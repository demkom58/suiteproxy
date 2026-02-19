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
import { cookieToStorageState } from './auth-converter';
import { AI_STUDIO_NEW_CHAT, AI_STUDIO_URL_PATTERN, PROMPT_TEXTAREA, INPUT_WRAPPER } from './selectors';
import { AuthenticationError, BrowserNotInitializedError, PageNotReadyError } from './errors';
import { installInterceptorOnContext, resetInterceptorState } from './network-interceptor';
import { clearTokenCache } from './drive-uploader';

// ── Global state (survives hot reloads) ─────────────────────────────────
declare global {
  var _browserState: BrowserState | undefined;
  var _browserLaunchPromise: Promise<Page> | null;
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
 * Get a ready-to-use AI Studio page. Launches Camoufox if not already running.
 */
export async function getPage(
  cookieStr: string,
  accountId: string,
  authUser?: string,
): Promise<Page> {
  const state = getState();

  // If page exists and belongs to the same account, reuse it
  if (state.page && state.isReady && state.currentAccountId === accountId) {
    try {
      await state.page.evaluate(() => true);
      return state.page;
    } catch {
      console.warn('[Browser] Page is stale, relaunching...');
      await closeBrowser();
    }
  }

  // If different account, close and reopen with new cookies
  if (state.page && state.currentAccountId !== accountId) {
    console.log(`[Browser] Switching account: ${state.currentAccountId} → ${accountId}`);
    await closeBrowser();
  }

  // Dedup concurrent launches
  if (globalThis._browserLaunchPromise) {
    return globalThis._browserLaunchPromise;
  }

  globalThis._browserLaunchPromise = launchAndNavigate(cookieStr, accountId, authUser);

  try {
    const page = await globalThis._browserLaunchPromise;
    return page;
  } finally {
    globalThis._browserLaunchPromise = null;
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
 * Close everything gracefully.
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
 * Refresh the current page (Tier 1 error recovery).
 */
export async function refreshPage(): Promise<void> {
  const state = getState();
  if (!state.page) throw new Error('No page to refresh');

  console.log('[Browser] Refreshing page...');
  await state.page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
  await waitForInputReady(state.page);
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

/**
 * Launch Camoufox browser with platform-aware configuration.
 * Uses the high-level Camoufox() API first (handles OS-specific quirks),
 * falls back to manual launchOptions + firefox.launch if that fails.
 */
async function launchCamoufox(isWindows: boolean, isLinux: boolean): Promise<Browser> {
  // Verify installation integrity before attempting launch
  verifyCamoufoxInstallation();
  // Method 1: Camoufox() high-level API — recommended, handles internals
  try {
    console.log('[Browser] Trying Camoufox() high-level API...');
    const browser = await Camoufox({
      headless: isLinux ? false : false, // Non-headless for best stealth on all platforms
      os: isWindows ? ['windows'] : undefined, // Match native OS fingerprint on Windows
    });
    console.log('[Browser] Camoufox launched via high-level API');
    return browser as Browser;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack?.substring(0, 500) : '';
    console.warn(`[Browser] High-level Camoufox() failed: ${msg}`);
    if (stack) console.warn(`[Browser] Stack: ${stack}`);
    console.log('[Browser] Falling back to manual launch...');
  }

  // Method 2: Manual launchOptions + firefox.launch (more control, proven on Linux)
  try {
    const cfxOptions = await launchOptions({
      headless: false,
      os: isWindows ? 'windows' : undefined,
    });
    console.log(`[Browser] Launch options ready (executablePath: ${cfxOptions.executablePath})`);

    const launchEnv: Record<string, string | undefined> = {
      ...process.env,
      ...(cfxOptions.env ?? {}),
    };
    if (isLinux) {
      launchEnv.DISPLAY = process.env.DISPLAY || ':99';
    }

    console.log(`[Browser] Launching Firefox...${isLinux ? ` (DISPLAY=${launchEnv.DISPLAY})` : ''}`);
    const browser = await firefox.launch({
      ...cfxOptions,
      args: [
        ...(cfxOptions.args ?? []),
        '--no-remote',
      ],
      timeout: 120_000, // 2 min timeout for Windows (slower startup)
      env: launchEnv,
    });

    console.log('[Browser] Camoufox launched via manual launch');
    return browser;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack?.substring(0, 500) : '';
    console.error(`[Browser] Manual launch also failed: ${msg}`);
    if (stack) console.error(`[Browser] Stack: ${stack}`);
    throw error;
  }
}

async function launchAndNavigate(
  cookieStr: string,
  accountId: string,
  authUser?: string,
): Promise<Page> {
  const state = getState();
  state.isInitializing = true;

  try {
    const isWindows = process.platform === 'win32';
    const isLinux = process.platform === 'linux';
    console.log(`[Browser] 🚀 Launching Camoufox (stealth Firefox) on ${process.platform}...`);

    // Ensure virtual display for headless Linux/Docker (not needed on Windows/macOS)
    if (isLinux && !process.env.DISPLAY) {
      process.env.DISPLAY = ':99';
    }

    // Use Camoufox() high-level API — it handles platform-specific quirks internally.
    // Falls back to manual launchOptions + firefox.launch on failure.
    const browser = await launchCamoufox(isWindows, isLinux);

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
    console.log(`[Browser] Context created with ${storageState.cookies.length} cookies`);

    // Install route-based network interceptor on context
    // This uses page.route() at the Playwright protocol level — catches ALL requests
    // regardless of transport (XHR, fetch, gRPC-web Rv polyfill, etc.)
    await installInterceptorOnContext(context);

    // Create page and navigate to AI Studio
    const page = await context.newPage();

    // Forward browser console error messages to Node.js for debugging
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`[BrowserConsole:${type}] ${text}`);
      }
    });

    console.log(`[Browser] Navigating to ${AI_STUDIO_NEW_CHAT}...`);
    await page.goto(AI_STUDIO_NEW_CHAT, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    const currentUrl = page.url();
    console.log(`[Browser] Landed on: ${currentUrl}`);

    // Check if we got redirected to login
    if (currentUrl.includes('accounts.google.com')) {
      throw new AuthenticationError(accountId);
    }

    // Verify we're on AI Studio
    if (!currentUrl.includes(AI_STUDIO_URL_PATTERN)) {
      throw new PageNotReadyError(`Unexpected page after navigation: ${currentUrl}`);
    }

    // Wait for the input area to be ready
    await waitForInputReady(page);

    // Enable temporary chat mode (no history saved)
    await enableTempChat(page);

    // Read the current model from the page
    try {
      const modelEl = page.locator('[data-test-id="model-name"]');
      const modelText = await modelEl.first().innerText({ timeout: 5_000 });
      state.currentModel = modelText.trim();
      console.log(`[Browser] Current model: ${state.currentModel}`);
    } catch {
      console.warn('[Browser] Could not read model name from page');
    }

    state.page = page;
    state.isReady = true;
    state.currentAccountId = accountId;
    state.isInitializing = false;

    console.log(`[Browser] ✅ AI Studio ready for account: ${accountId}`);
    return page;

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
