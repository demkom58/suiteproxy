/**
 * Browser singleton — manages a persistent Camoufox (stealth Firefox) instance.
 * The browser opens a real AI Studio page and we interact via Playwright.
 *
 * Architecture:
 * - Single browser instance shared across requests
 * - Survives Nuxt hot reloads via globalThis
 * - Cookie injection from SuiteProxy's SQLite database
 * - localStorage manipulation for model switching
 */
import { firefox } from 'playwright-core';
import { Camoufox, launchOptions } from 'camoufox-js';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { BrowserState, StorageState } from './types';
import type { FingerprintConfig, ProxyConfig, ProxyEntry } from '~~/shared/types';
import { cookieToStorageState } from './auth-converter';
import { AI_STUDIO_NEW_CHAT, AI_STUDIO_URL_PATTERN, PROMPT_TEXTAREA, INPUT_WRAPPER } from './selectors';
import { AuthenticationError, BrowserNotInitializedError, PageNotReadyError } from './errors';
import { installInterceptorOnContext, resetInterceptorState } from './network-interceptor';
import { getErrorMessage } from '~~/server/utils/helpers';
import { clearTokenCache } from './drive-uploader';
import { closeAllSlots, type PageSlot, setSlotPage } from './page-pool';

/** Config passed from the account record to the browser launcher. */
export interface BrowserLaunchConfig {
  fingerprint?: FingerprintConfig | null;
  proxy?: ProxyConfig | null;
}

// ── Global state (survives hot reloads) ─────────────────────────────────
declare global {
  var _browserState: BrowserState | undefined;
  var _browserLaunchPromise: Promise<void> | null;
}

function getState(): BrowserState {
  if (!globalThis._browserState) {
    globalThis._browserState = {
      browser: null,
      context: null,
      page: null,
      isReady: false,
      isInitializing: false,
      currentModel: null,
      currentAccountId: null,
    };
  }
  return globalThis._browserState;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Ensure the browser and context are running for the given account.
 * If the account differs from the current one, closes and relaunches.
 * Does NOT create pages — that's handled by getPageForSlot().
 */
export async function ensureBrowser(
  cookieStr: string,
  accountId: string,
  authUser?: string,
  launchConfig?: BrowserLaunchConfig,
): Promise<void> {
  const state = getState();

  // If browser exists and belongs to the same account, reuse it
  if (state.browser && state.context && state.currentAccountId === accountId) {
    return;
  }

  // If different account, close and reopen with new cookies
  if (state.browser && state.currentAccountId !== accountId) {
    console.log(`[Browser] Switching account: ${state.currentAccountId} → ${accountId}`);
    await closeBrowser();
  }

  // Dedup concurrent launches
  if (globalThis._browserLaunchPromise) {
    await globalThis._browserLaunchPromise;
    return;
  }

  globalThis._browserLaunchPromise = launchBrowserAndContext(cookieStr, accountId, authUser, launchConfig);

  try {
    await globalThis._browserLaunchPromise;
  } finally {
    globalThis._browserLaunchPromise = null;
  }
}

/**
 * Get a ready-to-use AI Studio page for a specific pool slot.
 * Creates a new page if the slot doesn't have one, or reuses the existing page.
 * Navigates to AI Studio and waits for input readiness if needed.
 */
export async function getPageForSlot(
  slot: PageSlot,
  cookieStr: string,
  accountId: string,
  authUser?: string,
  launchConfig?: BrowserLaunchConfig,
): Promise<Page> {
  // Ensure browser is running
  await ensureBrowser(cookieStr, accountId, authUser, launchConfig);

  const state = getState();
  if (!state.context) {
    throw new BrowserNotInitializedError('Browser context not available');
  }

  // If slot already has a live page, validate and reuse
  if (slot.page && slot.isReady) {
    try {
      await slot.page.evaluate(() => true);
      return slot.page;
    } catch {
      console.warn(`[Browser] Slot ${slot.index}: page is stale, creating new one`);
      slot.page = null;
      slot.isReady = false;
    }
  }

  // Create a new page in the existing context
  console.log(`[Browser] Slot ${slot.index}: creating new page...`);
  const page = await state.context.newPage();

  // Forward browser console error messages to Node.js for debugging
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`[BrowserConsole:slot${slot.index}:${type}] ${text}`);
    }
  });

  console.log(`[Browser] Slot ${slot.index}: navigating to ${AI_STUDIO_NEW_CHAT}...`);
  await page.goto(AI_STUDIO_NEW_CHAT, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });

  const currentUrl = page.url();
  console.log(`[Browser] Slot ${slot.index}: landed on ${currentUrl}`);

  // Check if we got redirected to login
  if (currentUrl.includes('accounts.google.com')) {
    await page.close();
    throw new AuthenticationError(accountId);
  }

  // Verify we're on AI Studio
  if (!currentUrl.includes(AI_STUDIO_URL_PATTERN)) {
    await page.close();
    throw new PageNotReadyError(`Unexpected page after navigation: ${currentUrl}`);
  }

  // Wait for the input area to be ready
  await waitForInputReady(page);

  // Enable temporary chat mode (no history saved)
  await enableTempChat(page);

  // Read the current model from the page
  let currentModel: string | null = null;
  try {
    const modelEl = page.locator('[data-test-id="model-name"]');
    const modelText = await modelEl.first().innerText({ timeout: 5_000 });
    currentModel = modelText.trim();
    console.log(`[Browser] Slot ${slot.index}: current model: ${currentModel}`);
  } catch {
    console.warn(`[Browser] Slot ${slot.index}: could not read model name`);
  }

  // Register slot
  setSlotPage(slot, page, accountId);
  slot.currentModel = currentModel;

  // Also update legacy state for health checks
  state.page = page;
  state.isReady = true;
  state.currentAccountId = accountId;
  state.currentModel = currentModel;

  console.log(`[Browser] Slot ${slot.index}: AI Studio ready for account ${accountId}`);
  return page;
}

