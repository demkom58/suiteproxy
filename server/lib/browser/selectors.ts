/**
 * CSS Selectors for Google AI Studio UI elements.
 * Ported from AIstudioProxyAPI config/selectors.py with multi-fallback support.
 */

// ── Input Area ──────────────────────────────────────────────────────────
/** The main prompt textarea — supports both new and old UI layouts */
export const PROMPT_TEXTAREA = [
  'textarea.textarea',                                       // Most direct (current UI)
  'ms-autosize-textarea textarea',                           // Generic
  'ms-chunk-input textarea',                                 // Chunk editor variant
  'ms-chunk-editor ms-autosize-textarea textarea',           // Chunk editor + autosize
  'ms-prompt-input-wrapper ms-autosize-textarea textarea',   // Wrapper + autosize
  'ms-prompt-input-wrapper textarea[aria-label*="prompt" i]', // Aria-labeled
  'ms-prompt-input-wrapper textarea',                        // Wrapper generic
  'ms-prompt-box ms-autosize-textarea textarea',             // Old UI
  'ms-prompt-box textarea[aria-label="Enter a prompt"]',     // Old UI aria
  'ms-prompt-box textarea',                                  // Old UI generic
] as const;

/** Wrapper around the input area (for visibility checks) */
export const INPUT_WRAPPER = [
  'ms-chunk-editor',                                    // Current UI (2024-12+)
  'ms-prompt-input-wrapper .prompt-input-wrapper',      // Alternate
  'ms-prompt-input-wrapper',                            // Wrapper
  'ms-prompt-box .prompt-box-container',                // Old UI
  'ms-prompt-box',                                      // Old UI fallback
] as const;

// ── Buttons ─────────────────────────────────────────────────────────────
/**
 * Submit / Run button — combined selector matching current and old UI.
 * Uses comma-separated CSS selector for broader compatibility.
 */
export const SUBMIT_BUTTON =
  'ms-run-button button[type="submit"].ms-button-primary, ' +
  'ms-run-button button[type="submit"], ' +
  'ms-prompt-input-wrapper ms-run-button button[aria-label="Run"], ' +
  'ms-prompt-input-wrapper button[aria-label="Run"][type="submit"], ' +
  'button[aria-label="Run"].run-button, ' +
  'ms-run-button button[type="submit"].run-button, ' +
  'ms-prompt-box ms-run-button button[aria-label="Run"], ' +
  'ms-prompt-box button[aria-label="Run"][type="submit"]';

/** Clear chat / New chat button */
export const CLEAR_CHAT_BUTTON =
  'button[data-test-clear="outside"][aria-label="New chat"], ' +
  'button[aria-label="New chat"]';

/** Temporary chat toggle */
export const TEMP_CHAT_BUTTON = 'button[aria-label="Temporary chat toggle"]';

// ── Response Area ───────────────────────────────────────────────────────
/** Chat turn container (each message bubble) */
export const CHAT_TURN = 'ms-chat-turn';

/** The assistant (model) response turn — identified by .model class on chat-turn-container */
export const RESPONSE_CONTAINER = 'ms-chat-turn .chat-turn-container.model';

/** Model name display element */
export const MODEL_NAME = '[data-test-id="model-name"]';

// ── Parameter Controls ──────────────────────────────────────────────────
/** Temperature slider/input */
export const TEMPERATURE_INPUT =
  'ms-slider input[type="number"][max="2"], ' +
  'input.slider-number-input[aria-valuemax="2"]';

/** Max output tokens input */
export const MAX_TOKENS_INPUT = 'input[aria-label="Maximum output tokens"]';

/** Top-P input */
export const TOP_P_INPUT =
  'ms-slider input[type="number"][max="1"], ' +
  'input.slider-number-input[aria-valuemax="1"]';

/** Stop sequences chip input */
export const STOP_SEQUENCES_INPUT = 'input[aria-label="Add stop token"]';

// ── Thinking Controls ───────────────────────────────────────────────────
/** Thinking mode toggle (enables/disables thinking) */
export const THINKING_TOGGLE = [
  'button[role="switch"][aria-label="Toggle thinking mode"]',
  'mat-slide-toggle[data-test-toggle="enable-thinking"] button[role="switch"].mdc-switch',
  '[data-test-toggle="enable-thinking"] button[role="switch"].mdc-switch',
] as const;

/** Thinking budget toggle (auto vs manual) */
export const THINKING_BUDGET_TOGGLE = [
  'button[role="switch"][aria-label="Toggle thinking budget between auto and manual"]',
  'mat-slide-toggle[data-test-toggle="manual-budget"] button[role="switch"].mdc-switch',
  '[data-test-toggle="manual-budget"] button[role="switch"].mdc-switch',
] as const;

/** Thinking budget value input */
export const THINKING_BUDGET_INPUT =
  '[data-test-id="user-setting-budget-animation-wrapper"] input[type="number"], ' +
  'input.slider-number-input[min="512"], ' +
  'ms-slider input[type="number"][min="512"], ' +
  '[data-test-slider] input[type="number"]';

