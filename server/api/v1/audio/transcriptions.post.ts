/**
 * POST /api/v1/audio/transcriptions
 *
 * OpenAI-compatible audio transcription (speech-to-text) endpoint.
 * Uses Gemini's multimodal capability to transcribe audio files.
 *
 * Accepts multipart/form-data with:
 * - file: Audio file (wav, mp3, m4a, webm, etc.)
 * - model: Model to use (default: gemini-2.5-flash)
 * - language: Language hint (optional)
 * - prompt: Context hint for transcription (optional)
 * - response_format: 'json', 'text', 'verbose_json' (default: 'json')
 *
 * CRITICAL: Uses SAPISID cookie auth (NOT api_key) to call the Gemini REST API.
 * The api_key from AI Studio belongs to Google's internal project and returns 403.
 * SAPISID auth authenticates as the user's Google session instead.
 */
import type { OpenAIAudioTranscriptionResponse } from '~~/server/types/openai';
import { getGoogleApiCredentials, callGeminiRestApi } from '~~/server/utils/google-api';

// ── Model Aliases ───────────────────────────────────────────────────────
const TRANSCRIPTION_MODEL_ALIASES: Record<string, string> = {
  'whisper-1': 'gemini-2.5-flash',
};

const DEFAULT_TRANSCRIPTION_MODEL = 'gemini-2.5-flash';

export default defineEventHandler(async (event) => {
  // Parse multipart form data
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'multipart form data with audio file is required',
    });
  }

  // Extract fields from form data
  let audioFile: { data: Buffer; filename?: string; type?: string } | null = null;
  let model = DEFAULT_TRANSCRIPTION_MODEL;
  let language = '';
  let prompt = '';
  let responseFormat = 'json';

  for (const part of formData) {
    const name = part.name;
    if (name === 'file') {
      audioFile = {
        data: part.data,
        filename: part.filename,
        type: part.type,
      };
    } else if (name === 'model') {
      model = part.data.toString('utf-8');
    } else if (name === 'language') {
      language = part.data.toString('utf-8');
    } else if (name === 'prompt') {
      prompt = part.data.toString('utf-8');
    } else if (name === 'response_format') {
      responseFormat = part.data.toString('utf-8');
    }
  }

  if (!audioFile) {
    throw createError({ statusCode: 400, statusMessage: 'audio file is required' });
  }

  // Resolve model
  const resolvedModel = TRANSCRIPTION_MODEL_ALIASES[model] ?? model;
  const modelPath = resolvedModel.startsWith('models/')
    ? resolvedModel
    : `models/${resolvedModel}`;

  // Determine MIME type
  const mimeType = audioFile.type || guessMimeType(audioFile.filename);

  // Get authenticated credentials (SAPISID cookie auth)
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  const creds = getGoogleApiCredentials(bearer);

  try {
    const reqId = `stt-${crypto.randomUUID().substring(0, 8)}`;
    console.log(`[Transcription:${reqId}] Transcribing: ${audioFile.filename ?? 'audio'} (${mimeType}, ${audioFile.data.length} bytes)`);

    // Build the transcription prompt
    let transcriptionPrompt = 'Transcribe the following audio accurately. Return ONLY the transcription text, with no additional commentary or formatting.';
    if (language) {
      transcriptionPrompt += ` The audio is in ${language}.`;
    }
    if (prompt) {
      transcriptionPrompt += ` Context: ${prompt}`;
    }

    // Base64-encode the audio file
    const audioBase64 = audioFile.data.toString('base64');

    // Call Gemini REST API with SAPISID auth (audio as inline data)
    const resp = await callGeminiRestApi(`${modelPath}:generateContent`, {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: transcriptionPrompt,
          },
        ],
      }],
      generationConfig: {
        temperature: 0, // Deterministic for transcription
        maxOutputTokens: 8192,
      },
    }, creds);

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`[Transcription:${reqId}] API error ${resp.status}: ${errText.substring(0, 300)}`);
      throw new Error(`Transcription API error ${resp.status}: ${errText.substring(0, 200)}`);
    }

    const data = await resp.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    // Extract transcription text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      throw new Error('Transcription returned no text');
    }

    console.log(`[Transcription:${reqId}] Transcribed: ${text.length} chars`);

    // Return based on response format
    if (responseFormat === 'text') {
      setResponseHeader(event, 'Content-Type', 'text/plain');
      return text;
    }

    if (responseFormat === 'verbose_json') {
      return {
        task: 'transcribe',
        language: language || 'unknown',
        duration: 0, // We don't know the duration without parsing the audio
        text,
        segments: [],
        words: [],
      };
    }

    // Default: json
    const response: OpenAIAudioTranscriptionResponse = { text };
    return response;

  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Transcription] Error:`, msg);
    throw createError({ statusCode: 502, statusMessage: msg });
  }
});

// ── Helpers ─────────────────────────────────────────────────────────────

function guessMimeType(filename?: string): string {
  if (!filename) return 'audio/wav';
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    m4a: 'audio/m4a',
    webm: 'audio/webm',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    opus: 'audio/opus',
    mp4: 'audio/mp4',
  };
  return mimeMap[ext ?? ''] ?? 'audio/wav';
}
