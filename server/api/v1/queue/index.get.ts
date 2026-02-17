/**
 * GET /api/v1/queue
 *
 * Returns the current request queue status.
 */
import { getQueueStatus } from '~~/server/lib/browser/queue';
import { isPageReady, getCurrentModel } from '~~/server/lib/browser/index';

export default defineEventHandler(() => {
  const queue = getQueueStatus();

  return {
    queue_length: queue.queueLength,
    is_processing: queue.isProcessing,
    browser_ready: isPageReady(),
    current_model: getCurrentModel(),
  };
});
