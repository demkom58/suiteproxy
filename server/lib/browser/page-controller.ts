/**
 * PageController — orchestrates all interaction with the AI Studio page.
 * Ported from AIstudioProxyAPI's PageController hierarchy (Python → TypeScript).
 *
 * Responsibilities:
 * - Fill and submit prompts
 * - Adjust parameters (temperature, max_tokens, top_p, stop sequences)
 * - Handle thinking model configuration
 * - Extract response text
 * - Clear chat history between requests
 * - Poll for response completion (for streaming)
 */
import type { Page, Locator } from 'playwright-core';
import type { RequestContext, ThinkingDirective, ModelCategory, ThinkingLevel, QueueResult, StreamDelta } from './types';
import { RateLimitError } from './errors';
import * as S from './selectors';
import {
  installInterceptor,
  startCapture,
  endCapture,
  consumeChunks,
  consumeStreamingChunks,
  isCaptureActive,
} from './network-interceptor';

// ── Timeouts ────────────────────────────────────────────────────────────
const RESPONSE_TIMEOUT_MS = 300_000; // 5 min
const CLICK_TIMEOUT_MS = 3_000;
const POLL_INTERVAL_MS = 300;

export class PageController {
  constructor(
    private page: Page,
    private reqId: string,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // PROMPT SUBMISSION
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Fill the prompt textarea and submit it.
   * Uses JavaScript-based filling to bypass Angular's form detection.
   */
  async submitPrompt(text: string): Promise<void> {
    console.log(`[PageController:${this.reqId}] Submitting prompt (${text.length} chars)...`);

    // Find the textarea
    const textarea = await this.findTextarea();

    // Fill using JS to bypass Angular value accessors
    await this.page.evaluate((args: { selector: string; value: string }) => {
      const el = document.querySelector(args.selector) as HTMLTextAreaElement | null;
      if (!el) throw new Error('Textarea not found');

      // Set native value
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype, 'value',
      )?.set;
      nativeInputValueSetter?.call(el, args.value);

      // Dispatch events so Angular picks up the change
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));

      // Also update the autosize wrapper's data-value if it exists
      const wrapper = el.closest('ms-autosize-textarea');
      if (wrapper) {
        wrapper.setAttribute('data-value', args.value);
      }
    }, { selector: textarea.selector, value: text });

    // Brief wait for Angular to process
    await this.page.waitForTimeout(300);

    // Wait for submit button to become enabled
    const submitBtn = this.page.locator(S.SUBMIT_BUTTON);
    try {
      await submitBtn.waitFor({ state: 'visible', timeout: 5_000 });
      // Wait for it to be enabled (not disabled)
      await this.page.waitForFunction(
        (sel: string) => {
          const btn = document.querySelector(sel) as HTMLButtonElement | null;
          return btn && !btn.disabled;
        },
        S.SUBMIT_BUTTON,
        { timeout: 5_000 },
      );
    } catch {
      console.warn(`[PageController:${this.reqId}] Submit button not ready, trying anyway...`);
    }

    // Click submit — with fallbacks
    await this.clickSubmit(textarea.locator, submitBtn);

    console.log(`[PageController:${this.reqId}] Prompt submitted`);
  }

  private async clickSubmit(textarea: Locator, submitBtn: Locator): Promise<void> {
    // Method 1: Click the submit button
    try {
      await submitBtn.click({ timeout: CLICK_TIMEOUT_MS });
      // Verify submission worked (input should be cleared)
      await this.page.waitForTimeout(500);
      const value = await textarea.inputValue().catch(() => 'non-empty');
      if (value === '') return;
    } catch { /* try next method */ }

    // Method 2: JS click
    try {
      await this.page.evaluate((sel: string) => {
        const btn = document.querySelector(sel) as HTMLButtonElement | null;
        btn?.click();
      }, S.SUBMIT_BUTTON);
      await this.page.waitForTimeout(500);
      const value = await textarea.inputValue().catch(() => 'non-empty');
      if (value === '') return;
    } catch { /* try next method */ }

    // Method 3: Enter key
    try {
      await textarea.press('Enter');
      await this.page.waitForTimeout(500);
      const value = await textarea.inputValue().catch(() => 'non-empty');
      if (value === '') return;
    } catch { /* try next method */ }

    // Method 4: Ctrl+Enter / Meta+Enter
    try {
      const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
      await textarea.press(`${modifier}+Enter`);
      await this.page.waitForTimeout(500);
    } catch {
      console.warn(`[PageController:${this.reqId}] All submit methods attempted`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // RESPONSE EXTRACTION
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Wait for the AI to finish responding and extract the text.
   * This is the non-streaming path.
   */
  async getResponse(): Promise<QueueResult> {
    console.log(`[PageController:${this.reqId}] Waiting for response...`);

    // Wait for at least one response container with text (assistant's response)
    await this.waitForResponseText();

    // Wait for response to complete (no more text being generated)
    await this.waitForCompletion();

    // Extract the response text
    const text = await this.extractResponseText();

    console.log(`[PageController:${this.reqId}] Response received (${text.length} chars)`);

    return {
      text,
      finishReason: 'stop',
    };
  }

  /**
   * Poll for response text incrementally (for streaming).
   * Yields text deltas as they appear on the page.
   */
  async *pollResponse(abortSignal?: AbortSignal): AsyncGenerator<StreamDelta> {
    let previousText = '';
    let stableCount = 0; // Counts how many polls text hasn't changed AND textarea is empty
    const STABLE_THRESHOLD = 10; // ~3 seconds at 300ms interval — heuristic completion
    const maxPolls = Math.floor(RESPONSE_TIMEOUT_MS / POLL_INTERVAL_MS);
    let totalPolls = 0;

    // Wait for the assistant to start generating (response text appears)
    console.log(`[PageController:${this.reqId}] pollResponse: waiting for response text...`);
    try {
      await this.waitForResponseText();
    } catch {
      throw new Error('No assistant response appeared within 90 seconds');
    }
    console.log(`[PageController:${this.reqId}] pollResponse: response text detected, starting poll`);

    while (totalPolls < maxPolls) {
      totalPolls++;

      // Check abort signal
      if (abortSignal?.aborted) {
        console.log(`[PageController:${this.reqId}] Stream aborted by client`);
        yield { delta: '', done: true };
        return;
      }

      await this.page.waitForTimeout(POLL_INTERVAL_MS);

      const currentText = await this.getRawResponseText();

      if (currentText.length > previousText.length) {
        const delta = currentText.substring(previousText.length);
        previousText = currentText;
        stableCount = 0;
        yield { delta, done: false };
      } else if (currentText.length > 0) {
        // Text unchanged — check if generation is done
        stableCount++;
      }

      // Check definitive completion signals (edit button, rerun button, run time pill)
      if (currentText.length > 0) {
        const isComplete = await this.isResponseComplete();
        if (isComplete) {
          // One final check for any remaining text
          const finalText = await this.getRawResponseText();
          if (finalText.length > previousText.length) {
            yield { delta: finalText.substring(previousText.length), done: false };
          }
          console.log(`[PageController:${this.reqId}] pollResponse: complete (definitive signal after ${totalPolls} polls)`);
          yield { delta: '', done: true };
          return;
        }
      }

      // Heuristic fallback: if text hasn't changed for ~3s and textarea is empty,
      // the generation is very likely done (covers cases where UI signals are slow)
      if (stableCount >= STABLE_THRESHOLD && currentText.length > 0) {
        const textareaEmpty = await this.isTextareaEmpty();
        if (textareaEmpty) {
          const finalText = await this.getRawResponseText();
          if (finalText.length > previousText.length) {
            yield { delta: finalText.substring(previousText.length), done: false };
          }
          console.log(`[PageController:${this.reqId}] pollResponse: complete (heuristic after ${totalPolls} polls, stable for ${stableCount})`);
          yield { delta: '', done: true };
          return;
        }
      }
    }

    // Timeout — yield what we have
    console.warn(`[PageController:${this.reqId}] pollResponse: timeout after ${totalPolls} polls`);
    yield { delta: '', done: true };
  }

  // ══════════════════════════════════════════════════════════════════════
  // NETWORK-INTERCEPTED STREAMING (preferred — real-time)
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Prepare the network interceptor BEFORE submitting the prompt.
   * Must be called before submitPrompt() for network-based streaming.
   * @param mode - 'streaming' enables in-browser XHR patches for real-time chunks.
   *               'non-streaming' only uses response.body() for the full result.
   */
  async prepareNetworkCapture(mode: 'streaming' | 'non-streaming' = 'non-streaming'): Promise<void> {
    await installInterceptor(this.page);
    await startCapture(this.page, this.reqId, mode);
    console.log(`[PageController:${this.reqId}] Network capture prepared (mode=${mode})`);
  }

  /**
   * Stream response via network interception (v3 hybrid).
   * Uses consumeStreamingChunks() which polls in-browser XHR data for real-time
   * streaming, with automatic fallback to response.body() burst if XHR patches
   * don't capture the data. Falls back to DOM polling only if neither fires.
   */
  async *streamViaNetwork(abortSignal?: AbortSignal): AsyncGenerator<StreamDelta> {
    if (!(await isCaptureActive(this.page))) {
      console.warn(`[PageController:${this.reqId}] No active capture, falling back to DOM polling`);
      yield* this.pollResponse(abortSignal);
      return;
    }

    console.log(`[PageController:${this.reqId}] Streaming via hybrid interception (XHR + route fallback)`);

    let gotAnyData = false;

    try {
      for await (const chunk of consumeStreamingChunks(this.page, this.reqId, abortSignal)) {
        if (abortSignal?.aborted) {
          yield { delta: '', done: true };
          return;
        }

        if (chunk.error) {
          // 'no_data' = neither XHR patches nor response.body() delivered, fall back to DOM polling
          if (!gotAnyData) {
            console.log(`[PageController:${this.reqId}] Network interception didn't fire, falling back to DOM polling (${chunk.error})`);
            await endCapture(this.page);
            yield* this.pollResponse(abortSignal);
            return;
          }
          console.error(`[PageController:${this.reqId}] Stream error: ${chunk.error}`);
          yield { delta: `\n\n[Error: ${chunk.error}]`, done: true };
          return;
        }

        if (chunk.functionCalls?.length) {
          gotAnyData = true;
          yield { delta: '', functionCalls: chunk.functionCalls, done: false };
        }

        if (chunk.images?.length) {
          gotAnyData = true;
          yield { delta: '', images: chunk.images, done: false };
        }

        if (chunk.audioChunks?.length) {
          gotAnyData = true;
          yield { delta: '', audioChunks: chunk.audioChunks, done: false };
        }

        if (chunk.text) {
          gotAnyData = true;
          yield { delta: chunk.text, done: false };
        }

        if (chunk.thinking) {
          gotAnyData = true;
          yield { delta: '', thinking: chunk.thinking, done: false };
        }

        if (chunk.done) {
          yield { delta: '', done: true };
          return;
        }
      }
    } finally {
      await endCapture(this.page);
    }

    // If we exited without a done signal
    if (gotAnyData) {
      yield { delta: '', done: true };
    }
  }

  /**
   * Get response via network interception (non-streaming).
   * With route-based interception, the response is captured at the network level
   * and parsed server-side. Falls back to DOM extraction only if the route doesn't fire.
   */
  async getResponseViaNetwork(): Promise<QueueResult> {
    if (!(await isCaptureActive(this.page))) {
      console.warn(`[PageController:${this.reqId}] No active capture, using DOM extraction`);
      return this.getResponse();
    }

    console.log(`[PageController:${this.reqId}] Getting response via route interception`);

    let networkText = '';
    let networkThinking = '';
    const networkImages: Array<{ mimeType: string; data: string }> = [];
    const networkAudio: Array<{ mimeType: string; data: string }> = [];
    const networkFunctionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    try {
      for await (const chunk of consumeChunks(this.page, this.reqId)) {
        if (chunk.error) {
          if (chunk.error === 'no_data') {
            // Route didn't fire — fall back to DOM extraction
            console.log(`[PageController:${this.reqId}] Route didn't fire, falling back to DOM extraction`);
            await endCapture(this.page);
            return this.getResponse();
          }
          console.error(`[PageController:${this.reqId}] Network error: ${chunk.error}`);
          await endCapture(this.page);
          throw new Error(`Network interception error: ${chunk.error}`);
        }

        if (chunk.text) networkText += chunk.text;
        if (chunk.thinking) networkThinking += chunk.thinking;
        if (chunk.images) networkImages.push(...chunk.images);
        if (chunk.audioChunks) networkAudio.push(...chunk.audioChunks);
        if (chunk.functionCalls) networkFunctionCalls.push(...chunk.functionCalls);

        if (chunk.done) break;
      }
    } finally {
      await endCapture(this.page);
    }

    if (networkText || networkImages.length > 0 || networkAudio.length > 0 || networkFunctionCalls.length > 0) {
      console.log(`[PageController:${this.reqId}] Got response via route (${networkText.length} chars, ${networkImages.length} images, ${networkAudio.length} audio, ${networkFunctionCalls.length} function calls)`);
      return {
        text: networkText,
        finishReason: networkFunctionCalls.length > 0 ? 'tool_calls' : 'stop',
        thinkingText: networkThinking || undefined,
        images: networkImages.length > 0 ? networkImages : undefined,
        audioChunks: networkAudio.length > 0 ? networkAudio : undefined,
        functionCalls: networkFunctionCalls.length > 0 ? networkFunctionCalls : undefined,
      };
    }

    // No text from network — fall back to DOM
    console.warn(`[PageController:${this.reqId}] No text from route, falling back to DOM`);
    return this.getResponse();
  }

  /**
   * Quick check if the textarea is empty (prompt was consumed).
   */
  private async isTextareaEmpty(): Promise<boolean> {
    try {
      return await this.page.evaluate((textareaSels: string[]) => {
        for (const sel of textareaSels) {
          const ta = document.querySelector(sel) as HTMLTextAreaElement | null;
          if (ta) return ta.value === '';
        }
        return false;
      }, [...S.PROMPT_TEXTAREA]);
    } catch {
      return false;
    }
  }

  /**
   * Wait until the response generation is complete.
   * Completion is detected by: input empty + submit disabled + edit button visible.
   */
  private async waitForCompletion(): Promise<void> {
    const startTime = Date.now();
    let consecutiveReady = 0;
    let consecutivePrimaryReady = 0;
    let pollCount = 0;

    while (Date.now() - startTime < RESPONSE_TIMEOUT_MS) {
      pollCount++;
      const complete = await this.isResponseComplete();

      if (complete) {
        consecutiveReady++;
        consecutivePrimaryReady = 0;
        // Require 2 consecutive positive signals (edit button visible) for confidence
        if (consecutiveReady >= 2) return;
      } else {
        consecutiveReady = 0;

        // Also track primary signals (submit disabled + input empty)
        // without requiring edit button — heuristic fallback
        const primaryComplete = await this.isPrimaryComplete();
        if (primaryComplete) {
          consecutivePrimaryReady++;
          // If primary signals hold for ~3s but edit button never appears, accept anyway
          if (consecutivePrimaryReady >= 6) {
            console.warn(`[PageController:${this.reqId}] Heuristic completion: ` +
              `submit disabled + input empty for ${consecutivePrimaryReady} checks, ` +
              `but edit button not visible. Accepting response.`);
            return;
          }
        } else {
          consecutivePrimaryReady = 0;
        }
      }

      // Periodic status logging (every ~5s)
      if (pollCount % 16 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const hasResponse = await this.page.locator(S.RESPONSE_TEXT).count().catch(() => 0);
        const spinnerVisible = await this.page.locator(S.LOADING_SPINNER).isVisible({ timeout: 200 }).catch(() => false);
        console.log(`[PageController:${this.reqId}] Waiting... ${elapsed}s elapsed, ` +
          `responseElements=${hasResponse}, spinner=${spinnerVisible}, ` +
          `primaryReady=${consecutivePrimaryReady}, fullReady=${consecutiveReady}`);
      }

      await this.page.waitForTimeout(POLL_INTERVAL_MS);
    }

    console.warn(`[PageController:${this.reqId}] Response completion timeout after ${RESPONSE_TIMEOUT_MS}ms`);
  }

  /**
   * Check if the textarea is empty and no spinner is visible (primary completion signal).
   * NOTE: The submit button is NOT reliable — AI Studio re-enables it after generation.
   */
  private async isPrimaryComplete(): Promise<boolean> {
    try {
      return await this.page.evaluate((args: { textareaSels: string[]; spinnerSel: string }) => {
        // Check spinner is gone (not actively generating)
        const spinner = document.querySelector(args.spinnerSel);
        if (spinner) return false;

        // Check textarea is empty (prompt was consumed)
        for (const sel of args.textareaSels) {
          const ta = document.querySelector(sel) as HTMLTextAreaElement | null;
          if (ta) return ta.value === '';
        }
        return false;
      }, { textareaSels: [...S.PROMPT_TEXTAREA], spinnerSel: S.LOADING_SPINNER });
    } catch {
      return false;
    }
  }

  /**
   * Full completion check via single page.evaluate (one round-trip).
   * Checks: textarea empty + no spinner + edit button visible on a model turn.
   */
  private async isResponseComplete(): Promise<boolean> {
    try {
      return await this.page.evaluate((args: { textareaSels: string[]; spinnerSel: string }) => {
        // Check textarea is empty (prompt was consumed)
        let textareaEmpty = false;
        for (const sel of args.textareaSels) {
          const ta = document.querySelector(sel) as HTMLTextAreaElement | null;
          if (ta) { textareaEmpty = ta.value === ''; break; }
        }
        if (!textareaEmpty) return false;

        // Get model turns
        const modelTurns = document.querySelectorAll('ms-chat-turn .chat-turn-container.model');
        if (modelTurns.length === 0) return false;

        // Check the LAST model turn for completion signals
        const lastModelTurn = modelTurns[modelTurns.length - 1]!;

        // Signal 1: Edit button (strongest — may use aria-label="Edit" or class .toggle-edit-button)
        const editBtn = lastModelTurn.querySelector('[aria-label="Edit"], button.toggle-edit-button');
        if (editBtn) return true;

        // Signal 2: "Rerun this turn" button (appears only after generation completes)
        const rerunBtn = lastModelTurn.querySelector('[aria-label="Rerun this turn"]');
        if (rerunBtn) return true;

        // Signal 3: Run time pill visible (shows generation duration like "0.2s")
        // This is inside the turn footer and only appears after completion
        const closestTurn = lastModelTurn.closest('ms-chat-turn');
        if (closestTurn) {
          const runTimePill = closestTurn.querySelector('.model-run-time-pill');
          if (runTimePill) return true;
        }

        return false;
      }, { textareaSels: [...S.PROMPT_TEXTAREA], spinnerSel: S.LOADING_SPINNER });
    } catch {
      return false;
    }
  }

  /**
   * Extract the response text from the page.
   * Uses a tiered approach matching the reference project:
   * 1. Edit button (most reliable — gets raw markdown via data-value)
   * 2. Copy Markdown via clipboard (gets formatted markdown)
   * 3. Direct DOM text extraction (fallback — may have minor formatting issues)
   */
  private async extractResponseText(): Promise<string> {
    // Method 1: Edit button (most reliable)
    const editText = await this.extractViaEditButton();
    if (editText !== null && editText.length > 0) return editText;

    // Method 2: Copy Markdown via clipboard
    const clipboardText = await this.extractViaCopyMarkdown();
    if (clipboardText !== null && clipboardText.length > 0) return clipboardText;

    // Method 3: Direct DOM text extraction
    const domText = await this.getRawResponseText();
    if (domText.length > 0) return domText;

    console.warn(`[PageController:${this.reqId}] Could not extract response text`);
    return '';
  }

  private async extractViaEditButton(): Promise<string | null> {
    try {
      const lastTurn = this.page.locator(S.CHAT_TURN).last();

      // Hover over the last turn to reveal action buttons
      try {
        await lastTurn.hover({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(300);
      } catch {
        console.warn(`[PageController:${this.reqId}] Hover on last turn failed, continuing...`);
      }

      // Use aria-label based locators (more reliable than CSS selectors)
      const editBtn = lastTurn.getByLabel('Edit');
      try {
        await editBtn.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT_MS });
      } catch {
        console.log(`[PageController:${this.reqId}] Edit button not visible via label, trying CSS...`);
        // Fallback to CSS selector
        const editBtnCss = lastTurn.locator(S.EDIT_BUTTON);
        if (!(await editBtnCss.isVisible({ timeout: CLICK_TIMEOUT_MS }).catch(() => false))) {
          return null;
        }
        await editBtnCss.click({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(300);
        // continue to content extraction below
        return await this.readEditContent(lastTurn);
      }

      await editBtn.click({ timeout: CLICK_TIMEOUT_MS });
      await this.page.waitForTimeout(300);

      return await this.readEditContent(lastTurn);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Edit button extraction failed:`, error);
      return null;
    }
  }

  /**
   * Read content from the edit textarea, then stop editing.
   * Called after clicking the Edit button.
   */
  private async readEditContent(lastTurn: Locator): Promise<string | null> {
    let content: string | null = null;

    // Try data-value attribute first (most reliable — contains raw markdown)
    const autosizeTextarea = lastTurn.locator('ms-autosize-textarea');
    if (await autosizeTextarea.count() > 0) {
      try {
        const dataValue = await autosizeTextarea.getAttribute('data-value');
        if (dataValue !== null) {
          content = dataValue;
          console.log(`[PageController:${this.reqId}] Got content via data-value (${content.length} chars)`);
        }
      } catch {
        console.warn(`[PageController:${this.reqId}] data-value read failed`);
      }
    }

    // Fallback to textarea input value
    if (!content) {
      const ta = lastTurn.locator('textarea');
      if (await ta.count() > 0) {
        try {
          await ta.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT_MS });
          content = await ta.inputValue({ timeout: CLICK_TIMEOUT_MS });
          if (content) {
            console.log(`[PageController:${this.reqId}] Got content via textarea inputValue (${content.length} chars)`);
          }
        } catch {
          console.warn(`[PageController:${this.reqId}] textarea inputValue read failed`);
        }
      }
    }

    // Click "Stop editing" to restore normal view
    try {
      const stopBtn = lastTurn.getByLabel('Stop editing');
      if (await stopBtn.isVisible({ timeout: CLICK_TIMEOUT_MS }).catch(() => false)) {
        await stopBtn.click({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(200);
      }
    } catch {
      // Also try CSS selector fallback
      try {
        const stopBtnCss = lastTurn.locator(S.STOP_EDITING_BUTTON);
        if (await stopBtnCss.isVisible({ timeout: CLICK_TIMEOUT_MS }).catch(() => false)) {
          await stopBtnCss.click({ timeout: CLICK_TIMEOUT_MS });
          await this.page.waitForTimeout(200);
        }
      } catch {
        console.warn(`[PageController:${this.reqId}] Could not click Stop editing button`);
      }
    }

    return content?.trim() ?? null;
  }

  /**
   * Extract response via "Copy Markdown" menu option + clipboard.
   * Fallback method when edit button approach fails.
   */
  private async extractViaCopyMarkdown(): Promise<string | null> {
    try {
      const lastTurn = this.page.locator(S.CHAT_TURN).last();

      // Hover to reveal action buttons
      try {
        await lastTurn.hover({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(500);
      } catch {
        console.warn(`[PageController:${this.reqId}] Hover failed for copy markdown`);
        return null;
      }

      // Click "Open options" (more options button)
      const moreOptionsBtn = lastTurn.getByLabel('Open options');
      try {
        await moreOptionsBtn.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT_MS });
        await moreOptionsBtn.click({ timeout: CLICK_TIMEOUT_MS });
      } catch {
        // Fallback to CSS selector
        const moreOptsCss = lastTurn.locator(S.MORE_OPTIONS_BUTTON);
        if (!(await moreOptsCss.isVisible({ timeout: CLICK_TIMEOUT_MS }).catch(() => false))) {
          return null;
        }
        await moreOptsCss.click({ timeout: CLICK_TIMEOUT_MS });
      }
      await this.page.waitForTimeout(500);

      // Click "Copy markdown" menu item
      const copyMarkdownBtn = this.page.getByRole('menuitem', { name: 'Copy markdown' });
      try {
        await copyMarkdownBtn.waitFor({ state: 'visible', timeout: CLICK_TIMEOUT_MS });
        await copyMarkdownBtn.click({ timeout: CLICK_TIMEOUT_MS, force: true });
      } catch {
        // Fallback to CSS selector
        const copyMdCss = this.page.locator(S.COPY_MARKDOWN_ITEM);
        if (!(await copyMdCss.isVisible({ timeout: CLICK_TIMEOUT_MS }).catch(() => false))) {
          // Dismiss menu by pressing Escape
          await this.page.keyboard.press('Escape').catch(() => {});
          return null;
        }
        await copyMdCss.click({ timeout: CLICK_TIMEOUT_MS, force: true });
      }
      await this.page.waitForTimeout(500);

      // Read clipboard content
      const clipboardContent = await this.page.evaluate(
        () => navigator.clipboard.readText(),
      ).catch(() => null);

      if (clipboardContent && clipboardContent.trim().length > 0) {
        console.log(`[PageController:${this.reqId}] Got content via Copy Markdown (${clipboardContent.length} chars)`);
        return clipboardContent.trim();
      }

      return null;
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Copy Markdown extraction failed:`, error);
      return null;
    }
  }

  /**
   * Wait until there's actual response text on the page.
   * Polls until the last response container has non-empty text content.
   * Also checks for page errors (rate limit, internal errors) and throws them.
   */
  private async waitForResponseText(timeoutMs = 90_000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const text = await this.getRawResponseText();
        if (text.trim().length > 0) return;
      } catch (error) {
        // Propagate typed errors (RateLimitError, AI Studio errors)
        if (error instanceof RateLimitError || (
          error instanceof Error && error.message.startsWith('AI Studio error:')
        )) {
          throw error;
        }
        // Other errors — keep polling
      }

      // Also check for error toasts
      try {
        const errorToast = await this.page.locator(S.ERROR_TOAST).first().isVisible({ timeout: 100 });
        if (errorToast) {
          const toastText = await this.page.locator(S.ERROR_TOAST).first().innerText({ timeout: 1_000 }).catch(() => '');
          if (toastText.toLowerCase().includes('rate limit') || toastText.toLowerCase().includes('quota')) {
            throw new RateLimitError(toastText);
          }
          if (toastText.length > 0) {
            throw new Error(`AI Studio error: ${toastText}`);
          }
        }
      } catch (error) {
        if (error instanceof RateLimitError || (
          error instanceof Error && error.message.startsWith('AI Studio error:')
        )) {
          throw error;
        }
      }

      await this.page.waitForTimeout(POLL_INTERVAL_MS);
    }
    throw new Error(`No response text appeared within ${timeoutMs}ms`);
  }

  private async getRawResponseText(): Promise<string> {
    try {
      // Use page.evaluate for a single round-trip to extract response text
      // This is critical for streaming performance (called every 300ms)
      const result = await this.page.evaluate((cmarkSel: string) => {
        const modelTurns = document.querySelectorAll('ms-chat-turn .chat-turn-container.model');
        if (modelTurns.length === 0) return { text: '', error: null };

        // Find the RESPONSE turn (not the thinking turn)
        // The thinking turn contains "Thinking" or "Thoughts" label
        // We want the last turn that is NOT a thinking-only turn
        let responseTurn: Element | null = null;
        for (let i = modelTurns.length - 1; i >= 0; i--) {
          const turn = modelTurns[i]!;
          const container = turn.querySelector('.model-prompt-container');
          const containerText = container?.textContent?.trim() ?? '';
          // Skip if it's ONLY a thinking/timer turn (no real content)
          const isThinkingOnly = /^(Model\s*)?(Thinking|Thoughts)/i.test(containerText)
            || /^\d+\.\d+s$/.test(containerText)
            || containerText === 'Model'
            || containerText === '';
          if (!isThinkingOnly) {
            responseTurn = turn;
            break;
          }
        }

        if (!responseTurn) return { text: '', error: null };

        // Check for model error (rate limit, internal error, etc.)
        const errorEl = responseTurn.querySelector('.model-error');
        if (errorEl) {
          const errorText = (errorEl as HTMLElement).innerText?.trim() ?? '';
          if (errorText) {
            return { text: '', error: errorText };
          }
        }

        // Primary: extract text from cmark nodes (rendered markdown)
        const cmarkNodes = responseTurn.querySelectorAll(cmarkSel);
        if (cmarkNodes.length > 0) {
          const texts: string[] = [];
          cmarkNodes.forEach(node => {
            const t = (node as HTMLElement).innerText?.trim();
            if (t) texts.push(t);
          });
          const combined = texts.join('\n');
          if (combined.length > 0) return { text: combined, error: null };
        }

        // Fallback: use .model-prompt-container text
        const promptContainer = responseTurn.querySelector('.model-prompt-container');
        if (promptContainer) {
          const text = (promptContainer as HTMLElement).innerText?.trim() ?? '';
          return { text, error: null };
        }

        return { text: '', error: null };
      }, S.RESPONSE_TEXT);

      // Handle page-level errors
      if (result.error) {
        const errorLower = result.error.toLowerCase();
        if (errorLower.includes('rate limit') || errorLower.includes('quota')) {
          throw new RateLimitError(result.error);
        }
        if (errorLower.includes('internal error') || errorLower.includes('error')) {
          throw new Error(`AI Studio error: ${result.error}`);
        }
      }

      return result.text;
    } catch (error) {
      // Re-throw typed errors (RateLimitError, AI Studio errors)
      if (error instanceof RateLimitError || (
        error instanceof Error && error.message.startsWith('AI Studio error:')
      )) {
        throw error;
      }
      return '';
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // PARAMETER ADJUSTMENT
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Adjust all generation parameters on the page before submitting.
   */
  async adjustParameters(ctx: RequestContext): Promise<void> {
    // Set system instruction via the AI Studio UI panel
    if (ctx.systemInstruction) {
      await this.setSystemInstruction(ctx.systemInstruction);
    }

    // Standard parameters
    if (ctx.temperature !== undefined) {
      await this.setSliderValue(S.TEMPERATURE_INPUT, ctx.temperature, 'Temperature');
    }
    if (ctx.maxTokens !== undefined) {
      await this.setSliderValue(S.MAX_TOKENS_INPUT, ctx.maxTokens, 'Max Tokens');
    }
    if (ctx.topP !== undefined) {
      await this.setSliderValue(S.TOP_P_INPUT, ctx.topP, 'Top P');
    }
    if (ctx.stopSequences && ctx.stopSequences.length > 0) {
      await this.setStopSequences(ctx.stopSequences);
    }
    if (ctx.reasoningEffort !== undefined) {
      await this.handleThinking(ctx.model, ctx.reasoningEffort);
    }

    // Expand tools panel before toggling tools
    await this.ensureToolsPanelExpanded();

    // Google Search grounding
    if (ctx.enableGoogleSearch !== undefined) {
      await this.setGoogleSearch(ctx.enableGoogleSearch);
    }

    // URL Context
    if (ctx.enableUrlContext !== undefined) {
      await this.setUrlContext(ctx.enableUrlContext);
    }

    // Upload images if present
    if (ctx.images && ctx.images.length > 0) {
      await this.uploadImages(ctx.images);
    }
  }

  private async setSliderValue(selector: string, value: number, label: string): Promise<void> {
    try {
      const input = this.page.locator(selector);
      if (!(await input.isVisible({ timeout: 2_000 }).catch(() => false))) {
        console.log(`[PageController:${this.reqId}] ${label} input not visible, skipping`);
        return;
      }

      // Read current value
      const currentVal = await input.inputValue().catch(() => '');
      if (currentVal === String(value)) return; // Already correct

      // Set via JS
      await this.page.evaluate((args: { sel: string; val: number }) => {
        const el = document.querySelector(args.sel) as HTMLInputElement | null;
        if (!el) return;
        const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        nativeSetter?.call(el, String(args.val));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, { sel: selector, val: value });

      console.log(`[PageController:${this.reqId}] Set ${label} = ${value}`);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to set ${label}:`, error);
    }
  }

  private async setStopSequences(sequences: string[]): Promise<void> {
    try {
      const input = this.page.locator(S.STOP_SEQUENCES_INPUT);
      if (!(await input.isVisible({ timeout: 2_000 }).catch(() => false))) return;

      for (const seq of sequences) {
        await input.fill(seq);
        await input.press('Enter');
        await this.page.waitForTimeout(200);
      }
      console.log(`[PageController:${this.reqId}] Set ${sequences.length} stop sequences`);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to set stop sequences:`, error);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // SYSTEM INSTRUCTION
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Set the system instruction via AI Studio's system instruction panel.
   * Expands the panel if collapsed, clears any existing instruction, and fills new text.
   */
  private async setSystemInstruction(text: string): Promise<void> {
    try {
      // Open the system instruction panel if collapsed
      for (const toggleSelector of S.SYSTEM_INSTRUCTION_TOGGLE) {
        const toggle = this.page.locator(toggleSelector);
        if (await toggle.isVisible({ timeout: 2_000 }).catch(() => false)) {
          // Check if the panel is already expanded (textarea visible)
          let alreadyVisible = false;
          for (const taSelector of S.SYSTEM_INSTRUCTION_TEXTAREA) {
            if (await this.page.locator(taSelector).isVisible({ timeout: 500 }).catch(() => false)) {
              alreadyVisible = true;
              break;
            }
          }
          if (!alreadyVisible) {
            await toggle.click({ timeout: CLICK_TIMEOUT_MS });
            await this.page.waitForTimeout(500);
          }
          break;
        }
      }

      // Find and fill the system instruction textarea
      for (const taSelector of S.SYSTEM_INSTRUCTION_TEXTAREA) {
        const ta = this.page.locator(taSelector);
        if (await ta.isVisible({ timeout: 3_000 }).catch(() => false)) {
          // Clear existing content
          await ta.fill('');
          await this.page.waitForTimeout(100);

          // Fill via JS for Angular compatibility
          await this.page.evaluate((args: { sel: string; val: string }) => {
            const el = document.querySelector(args.sel) as HTMLTextAreaElement | null;
            if (!el) return;
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
            setter?.call(el, args.val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, { sel: taSelector, val: text });

          console.log(`[PageController:${this.reqId}] Set system instruction (${text.length} chars)`);
          return;
        }
      }

      console.warn(`[PageController:${this.reqId}] System instruction textarea not found, falling back to prompt prepend`);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to set system instruction via UI:`, error);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // TOOLS PANEL & TOGGLES
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Ensure the tools panel is expanded so we can access toggles inside it.
   */
  private async ensureToolsPanelExpanded(): Promise<void> {
    try {
      const toggle = this.page.locator(S.TOOLS_PANEL_TOGGLE);
      if (!(await toggle.isVisible({ timeout: 3_000 }).catch(() => false))) return;

      // Check the grandparent for "expanded" class
      const grandparent = toggle.locator('xpath=../..');
      const classStr = await grandparent.getAttribute('class').catch(() => '');
      if (classStr && !classStr.includes('expanded')) {
        await toggle.click({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(500);
        console.log(`[PageController:${this.reqId}] Tools panel expanded`);
      }
    } catch {
      // Non-critical — tools panel may not exist on all pages
    }
  }

  /**
   * Toggle Google Search grounding on/off.
   */
  private async setGoogleSearch(enabled: boolean): Promise<void> {
    try {
      const toggle = this.page.locator(S.GOOGLE_SEARCH_TOGGLE).first();
      if (!(await toggle.isVisible({ timeout: 3_000 }).catch(() => false))) {
        console.log(`[PageController:${this.reqId}] Google Search toggle not visible, skipping`);
        return;
      }

      const isChecked = await toggle.getAttribute('aria-checked') === 'true';
      if (isChecked === enabled) return; // Already in desired state

      await toggle.scrollIntoViewIfNeeded().catch(() => {});
      await toggle.click({ timeout: CLICK_TIMEOUT_MS });
      await this.page.waitForTimeout(300);
      console.log(`[PageController:${this.reqId}] Google Search ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to toggle Google Search:`, error);
    }
  }

  /**
   * Toggle URL Context on/off.
   */
  private async setUrlContext(enabled: boolean): Promise<void> {
    try {
      const toggle = this.page.locator(S.URL_CONTEXT_TOGGLE).first();
      if (!(await toggle.isVisible({ timeout: 3_000 }).catch(() => false))) {
        console.log(`[PageController:${this.reqId}] URL Context toggle not visible, skipping`);
        return;
      }

      const isChecked = await toggle.getAttribute('aria-checked') === 'true';
      if (isChecked === enabled) return;

      await toggle.click({ timeout: CLICK_TIMEOUT_MS });
      await this.page.waitForTimeout(300);
      console.log(`[PageController:${this.reqId}] URL Context ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to toggle URL Context:`, error);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // IMAGE/FILE UPLOAD
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Upload images via AI Studio's "Insert assets" → "Upload a file" flow.
   * Images are expected as base64-encoded data with MIME types.
   */
  private async uploadImages(images: Array<{ mimeType: string; data: string }>): Promise<void> {
    try {
      const { writeFile, mkdir } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const tmpDir = join('data', 'uploads', this.reqId);
      await mkdir(tmpDir, { recursive: true });

      // Write base64 images to temp files
      const filePaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i]!;
        const ext = img.mimeType.split('/')[1] ?? 'bin';
        const filePath = join(tmpDir, `image_${i}.${ext}`);
        const buffer = Buffer.from(img.data, 'base64');
        await writeFile(filePath, buffer);
        filePaths.push(filePath);
      }

      // Click "Insert assets" button
      const insertBtn = this.page.locator(S.INSERT_ASSETS_BUTTON);
      if (!(await insertBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
        console.warn(`[PageController:${this.reqId}] Insert assets button not found`);
        return;
      }
      await insertBtn.click({ timeout: CLICK_TIMEOUT_MS });
      await this.page.waitForTimeout(500);

      // Click "Upload a file" menu item
      const uploadBtn = this.page.locator(S.UPLOAD_FILE_OPTION);
      if (await uploadBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        // Try hidden input[type=file] first
        const fileInput = uploadBtn.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(filePaths);
        } else {
          // Use file chooser
          const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser', { timeout: 5_000 }),
            uploadBtn.click({ timeout: CLICK_TIMEOUT_MS }),
          ]);
          await fileChooser.setFiles(filePaths);
        }

        console.log(`[PageController:${this.reqId}] Uploaded ${filePaths.length} images`);
        await this.page.waitForTimeout(1_000);
      } else {
        // Dismiss menu
        await this.page.keyboard.press('Escape').catch(() => {});
        console.warn(`[PageController:${this.reqId}] Upload file option not found`);
      }

      // Handle potential copyright/auth dialog after upload
      await this.handlePostUploadDialog();

      // Cleanup temp files
      const { rm } = await import('node:fs/promises');
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});

    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Image upload failed:`, error);
    }
  }

  /**
   * Handle post-upload dialogs (copyright acknowledgment, etc.)
   */
  private async handlePostUploadDialog(): Promise<void> {
    try {
      const agreeTexts = ['Agree', 'I agree', 'Allow', 'Continue', 'OK'];
      for (const text of agreeTexts) {
        const btn = this.page.locator(`button:has-text("${text}")`);
        if (await btn.first().isVisible({ timeout: 500 }).catch(() => false)) {
          await btn.first().click({ timeout: CLICK_TIMEOUT_MS });
          await this.page.waitForTimeout(300);
          console.log(`[PageController:${this.reqId}] Clicked post-upload dialog: "${text}"`);
          break;
        }
      }
    } catch { /* non-critical */ }
  }

  // ══════════════════════════════════════════════════════════════════════
  // THINKING MODEL SUPPORT
  // ══════════════════════════════════════════════════════════════════════

  private async handleThinking(model: string, effort: string | number): Promise<void> {
    const category = classifyModel(model);
    const directive = normalizeReasoningEffort(effort, category);

    if (category === 'NON_THINKING') return;

    console.log(`[PageController:${this.reqId}] Thinking config: ${category}, ` +
      `enabled=${directive.enabled}, budget=${directive.budgetValue}, level=${directive.level}`);

    switch (category) {
      case 'THINKING_FLASH_25':
        await this.setThinkingToggle(directive.enabled);
        if (directive.enabled && directive.budgetEnabled) {
          await this.setThinkingBudget(directive.budgetValue);
        }
        break;
      case 'THINKING_PRO_25':
        // Always-on thinking, just set budget
        if (directive.budgetEnabled) {
          await this.setThinkingBudget(directive.budgetValue);
        }
        break;
      case 'THINKING_LEVEL_PRO':
      case 'THINKING_LEVEL_FLASH':
        if (directive.level) {
          await this.setThinkingLevel(directive.level);
        }
        break;
    }
  }

  private async setThinkingToggle(enabled: boolean): Promise<void> {
    for (const selector of S.THINKING_TOGGLE) {
      try {
        const toggle = this.page.locator(selector);
        if (!(await toggle.isVisible({ timeout: 2_000 }).catch(() => false))) continue;

        const isCurrentlyEnabled = await toggle.getAttribute('aria-checked') === 'true'
          || (await toggle.getAttribute('class'))?.includes('active')
          || false;

        if (isCurrentlyEnabled !== enabled) {
          await toggle.click({ timeout: CLICK_TIMEOUT_MS });
          await this.page.waitForTimeout(300);
        }
        return;
      } catch { continue; }
    }
  }

  private async setThinkingBudget(value: number | null): Promise<void> {
    if (value === null) return;

    try {
      // Enable budget toggle first
      for (const selector of S.THINKING_BUDGET_TOGGLE) {
        const toggle = this.page.locator(selector);
        if (!(await toggle.isVisible({ timeout: 2_000 }).catch(() => false))) continue;

        const isEnabled = await toggle.getAttribute('aria-checked') === 'true'
          || (await toggle.getAttribute('class'))?.includes('active');

        if (!isEnabled) {
          await toggle.click({ timeout: CLICK_TIMEOUT_MS });
          await this.page.waitForTimeout(300);
        }
        break;
      }

      // Set budget value
      await this.setSliderValue(S.THINKING_BUDGET_INPUT, value, 'Thinking Budget');
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to set thinking budget:`, error);
    }
  }

  private async setThinkingLevel(level: ThinkingLevel): Promise<void> {
    try {
      // Find and click the dropdown
      for (const selector of S.THINKING_LEVEL_DROPDOWN) {
        const dropdown = this.page.locator(selector);
        if (!(await dropdown.isVisible({ timeout: 2_000 }).catch(() => false))) continue;

        await dropdown.click({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(300);

        // Select the option
        const optionSelector = S.THINKING_LEVEL_OPTIONS[level];
        const option = this.page.locator(optionSelector);
        await option.click({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(300);

        console.log(`[PageController:${this.reqId}] Set thinking level = ${level}`);
        return;
      }
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to set thinking level:`, error);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // POST-RESPONSE CLEANUP
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Ensure the model has fully stopped generating before the next request.
   * Clicks the stop button if it's still showing, then waits for idle state.
   */
  async ensureGenerationStopped(): Promise<void> {
    try {
      // Check if the submit button is in "stop" mode (has stoppable-spinner)
      const spinner = this.page.locator(S.LOADING_SPINNER);
      if (await spinner.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log(`[PageController:${this.reqId}] Generation still active, clicking stop...`);
        const submitBtn = this.page.locator(S.SUBMIT_BUTTON);
        await submitBtn.click({ timeout: CLICK_TIMEOUT_MS }).catch(() => {});
        // Wait for spinner to disappear
        await spinner.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
        console.log(`[PageController:${this.reqId}] Generation stopped`);
      }
    } catch {
      // Non-fatal — generation may have already stopped
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Clear the chat history (click "New chat" button).
   */
  async clearChat(): Promise<void> {
    try {
      // Dismiss any stale overlay backdrops first
      await this.dismissBackdrops();

      const newChatBtn = this.page.locator(S.CLEAR_CHAT_BUTTON).first();
      if (!(await newChatBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
        console.log(`[PageController:${this.reqId}] New chat button not visible, skipping clear`);
        return;
      }

      // Check if button is actually enabled (disabled = nothing to clear)
      const isDisabled = await newChatBtn.getAttribute('aria-disabled') === 'true'
        || await newChatBtn.isDisabled().catch(() => false);
      if (isDisabled) {
        console.log(`[PageController:${this.reqId}] New chat button is disabled (no chat to clear), skipping`);
        return;
      }

      await newChatBtn.click({ timeout: CLICK_TIMEOUT_MS });
      await this.page.waitForTimeout(500);

      // Handle "Discard and continue" dialog if it appears
      const discardBtn = this.page.locator(S.CONFIRM_DISCARD);
      if (await discardBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await discardBtn.click({ timeout: CLICK_TIMEOUT_MS });
        await this.page.waitForTimeout(500);
      }

      console.log(`[PageController:${this.reqId}] Chat cleared`);
    } catch (error) {
      console.warn(`[PageController:${this.reqId}] Failed to clear chat:`, error);
    }
  }

  /**
   * Dismiss overlays, backdrops, tooltips, and floating elements.
   * Ported from AIstudioProxyAPI's aggressive tooltip dismissal.
   * Uses DOM removal via JS rather than simulated clicks to avoid
   * triggering BotGuard detection.
   */
  private async dismissBackdrops(): Promise<void> {
    try {
      // Remove tooltip/overlay elements via JS (no click/keyboard needed)
      await this.page.evaluate(() => {
        // Remove CDK overlay containers (Angular Material menus, tooltips, dialogs)
        document.querySelectorAll('.cdk-overlay-container .cdk-overlay-pane').forEach(el => {
          el.remove();
        });
        // Remove backdrop overlays
        document.querySelectorAll('.cdk-overlay-backdrop').forEach(el => {
          el.remove();
        });
        // Remove tooltip elements
        document.querySelectorAll('mat-tooltip-component, .mat-mdc-tooltip').forEach(el => {
          el.remove();
        });
        // Remove any snack-bar / toast notifications that might overlap
        document.querySelectorAll('mat-snack-bar-container, .mat-mdc-snack-bar-container').forEach(el => {
          el.remove();
        });
      });

      // Move mouse to a neutral position to prevent hover-triggered tooltips
      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(100);
    } catch {
      // Fallback: try Escape key if JS removal fails
      try {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(200);
      } catch { /* ignore */ }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════

  private async findTextarea(): Promise<{ locator: Locator; selector: string }> {
    // Try each selector with increasing patience
    for (const selector of S.PROMPT_TEXTAREA) {
      const locator = this.page.locator(selector);
      try {
        const count = await locator.count();
        if (count > 0 && await locator.first().isVisible({ timeout: 2_000 })) {
          console.log(`[PageController:${this.reqId}] Found textarea: ${selector}`);
          return { locator: locator.first(), selector };
        }
      } catch { /* try next */ }
    }

    // Last resort: any visible textarea on the page
    const anyTextarea = this.page.locator('textarea');
    const count = await anyTextarea.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        if (await anyTextarea.nth(i).isVisible({ timeout: 1_000 }).catch(() => false)) {
          console.log(`[PageController:${this.reqId}] Found textarea via generic fallback (index ${i})`);
          return { locator: anyTextarea.nth(i), selector: 'textarea' };
        }
      }
    }

    throw new Error('Prompt textarea not found on page');
  }
}

// ── Model Classification ────────────────────────────────────────────────

export function classifyModel(model: string): ModelCategory {
  const m = model.toLowerCase();

  if (m.includes('gemini-3') && m.includes('flash')) return 'THINKING_LEVEL_FLASH';
  if (m.includes('gemini-3') && m.includes('pro')) return 'THINKING_LEVEL_PRO';
  if (m.includes('gemini-2.5') && m.includes('flash')) return 'THINKING_FLASH_25';
  if (m.includes('gemini-2.5') && m.includes('pro')) return 'THINKING_PRO_25';
  // Gemini 2.0, 1.5, etc.
  return 'NON_THINKING';
}

export function normalizeReasoningEffort(
  effort: string | number | undefined,
  category: ModelCategory,
): ThinkingDirective {
  if (effort === undefined || effort === null) {
    // Use defaults based on model category
    return getDefaultDirective(category);
  }

  // Disable thinking
  if (effort === 0 || effort === '0') {
    return { enabled: false, budgetEnabled: false, budgetValue: null, level: null };
  }

  // No budget limit
  if (effort === 'none' || effort === '-1' || effort === -1) {
    return { enabled: true, budgetEnabled: false, budgetValue: null, level: null };
  }

  // Level-based (for Gemini 3)
  if (typeof effort === 'string') {
    const lower = effort.toLowerCase() as ThinkingLevel;
    if (['minimal', 'low', 'medium', 'high'].includes(lower)) {
      return { enabled: true, budgetEnabled: false, budgetValue: null, level: lower };
    }
  }

  // Numeric budget
  const budgetValue = typeof effort === 'string' ? parseInt(effort, 10) : effort;
  if (!isNaN(budgetValue) && budgetValue > 0) {
    return { enabled: true, budgetEnabled: true, budgetValue, level: null };
  }

  return getDefaultDirective(category);
}

function getDefaultDirective(category: ModelCategory): ThinkingDirective {
  switch (category) {
    case 'THINKING_LEVEL_FLASH':
      return { enabled: true, budgetEnabled: false, budgetValue: null, level: 'high' };
    case 'THINKING_LEVEL_PRO':
      return { enabled: true, budgetEnabled: false, budgetValue: null, level: 'high' };
    case 'THINKING_FLASH_25':
      return { enabled: true, budgetEnabled: true, budgetValue: 8192, level: null };
    case 'THINKING_PRO_25':
      return { enabled: true, budgetEnabled: true, budgetValue: 8192, level: null };
    case 'NON_THINKING':
      return { enabled: false, budgetEnabled: false, budgetValue: null, level: null };
  }
}
