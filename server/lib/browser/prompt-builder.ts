/**
 * Prompt Builder — converts OpenAI messages to AI Studio PromptHistory.
 *
 * This is the core of multi-turn support. Instead of flattening all messages
 * into a single string, we build a proper AI Studio PromptHistory with
 * structured conversation turns that AI Studio's own JS will serialize
 * into the correct GenerateContent request body.
 *
 * IMAGE HANDLING:
 * Images are uploaded to Google Drive's AI Studio app folder BEFORE building
 * the PromptHistory. Each image's Drive file ID is set on the corresponding
 * PromptContent turn via the fileId field. When AI Studio's JS serializes
 * the turn for GenerateContent, it places the fileId at part position [5]:
 *   [null, null, null, null, null, ["fileId"]]
 *
 * The Drive upload flow matches AI Studio's native behavior:
 * 1. GetAppFolder RPC → get app folder ID
 * 2. Upload to Drive with parents:[appFolderId]
 * 3. GenerateContent references the fileId
 *
 * Without parents, the file lands in root Drive and GenerateContent returns
 * 404 "Requested entity was not found".
 */
import type { Page } from 'playwright-core';
import type { RequestContext } from './types';
import {
  createPromptContent,
  createGenerationConfig,
  createPromptHistory,
  flatten,
  type PromptContent,
  type PromptHistory,
  type ResponseModality,
} from '~~/server/types/aistudio';
import { uploadImageToDrive, type DriveAuthCredentials } from './drive-uploader';

/** Image pending upload — extracted from message content, associated with a turn. */
interface PendingImage {
  turnIndex: number;
  mimeType: string;
  data: string; // base64
}

/**
 * Generate a random prompt ID (base64url-encoded, 32 chars).
 * Matches AI Studio's internal format.
 */
export function randomPromptId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  // base64url encode
  const base64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return base64;
}

/**
 * Convert OpenAI chat messages into an AI Studio PromptHistory.
 *
 * Images are uploaded to Google Drive (in AI Studio's app folder) and their
 * file IDs are embedded in PromptContent turns. AI Studio's JS then includes
 * the file references at part position [5] in the GenerateContent request.
 *
 * Key mapping:
 * - system messages → systemInstruction array
 * - user messages → PromptContent with role="user"
 * - assistant messages → PromptContent with role="model"
 * - image parts → fileId on the corresponding user turn
 * - Last turn is always a model placeholder "(placeholder)" to trigger rerun
 *
 * @returns promptId, history, serialized JSON, and list of Drive file IDs to clean up later
 */
export async function buildPromptHistory(
  ctx: RequestContext,
  opts?: { page?: Page; driveCreds?: DriveAuthCredentials },
): Promise<{ promptId: string; history: PromptHistory; serialized: string; driveFileIds: string[] }> {
  const messages = ctx.messages ?? [];
  const promptId = randomPromptId();

  // Separate system messages from conversation
  const systemTexts: string[] = [];
  const turns: PromptContent[] = [];
  const pendingImages: PendingImage[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemTexts.push(extractTextContent(msg.content ?? ''));
      continue;
    }

    // Tool result messages (role='tool') → serialize as user turn with function response text
    // AI Studio doesn't have native functionResponse in PromptContent, so we
    // serialize tool results as structured text in a user turn.
    if (msg.role === 'tool') {
      const toolResultText = msg.name
        ? `[Function result for ${msg.name}]: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`
        : typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content ?? '');
      turns.push(createPromptContent('user', toolResultText));
      continue;
    }

    // Assistant messages with tool_calls → serialize as model turn with function call text
    if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
      const callTexts = msg.tool_calls.map(tc =>
        `[Function call: ${tc.function.name}(${tc.function.arguments})]`,
      );
      const textContent = extractTextContent(msg.content ?? '');
      const fullText = textContent
        ? `${textContent}\n${callTexts.join('\n')}`
        : callTexts.join('\n');
      turns.push(createPromptContent('model', fullText));
      continue;
    }

    const role = msg.role === 'user' ? 'user' as const : 'model' as const;
    const text = extractTextContent(msg.content ?? '');
    const images = extractInlineImages(msg.content ?? '');

    // Track images with their turn index for Drive upload
    if (images.length > 0) {
      const turnIndex = turns.length;
      for (const img of images) {
        pendingImages.push({ turnIndex, mimeType: img.mimeType, data: img.data });
      }
    }

    // Add the text turn (even if empty for image-only messages,
    // because we need a turn in PromptHistory for the Rerun button)
    turns.push(createPromptContent(role, text || ''));
  }

  // If system instruction was passed separately (not in messages)
  if (ctx.systemInstruction && !systemTexts.includes(ctx.systemInstruction)) {
    systemTexts.unshift(ctx.systemInstruction);
  }

  // Upload images to Google Drive (app folder) and set fileId on the corresponding turns
  const driveFileIds: string[] = [];
  if (pendingImages.length > 0 && opts?.page && opts?.driveCreds) {
    console.log(`[PromptBuilder:${ctx.reqId}] Uploading ${pendingImages.length} image(s) to Google Drive...`);

    // Upload images sequentially (browser page.evaluate is single-threaded)
    const uploadResults: Array<{ turnIndex: number; fileId: string }> = [];
    for (const img of pendingImages) {
      const result = await uploadImageToDrive(opts.page, img.mimeType, img.data, ctx.reqId, opts.driveCreds);
      uploadResults.push({ turnIndex: img.turnIndex, fileId: result.fileId });
    }

    // Group file IDs by turn index
    const imagesByTurn = new Map<number, string[]>();
    for (const { turnIndex, fileId } of uploadResults) {
      driveFileIds.push(fileId);
      const list = imagesByTurn.get(turnIndex) ?? [];
      list.push(fileId);
      imagesByTurn.set(turnIndex, list);
    }

    // Set the first image's fileId on the existing turn.
    // AI Studio only supports one fileId per PromptContent turn.
    for (const [turnIndex, fileIds] of imagesByTurn) {
      if (turnIndex < turns.length) {
        const turn = turns[turnIndex]!;
        turn.fileId = [fileIds[0]!];
        if (fileIds.length > 1) {
          console.warn(
            `[PromptBuilder:${ctx.reqId}] Turn ${turnIndex} has ${fileIds.length} images — only first fileId used. ` +
            `Multi-image per turn not yet supported.`,
          );
        }
      }
    }

    console.log(`[PromptBuilder:${ctx.reqId}] All images uploaded — ${driveFileIds.length} Drive file(s) created`);
  } else if (pendingImages.length > 0 && (!opts?.page || !opts?.driveCreds)) {
    console.warn(`[PromptBuilder:${ctx.reqId}] ${pendingImages.length} image(s) found but no page/driveCreds provided — images will be skipped`);
  }

  // AI Studio needs a final model turn with "(placeholder)" to trigger rerun
  turns.push(createPromptContent('model', '(placeholder)'));

  // Build generation config from request context
  const generationConfig = createGenerationConfig(ctx.model, {
    topP: ctx.topP,
    maxOutputTokens: ctx.maxTokens,
    stopSequences: ctx.stopSequences,
    thinkingBudget: resolveThinkingBudget(ctx),
    googleSearch: ctx.enableGoogleSearch,
    urlContext: ctx.enableUrlContext,
    codeExecution: ctx.enableCodeExecution,
    functionDeclarations: ctx.functionDeclarations,
    responseMimeType: ctx.responseFormat?.type === 'json_object' || ctx.responseFormat?.type === 'json_schema'
      ? 'application/json'
      : 'text/plain',
    responseSchema: ctx.responseFormat?.schema,
    responseModalities: ctx.responseModalities as ResponseModality[] | undefined,
  });

  // NOTE: Temperature is NOT in GenerateContentConfig — it's a UI-only setting.
  // It's set via the temperature slider in triggerGeneration() after the page loads.

  const history = createPromptHistory(
    promptId,
    ctx.model,
    turns,
    systemTexts.length > 0 ? systemTexts : null,
    generationConfig,
  );

  const serialized = JSON.stringify(flatten(history));

  return { promptId, history, serialized, driveFileIds };
}