/**
 * Legacy: Get a ready-to-use AI Studio page (single-page compat).
 * Used by existing code paths during migration. Internally uses slot 0.
 */
export async function getPage(
  cookieStr: string,
  accountId: string,
  authUser?: string,
  launchConfig?: BrowserLaunchConfig,
): Promise<Page> {
  // Import here to avoid circular dependency
  const { acquireSlot, releaseSlot } = await import('./page-pool');
  const { slot } = await acquireSlot(accountId, null);
  try {
    const page = await getPageForSlot(slot, cookieStr, accountId, authUser, launchConfig);
    releaseSlot(slot);
    return page;
  } catch (error) {
    releaseSlot(slot);
    throw error;
  }
}

/**
 * Check if a page is currently available and ready.
 */
export function isPageReady(): boolean {
  return getState().isReady;
}

/**
 * Get the current model displayed on the page.
 */
export function getCurrentModel(): string | null {
  return getState().currentModel;
}

/**
 * Update the tracked current model.
 */
export function setCurrentModel(model: string): void {
  getState().currentModel = model;
}

/**
 * Get the current account ID (email) that the browser is authenticated with.
 */
export function getCurrentAccountId(): string | null {
  return getState().currentAccountId;
}

/**
 * Close everything gracefully — browser, context, all pool slots.
 */
export async function closeBrowser(): Promise<void> {
  const state = getState();
  state.isReady = false;
  state.currentAccountId = null;
  state.currentModel = null;

  // Reset interceptor state (route handler references, buffers)
  resetInterceptorState();

  // Clear cached OAuth2 token (account-specific)
  clearTokenCache();

  // Close all pool slots (closes their pages)
  await closeAllSlots();

  // Legacy: close the single page reference
  if (state.page) {
    try { await state.page.close(); } catch { /* ignore */ }
    state.page = null;
  }
  if (state.context) {
    try { await state.context.close(); } catch { /* ignore */ }
    state.context = null;
  }
  if (state.browser) {
    try { await state.browser.close(); } catch { /* ignore */ }
    state.browser = null;
  }

  console.log('[Browser] Closed all resources');
}

/**
 * Refresh a specific page (Tier 1 error recovery).
 */
export async function refreshPage(page?: Page): Promise<void> {
  const target = page ?? getState().page;
  if (!target) throw new Error('No page to refresh');

  console.log('[Browser] Refreshing page...');
  await target.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
  await waitForInputReady(target);
  console.log('[Browser] Page refreshed and ready');
}

// ── Internal ────────────────────────────────────────────────────────────

/**
 * Pre-flight check for Camoufox installation integrity.
 * Docker volume mounts can corrupt files (null bytes instead of content).
 * Verifies that critical config files are valid JSON before launching.
 */
