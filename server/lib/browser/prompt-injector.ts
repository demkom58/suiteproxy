/**
 * Prompt Injector — intercepts AI Studio routes to inject fake PromptHistory.
 *
 * ARCHITECTURE (HAGMI approach):
 *
 * 1. We build a PromptHistory with proper multi-turn conversation structure
 * 2. We install a SINGLE wildcard route interceptor that matches ALL
 *    MakerSuiteService RPC calls. The handler switches on the endpoint name:
 *    - ResolveDriveResource → serve our fake PromptHistory
 *    - ListPrompts → serve metadata for our fake prompt
 *    - GenerateAccessToken → block (prevent prompt saving to history)
 *    - CreatePrompt / UpdatePrompt → block
 *    - CountTokens → serve fake response
 *    - GenerateContent → NOT handled here (falls through to network-interceptor.ts)
 *    - Everything else → route.fallback() (pass through to real Google servers)
 * 3. We navigate to aistudio.google.com/prompts/{promptId}
 * 4. AI Studio loads the fake conversation, we click "Rerun" on the last turn
 * 5. AI Studio's JS builds a proper GenerateContent request with BotGuard tokens
 * 6. network-interceptor.ts captures it and replays it for streaming
 *
 * CRITICAL: Using a single wildcard route with fallback() for unknown endpoints
 * is essential. If we only intercept specific endpoints, other RPC calls
 * (like GetPrompt, etc.) will hit Google's servers with our fake prompt ID
 * and return errors / redirect to "prompt-access-restricted".
 */
import type { Page, Route } from 'playwright-core';
import type { RequestContext } from './types';
import type { DriveAuthCredentials } from './drive-uploader';
import { buildPromptHistory } from './prompt-builder';

/** The single wildcard pattern that catches all MakerSuiteService RPC calls */
const MAKERSUITE_RPC_PATTERN = '**/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/*';

export interface InjectionResult {
  promptId: string;
  /** Drive file IDs created during image upload — must be cleaned up after request */
  driveFileIds: string[];
}

/**
 * Install the unified route interceptor for prompt injection.
 * Returns the promptId used for navigation and any Drive file IDs to clean up.
 *
 * The page is passed through to buildPromptHistory so images can be uploaded
 * to Google Drive via page.evaluate() (auth token is captured from browser traffic).
 */
export async function injectPromptHistory(
  page: Page,
  ctx: RequestContext,
  reqId: string,
  driveCreds?: DriveAuthCredentials,
): Promise<InjectionResult> {
  // Images are uploaded to Drive BEFORE building the PromptHistory
  const { promptId, serialized, driveFileIds } = await buildPromptHistory(ctx, { page, driveCreds });

  // Build the ListPrompts metadata (minimal — just enough for AI Studio to load)
  const listPromptsData = buildListPromptsResponse(promptId);

  console.log(`[PromptInjector:${reqId}] Installing unified route interceptor for prompt ${promptId}`);

  // Single wildcard route handler for ALL MakerSuiteService RPC calls
  const handler = async (route: Route) => {
    const url = route.request().url();
    const endpoint = url.split('/').pop() ?? '';

    switch (endpoint) {
      case 'ResolveDriveResource':
        console.log(`[PromptInjector:${reqId}] Serving fake PromptHistory (${serialized.length} bytes)`);
        await route.fulfill({
          contentType: 'application/json+protobuf; charset=UTF-8',
          body: serialized,
        });
        break;

      case 'ListPrompts':
        console.log(`[PromptInjector:${reqId}] Serving ListPrompts`);
        await route.fulfill({
          contentType: 'application/json+protobuf; charset=UTF-8',
          body: listPromptsData,
        });
        break;

      case 'GenerateAccessToken':
        if (driveFileIds.length > 0) {
          // Allow through — AI Studio needs OAuth2 token to access Drive files
          // during GenerateContent. Without this, file references return 404.
          console.log(`[PromptInjector:${reqId}] Allowing GenerateAccessToken (Drive files present)`);
          await route.fallback();
        } else {
          // Block to prevent prompt saving to Google's history (no Drive files)
          console.log(`[PromptInjector:${reqId}] Blocking GenerateAccessToken (no Drive files)`);
          await route.fulfill({
            contentType: 'application/json+protobuf; charset=UTF-8',
            body: '[16,"Request is missing required authentication credential."]',
            status: 401,
          });
        }
        break;

      case 'CreatePrompt':
        console.log(`[PromptInjector:${reqId}] Blocking CreatePrompt`);
        await route.abort();
        break;

      case 'UpdatePrompt':
        console.log(`[PromptInjector:${reqId}] Blocking UpdatePrompt`);
        await route.abort();
        break;

      case 'CountTokens':
        console.log(`[PromptInjector:${reqId}] Serving fake CountTokens`);
        await route.fulfill({
          contentType: 'application/json+protobuf; charset=UTF-8',
          body: JSON.stringify([4, [], [[[3], 1]], null, null, [[1, 4]]]),
        });
        break;

      case 'GenerateContent':
        // Let the network-interceptor's context-level handler process this.
        // It handles external replay for streaming and response capture.
        // Images are referenced by Drive file IDs in the PromptHistory,
        // so AI Studio's JS includes them at part position [5] with valid BotGuard tokens.
        console.log(`[PromptInjector:${reqId}] GenerateContent → falling through to network interceptor`);
        await route.fallback();
        break;

      default:
        // Pass through all other RPC calls to the real server.
        // This includes ListModels, GetUser, etc.
        // Using fallback() lets them reach the actual Google endpoint.
        await route.fallback();
        break;
    }
  };

  await page.route(MAKERSUITE_RPC_PATTERN, handler);

  return { promptId, driveFileIds };
}