/**
 * Extract text content from a message's content field.
 * Handles string, null, and array content (multimodal).
 */
function extractTextContent(content: string | null | Array<{ type: string; text?: string; image_url?: { url: string } }>): string {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;

  return content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('\n');
}

/**
 * Extract inline images from a message's content field.
 * Returns base64 data extracted from data: URIs in image_url parts.
 */
function extractInlineImages(
  content: string | null | Array<{ type: string; text?: string; image_url?: { url: string } }>,
): Array<{ mimeType: string; data: string }> {
  if (content === null || typeof content === 'string') return [];

  const images: Array<{ mimeType: string; data: string }> = [];
  for (const part of content) {
    if (part.type !== 'image_url' || !part.image_url) continue;

    const url = part.image_url.url;
    const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/);
    if (dataMatch) {
      images.push({ mimeType: dataMatch[1]!, data: dataMatch[2]! });
    }
    // HTTP URLs are already resolved to data URIs by completions.post.ts's resolveImageUrls()
  }
  return images;
}

/**
 * Resolve thinking budget from reasoning_effort.
 *
 * When no reasoning_effort is specified, applies model-aware defaults
 * matching the textarea path's behavior (getDefaultDirective in page-controller).
 */
function resolveThinkingBudget(ctx: RequestContext): number | undefined {
  // Explicit disable
  if (ctx.reasoningEffort === 0 || ctx.reasoningEffort === '0') return 0;

  // No budget limit — thinking enabled with no cap
  // Matches textarea path's normalizeReasoningEffort() handling of 'none' / -1
  if (ctx.reasoningEffort === 'none' || ctx.reasoningEffort === -1 || ctx.reasoningEffort === '-1') {
    return undefined; // null in config = no budget constraint (AI Studio default)
  }

  // Numeric budget (explicit)
  if (ctx.reasoningEffort !== undefined && ctx.reasoningEffort !== null) {
    const val = typeof ctx.reasoningEffort === 'string'
      ? parseInt(ctx.reasoningEffort, 10)
      : ctx.reasoningEffort;

    if (typeof val === 'number' && !isNaN(val) && val > 0) return val;

    // Named levels → approximate budget
    if (typeof ctx.reasoningEffort === 'string') {
      switch (ctx.reasoningEffort.toLowerCase()) {
        case 'minimal': return 1024;
        case 'low': return 2048;
        case 'medium': return 8192;
        case 'high': return 32768;
      }
    }
  }

  // No reasoning_effort specified → apply model-aware defaults
  // This matches the textarea path's getDefaultDirective() behavior
  const model = ctx.model.toLowerCase();
  if (model.includes('gemini-2.5') && (model.includes('flash') || model.includes('pro'))) {
    return 8192; // Default budget for Gemini 2.5 thinking models
  }
  if (model.includes('gemini-3')) {
    return 32768; // Default "high" for Gemini 3 (mapped to budget since level isn't in config)
  }

  // Non-thinking models — no budget
  return undefined;
}