function verifyCamoufoxInstallation(): void {
  const { readFileSync, existsSync } = require('node:fs') as typeof import('node:fs');
  const { join } = require('node:path') as typeof import('node:path');
  const cacheDir = join(process.env.HOME || '/root', '.cache', 'camoufox');

  const criticalFiles = ['version.json', 'properties.json'];
  for (const file of criticalFiles) {
    const filePath = join(cacheDir, file);
    if (!existsSync(filePath)) continue;

    try {
      const content = readFileSync(filePath, 'utf-8');
      // Check for null byte corruption (Docker volume issue)
      if (content.includes('\0')) {
        console.error(`[Browser] CORRUPTED: ${filePath} contains null bytes — Camoufox installation may be damaged`);
        console.error(`[Browser] Fix: delete ${cacheDir} and restart to re-download Camoufox`);
        throw new Error(`Camoufox installation corrupted: ${file} contains null bytes. Delete ~/.cache/camoufox/ and restart.`);
      }
      JSON.parse(content); // Validate JSON
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`[Browser] CORRUPTED: ${filePath} is not valid JSON`);
        throw new Error(`Camoufox installation corrupted: ${file} is not valid JSON. Delete ~/.cache/camoufox/ and restart.`);
      }
      throw error; // Re-throw our own error
    }
  }
}

// ── Proxy Helpers ───────────────────────────────────────────────────────

/**
 * Select a proxy from the chain based on rotation strategy.
 * Returns null if proxy is disabled or chain is empty.
 */
function selectProxy(proxyConfig?: ProxyConfig | null): ProxyEntry | null {
  if (!proxyConfig?.enabled || !proxyConfig.chain?.length) return null;

  const rotation = proxyConfig.rotation ?? 'none';
  if (rotation === 'random') {
    return proxyConfig.chain[Math.floor(Math.random() * proxyConfig.chain.length)]!;
  }
  if (rotation === 'round-robin') {
    // Simple counter stored on the config object at runtime
    const idx = (globalThis._proxyRoundRobinIdx ?? 0) % proxyConfig.chain.length;
    globalThis._proxyRoundRobinIdx = idx + 1;
    return proxyConfig.chain[idx]!;
  }
  return proxyConfig.chain[0]!; // 'none' — use first
}

/** Convert a ProxyEntry to Camoufox proxy format. */
function buildCamoufoxProxy(entry: ProxyEntry, bypass?: string): Record<string, string> {
  const url = `${entry.protocol}://${entry.host}:${entry.port}`;
  const proxy: Record<string, string> = { server: url };
  if (entry.username) proxy.username = entry.username;
  if (entry.password) proxy.password = entry.password;
  if (bypass) proxy.bypass = bypass;
  return proxy;
}

// Add round-robin counter to global state
declare global {
  var _proxyRoundRobinIdx: number | undefined;
}

// ── Browser Launch ──────────────────────────────────────────────────────

/**
 * Build Camoufox options from account fingerprint and proxy config.
 */
function buildCamoufoxOptions(
  isWindows: boolean,
  fp?: FingerprintConfig | null,
  proxyConfig?: ProxyConfig | null,
): Record<string, unknown> {
  const opts: Record<string, unknown> = {
    headless: false,
  };

  // OS: account config → platform default
  if (fp?.os) {
    opts.os = fp.os;
  } else if (isWindows) {
    opts.os = ['windows'];
  }

  // Window size
  if (fp?.window) opts.window = fp.window;

  // Screen constraints
  if (fp?.screen) opts.screen = fp.screen;

  // WebGL
  if (fp?.webgl) opts.webgl_config = fp.webgl;

  // Custom config overrides (navigator, screen properties)
  if (fp?.config) opts.config = fp.config;

  // Locale
  if (fp?.locale) opts.locale = fp.locale;

  // Fonts
  if (fp?.fonts) opts.fonts = fp.fonts;

  // WebRTC blocking
  if (fp?.blockWebrtc) opts.block_webrtc = true;

  // Humanized cursor
  if (fp?.humanize && fp.humanize > 0) opts.humanize = fp.humanize;

  // Proxy
  const selectedProxy = selectProxy(proxyConfig);
  if (selectedProxy) {
    opts.proxy = buildCamoufoxProxy(selectedProxy, proxyConfig?.bypass);
    if (proxyConfig?.geoip) opts.geoip = true;
    console.log(`[Browser] Using proxy: ${selectedProxy.protocol}://${selectedProxy.host}:${selectedProxy.port}`);
  }

  return opts;
}