/** Thinking level dropdown (Gemini 3) */
export const THINKING_LEVEL_DROPDOWN = [
  '[role="combobox"][aria-label="Thinking Level"]',
  'mat-select[aria-label="Thinking Level"]',
  '[role="combobox"][aria-label="Thinking level"]',
  'mat-select[aria-label="Thinking level"]',
] as const;

/** Thinking level options */
export const THINKING_LEVEL_OPTIONS = {
  minimal: '[role="listbox"][aria-label="Thinking Level"] [role="option"]:has-text("Minimal"), [role="listbox"][aria-label="Thinking level"] [role="option"]:has-text("Minimal")',
  low: '[role="listbox"][aria-label="Thinking Level"] [role="option"]:has-text("Low"), [role="listbox"][aria-label="Thinking level"] [role="option"]:has-text("Low")',
  medium: '[role="listbox"][aria-label="Thinking Level"] [role="option"]:has-text("Medium"), [role="listbox"][aria-label="Thinking level"] [role="option"]:has-text("Medium")',
  high: '[role="listbox"][aria-label="Thinking Level"] [role="option"]:has-text("High"), [role="listbox"][aria-label="Thinking level"] [role="option"]:has-text("High")',
} as const;

// ── System Instruction ──────────────────────────────────────────────────
/** System instruction textarea (collapsible panel in AI Studio) */
export const SYSTEM_INSTRUCTION_TEXTAREA = [
  'ms-system-instructions-editor textarea',
  'ms-prompt-system-instructions textarea',
  '[data-test-id="system-instructions"] textarea',
  'ms-system-instructions textarea',
] as const;

/** System instruction expand/toggle button */
export const SYSTEM_INSTRUCTION_TOGGLE = [
  'button[aria-label="System instructions"]',
  'button[aria-label="System Instructions"]',
  '[data-test-id="system-instructions-toggle"]',
] as const;

// ── Tool Controls ───────────────────────────────────────────────────────
/** Tools panel expand/collapse button */
export const TOOLS_PANEL_TOGGLE = 'button[aria-label="Expand or collapse tools"]';

/** Google Search grounding toggle (inside tools panel) */
export const GOOGLE_SEARCH_TOGGLE =
  'div[data-test-id="searchAsAToolTooltip"] mat-slide-toggle button, ' +
  'mat-slide-toggle[aria-label="Google Search"] button, ' +
  'button[aria-label="Google Search toggle"]';

/** URL Context toggle (inside tools panel) */
export const URL_CONTEXT_TOGGLE =
  'button[aria-label="Browse the url context"], ' +
  'mat-slide-toggle[aria-label="URL context"] button';

// ── Response Extraction ─────────────────────────────────────────────────
/** Edit button on the last response */
export const EDIT_BUTTON = '.actions-container button.toggle-edit-button';

/** Stop editing button */
export const STOP_EDITING_BUTTON = '.actions-container button.toggle-edit-button[aria-label="Stop editing"]';

/** More options button on a response */
export const MORE_OPTIONS_BUTTON = 'div.actions-container div ms-chat-turn-options div > button';

/** Copy markdown menu items */
export const COPY_MARKDOWN_ITEM = 'button.mat-mdc-menu-item:nth-child(4), div[role="menu"] button:has-text("Copy Markdown")';

/** Response text selectors */
export const RESPONSE_TEXT = 'ms-cmark-node.cmark-node';

/** Loading spinner / generating indicator — combined selector for current and old UI */
export const LOADING_SPINNER =
  'ms-run-button button[type="submit"] .spinner-border, ' +
  'ms-run-button button[type="submit"] .mat-mdc-progress-spinner, ' +
  'ms-run-button button[type="submit"] svg.stoppable-spinner, ' +
  'ms-run-button .generating-indicator, ' +
  'button[aria-label="Run"].run-button svg .stoppable-spinner';

/** Error toast */
export const ERROR_TOAST = 'div.toast.warning, div.toast.error';

/** Model error inside a turn */
export const MODEL_ERROR = '.model-error';

// ── Dialogs & Overlays ─────────────────────────────────────────────────
/** CDK overlay backdrop (Angular Material) */
export const CDK_BACKDROP = '.cdk-overlay-backdrop';

/** Confirm dialog buttons */
export const CONFIRM_DISCARD = 'button:has-text("Discard and continue")';

// ── Upload ──────────────────────────────────────────────────────────────
/** Insert assets menu button */
export const INSERT_ASSETS_BUTTON = 'button[aria-label="Insert assets"]';

/** Upload a file option in the menu */
export const UPLOAD_FILE_OPTION = 'button:has-text("Upload a file")';

// ── Constants ───────────────────────────────────────────────────────────
export const AI_STUDIO_URL = 'https://aistudio.google.com';
export const AI_STUDIO_NEW_CHAT = 'https://aistudio.google.com/prompts/new_chat';
export const AI_STUDIO_URL_PATTERN = 'aistudio.google.com';