/**
 * Remove the injector route from the page.
 * Must be called after the GenerateContent request is captured.
 */
export async function removeInjectorRoutes(page: Page, reqId: string): Promise<void> {
  try {
    await page.unroute(MAKERSUITE_RPC_PATTERN);
    console.log(`[PromptInjector:${reqId}] Injector route removed`);
  } catch (error) {
    console.warn(`[PromptInjector:${reqId}] Error removing injector route:`, error);
  }
}

/**
 * Navigate to the injected prompt and trigger generation by clicking Rerun.
 *
 * @param opts.temperature — If set, adjusts the temperature slider on the loaded page
 *   before clicking Rerun. Temperature isn't part of PromptHistory's GenerateContentConfig;
 *   it's a UI-only setting that AI Studio reads from its Angular state.
 */
export async function triggerGeneration(
  page: Page,
  promptId: string,
  reqId: string,
  opts: { temperature?: number; timeoutMs?: number } = {},
): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const url = `https://aistudio.google.com/prompts/${promptId}`;
  console.log(`[PromptInjector:${reqId}] Navigating to ${url}`);

  // Set AI Studio preferences before navigation to prevent dialogs and autosave
  // (same approach as HAGMI's prepare_page)
  try {
    await page.evaluate(() => {
      localStorage.setItem('aiStudioUserPreference', JSON.stringify({
        isAdvancedOpen: false,
        isSafetySettingsOpen: false,
        areToolsOpen: true,
        autosaveEnabled: false,
        hasShownDrivePermissionDialog: true,
        hasShownAutosaveOnDialog: true,
        enterKeyBehavior: 0,
        theme: 'system',
        isSystemInstructionsOpen: true,
        warmWelcomeDisplayed: true,
        fileCopyrightAcknowledged: false,
        enableSearchAsATool: true,
        selectedSystemInstructionsConfigName: null,
        thinkingBudgetsByModel: {},
        rawModeEnabled: false,
      }));
    });
  } catch {
    console.warn(`[PromptInjector:${reqId}] Failed to set localStorage preferences`);
  }

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

  // Wait for the placeholder text to appear in the last turn
  // This confirms AI Studio loaded our fake PromptHistory
  console.log(`[PromptInjector:${reqId}] Waiting for placeholder turn...`);
  const lastTurn = page.locator('ms-chat-turn').last();

  try {
    await lastTurn.locator('ms-text-chunk').waitFor({
      state: 'visible',
      timeout: 20_000,
    });
    console.log(`[PromptInjector:${reqId}] Placeholder turn visible`);
  } catch {
    // Check if we ended up on an error page
    const currentUrl = page.url();
    if (currentUrl.includes('access-restricted') || currentUrl.includes('error')) {
      throw new Error(`AI Studio rejected fake prompt — landed on: ${currentUrl}`);
    }
    console.warn(`[PromptInjector:${reqId}] Placeholder turn not visible, trying to continue anyway`);
  }

  // Dismiss cookie banner if visible
  try {
    const cookieReject = page.locator('.glue-cookie-notification-bar__reject');
    if (await cookieReject.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await cookieReject.click();
    }
  } catch { /* non-critical */ }

  // Close run settings panel if visible
  try {
    const closePanel = page.locator('button[aria-label="Close run settings panel"]');
    if (await closePanel.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closePanel.click({ force: true });
    }
  } catch { /* non-critical */ }

  // Set temperature if specified (UI-only parameter not in PromptHistory)
  if (opts.temperature !== undefined) {
    try {
      await setTemperatureSlider(page, opts.temperature, reqId);
    } catch (error) {
      console.warn(`[PromptInjector:${reqId}] Failed to set temperature:`, error);
    }
  }

  // Click on the last turn's textarea to make actions appear
  try {
    const textChunkTextarea = page.locator('ms-text-chunk textarea');
    if (await textChunkTextarea.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await textChunkTextarea.click();
    }
  } catch { /* non-critical */ }

  // Click on the last turn to reveal action buttons (hover)
  await lastTurn.click({ force: true });
  await page.waitForTimeout(500);

  // Find and click the Rerun button
  const rerunBtn = lastTurn.locator('[name="rerun-button"]');
  try {
    await rerunBtn.waitFor({ state: 'visible', timeout: 5_000 });
    console.log(`[PromptInjector:${reqId}] Rerun button visible, clicking...`);
    await rerunBtn.click({ force: true });
    console.log(`[PromptInjector:${reqId}] Rerun clicked — generation triggered`);
  } catch {
    // Fallback: try aria-label based
    console.warn(`[PromptInjector:${reqId}] Rerun button not found via [name], trying aria-label`);
    const rerunAria = lastTurn.locator('[aria-label="Rerun this turn"]');
    if (await rerunAria.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await rerunAria.click({ force: true });
      console.log(`[PromptInjector:${reqId}] Rerun clicked via aria-label`);
    } else {
      throw new Error('Could not find Rerun button to trigger generation');
    }
  }

  // Click on textarea area to deselect the turn (prevents UI issues)
  try {
    const textChunkTextarea = page.locator('ms-text-chunk textarea');
    if (await textChunkTextarea.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await textChunkTextarea.click();
    }
  } catch { /* non-critical */ }
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Set the temperature slider on the loaded AI Studio page.
 * The temperature input is a number input with max="2".
 */