/**
 * Launch Camoufox browser with platform-aware configuration.
 * Uses the high-level Camoufox() API first (handles OS-specific quirks),
 * falls back to manual launchOptions + firefox.launch if that fails.
 */
async function launchCamoufox(
  isWindows: boolean,
  isLinux: boolean,
  launchConfig?: BrowserLaunchConfig,
): Promise<Browser> {
  // Verify installation integrity before attempting launch
  verifyCamoufoxInstallation();

  const cfxOpts = buildCamoufoxOptions(isWindows, launchConfig?.fingerprint, launchConfig?.proxy);

  // Log fingerprint config if custom
  if (launchConfig?.fingerprint) {
    const fp = launchConfig.fingerprint;
    const parts: string[] = [];
    if (fp.os) parts.push(`os=${JSON.stringify(fp.os)}`);
    if (fp.window) parts.push(`window=${fp.window[0]}x${fp.window[1]}`);
    if (fp.webgl) parts.push(`webgl=${fp.webgl[0]}`);
    if (fp.locale) parts.push(`locale=${JSON.stringify(fp.locale)}`);
    if (fp.blockWebrtc) parts.push('blockWebrtc');
    if (fp.humanize) parts.push(`humanize=${fp.humanize}s`);
    console.log(`[Browser] Fingerprint config: ${parts.join(', ') || 'default'}`);
  }

  // Method 1: Camoufox() high-level API — recommended, handles internals
  try {
    console.log('[Browser] Trying Camoufox() high-level API...');
    const browser = await Camoufox(cfxOpts);
    console.log('[Browser] Camoufox launched via high-level API');
    return browser as Browser;
  } catch (error) {
    const msg = getErrorMessage(error);
    const stack = error instanceof Error ? error.stack?.substring(0, 500) : '';
    console.warn(`[Browser] High-level Camoufox() failed: ${msg}`);
    if (stack) console.warn(`[Browser] Stack: ${stack}`);
    console.log('[Browser] Falling back to manual launch...');
  }

  // Method 2: Manual launchOptions + firefox.launch (more control, proven on Linux)
  try {
    const manualOpts: Record<string, unknown> = {
      headless: false,
    };
    if (cfxOpts.os) manualOpts.os = cfxOpts.os;

    const cfxLaunchOpts = await launchOptions(manualOpts);
    console.log(`[Browser] Launch options ready (executablePath: ${cfxLaunchOpts.executablePath})`);

    const launchEnv: Record<string, string | undefined> = {
      ...process.env,
      ...(cfxLaunchOpts.env ?? {}),
    };
    if (isLinux) {
      launchEnv.DISPLAY = process.env.DISPLAY || ':99';
    }

    console.log(`[Browser] Launching Firefox...${isLinux ? ` (DISPLAY=${launchEnv.DISPLAY})` : ''}`);
    const browser = await firefox.launch({
      ...cfxLaunchOpts,
      args: [
        ...(cfxLaunchOpts.args ?? []),
        '--no-remote',
      ],
      timeout: 120_000, // 2 min timeout for Windows (slower startup)
      env: launchEnv,
      // Pass proxy to Playwright launch if Camoufox high-level didn't handle it
      ...(cfxOpts.proxy ? { proxy: cfxOpts.proxy as { server: string; username?: string; password?: string; bypass?: string } } : {}),
    });

    console.log('[Browser] Camoufox launched via manual launch');
    return browser;
  } catch (error) {
    const msg = getErrorMessage(error);
    const stack = error instanceof Error ? error.stack?.substring(0, 500) : '';
    console.error(`[Browser] Manual launch also failed: ${msg}`);
    if (stack) console.error(`[Browser] Stack: ${stack}`);
    throw error;
  }
}

/**
 * Launch browser and create context (no page yet — pages are created per-slot).
 */
