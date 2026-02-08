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
 *    - GenerateAccessToken → fallback (allow through — needed for OAuth2 tokens)
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
import { classifyModel } from './page-controller';
import { thinkingLevelToWireValue } from '~~/server/types/aistudio';
import { RateLimitError } from './errors';

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
        // Always allow through — AI Studio needs OAuth2 tokens for:
        // 1. GenerateContent RPC (bearer token in Authorization header)
        // 2. Drive file access (when images are embedded)
        // 3. BotGuard/WAA initialization
        // Blocking this on fresh pages prevents GenerateContent from firing at all.
        // Prompt saving is already blocked by CreatePrompt/UpdatePrompt handlers.
        console.log(`[PromptInjector:${reqId}] GenerateAccessToken → fallback (allowing through)`);
        await route.fallback();
        break;

      case 'CreatePrompt':
        // Return empty success instead of aborting — route.abort() causes network
        // errors that AI Studio's JS may interpret as fatal, blocking GenerateContent.
        console.log(`[PromptInjector:${reqId}] Blocking CreatePrompt (fake success)`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json+protobuf; charset=UTF-8',
          body: '[]',
        });
        break;

      case 'UpdatePrompt':
        // Return empty success instead of aborting
        console.log(`[PromptInjector:${reqId}] Blocking UpdatePrompt (fake success)`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json+protobuf; charset=UTF-8',
          body: '[]',
        });
        break;

      case 'CountTokens':
        // Let CountTokens pass through to the real server.
        // AI Studio uses the response to validate prompt structure before GenerateContent.
        // Faking it with a hardcoded response was causing AI Studio to loop without
        // ever firing GenerateContent — likely because the response format was wrong
        // or missing fields that AI Studio's state machine checks.
        await route.fallback();
        break;

      case 'GenerateContent':
        // Let the network-interceptor's per-page handler process this.
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
 * @param opts.thinkingLevel — For Gemini 3.x models, the thinking level ('low'|'medium'|'high').
 *   Set in localStorage as `thinkingBudgetsByModel` so AI Studio's JS uses the correct level
 *   in the GenerateContent RPC.
 * @param opts.model — The model name, used to determine if thinking level config is needed.
 */
