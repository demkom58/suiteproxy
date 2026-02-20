/**
 * Request Queue — manages concurrent request processing through browser page pool.
 *
 * Features:
 * - Concurrent processing via page pool (configurable pool size, default 3)
 * - Conversation caching — reuses pages with matching conversation prefix
 * - Tiered error recovery (Tier 1: refresh page → Tier 2: switch account)
 * - Abort signal support for client disconnection
 * - Streaming and non-streaming paths
 * - Error snapshots on failure
 * - Typed error classification for precise recovery
 */
import type { RequestContext, QueueItem, QueueResult, StreamDelta } from './types';
import type { Page } from 'playwright-core';
import { getPageForSlot, refreshPage, closeBrowser, getCurrentModel, getCurrentAccountId, type BrowserLaunchConfig } from './index';
import { PageController } from './page-controller';
import { switchModel } from './model-switcher';
import { useDb } from '~~/server/utils/suite';
import {
  NoAccountsError,
  ClientDisconnectedError,
  isTier2Recoverable,
  isFatalError
} from './errors';
import { isRateLimitError } from './errors';
import { saveErrorSnapshot } from './snapshots';
import { injectPromptHistory, removeInjectorRoutes, triggerGeneration } from './prompt-injector';
import { deleteDriveFiles, type DriveAuthCredentials } from './drive-uploader';
import { generateSpeech } from './tts-controller';
import { logRequestUpdate } from '~~/server/utils/request-log';
import { generateOpenAIId } from '~~/server/utils/helpers';
import {
  acquireSlot,
  releaseSlot,
  computeConversationHash,
  computeFullConversationHash,
  getPoolStatus,
  evictIdleSlots,
  type PageSlot,
  type AcquireResult,
} from './page-pool';

// ── SSE Helpers ─────────────────────────────────────────────────────────

/** Build an OpenAI-format SSE chunk object. */
function buildSSEChunk(
  chatId: string,
  created: number,
  model: string,
  delta: Record<string, unknown>,
  finishReason: string | null,
): string {
  return JSON.stringify({
    id: chatId,
    object: 'chat.completion.chunk',
    created,
    model,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  });
}

// ── Legacy Queue State (for backward compat with processQueue drain) ────
declare global {
  var _currentPage: Page | null;
  var _activeRequests: number | undefined;
}

if (globalThis._currentPage === undefined) globalThis._currentPage = null;
if (globalThis._activeRequests === undefined) globalThis._activeRequests = 0;

const MAX_RETRIES = 3;

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Process a non-streaming request. Acquires a pool slot, executes, and releases.
 * Concurrent requests are handled by the pool — each gets its own page.
 */
export async function enqueueRequest(
  context: RequestContext,
  abortSignal?: AbortSignal,
): Promise<QueueResult> {
  if (abortSignal?.aborted) {
    throw new ClientDisconnectedError('Request aborted before processing', context.reqId);
  }

  globalThis._activeRequests = (globalThis._activeRequests ?? 0) + 1;
  const poolInfo = getPoolStatus();
  console.log(`[Queue] Processing ${context.reqId} (active: ${globalThis._activeRequests}, pool: ${poolInfo.busySlots}/${poolInfo.totalSlots})`);

  try {
    return await executeWithRetry(context, abortSignal);
  } finally {
    globalThis._activeRequests = Math.max(0, (globalThis._activeRequests ?? 1) - 1);
    // Periodically evict idle slots
    evictIdleSlots().catch(() => {});
  }
}

/**
 * Process a streaming request. Returns an async generator of SSE events.
 * Acquires a pool slot, streams through it, and releases when done.
 */
