/**
 * TTS Controller — handles text-to-speech via AI Studio's dedicated TTS page.
 *
 * AI Studio TTS has its own UI at /generate-speech?model={model}, separate
 * from the chat/prompt interface. This controller navigates to that page,
 * fills in text, selects voice, clicks Run, and extracts the generated audio.
 *
 * Reference: AIStudio2API project (Mag1cFall/AIStudio2API)
 */
import type { Page } from 'playwright-core';

// ── Constants ───────────────────────────────────────────────────────────

const TTS_PAGE_URL = 'https://aistudio.google.com/generate-speech';

/** Supported TTS models */
export const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
] as const;

const DEFAULT_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/** All 30 available Gemini TTS voices */
export const GEMINI_VOICES = [
  'Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir',
  'Leda', 'Orus', 'Aoede', 'Callirrhoe', 'Autonoe',
  'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina',
  'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia', 'Achernar',
  'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird',
  'Zubenelgenubi', 'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat',
] as const;

/** Map OpenAI voice names to Gemini voice names */
export const OPENAI_VOICE_MAP: Record<string, string> = {
  alloy: 'Puck',
  echo: 'Charon',
  fable: 'Kore',
  onyx: 'Fenrir',
  nova: 'Aoede',
  shimmer: 'Leda',
};

/** Map OpenAI TTS model names to Gemini TTS models */
export const TTS_MODEL_ALIASES: Record<string, string> = {
  'tts-1': DEFAULT_TTS_MODEL,
  'tts-1-hd': 'gemini-2.5-pro-preview-tts',
};

// ── Selectors (from AI Studio's TTS page) ───────────────────────────────

const SEL = {
  root: 'ms-speech-prompt',
  textInput: 'textarea[placeholder="Start writing or paste text here to generate speech"]',
  voiceDropdown: 'ms-voice-selector mat-select',
  voiceOption: 'mat-option',
  runButton: 'ms-run-button button[type="submit"]',
  runButtonAlt: '.speech-prompt-footer .button-wrapper ms-run-button button',
  runButtonAlt2: 'ms-run-button button:has(.run-button-label)',
  audioPlayer: '.speech-prompt-footer audio[controls]',
  singleSpeakerMode: 'ms-tts-mode-selector button:has-text("Single-speaker")',
} as const;

// ── TTS Result ──────────────────────────────────────────────────────────

export interface TTSResult {
  /** Base64-encoded audio data */
  audioData: string;
  /** MIME type of the audio (e.g. 'audio/wav') */
  mimeType: string;
}

// ── Main Controller ─────────────────────────────────────────────────────

/**
 * Generate speech using AI Studio's TTS page.
 *
 * @param page - Playwright page (already authenticated)
 * @param text - Text to convert to speech
 * @param options - Voice and model options
 * @param reqId - Request ID for logging
 * @returns Base64-encoded audio data
 */
export async function generateSpeech(
  page: Page,
  text: string,
  options: {
    voice?: string;
    model?: string;
  },
  reqId: string,
): Promise<TTSResult> {
  const model = resolveModel(options.model);
  const voice = resolveVoice(options.voice);

  console.log(`[TTS:${reqId}] Generating speech: model=${model}, voice=${voice}, text=${text.length} chars`);

  // 1. Navigate to TTS page
  await navigateToTTSPage(page, model, reqId);

  // 2. Ensure single-speaker mode
  await ensureSingleSpeakerMode(page, reqId);

  // 3. Select voice
  await selectVoice(page, voice, reqId);

  // 4. Fill text
  await fillText(page, text, reqId);

  // 5. Click Run
  await clickRun(page, reqId);

  // 6. Wait for and extract audio
  const result = await waitForAudio(page, reqId);

  console.log(`[TTS:${reqId}] Speech generated: ${result.mimeType}, ${result.audioData.length} chars base64`);
  return result;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function resolveModel(model?: string): string {
  if (!model) return DEFAULT_TTS_MODEL;
  // Check aliases (OpenAI model names)
  const alias = TTS_MODEL_ALIASES[model];
  if (alias) return alias;
  // Check if it's already a valid Gemini TTS model
  if (model.includes('tts')) return model;
  // Default
  return DEFAULT_TTS_MODEL;
}

function resolveVoice(voice?: string): string {
  if (!voice) return 'Puck'; // Default voice
  // Check OpenAI voice mapping
  const mapped = OPENAI_VOICE_MAP[voice.toLowerCase()];
  if (mapped) return mapped;
  // Check if it's already a Gemini voice name (case-insensitive match)
  const geminiVoice = GEMINI_VOICES.find(
    v => v.toLowerCase() === voice.toLowerCase(),
  );
  if (geminiVoice) return geminiVoice;
  // Default
  return 'Puck';
}

async function navigateToTTSPage(page: Page, model: string, reqId: string): Promise<void> {
  const url = `${TTS_PAGE_URL}?model=${model}`;
  console.log(`[TTS:${reqId}] Navigating to ${url}`);

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });

      // Wait for TTS root element
      await page.waitForSelector(SEL.root, { timeout: 15_000, state: 'visible' });
      console.log(`[TTS:${reqId}] TTS page loaded`);
      return;
    } catch (error) {
      console.warn(`[TTS:${reqId}] Page load attempt ${attempt} failed:`, error);
      if (attempt >= maxAttempts) {
        throw new Error(`TTS page failed to load after ${maxAttempts} attempts`);
      }
      await page.waitForTimeout(2000);
    }
  }
}

