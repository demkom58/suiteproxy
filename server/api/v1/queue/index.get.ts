/**
 * GET /api/v1/queue
 *
 * Returns the current request queue and pool status.
 */
import { getQueueStatus } from '~~/server/lib/browser/queue';
import { getPoolStatus } from '~~/server/lib/browser/page-pool';
import { isPageReady, getCurrentModel } from '~~/server/lib/browser/index';

export default defineEventHandler(() => {
  const queue = getQueueStatus();
  const pool = getPoolStatus();

  return {
    queue_length: queue.queueLength,
    is_processing: queue.isProcessing,
    browser_ready: isPageReady(),
    current_model: getCurrentModel(),
    pool: {
      total_slots: pool.totalSlots,
      busy_slots: pool.busySlots,
      idle_slots: pool.idleSlots,
      cached_conversations: pool.cachedConversations,
      max_size: pool.maxSize,
      waiting_requests: pool.waitingRequests,
    },
  };
});