export async function* enqueueStreamingRequest(
  context: RequestContext,
  abortSignal?: AbortSignal,
): AsyncGenerator<string> {
  if (abortSignal?.aborted) {
    throw new ClientDisconnectedError('Request aborted before processing', context.reqId);
  }

  const streamContext: RequestContext = { ...context, stream: true };
  const chatId = generateOpenAIId('chatcmpl');
  const model = context.model.startsWith('models/') ? context.model : `models/${context.model}`;
  const created = Math.floor(Date.now() / 1000);

  globalThis._activeRequests = (globalThis._activeRequests ?? 0) + 1;
  const poolInfo = getPoolStatus();
  console.log(`[Queue] Streaming ${context.reqId} (active: ${globalThis._activeRequests}, pool: ${poolInfo.busySlots}/${poolInfo.totalSlots})`);

  try {
    const streamResult = await executeStreamingWithRetry(streamContext, abortSignal);

    // Yield SSE chunks from the generator
    let chunkIndex = 0;
    let hadFunctionCalls = false;
    for await (const chunk of streamResult) {
      chunkIndex++;
      console.log(`[Queue] Stream chunk #${chunkIndex}: delta=${chunk.delta.length} chars, thinking=${chunk.thinking?.length ?? 0} chars, functionCalls=${chunk.functionCalls?.length ?? 0}, done=${chunk.done}`);
      if (abortSignal?.aborted) break;

      // Emit thinking/reasoning content
      if (chunk.thinking) {
        yield `data: ${buildSSEChunk(chatId, created, model, { reasoning_content: chunk.thinking }, null)}\n\n`;
      }

      // Emit function calls
      if (chunk.functionCalls?.length) {
        hadFunctionCalls = true;
        const toolCalls = chunk.functionCalls.map((fc, idx) => ({
          index: idx,
          id: generateOpenAIId('call'),
          type: 'function' as const,
          function: {
            name: fc.name,
            arguments: JSON.stringify(fc.args),
          },
        }));
        yield `data: ${buildSSEChunk(chatId, created, model, { tool_calls: toolCalls }, null)}\n\n`;
      }

      // Emit inline images
      if (chunk.images?.length) {
        for (const img of chunk.images) {
          yield `data: ${buildSSEChunk(chatId, created, model, {
            content: [{ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.data}` } }],
          }, null)}\n\n`;
        }
      }

      if (chunk.delta) {
        yield `data: ${buildSSEChunk(chatId, created, model, { content: chunk.delta }, null)}\n\n`;
      }

      if (chunk.done) {
        yield `data: ${buildSSEChunk(chatId, created, model, {}, hadFunctionCalls ? 'tool_calls' : 'stop')}\n\n`;
        yield `data: [DONE]\n\n`;
        return;
      }
    }

    // Safety: if the generator ended without a done chunk, send [DONE] anyway
    console.warn(`[Queue] Stream generator for ${context.reqId} ended without done signal — sending [DONE]`);
    yield `data: ${buildSSEChunk(chatId, created, model, {}, hadFunctionCalls ? 'tool_calls' : 'stop')}\n\n`;
    yield `data: [DONE]\n\n`;
  } finally {
    globalThis._activeRequests = Math.max(0, (globalThis._activeRequests ?? 1) - 1);
    evictIdleSlots().catch(() => {});
  }
}

/**
 * Get current queue status.
 */
export function getQueueStatus(): { queueLength: number; isProcessing: boolean } {
  const pool = getPoolStatus();
  return {
    queueLength: pool.waitingRequests,
    isProcessing: pool.busySlots > 0,
  };
}

// ── Retry Logic ─────────────────────────────────────────────────────────

async function executeWithRetry(
  ctx: RequestContext,
  abortSignal?: AbortSignal,
): Promise<QueueResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (abortSignal?.aborted) {
      throw new ClientDisconnectedError('Request aborted', ctx.reqId);
    }

    try {
      console.log(`[Queue] Processing ${ctx.reqId} (attempt ${attempt}/${MAX_RETRIES})...`);
      return await executeRequest(ctx);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Queue] Attempt ${attempt} failed for ${ctx.reqId}:`, lastError.message);
      await saveErrorSnapshot(`attempt${attempt}_${ctx.reqId}`, globalThis._currentPage);

      if (isFatalError(lastError)) throw lastError;

      if (attempt < MAX_RETRIES) {
        if (isTier2Recoverable(lastError) || attempt >= 2) {
          await handleTier2Recovery(ctx, lastError);
        } else {
          await handleTier1Recovery(globalThis._currentPage ?? undefined);
        }
      }
    }
  }

  throw lastError ?? new Error('All retry attempts exhausted');
}