export async function triggerGeneration(
  page: Page,
  promptId: string,
  reqId: string,
  opts: { temperature?: number; thinkingLevel?: string; model?: string; timeoutMs?: number } = {},
): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const url = `https://aistudio.google.com/prompts/${promptId}`;
  console.log(`[PromptInjector:${reqId}] Navigating to ${url}`);

  // Set AI Studio preferences before navigation to prevent dialogs and autosave
  // (same approach as HAGMI's prepare_page)
  //
  // For Gemini 3.x level-based models, we set the thinking level in
  // `thinkingBudgetsByModel` which AI Studio reads to configure the
  // thinking level dropdown. The key is the full model name and the value
  // is the level number (1=Low, 2=Medium, 3=High).
  const thinkingBudgets: Record<string, number> = {};
  if (opts.thinkingLevel && opts.model) {
    const category = classifyModel(opts.model);
    if (category === 'THINKING_LEVEL_PRO' || category === 'THINKING_LEVEL_FLASH') {
      const modelKey = opts.model.startsWith('models/') ? opts.model : `models/${opts.model}`;
      thinkingBudgets[modelKey] = thinkingLevelToWireValue(opts.thinkingLevel);
      console.log(`[PromptInjector:${reqId}] Setting thinking level for ${modelKey}: ${opts.thinkingLevel} (${thinkingBudgets[modelKey]})`);
    }
  }

  try {
    await page.evaluate((budgets: Record<string, number>) => {
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
        thinkingBudgetsByModel: budgets,
        rawModeEnabled: false,
      }));
    }, thinkingBudgets);
  } catch {
    console.warn(`[PromptInjector:${reqId}] Failed to set localStorage preferences`);
  }

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

  // Wait for our fake PromptHistory to be served, then wait for chat turns to render.
  console.log(`[PromptInjector:${reqId}] Waiting for prompt to load...`);
  const lastTurn = page.locator('ms-chat-turn').last();

  try {
    await lastTurn.waitFor({ state: 'attached', timeout: 15_000 });
    console.log(`[PromptInjector:${reqId}] Chat turns loaded`);
  } catch {
    const currentUrl = page.url();
    if (currentUrl.includes('access-restricted') || currentUrl.includes('error')) {
      throw new Error(`AI Studio rejected fake prompt — landed on: ${currentUrl}`);
    }
    throw new Error('Chat turns did not appear within 15 seconds');
  }

  // Dismiss overlays and set temperature in parallel (non-blocking, fast)
  await Promise.allSettled([
    page.locator('.glue-cookie-notification-bar__reject').click({ timeout: 500 }).catch(() => {}),
    page.locator('button[aria-label="Close run settings panel"]').click({ force: true, timeout: 500 }).catch(() => {}),
    opts.temperature !== undefined
      ? setTemperatureSlider(page, opts.temperature, reqId).catch(() => {})
      : Promise.resolve(),
  ]);

  // ── Click the Rerun button ────────────────────────────────────────────
  //
  // ROOT CAUSE OF PRIOR BUG: The Rerun button lives inside a `.hover-or-edit`
  // container that has `pointer-events: none; opacity: 0` by default.
  // It only becomes clickable when the parent `.chat-turn-container` is hovered,
  // which triggers `pointer-events: auto; opacity: 1`.
  //
  // Playwright's `force: true` bypasses visibility checks but the browser still
  // respects `pointer-events: none` — the click passes through the button to
  // whatever is behind it. Even JS `.click()` doesn't trigger Angular's event
  // handlers when pointer-events is disabled.
  //
  // FIX: Use page.evaluate() to force the hover-or-edit container to be
  // visible and clickable before clicking.

  const rerunClicked = await page.evaluate(() => {
    // Find the last model turn's Rerun button
    const allTurns = document.querySelectorAll('ms-chat-turn');
    if (allTurns.length === 0) return { ok: false, error: 'No chat turns found' };

    const lastTurnEl = allTurns[allTurns.length - 1]!;

    // Force ALL .hover-or-edit containers in the last turn to be visible/clickable
    const hoverContainers = lastTurnEl.querySelectorAll('.hover-or-edit');
    for (const container of hoverContainers) {
      (container as HTMLElement).style.opacity = '1';
      (container as HTMLElement).style.pointerEvents = 'auto';
    }

    // Find the Rerun button
    const btn = lastTurnEl.querySelector('[name="rerun-button"]') as HTMLButtonElement | null;
    if (!btn) return { ok: false, error: 'Rerun button not found in last turn' };

    // Also force the button itself to be clickable
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';

    // Click it
    btn.click();

    return { ok: true, error: null };
  });

  if (!rerunClicked.ok) {
    throw new Error(`Could not click Rerun: ${rerunClicked.error}`);
  }
  console.log(`[PromptInjector:${reqId}] Rerun clicked (forced hover-or-edit visible + JS click)`);

  // Verify generation actually started — wait for spinner to appear
  try {
    const spinnerSel =
      'ms-run-button button[type="submit"] svg.stoppable-spinner, ' +
      'ms-run-button .generating-indicator, ' +
      'ms-run-button button[type="submit"] .mat-mdc-progress-spinner';
    await page.locator(spinnerSel).first().waitFor({ state: 'visible', timeout: 5_000 });
    console.log(`[PromptInjector:${reqId}] Generation confirmed (spinner visible)`);
  } catch {
    // Spinner didn't appear — generation may not have started
    // Check if there's a dialog or error blocking
    const uiState = await page.evaluate(() => {
      const overlays = document.querySelectorAll('.cdk-overlay-container .cdk-overlay-pane');
      const dialogs: string[] = [];
      overlays.forEach(o => {
        const text = (o as HTMLElement).innerText?.trim();
        if (text) dialogs.push(text.substring(0, 200));
      });
      const rerunBtn = document.querySelectorAll('[name="rerun-button"]');
      return {
        dialogs,
        rerunCount: rerunBtn.length,
        rerunLastDisabled: rerunBtn.length > 0 ? (rerunBtn[rerunBtn.length - 1] as HTMLButtonElement).disabled : null,
      };
    });
    console.warn(`[PromptInjector:${reqId}] Spinner NOT visible after Rerun click. ` +
      `rerunButtons=${uiState.rerunCount}, lastDisabled=${uiState.rerunLastDisabled}, ` +
      `dialogs=${JSON.stringify(uiState.dialogs)}`);

    // If an error dialog is showing, throw immediately instead of letting
    // pollResponse wait 90 seconds for text that will never appear.
    if (uiState.dialogs.length > 0) {
      const dialogText = uiState.dialogs.join(' ').toLowerCase();
      if (dialogText.includes('rate limit') || dialogText.includes('quota')) {
        throw new RateLimitError(undefined, uiState.dialogs[0], reqId);
      }
      if (dialogText.includes('permission denied') || dialogText.includes('failed to generate')) {
        throw new Error(`AI Studio error: ${uiState.dialogs[0]}`);
      }
    }
  }
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


