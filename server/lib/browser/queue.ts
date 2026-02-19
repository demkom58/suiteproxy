/**
 * Request Queue — processes requests sequentially through the browser.
 *
 * Features:
 * - Sequential processing (browser can only handle one request at a time)
 * - Tiered error recovery (Tier 1: refresh → Tier 2: account switch)
 * - Abort signal support for client disconnection
 * - Streaming requests also go through the queue (no bypass)
 * - Error snapshots on failure
 * - Typed error classification for precise recovery
 */
import type { RequestContext, QueueItem, QueueResult, StreamDelta } from './types';
import type { Page } from 'playwright-core';
import { getPage, refreshPage, closeBrowser, getCurrentModel, getCurrentAccountId } from './index';
import { PageController } from './page-controller';
import { switchModel } from './model-switcher';
import { useDb } from '~~/server/utils/suite';
import {
  NoAccountsError,
  ClientDisconnectedError,
  isTier2Recoverable,
  isFatalError,
  type BrowserAutomationError,
} from './errors';
import { isRateLimitError } from './errors';
import { saveErrorSnapshot } from './snapshots';
import { injectPromptHistory, removeInjectorRoutes, triggerGeneration } from './prompt-injector';
import { deleteDriveFiles, type DriveAuthCredentials } from './drive-uploader';
import { generateSpeech } from './tts-controller';

// ── Queue State (survives hot reloads) ──────────────────────────────────
declare global {
  var _requestQueue: QueueItem[] | undefined;
  var _isProcessing: boolean | undefined;
  var _currentPage: Page | null;
}

if (!globalThis._requestQueue) globalThis._requestQueue = [];
if (globalThis._isProcessing === undefined) globalThis._isProcessing = false;
if (globalThis._currentPage === undefined) globalThis._currentPage = null;

const MAX_RETRIES = 3;

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Enqueue a request for processing. Returns a promise that resolves with the response.
 */
export function enqueueRequest(
  context: RequestContext,
  abortSignal?: AbortSignal,
): Promise<QueueResult> {
  return new Promise<QueueResult>((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new ClientDisconnectedError('Request aborted before enqueue', context.reqId));
      return;
    }

    const item: QueueItem = { context, resolve, reject, abortSignal };
    globalThis._requestQueue!.push(item);

    console.log(`[Queue] Enqueued request ${context.reqId} (queue size: ${globalThis._requestQueue!.length})`);

    if (!globalThis._isProcessing) {
      processQueue().catch(err => {
        console.error('[Queue] Processing loop error:', err);
      });
    }
  });
}

/**
 * Enqueue a streaming request. Returns an async generator of SSE events.
 * Unlike the old implementation, this now goes through the queue properly.
 */
