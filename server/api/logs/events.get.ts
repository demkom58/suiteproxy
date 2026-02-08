/**
 * GET /api/logs/events
 *
 * SSE stream of request log events (new entries and updates).
 * Used by the live log dashboard view.
 */
import { requestLogBus, LOG_EVENTS, type RequestLogEntry } from '~~/server/utils/request-log';

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const onNew = (entry: RequestLogEntry) => {
        try {
          controller.enqueue(encoder.encode(`event: new\ndata: ${JSON.stringify(entry)}\n\n`));
        } catch {
          cleanup();
        }
      };

      const onUpdate = (entry: RequestLogEntry) => {
        try {
          controller.enqueue(encoder.encode(`event: update\ndata: ${JSON.stringify(entry)}\n\n`));
        } catch {
          cleanup();
        }
      };

      const cleanup = () => {
        requestLogBus.off(LOG_EVENTS.NEW_ENTRY, onNew);
        requestLogBus.off(LOG_EVENTS.UPDATE_ENTRY, onUpdate);
        try { controller.close(); } catch { /* already closed */ }
      };

      requestLogBus.on(LOG_EVENTS.NEW_ENTRY, onNew);
      requestLogBus.on(LOG_EVENTS.UPDATE_ENTRY, onUpdate);

      // Clean up when client disconnects
      event.node.req.on('close', cleanup);
    },
  });

  return stream;
});