async function ensureSingleSpeakerMode(page: Page, reqId: string): Promise<void> {
  try {
    const modeBtn = page.locator(SEL.singleSpeakerMode).first();
    if (await modeBtn.isVisible({ timeout: 3000 })) {
      const btnClass = await modeBtn.getAttribute('class') ?? '';
      if (!btnClass.includes('ms-button-active')) {
        await modeBtn.click();
        await page.waitForTimeout(500);
        console.log(`[TTS:${reqId}] Switched to single-speaker mode`);
      }
    }
  } catch {
    // Single-speaker mode might already be active or not available
    console.log(`[TTS:${reqId}] Single-speaker mode check skipped`);
  }
}

async function selectVoice(page: Page, voiceName: string, reqId: string): Promise<void> {
  try {
    const dropdown = page.locator(SEL.voiceDropdown).first();
    if (!await dropdown.isVisible({ timeout: 5000 })) {
      console.warn(`[TTS:${reqId}] Voice dropdown not visible, skipping voice selection`);
      return;
    }

    await dropdown.click();
    await page.waitForTimeout(300);

    // Look for the voice option
    const option = page.locator(`${SEL.voiceOption}:has-text("${voiceName}")`).first();
    try {
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      await page.waitForTimeout(300);
      console.log(`[TTS:${reqId}] Voice selected: ${voiceName}`);
    } catch {
      // Voice not found — press Escape and continue with default
      console.warn(`[TTS:${reqId}] Voice "${voiceName}" not found, using default`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  } catch (error) {
    console.warn(`[TTS:${reqId}] Voice selection failed:`, error);
  }
}

async function fillText(page: Page, text: string, reqId: string): Promise<void> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const textInput = page.locator(SEL.textInput);
      await textInput.waitFor({ state: 'visible', timeout: 10_000 });
      await textInput.fill(text);
      await page.waitForTimeout(200);

      // Verify text was filled
      const actual = await textInput.inputValue();
      if (actual === text) {
        console.log(`[TTS:${reqId}] Text filled: ${text.length} chars`);
        return;
      }
      console.warn(`[TTS:${reqId}] Text fill verification failed (attempt ${attempt})`);
    } catch (error) {
      console.warn(`[TTS:${reqId}] Text fill attempt ${attempt} failed:`, error);
    }
    if (attempt < maxAttempts) {
      await page.waitForTimeout(1000);
    }
  }
  throw new Error('Failed to fill text in TTS input');
}

async function clickRun(page: Page, reqId: string): Promise<void> {
  const selectors = [SEL.runButton, SEL.runButtonAlt, SEL.runButtonAlt2];

  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 3000 })) {
        // Wait for button to be enabled
        await btn.waitFor({ state: 'visible', timeout: 5000 });
        const isDisabled = await btn.isDisabled();
        if (isDisabled) {
          console.warn(`[TTS:${reqId}] Run button disabled, waiting...`);
          await page.waitForTimeout(2000);
        }
        await btn.click();
        console.log(`[TTS:${reqId}] Run button clicked (selector: ${selector})`);
        return;
      }
    } catch {
      // Try next selector
    }
  }
  throw new Error('Run button not found or not clickable');
}

async function waitForAudio(
  page: Page,
  reqId: string,
  timeoutSeconds = 120,
): Promise<TTSResult> {
  console.log(`[TTS:${reqId}] Waiting for audio generation...`);
  const startTime = Date.now();
  let lastSrc = '';

  while (true) {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > timeoutSeconds) {
      throw new Error(`Audio generation timed out after ${timeoutSeconds}s`);
    }

    try {
      const audioPlayer = page.locator(SEL.audioPlayer);
      if (await audioPlayer.count() > 0) {
        const src = await audioPlayer.getAttribute('src') ?? '';
        if (src && src.startsWith('data:audio/') && src !== lastSrc) {
          console.log(`[TTS:${reqId}] Audio ready (${src.length} bytes data URI, ${Math.round(elapsed)}s)`);

          // Parse data URI: data:audio/wav;base64,<data>
          const commaIdx = src.indexOf(',');
          if (commaIdx === -1) {
            throw new Error('Invalid audio data URI format');
          }

          const header = src.substring(0, commaIdx); // e.g. "data:audio/wav;base64"
          const base64Data = src.substring(commaIdx + 1);

          // Extract MIME type
          const mimeMatch = header.match(/^data:(audio\/[^;]+)/);
          const mimeType = mimeMatch?.[1] ?? 'audio/wav';

          return { audioData: base64Data, mimeType };
        }
        lastSrc = src;
      }
    } catch (error) {
      // Element might not exist yet
      if (elapsed > 10) {
        console.warn(`[TTS:${reqId}] Audio check error at ${Math.round(elapsed)}s:`, error);
      }
    }

    await page.waitForTimeout(1500);
  }
}
