/**
 * GET /api/logs
 *
 * Returns the request log ring buffer (most recent last).
 */
import { getRequestLog } from '~~/server/utils/request-log';

export default defineEventHandler(() => {
  return getRequestLog();
});
