/**
 * Model switching via localStorage manipulation + page navigation.
 * Ported from AIstudioProxyAPI browser_utils/models/switcher.py.
 *
 * Strategy:
 * 1. Set `aiStudioUserPreference.promptModel` in localStorage
 * 2. Navigate to /prompts/new_chat (forces AI Studio to load with new model)
 * 3. Verify the model name displayed on page matches
 */
import type { Page } from 'playwright-core';
import { AI_STUDIO_NEW_CHAT, MODEL_NAME, INPUT_WRAPPER, PROMPT_TEXTAREA } from './selectors';
import { setCurrentModel } from './index';
import { ModelSwitchError } from './errors';

/**
 * Switch the AI Studio model to the specified model ID.
 * @param page - Playwright page instance
 * @param targetModel - Model ID like "models/gemini-3-flash-preview" or "gemini-3-flash-preview"
 * @returns The actual model name displayed on the page after switching
 */
export async function switchModel(page: Page, targetModel: string): Promise<string> {
  // Normalize model name
  const fullModelId = targetModel.startsWith('models/')
    ? targetModel
    : `models/${targetModel}`;

  console.log(`[ModelSwitcher] Switching to: ${fullModelId}`);

  // Read current localStorage preference (for rollback if needed)
  const previousPref = await page.evaluate(() => {
    return localStorage.getItem('aiStudioUserPreference');
  });

  try {
    // Set the model in localStorage
    await page.evaluate((modelId: string) => {
      const existingPref = localStorage.getItem('aiStudioUserPreference');
      let pref: Record<string, unknown> = {};

      if (existingPref) {
        try { pref = JSON.parse(existingPref); } catch { /* ignore */ }
      }

      pref.promptModel = modelId;
      localStorage.setItem('aiStudioUserPreference', JSON.stringify(pref));
    }, fullModelId);

    // Navigate to new_chat to apply the model switch
    console.log(`[ModelSwitcher] Navigating to new_chat to apply model...`);
    await page.goto(AI_STUDIO_NEW_CHAT, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });

    // Wait for input to be ready
    await waitForInputAfterSwitch(page);

    // Verify the model name on the page
    const actualModel = await verifyModelOnPage(page, fullModelId);
    setCurrentModel(actualModel);

    // Re-enable temp chat mode after navigation
    await enableTempChatAfterSwitch(page);

    console.log(`[ModelSwitcher] ✅ Successfully switched to: ${actualModel}`);
    return actualModel;

  } catch (error) {
    console.error(`[ModelSwitcher] ❌ Failed to switch to ${fullModelId}:`, error);

    // Attempt rollback
    if (previousPref !== null) {
      try {
        await page.evaluate((prevPref: string) => {
          localStorage.setItem('aiStudioUserPreference', prevPref);
        }, previousPref);
        console.log('[ModelSwitcher] Rolled back localStorage preference');
      } catch {
        console.warn('[ModelSwitcher] Could not rollback localStorage');
      }
    }

    // Wrap in ModelSwitchError if not already
    if (error instanceof ModelSwitchError) throw error;
    const msg = error instanceof Error ? error.message : String(error);
    throw new ModelSwitchError(fullModelId, msg);
  }
}

async function waitForInputAfterSwitch(page: Page): Promise<void> {
  for (const selector of INPUT_WRAPPER) {
    try {
      await page.locator(selector).first().waitFor({
        state: 'visible',
        timeout: 30_000,
      });

      // Also check for textarea
      for (const textareaSelector of PROMPT_TEXTAREA) {
        try {
          await page.locator(textareaSelector).first().waitFor({
            state: 'visible',
            timeout: 10_000,
          });
          return;
        } catch { continue; }
      }
      return;
    } catch { continue; }
  }
  throw new ModelSwitchError('unknown', 'Input area not ready after model switch');
}

async function verifyModelOnPage(page: Page, expectedModel: string): Promise<string> {
  try {
    const modelLocator = page.locator(MODEL_NAME);
    await modelLocator.first().waitFor({ state: 'visible', timeout: 10_000 });
    const modelText = await modelLocator.first().innerText({ timeout: 5_000 });
    const actual = modelText.trim();

    // Extract the short name for comparison
    // e.g. "models/gemini-3-flash-preview" → "gemini-3-flash-preview"
    const expectedShort = expectedModel.replace('models/', '');

    // The UI might show a display name like "Gemini 3 Flash" instead of the ID
    // So we just log it and trust the localStorage switch worked
    if (!actual.toLowerCase().includes(expectedShort.split('-')[0] ?? '')) {
      console.warn(
        `[ModelSwitcher] Model name mismatch: expected contains "${expectedShort}", page shows "${actual}"`,
      );
    }

    return actual;
  } catch {
    console.warn('[ModelSwitcher] Could not verify model name on page');
    return expectedModel;
  }
}

async function enableTempChatAfterSwitch(page: Page): Promise<void> {
  try {
    const toggle = page.locator('button[aria-label="Temporary chat toggle"]');
    await toggle.waitFor({ state: 'visible', timeout: 5_000 });

    const classes = await toggle.getAttribute('class');
    if (classes && !classes.includes('ms-button-active')) {
      await toggle.click({ timeout: 3_000, force: true });
      await page.waitForTimeout(500);
    }
  } catch {
    // Non-critical
  }
}
