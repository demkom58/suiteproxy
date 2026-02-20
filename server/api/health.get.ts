/**
 * GET /api/health
 *
 * Health check endpoint with detailed metrics including pool status.
 */
import { isPageReady, getCurrentModel } from '~~/server/lib/browser/index';
import { getQueueStatus } from '~~/server/lib/browser/queue';
import { getPoolStatus } from '~~/server/lib/browser/page-pool';
import { useDb } from '~~/server/utils/suite';

export default defineEventHandler(() => {
  const db = useDb();
  const accountCount = (db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number }).count;
  const availableAccounts = (db.prepare(
    'SELECT COUNT(*) as count FROM accounts WHERE limited_until < ?',
  ).get(Date.now()) as { count: number }).count;
  const queue = getQueueStatus();
  const pool = getPoolStatus();
  const authEnabled = !!process.env.PROXY_API_KEY;

  return {
    status: 'ok',
    browser_ready: isPageReady(),
    current_model: getCurrentModel(),
    accounts: {
      total: accountCount,
      available: availableAccounts,
      rate_limited: accountCount - availableAccounts,
    },
    queue: {
      length: queue.queueLength,
      is_processing: queue.isProcessing,
    },
    pool: {
      total_slots: pool.totalSlots,
      busy_slots: pool.busySlots,
      idle_slots: pool.idleSlots,
      cached_conversations: pool.cachedConversations,
      max_size: pool.maxSize,
      waiting_requests: pool.waitingRequests,
    },
    auth_enabled: authEnabled,
    uptime_seconds: Math.floor(process.uptime()),
  };
});