async function setTemperatureSlider(page: Page, value: number, reqId: string): Promise<void> {
  // Temperature input: ms-slider input[type="number"][max="2"]
  const selector = 'ms-slider input[type="number"][max="2"], input.slider-number-input[aria-valuemax="2"]';
  const input = page.locator(selector);

  if (!(await input.isVisible({ timeout: 3_000 }).catch(() => false))) {
    console.log(`[PromptInjector:${reqId}] Temperature input not visible, skipping`);
    return;
  }

  // Set via JS to bypass Angular value accessors
  await page.evaluate((args: { sel: string; val: number }) => {
    const el = document.querySelector(args.sel) as HTMLInputElement | null;
    if (!el) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    nativeSetter?.call(el, String(args.val));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { sel: selector, val: value });

  console.log(`[PromptInjector:${reqId}] Temperature set to ${value}`);
}

function buildListPromptsResponse(promptId: string): string {
  // Minimal ListPrompts response that AI Studio accepts
  // It's a flattened PromptMetadata wrapped in an array
  const userInfo = ['user', 1, ''];
  const metadata = [
    promptId,          // title
    null,              // unknow1
    userInfo,          // user
    null,              // unknow3
    [['', 0], userInfo], // unknow4
    [1, 1, 1],         // unknow5
  ];
  return JSON.stringify([metadata]);
}


