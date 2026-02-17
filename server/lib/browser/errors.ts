/**
 * Typed error classes for browser automation.
 * Enables precise error handling and recovery decisions in the queue.
 */

/** Base class for all browser automation errors */
export class BrowserAutomationError extends Error {
  constructor(message: string, public readonly reqId?: string) {
    super(reqId ? `[${reqId}] ${message}` : message);
    this.name = 'BrowserAutomationError';
  }
}

/** Browser is not initialized or has crashed */
export class BrowserNotInitializedError extends BrowserAutomationError {
  constructor(message = 'Browser not initialized or has crashed', reqId?: string) {
    super(message, reqId);
    this.name = 'BrowserNotInitializedError';
  }
}

/** Page navigation or readiness failure */
export class PageNotReadyError extends BrowserAutomationError {
  constructor(message = 'Page is not ready or was redirected', reqId?: string) {
    super(message, reqId);
    this.name = 'PageNotReadyError';
  }
}

/** Authentication/cookie failure — redirected to Google login */
export class AuthenticationError extends BrowserAutomationError {
  constructor(
    public readonly accountId: string,
    message?: string,
    reqId?: string,
  ) {
    super(message ?? `Cookies for ${accountId} are expired. Please re-sync the account.`, reqId);
    this.name = 'AuthenticationError';
  }
}

/** Model switch failed */
export class ModelSwitchError extends BrowserAutomationError {
  constructor(
    public readonly targetModel: string,
    message?: string,
    reqId?: string,
  ) {
    super(message ?? `Failed to switch to model '${targetModel}'`, reqId);
    this.name = 'ModelSwitchError';
  }
}

/** Response extraction failed (edit button, copy markdown, DOM all failed) */
export class ResponseExtractionError extends BrowserAutomationError {
  constructor(message = 'Failed to extract response text from page', reqId?: string) {
    super(message, reqId);
    this.name = 'ResponseExtractionError';
  }
}

/** Response timed out waiting for completion */
export class ResponseTimeoutError extends BrowserAutomationError {
  constructor(
    public readonly timeoutMs: number,
    message?: string,
    reqId?: string,
  ) {
    super(message ?? `Response did not complete within ${timeoutMs}ms`, reqId);
    this.name = 'ResponseTimeoutError';
  }
}

/** Prompt submission failed (all methods: click, JS click, Enter, Ctrl+Enter) */
export class SubmitError extends BrowserAutomationError {
  constructor(message = 'Failed to submit prompt (all methods failed)', reqId?: string) {
    super(message, reqId);
    this.name = 'SubmitError';
  }
}

/** Textarea not found on the page */
export class TextareaNotFoundError extends BrowserAutomationError {
  constructor(message = 'Prompt textarea not found on page', reqId?: string) {
    super(message, reqId);
    this.name = 'TextareaNotFoundError';
  }
}

/** Rate limit / quota exhausted */
export class RateLimitError extends BrowserAutomationError {
  constructor(
    public readonly accountId?: string,
    message?: string,
    reqId?: string,
  ) {
    super(message ?? 'Rate limit or quota exceeded', reqId);
    this.name = 'RateLimitError';
  }
}

/** No accounts available (all rate-limited or no accounts synced) */
export class NoAccountsError extends BrowserAutomationError {
  constructor(message = 'No accounts available. Please sync an account first.', reqId?: string) {
    super(message, reqId);
    this.name = 'NoAccountsError';
  }
}

/** Client disconnected before or during processing */
export class ClientDisconnectedError extends BrowserAutomationError {
  constructor(message = 'Client disconnected', reqId?: string) {
    super(message, reqId);
    this.name = 'ClientDisconnectedError';
  }
}

// ── Error Classification Helpers ────────────────────────────────────────

/** Check if an error indicates a rate limit / quota issue */
export function isRateLimitError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return error instanceof RateLimitError
    || msg.includes('429')
    || msg.includes('rate limit')
    || msg.includes('quota')
    || msg.includes('resource exhausted');
}

/** Check if an error is recoverable by page refresh (Tier 1) */
export function isTier1Recoverable(error: Error): boolean {
  return error instanceof ResponseTimeoutError
    || error instanceof SubmitError
    || error instanceof ResponseExtractionError;
}

/** Check if an error requires account switch (Tier 2) */
export function isTier2Recoverable(error: Error): boolean {
  return error instanceof RateLimitError
    || error instanceof AuthenticationError
    || isRateLimitError(error);
}

/** Check if an error is fatal and should not be retried */
export function isFatalError(error: Error): boolean {
  return error instanceof NoAccountsError
    || error instanceof ClientDisconnectedError;
}
