/**
 * Global error handler plugin — prevents Bun from crashing on unhandled rejections.
 *
 * Bun treats unhandled promise rejections as fatal by default (process.exit(1)).
 * Browser automation code (Playwright, ReadableStream, etc.) can produce
 * unhandled rejections during race conditions (e.g., stream cancelled while
 * generator is still yielding). This plugin catches them and logs instead of
 * crashing the entire server.
 */
export default defineNitroPlugin(() => {
  process.on('unhandledRejection', (reason, promise) => {
    // Log with full context for debugging
    const message = reason instanceof Error
      ? reason.message
      : reason !== undefined ? String(reason) : '(undefined)';
    const stack = reason instanceof Error ? reason.stack : undefined;

    console.error('[UnhandledRejection]', message);
    if (stack) {
      console.error(stack);
    }

    // Don't crash — the error is logged for debugging but the server stays up.
    // NOTE: If this fires frequently for the same error, it indicates a real bug
    // that should be fixed at the source.
  });

  process.on('uncaughtException', (error) => {
    console.error('[UncaughtException]', error.message);
    if (error.stack) {
      console.error(error.stack);
    }

    // For truly critical errors, we still want to crash eventually.
    // But for known benign errors (stream controller closed, etc.), survive.
    const msg = error.message?.toLowerCase() ?? '';
    const isBenign = msg.includes('controller is already closed')
      || msg.includes('controller is already used')
      || msg.includes('aborted')
      || msg.includes('client disconnected');

    if (!isBenign) {
      // Log but don't exit — Nitro/Bun will handle shutdown if needed.
      // If you prefer strict mode, uncomment: process.exit(1);
      console.error('[UncaughtException] Non-benign exception caught, server continues running');
    }
  });
});