export async function* enqueueStreamingRequest(
  context: RequestContext,
  abortSignal?: AbortSignal,
): AsyncGenerator<string> {
  // Create a bridge: the queue resolves with a special streaming result
  // containing an async generator that yields chunks
  const streamContext: RequestContext = { ...context, stream: true };

  // We need a different approach for streaming:
  // Execute through the queue but yield SSE chunks as they arrive
  const chatId = `chatcmpl-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;
  const model = context.model.startsWith('models/') ? context.model : `models/${context.model}`;
  const created = Math.floor(Date.now() / 1000);

  // Wait for our turn in the queue, then stream
  const streamResult = await new Promise<AsyncGenerator<StreamDelta>>((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new ClientDisconnectedError('Request aborted before enqueue', context.reqId));
      return;
    }

    const item: QueueItem = {
      context: streamContext,
      resolve: (result) => {
        // This won't be called in streaming mode
        resolve(result as unknown as AsyncGenerator<StreamDelta>);
      },
      reject,
      abortSignal,
      streamCallback: (generator) => resolve(generator),
    };
    globalThis._requestQueue!.push(item);

    console.log(`[Queue] Enqueued streaming request ${context.reqId} (queue size: ${globalThis._requestQueue!.length})`);

    if (!globalThis._isProcessing) {
      processQueue().catch(err => {
        console.error('[Queue] Processing loop error:', err);
      });
    }
  });

  // Now yield SSE chunks from the generator
  console.log(`[Queue] enqueueStreamingRequest: got generator, starting iteration for ${context.reqId}`);
  let chunkIndex = 0;
  for await (const chunk of streamResult) {
    chunkIndex++;
    console.log(`[Queue] Stream chunk #${chunkIndex}: delta=${chunk.delta.length} chars, thinking=${chunk.thinking?.length ?? 0} chars, done=${chunk.done}`);
    if (abortSignal?.aborted) break;

    // Emit thinking/reasoning content as a separate SSE chunk with reasoning_content field
    // (DeepSeek/Gemini convention used by most OpenAI-compatible clients)
    if (chunk.thinking) {
      const thinkingData = {
        id: chatId,
        object: 'chat.completion.chunk',
        created,
        model,
        choices: [{
          index: 0,
          delta: { reasoning_content: chunk.thinking },
          finish_reason: null,
        }],
      };
      yield `data: ${JSON.stringify(thinkingData)}\n\n`;
    }

    // Emit inline images as content parts (from image-generation models)
    if (chunk.images?.length) {
      for (const img of chunk.images) {
        const imageData = {
          id: chatId,
          object: 'chat.completion.chunk',
          created,
          model,
          choices: [{
            index: 0,
            delta: {
              content: [{ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.data}` } }],
            },
            finish_reason: null,
          }],
        };
        yield `data: ${JSON.stringify(imageData)}\n\n`;
      }
    }

    if (chunk.delta) {
      const sseData = {
        id: chatId,
        object: 'chat.completion.chunk',
        created,
        model,
        choices: [{
          index: 0,
          delta: { content: chunk.delta },
          finish_reason: null,
        }],
      };
      yield `data: ${JSON.stringify(sseData)}\n\n`;
    }

    if (chunk.done) {
      const finalData = {
        id: chatId,
        object: 'chat.completion.chunk',
        created,
        model,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop',
        }],
      };
      yield `data: ${JSON.stringify(finalData)}\n\n`;
      yield `data: [DONE]\n\n`;
      return;
    }
  }
}

/**
 * Get current queue status.
 */
export function getQueueStatus(): { queueLength: number; isProcessing: boolean } {
  return {
    queueLength: globalThis._requestQueue?.length ?? 0,
    isProcessing: globalThis._isProcessing ?? false,
  };
}

// ── Processing Loop ─────────────────────────────────────────────────────

async function processQueue(): Promise<void> {
  if (globalThis._isProcessing) return;
  globalThis._isProcessing = true;

  try {
    while (globalThis._requestQueue!.length > 0) {
      const item = globalThis._requestQueue!.shift();
      if (!item) continue;

      if (item.abortSignal?.aborted) {
        item.reject(new ClientDisconnectedError('Request aborted while queued', item.context.reqId));
        continue;
      }

      await processItem(item);
    }
  } finally {
    globalThis._isProcessing = false;
  }
}

async function processItem(item: QueueItem): Promise<void> {
  const { context, resolve, reject, abortSignal, streamCallback } = item;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (abortSignal?.aborted) {
      reject(new ClientDisconnectedError('Request aborted', context.reqId));
      return;
    }

    try {
      console.log(`[Queue] Processing ${context.reqId} (attempt ${attempt}/${MAX_RETRIES})...`);

      if (context.stream && streamCallback) {
        // Streaming path: provide the generator to the caller
        const generator = await executeStreamingRequest(context, abortSignal);
        streamCallback(generator);
        return;
      } else {
        // Non-streaming path
        const result = await executeRequest(context);
        resolve(result);
        return;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Queue] Attempt ${attempt} failed for ${context.reqId}:`, lastError.message);

      // Save error snapshot
      await saveErrorSnapshot(`attempt${attempt}_${context.reqId}`, globalThis._currentPage);

      // Fatal errors — don't retry
      if (isFatalError(lastError)) {
        reject(lastError);
        return;
      }

      if (attempt < MAX_RETRIES) {
        if (isTier2Recoverable(lastError) || attempt >= 2) {
          await handleTier2Recovery(context, lastError);
        } else {
          await handleTier1Recovery();
        }
      }
    }
  }

  reject(lastError ?? new Error('All retry attempts exhausted'));
}

// ── Request Execution ───────────────────────────────────────────────────

/**
 * Determine if we should use the injection approach or textarea.
 *
 * Injection is used when:
 * - Multiple non-system messages (multi-turn conversation)
 * - Images are present (injection uploads to Drive and sets fileId on
 *   PromptContent turns, matching AI Studio's native image handling)
 */
function shouldUseInjection(ctx: RequestContext): boolean {
  if (!ctx.messages || ctx.messages.length === 0) return false;

  // Images → always use injection (embeds directly in PromptHistory)
  if (ctx.images && ctx.images.length > 0) return true;

  // Custom responseModalities (e.g. image generation) → must use injection
  // The textarea path doesn't control GenerateContentConfig fields like responseModalities
  if (ctx.responseModalities && ctx.responseModalities.length > 0) return true;

  // Count non-system messages — if more than 1, it's multi-turn
  const nonSystemMessages = ctx.messages.filter(m => m.role !== 'system');
  return nonSystemMessages.length > 1;
}

async function executeRequest(ctx: RequestContext): Promise<QueueResult> {
  // TTS uses a completely separate page in AI Studio
  if (ctx.ttsConfig) {
    return executeRequestViaTTS(ctx);
  }
  if (shouldUseInjection(ctx)) {
    return executeRequestViaInjection(ctx);
  }
  return executeRequestViaTextarea(ctx);
}

async function executeStreamingRequest(
  ctx: RequestContext,
  abortSignal?: AbortSignal,
): Promise<AsyncGenerator<StreamDelta>> {
  if (shouldUseInjection(ctx)) {
    return executeStreamingRequestViaInjection(ctx, abortSignal);
  }
  return executeStreamingRequestViaTextarea(ctx, abortSignal);
}

// ── Textarea Path (original — for single-turn) ─────────────────────────

async function executeRequestViaTextarea(ctx: RequestContext): Promise<QueueResult> {
  const { page, controller } = await preparePageForRequest(ctx);

  // Clear previous chat
  await controller.clearChat();

  // Adjust parameters
  await controller.adjustParameters(ctx);

  // Prepare network capture for faster response extraction (non-streaming mode)
  try {
    await controller.prepareNetworkCapture('non-streaming');
  } catch (error) {
    console.warn(`[Queue] Network capture setup failed for non-streaming, will use DOM:`, error);
  }

  // Submit prompt
  await controller.submitPrompt(ctx.prompt);

  // Get response (network interception with DOM fallback)
  const result = await controller.getResponseViaNetwork();

  // Ensure generation is fully stopped before next request
  await controller.ensureGenerationStopped();

  return result;
}

async function executeStreamingRequestViaTextarea(
  ctx: RequestContext,
  abortSignal?: AbortSignal,
): Promise<AsyncGenerator<StreamDelta>> {
  console.log(`[Queue] executeStreamingRequest (textarea): preparing page for ${ctx.reqId}`);
  const { controller } = await preparePageForRequest(ctx);

  await controller.clearChat();
  await controller.adjustParameters(ctx);

  try {
    await controller.prepareNetworkCapture('streaming');
    console.log(`[Queue] executeStreamingRequest (textarea): network capture ready for ${ctx.reqId}`);
  } catch (error) {
    console.warn(`[Queue] executeStreamingRequest (textarea): network capture setup failed:`, error);
  }

  await controller.submitPrompt(ctx.prompt);

  console.log(`[Queue] executeStreamingRequest (textarea): starting stream for ${ctx.reqId}`);
  return controller.streamViaNetwork(abortSignal);
}

// ── TTS Path (dedicated TTS page) ───────────────────────────────────────

async function executeRequestViaTTS(ctx: RequestContext): Promise<QueueResult> {
  console.log(`[Queue] executeRequest (TTS): ${ctx.reqId}`);
  const { page } = await preparePageForRequest(ctx, { skipModelSwitch: true });

  try {
    const result = await generateSpeech(
      page,
      ctx.prompt,
      {
        voice: ctx.ttsConfig?.voice,
        model: ctx.model,
      },
      ctx.reqId,
    );

    return {
      text: '',
      finishReason: 'stop',
      audioChunks: [{
        mimeType: result.mimeType,
        data: result.audioData,
      }],
    };
  } finally {
    // Navigate back to base page for next request
    await navigateToBasePage(page, ctx.reqId);
  }
}

// ── Injection Path (new — for multi-turn) ───────────────────────────────

async function executeRequestViaInjection(ctx: RequestContext): Promise<QueueResult> {
  console.log(`[Queue] executeRequest (injection): multi-turn mode for ${ctx.reqId}`);
  // Skip model switching — injection embeds the model in PromptHistory's GenerateContentConfig
  const { page, controller, driveCreds } = await preparePageForRequest(ctx, { skipModelSwitch: true });

  // Install prompt injection routes (images uploaded to Drive app folder)
  const { promptId, driveFileIds } = await injectPromptHistory(page, ctx, ctx.reqId, driveCreds);

  try {
    // Prepare network capture BEFORE triggering generation
    try {
      await controller.prepareNetworkCapture('non-streaming');
    } catch (error) {
      console.warn(`[Queue] Injection: network capture setup failed, will use DOM:`, error);
    }

    // Navigate to fake prompt and click Rerun
    // Pass temperature — it's a UI-only param not embedded in PromptHistory
    await triggerGeneration(page, promptId, ctx.reqId, { temperature: ctx.temperature });

    // Get response (network interception with DOM fallback)
    const result = await controller.getResponseViaNetwork();

    await controller.ensureGenerationStopped();
    return result;
  } finally {
    // Always clean up injection routes and navigate back, even on error
    await removeInjectorRoutes(page, ctx.reqId);
    await navigateToBasePage(page, ctx.reqId);
    // Delete uploaded Drive files (non-blocking cleanup)
    if (driveFileIds.length > 0) {
      deleteDriveFiles(page, driveFileIds, ctx.reqId, driveCreds).catch(() => {});
    }
  }
}

async function executeStreamingRequestViaInjection(
  ctx: RequestContext,
  abortSignal?: AbortSignal,
): Promise<AsyncGenerator<StreamDelta>> {
  console.log(`[Queue] executeStreamingRequest (injection): multi-turn mode for ${ctx.reqId}`);
  // Skip model switching — injection embeds the model in PromptHistory's GenerateContentConfig
  const { page, controller, driveCreds } = await preparePageForRequest(ctx, { skipModelSwitch: true });

  // Install prompt injection routes (images uploaded to Drive app folder)
  const { promptId, driveFileIds } = await injectPromptHistory(page, ctx, ctx.reqId, driveCreds);

  // Prepare network capture BEFORE triggering generation (streaming mode)
  try {
    await controller.prepareNetworkCapture('streaming');
    console.log(`[Queue] executeStreamingRequest (injection): network capture ready for ${ctx.reqId}`);
  } catch (error) {
    console.warn(`[Queue] executeStreamingRequest (injection): network capture setup failed:`, error);
  }

  // Navigate to fake prompt and click Rerun
  // Pass temperature — it's a UI-only param not embedded in PromptHistory
  await triggerGeneration(page, promptId, ctx.reqId, { temperature: ctx.temperature });

  console.log(`[Queue] executeStreamingRequest (injection): starting stream for ${ctx.reqId}`);

  // Wrap the stream to clean up injector routes, navigate back, and delete Drive files when done
  const innerStream = controller.streamViaNetwork(abortSignal);
  return wrapStreamWithCleanup(innerStream, page, ctx.reqId, { driveFileIds, driveCreds });
}

/**
 * Wrap a stream generator to clean up injector routes when the stream ends.
 * Also navigates back to the base page so the next request starts fresh.
 * Optionally deletes uploaded Drive files after the stream completes.
 */
async function* wrapStreamWithCleanup(
  inner: AsyncGenerator<StreamDelta>,
  page: Page,
  reqId: string,
  cleanup?: { driveFileIds?: string[]; driveCreds?: DriveAuthCredentials },
): AsyncGenerator<StreamDelta> {
  try {
    for await (const chunk of inner) {
      yield chunk;
      if (chunk.done) return;
    }
  } finally {
    await removeInjectorRoutes(page, reqId);
    await navigateToBasePage(page, reqId);
    // Delete uploaded Drive files (non-blocking cleanup)
    if (cleanup?.driveFileIds?.length) {
      deleteDriveFiles(page, cleanup.driveFileIds, reqId, cleanup.driveCreds).catch(() => {});
    }
  }
}

/**
 * Shared setup for both streaming and non-streaming requests:
 * get page, switch model, create controller.
 *
 * @param opts.skipModelSwitch - Skip UI-based model switching (injection sets model via PromptHistory)
 */
async function preparePageForRequest(
  ctx: RequestContext,
  opts: { skipModelSwitch?: boolean } = {},
): Promise<{
  page: Page;
  controller: PageController;
  driveCreds: DriveAuthCredentials;
}> {
  const account = getAccountForRequest(ctx);
  if (!account) {
    throw new NoAccountsError(undefined, ctx.reqId);
  }

  const parsedCreds = JSON.parse(account.creds) as {
    cookie: string;
    authUser?: string;
    userAgent?: string;
    api_key?: string;
  };

  const page = await getPage(parsedCreds.cookie, account.id, parsedCreds.authUser);
  globalThis._currentPage = page;

  // Build Drive auth credentials for image uploads
  const driveCreds: DriveAuthCredentials = {
    cookie: parsedCreds.cookie,
    apiKey: parsedCreds.api_key || 'AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs',
    authUser: parsedCreds.authUser,
    userAgent: parsedCreds.userAgent,
  };

  // Check if we need to switch models (skip for injection — model is in PromptHistory)
  if (!opts.skipModelSwitch) {
    const currentModel = getCurrentModel();
    const targetModel = ctx.model.startsWith('models/')
      ? ctx.model.replace('models/', '')
      : ctx.model;

    if (currentModel && !currentModel.toLowerCase().includes(targetModel.split('-')[0]?.toLowerCase() ?? '')) {
      await switchModel(page, ctx.model);
    }
  }

  const controller = new PageController(page, ctx.reqId);
  return { page, controller, driveCreds };
}

// ── Navigation ──────────────────────────────────────────────────────────

/**
 * Navigate back to the base AI Studio page after an injection request.
 * This ensures the next request (whether injection or textarea) starts from a clean state.
 */
async function navigateToBasePage(page: Page, reqId: string): Promise<void> {
  try {
    const currentUrl = page.url();
    if (currentUrl.includes('/prompts/new_chat')) {
      return; // Already on the right page
    }

    console.log(`[Queue] Navigating back to base page from ${currentUrl.substring(0, 60)}...`);
    await page.goto('https://aistudio.google.com/prompts/new_chat', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    console.log(`[Queue:${reqId}] Back on base page`);
  } catch (error) {
    console.warn(`[Queue:${reqId}] Failed to navigate back to base page:`, error);
    // Non-fatal — the next request's preparePageForRequest will handle it
  }
}

// ── Error Recovery ──────────────────────────────────────────────────────

async function handleTier1Recovery(): Promise<void> {
  console.log('[Queue] Tier 1 recovery: refreshing page...');
  try {
    await refreshPage();
  } catch (error) {
    console.warn('[Queue] Tier 1 recovery failed, will try Tier 2 on next attempt:', error);
  }
}

async function handleTier2Recovery(_ctx: RequestContext, error: Error): Promise<void> {
  console.log('[Queue] Tier 2 recovery: switching account...');

  // Mark current account as rate-limited
  if (isRateLimitError(error)) {
    const accountId = getCurrentAccountId();
    if (accountId) {
      const db = useDb();
      try {
        const limitedUntil = Date.now() + 60_000; // 60 seconds
        db.prepare('UPDATE accounts SET limited_until = ? WHERE id = ?')
          .run(limitedUntil, accountId);
        console.log(`[Queue] Marked account ${accountId} as rate-limited until ${new Date(limitedUntil).toISOString()}`);
      } catch { /* ignore DB errors */ }
    }
  }

  // Close browser completely
  try {
    await closeBrowser();
    globalThis._currentPage = null;
  } catch { /* ignore */ }

  console.log('[Queue] Tier 2 recovery complete, next attempt will use next available account');
}

// ── Account Selection ───────────────────────────────────────────────────

function getAccountForRequest(
  _ctx: RequestContext,
): { id: string; creds: string } | null {
  const db = useDb();

  // Pick the least-recently-synced, non-rate-limited account
  const account = db.prepare(`
    SELECT id, creds FROM accounts
    WHERE limited_until < ?
    ORDER BY last_sync ASC
    LIMIT 1
  `).get(Date.now()) as { id: string; creds: string } | null;

  if (!account) {
    // Fallback: pick any account, even if rate-limited
    const anyAccount = db.prepare(`
      SELECT id, creds FROM accounts
      ORDER BY limited_until ASC
      LIMIT 1
    `).get() as { id: string; creds: string } | null;

    return anyAccount;
  }

  return account;
}
