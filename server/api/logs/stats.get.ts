/**
 * GET /api/logs/stats
 *
 * Returns aggregated request statistics (total, success, error, avg duration, RPM, model counts).
 */
import { getRequestStats } from '~~/server/utils/request-log';

export default defineEventHandler(() => {
  return getRequestStats();
});
