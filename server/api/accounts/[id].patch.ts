/**
 * PATCH /api/accounts/:id
 *
 * Update account configuration (fingerprint, proxy settings).
 * Body: { fingerprint?: FingerprintConfig | null, proxy?: ProxyConfig | null }
 *
 * Automatically restarts the browser if the updated account is currently active,
 * so fingerprint/proxy changes take effect immediately on the next request.
 */
import { useDb } from '~~/server/utils/suite';
import { accountBus, ACTIONS } from '~~/server/utils/bus';
import { closeBrowser, getCurrentAccountId } from '~~/server/lib/browser/index';
import type { FingerprintConfig, ProxyConfig } from '~~/shared/types';

interface PatchBody {
  fingerprint?: FingerprintConfig | null;
  proxy?: ProxyConfig | null;
}

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id');
  if (!rawId) throw createError({ statusCode: 400, statusMessage: 'Account ID required' });

  const id = decodeURIComponent(rawId);
  const body = await readBody<PatchBody>(event);

  if (body.fingerprint === undefined && body.proxy === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update (provide fingerprint and/or proxy)' });
  }

  const db = useDb();

  // Verify account exists
  const account = db.query('SELECT id FROM accounts WHERE id = ?').get(id);
  if (!account) {
    throw createError({ statusCode: 404, statusMessage: `Account '${id}' not found` });
  }

  // Update each provided field
  if (body.fingerprint !== undefined) {
    const val = body.fingerprint ? JSON.stringify(body.fingerprint) : null;
    db.run('UPDATE accounts SET fingerprint = ? WHERE id = ?', [val, id]);
  }

  if (body.proxy !== undefined) {
    const val = body.proxy ? JSON.stringify(body.proxy) : null;
    db.run('UPDATE accounts SET proxy = ? WHERE id = ?', [val, id]);
  }

  // Auto-restart browser if this account is currently active
  // The next request will lazily relaunch with the new config
  let browserRestarted = false;
  const activeAccountId = getCurrentAccountId();
  if (activeAccountId === id) {
    console.log(`[PATCH /accounts/${id}] Config changed for active account — closing browser`);
    try {
      await closeBrowser();
      browserRestarted = true;
    } catch (err) {
      console.warn(`[PATCH /accounts/${id}] Browser close failed (non-fatal):`, err);
    }
  }

  // Notify UI
  accountBus.emit(ACTIONS.ACCOUNTS_CHANGED);

  return { success: true, id, browserRestarted };
});