async function launchBrowserAndContext(
  cookieStr: string,
  accountId: string,
  authUser?: string,
  launchConfig?: BrowserLaunchConfig,
): Promise<void> {
  const state = getState();
  state.isInitializing = true;

  try {
    const isWindows = process.platform === 'win32';
    const isLinux = process.platform === 'linux';
    console.log(`[Browser] Launching Camoufox (stealth Firefox) on ${process.platform}...`);

    // Ensure virtual display for headless Linux/Docker (not needed on Windows/macOS)
    if (isLinux && !process.env.DISPLAY) {
      process.env.DISPLAY = ':99';
    }

    // Use Camoufox() high-level API — it handles platform-specific quirks internally.
    // Falls back to manual launchOptions + firefox.launch on failure.
    const browser = await launchCamoufox(isWindows, isLinux, launchConfig);

    state.browser = browser;
    console.log('[Browser] Camoufox launched');

    // Create context with storage state (cookies)
    const storageState = cookieToStorageState(cookieStr, authUser);

    const context = await browser.newContext({
      storageState,
      viewport: { width: 460, height: 800 },
      ignoreHTTPSErrors: true,
    });

    state.context = context;
    state.currentAccountId = accountId;
    state.isInitializing = false;
    console.log(`[Browser] Context created with ${storageState.cookies.length} cookies for account ${accountId}`);

    // Install route-based network interceptor on context
    // This uses page.route() at the Playwright protocol level — catches ALL requests
    // regardless of transport (XHR, fetch, gRPC-web Rv polyfill, etc.)
    await installInterceptorOnContext(context);

    console.log(`[Browser] Browser + context ready for account: ${accountId}`);

  } catch (error) {
    state.isInitializing = false;
    state.isReady = false;
    // Clean up on failure
    await closeBrowser();
    throw error;
  }
}

/**
 * Wait for the prompt input area to become visible and interactive.
 */
async function waitForInputReady(page: Page, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  // Try each wrapper selector
  for (const selector of INPUT_WRAPPER) {
    if (Date.now() > deadline) break;

    try {
      const remaining = deadline - Date.now();
      await page.locator(selector).first().waitFor({
        state: 'visible',
        timeout: Math.min(remaining, 10_000),
      });
      console.log(`[Browser] Input wrapper found: ${selector}`);

      // Now find the textarea inside
      for (const textareaSelector of PROMPT_TEXTAREA) {
        try {
          const remaining2 = deadline - Date.now();
          await page.locator(textareaSelector).first().waitFor({
            state: 'visible',
            timeout: Math.min(remaining2, 5_000),
          });
          console.log(`[Browser] Textarea found: ${textareaSelector}`);
          return;
        } catch {
          continue;
        }
      }
      return; // Wrapper found even if textarea not yet visible
    } catch {
      continue;
    }
  }

  throw new Error(`Input area not ready after ${timeoutMs}ms`);
}

/**
 * Enable temporary chat mode to avoid saving conversation history.
 */
async function enableTempChat(page: Page): Promise<void> {
  try {
    const toggle = page.locator('button[aria-label="Temporary chat toggle"]');
    await toggle.waitFor({ state: 'visible', timeout: 10_000 });

    const classes = await toggle.getAttribute('class');
    if (classes && classes.includes('ms-button-active')) {
      console.log('[Browser] Temporary chat already enabled');
      return;
    }

    await toggle.click({ timeout: 5_000, force: true });
    await page.waitForTimeout(1_000);

    const updatedClasses = await toggle.getAttribute('class');
    if (updatedClasses && updatedClasses.includes('ms-button-active')) {
      console.log('[Browser] Temporary chat enabled');
    } else {
      console.warn('[Browser] Temporary chat toggle may not have activated');
    }
  } catch {
    console.warn('[Browser] Could not enable temporary chat mode (non-fatal)');
  }
}

// Re-export everything from submodules
export { PageController } from './page-controller';
export { switchModel } from './model-switcher';
export { saveErrorSnapshot } from './snapshots';
export { installInterceptor, installInterceptorOnContext, startCapture, endCapture, consumeChunks, consumeStreamingChunks, hasRouteFired, resetInterceptorState } from './network-interceptor';
export type { StreamChunk } from './network-interceptor';
export type { BrowserState, RequestContext, QueueResult, StreamDelta, ParsedModel, ThinkingDirective } from './types';
export {
  BrowserAutomationError,
  BrowserNotInitializedError,
  PageNotReadyError,
  AuthenticationError,
  ModelSwitchError,
  ResponseExtractionError,
  ResponseTimeoutError,
  SubmitError,
  TextareaNotFoundError,
  RateLimitError,
  NoAccountsError,
  ClientDisconnectedError,
} from './errors';