async function executeStreamingWithRetry(
  ctx: RequestContext,
  abortSignal?: AbortSignal,
): Promise<AsyncGenerator<StreamDelta>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (abortSignal?.aborted) {
      throw new ClientDisconnectedError('Request aborted', ctx.reqId);
    }

    try {
      console.log(`[Queue] Streaming ${ctx.reqId} (attempt ${attempt}/${MAX_RETRIES})...`);
      return await executeStreamingRequest(ctx, abortSignal);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Queue] Streaming attempt ${attempt} failed for ${ctx.reqId}:`, lastError.message);
      await saveErrorSnapshot(`attempt${attempt}_${ctx.reqId}`, globalThis._currentPage);

      if (isFatalError(lastError)) throw lastError;

      if (attempt < MAX_RETRIES) {
        if (isTier2Recoverable(lastError) || attempt >= 2) {
          await handleTier2Recovery(ctx, lastError);
        } else {
          await handleTier1Recovery(globalThis._currentPage ?? undefined);
        }
      }
    }
  }

  throw lastError ?? new Error('All retry attempts exhausted');
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

  // Structured output (json_object / json_schema) → must use injection
  // Only the injection path embeds responseMimeType in GenerateContentConfig
  if (ctx.responseFormat && ctx.responseFormat.type !== 'text') return true;

  // Function calling → must use injection (functionDeclarations in GenerateContentConfig)
  if (ctx.functionDeclarations && ctx.functionDeclarations.length > 0) return true;

  // Code execution → must use injection (codeExecution in GenerateContentConfig)
  if (ctx.enableCodeExecution) return true;

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
  const { page, controller, slot, conversationCached } = await preparePageForRequest(ctx);

  try {
    // Skip clearChat if conversation is cached (continuation of same chat)
    if (!conversationCached) {
      await controller.clearChat();
    }

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

    // Update slot conversation cache — include all messages (current + response)
    const fullHash = computeFullConversationHash(ctx.messages);
    releaseSlot(slot, fullHash, ctx.messages?.length ?? 0, slot.currentModel);

    return result;
  } catch (error) {
    releaseSlot(slot);
    throw error;
  }
}

async function executeStreamingRequestViaTextarea(
  ctx: RequestContext,
  abortSignal?: AbortSignal,
): Promise<AsyncGenerator<StreamDelta>> {
  console.log(`[Queue] executeStreamingRequest (textarea): preparing page for ${ctx.reqId}`);
  const { controller, slot, conversationCached } = await preparePageForRequest(ctx);

  try {
    // Skip clearChat if conversation is cached
    if (!conversationCached) {
      await controller.clearChat();
    }
    await controller.adjustParameters(ctx);

    try {
      await controller.prepareNetworkCapture('streaming');
      console.log(`[Queue] executeStreamingRequest (textarea): network capture ready for ${ctx.reqId}`);
    } catch (error) {
      console.warn(`[Queue] executeStreamingRequest (textarea): network capture setup failed:`, error);
    }

    await controller.submitPrompt(ctx.prompt);

    console.log(`[Queue] executeStreamingRequest (textarea): starting stream for ${ctx.reqId}`);
    const innerStream = controller.streamViaNetwork(abortSignal);

    // Wrap to release slot when stream ends
    return wrapStreamWithSlotRelease(innerStream, slot, ctx.messages);
  } catch (error) {
    releaseSlot(slot);
    throw error;
  }
}

// ── TTS Path (dedicated TTS page) ───────────────────────────────────────

async function executeRequestViaTTS(ctx: RequestContext): Promise<QueueResult> {
  console.log(`[Queue] executeRequest (TTS): ${ctx.reqId}`);
  const { page, slot } = await preparePageForRequest(ctx, { skipModelSwitch: true });

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
    // TTS doesn't have conversation continuity
    releaseSlot(slot, null, 0);
  }
}

// ── Injection Path (new — for multi-turn) ───────────────────────────────

async function executeRequestViaInjection(ctx: RequestContext): Promise<QueueResult> {
  console.log(`[Queue] executeRequest (injection): multi-turn mode for ${ctx.reqId}`);
  // Skip model switching — injection embeds the model in PromptHistory's GenerateContentConfig
  const { page, controller, driveCreds, slot } = await preparePageForRequest(ctx, { skipModelSwitch: true });

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

    // Update conversation cache
    const fullHash = computeFullConversationHash(ctx.messages);
    releaseSlot(slot, fullHash, ctx.messages?.length ?? 0, slot.currentModel);

    return result;
  } catch (error) {
    releaseSlot(slot);
    throw error;
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
  const { page, controller, driveCreds, slot } = await preparePageForRequest(ctx, { skipModelSwitch: true });

  try {
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

    // Wrap the stream to clean up injector routes, navigate back, release slot, and delete Drive files when done
    const innerStream = controller.streamViaNetwork(abortSignal);
    return wrapStreamWithCleanup(innerStream, page, ctx.reqId, slot, ctx.messages, {
      driveFileIds,
      driveCreds,
    });
  } catch (error) {
    releaseSlot(slot);
    throw error;
  }
}

/**
 * Wrap a stream generator to:
 * 1. Clean up injector routes when the stream ends
 * 2. Navigate back to the base page
 * 3. Release the pool slot (with conversation hash for caching)
 * 4. Delete uploaded Drive files
 */
async function* wrapStreamWithCleanup(
  inner: AsyncGenerator<StreamDelta>,
  page: Page,
  reqId: string,
  slot: PageSlot,
  messages: RequestContext['messages'],
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
    // Update conversation cache and release slot
    const fullHash = computeFullConversationHash(messages);
    releaseSlot(slot, fullHash, messages?.length ?? 0, slot.currentModel);
    // Delete uploaded Drive files (non-blocking cleanup)
    if (cleanup?.driveFileIds?.length) {
      deleteDriveFiles(page, cleanup.driveFileIds, reqId, cleanup.driveCreds).catch(() => {});
    }
  }
}

/**
 * Wrap a stream generator with slot release on completion (for textarea path).
 */
async function* wrapStreamWithSlotRelease(
  inner: AsyncGenerator<StreamDelta>,
  slot: PageSlot,
  messages: RequestContext['messages'],
): AsyncGenerator<StreamDelta> {
  try {
    for await (const chunk of inner) {
      yield chunk;
      if (chunk.done) return;
    }
  } finally {
    const fullHash = computeFullConversationHash(messages);
    releaseSlot(slot, fullHash, messages?.length ?? 0, slot.currentModel);
  }
}

/**
 * Shared setup for both streaming and non-streaming requests:
 * acquire a pool slot, get/create page, switch model, create controller.
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
  slot: PageSlot;
  conversationCached: boolean;
}> {
  const account = getAccountForRequest(ctx);
  if (!account) {
    throw new NoAccountsError(undefined, ctx.reqId);
  }

  // Report the selected account to the request log
  logRequestUpdate(ctx.reqId, { account: account.id });

  const parsedCreds = JSON.parse(account.creds) as {
    cookie: string;
    authUser?: string;
    userAgent?: string;
    api_key?: string;
  };

  // Parse account-specific fingerprint and proxy config
  const launchConfig: BrowserLaunchConfig = {
    fingerprint: account.fingerprint ? JSON.parse(account.fingerprint) : null,
    proxy: account.proxy ? JSON.parse(account.proxy) : null,
  };

  // Compute conversation hash for cache matching
  const conversationHash = computeConversationHash(ctx.messages);

  // Acquire a slot from the pool (may wait if all are busy)
  const { slot, conversationCached } = await acquireSlot(account.id, conversationHash);

  try {
    // Get or create a page in this slot
    const page = await getPageForSlot(slot, parsedCreds.cookie, account.id, parsedCreds.authUser, launchConfig);
    globalThis._currentPage = page;

    // Build Drive auth credentials for image uploads
    const driveCreds: DriveAuthCredentials = {
      cookie: parsedCreds.cookie,
      apiKey: parsedCreds.api_key || 'AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs',
      authUser: parsedCreds.authUser,
      userAgent: parsedCreds.userAgent,
    };

    // Check if we need to switch models (skip for injection — model is in PromptHistory)
    if (!opts.skipModelSwitch && !conversationCached) {
      const currentModel = slot.currentModel || getCurrentModel();
      const targetModel = ctx.model.startsWith('models/')
        ? ctx.model.replace('models/', '')
        : ctx.model;

      if (currentModel && !currentModel.toLowerCase().includes(targetModel.split('-')[0]?.toLowerCase() ?? '')) {
        await switchModel(page, ctx.model);
        slot.currentModel = targetModel;
      }
    }

    const controller = new PageController(page, ctx.reqId);
    return { page, controller, driveCreds, slot, conversationCached };
  } catch (error) {
    // Release slot on preparation failure
    releaseSlot(slot);
    throw error;
  }
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

async function handleTier1Recovery(page?: Page): Promise<void> {
  console.log('[Queue] Tier 1 recovery: refreshing page...');
  try {
    await refreshPage(page);
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

interface AccountForRequest {
  id: string;
  creds: string;
  fingerprint: string | null;
  proxy: string | null;
}

function getAccountForRequest(
  _ctx: RequestContext,
): AccountForRequest | null {
  const db = useDb();

  // Pick the least-recently-synced, non-rate-limited account
  const account = db.prepare(`
    SELECT id, creds, fingerprint, proxy FROM accounts
    WHERE limited_until < ?
    ORDER BY last_sync ASC
    LIMIT 1
  `).get(Date.now()) as AccountForRequest | null;

  if (!account) {
    // Fallback: pick any account, even if rate-limited
    const anyAccount = db.prepare(`
      SELECT id, creds, fingerprint, proxy FROM accounts
      ORDER BY limited_until ASC
      LIMIT 1
    `).get() as AccountForRequest | null;

    return anyAccount;
  }

  return account;
}
