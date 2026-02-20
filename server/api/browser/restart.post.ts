/**
 * POST /api/browser/restart
 *
 * Manually restart the browser instance. Useful when:
 * - Fingerprint/proxy config was changed and you want to force a restart
 * - Browser is in a bad state
 * - You want to switch accounts
 *
 * The browser will lazily relaunch on the next API request with fresh config.
 */
import { closeBrowser, isPageReady, getCurrentAccountId } from '~~/server/lib/browser/index';
import { getPoolStatus } from '~~/server/lib/browser/page-pool';

export default defineEventHandler(async () => {
  const pool = getPoolStatus();
  const wasReady = isPageReady();
  const wasAccount = getCurrentAccountId();

  if (pool.busySlots > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot restart browser while ${pool.busySlots} request(s) are being processed. Wait for them to complete.`,
    });
  }

  try {
    await closeBrowser();
  } catch (err) {
    console.error('[Browser Restart] Failed:', err);
    throw createError({ statusCode: 500, statusMessage: 'Browser close failed' });
  }

  console.log(`[Browser Restart] Browser closed (was_ready=${wasReady}, account=${wasAccount}). Will relaunch on next request.`);

  return {
    success: true,
    message: 'Browser closed. Will relaunch on next API request with fresh configuration.',
    previousState: {
      wasReady,
      account: wasAccount,
    },
  };
});
