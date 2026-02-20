/**
 * Page Pool — manages multiple concurrent browser pages for parallel request handling.
 *
 * Architecture:
 * - Single browser + single context (shared cookies/auth per account)
 * - Multiple pages (tabs) within the context, each handling one request at a time
 * - LRU conversation cache: pages that served a conversation prefix can be reused
 *   for the continuation of that conversation without re-injecting history
 * - Configurable pool size (default: 3 concurrent pages)
 * - Acquire/release pattern with async waiting when all slots are busy
 *
 * Conversation Cache:
 * - Each page slot tracks its `conversationHash` — a hash of the message history
 *   (all messages except the last user message)
 * - When a new request arrives, we compute its prefix hash and try to find
 *   a slot that already has that conversation loaded
 * - Cache hit → skip history injection, just append the new message (for textarea)
 *   or only inject the delta (for injection)
 * - Cache miss → clear the page and start fresh
 */
import type { Page } from 'playwright-core';
import { getErrorMessage } from '~~/server/utils/helpers';

// ── Configuration ───────────────────────────────────────────────────────

/** Maximum number of concurrent page slots in the pool. */
const MAX_POOL_SIZE = Number(process.env.SUITEPROXY_POOL_SIZE) || 3;

/** How long (ms) an idle page can sit before being eligible for eviction. */
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/** Max time (ms) to wait for a slot when all are busy. */
const ACQUIRE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ── Types ───────────────────────────────────────────────────────────────

export interface PageSlot {
  /** Slot index (0-based). */
  index: number;
  /** The Playwright Page instance, or null if not yet created. */
  page: Page | null;
  /** Whether this slot is currently processing a request. */
  locked: boolean;
  /** Account ID that this page is authenticated for. */
  accountId: string | null;
  /** Hash of the conversation prefix loaded on this page. Null = fresh/cleared. */
  conversationHash: string | null;
  /** Number of messages in the cached conversation (for delta injection). */
  conversationLength: number;
  /** The model currently loaded on this page. */
  currentModel: string | null;
  /** Timestamp of last use (for LRU eviction). */
  lastUsedAt: number;
  /** Whether this page has been initialized (navigated to AI Studio, input ready). */
  isReady: boolean;
}

export interface AcquireResult {
  slot: PageSlot;
  /** True if this slot has a matching conversation cache (skip re-injection). */
  conversationCached: boolean;
}

// ── Global State ────────────────────────────────────────────────────────

declare global {
  var _pagePool: PageSlot[] | undefined;
  var _poolWaiters: Array<{
    resolve: (slot: PageSlot) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }> | undefined;
}

function getPool(): PageSlot[] {
  if (!globalThis._pagePool) {
    globalThis._pagePool = [];
  }
  return globalThis._pagePool;
}

function getWaiters() {
  if (!globalThis._poolWaiters) {
    globalThis._poolWaiters = [];
  }
  return globalThis._poolWaiters;
}

// ── Conversation Hashing ────────────────────────────────────────────────

/**
 * Compute a hash of the conversation prefix (all messages except the last user message).
 * This is used to identify when a new request is a continuation of an existing conversation.
 *
 * We hash the stringified messages array minus the last entry. If two requests have
 * the same prefix hash, the second is a continuation of the first.
 */
export function computeConversationHash(
  messages: Array<{ role: string; content: unknown }> | undefined,
): string | null {
  if (!messages || messages.length <= 1) return null;

  // The prefix is everything except the last message
  const prefix = messages.slice(0, -1);
  // Use a fast hash — we don't need crypto-strength, just collision resistance
  const str = JSON.stringify(prefix);
  return fastHash(str);
}

/**
 * Compute the full conversation hash (all messages including the last one).
 * Used to tag a slot after a request completes, so future requests can match against it.
 */
export function computeFullConversationHash(
  messages: Array<{ role: string; content: unknown }> | undefined,
): string | null {
  if (!messages || messages.length === 0) return null;
  const str = JSON.stringify(messages);
  return fastHash(str);
}

/** DJB2 string hash — fast, good distribution, non-cryptographic. */
function fastHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return hash.toString(36);
}

// ── Pool Management ─────────────────────────────────────────────────────

/**
 * Acquire a page slot from the pool. Tries to find a cache hit first,
 * then an empty slot, then evicts the LRU idle slot. If all slots are busy,
 * waits until one becomes available.
 *
 * @param accountId - The account this request needs
 * @param conversationHash - Hash of the message prefix (for cache matching)
 * @returns The acquired slot and whether the conversation is cached
 */
export async function acquireSlot(
  accountId: string,
  conversationHash: string | null,
): Promise<AcquireResult> {
  const pool = getPool();

  // Priority 1: Find a slot with matching conversation AND same account (cache hit!)
  if (conversationHash) {
    const cached = pool.find(
      s => !s.locked && s.accountId === accountId && s.conversationHash === conversationHash && s.isReady,
    );
    if (cached) {
      cached.locked = true;
      cached.lastUsedAt = Date.now();
      console.log(`[PagePool] Slot ${cached.index}: conversation cache HIT (hash=${conversationHash.substring(0, 8)})`);
      return { slot: cached, conversationCached: true };
    }
  }

  // Priority 2: Find an unlocked slot for the same account (avoids browser restart)
  const sameAccount = pool.find(s => !s.locked && s.accountId === accountId && s.isReady);
  if (sameAccount) {
    sameAccount.locked = true;
    sameAccount.lastUsedAt = Date.now();
    sameAccount.conversationHash = null; // Will be set after request completes
    sameAccount.conversationLength = 0;
    console.log(`[PagePool] Slot ${sameAccount.index}: reusing for same account (cleared conversation cache)`);
    return { slot: sameAccount, conversationCached: false };
  }

  // Priority 3: Create a new slot if pool isn't full
  if (pool.length < MAX_POOL_SIZE) {
    const slot = createSlot(pool.length);
    pool.push(slot);
    slot.locked = true;
    slot.lastUsedAt = Date.now();
    console.log(`[PagePool] Created new slot ${slot.index} (pool size: ${pool.length}/${MAX_POOL_SIZE})`);
    return { slot, conversationCached: false };
  }

  // Priority 4: Evict the LRU idle slot (oldest lastUsedAt, not locked)
  const idleSlots = pool.filter(s => !s.locked).sort((a, b) => a.lastUsedAt - b.lastUsedAt);
  if (idleSlots.length > 0) {
    const evicted = idleSlots[0]!;
    console.log(`[PagePool] Evicting slot ${evicted.index} (idle ${Math.round((Date.now() - evicted.lastUsedAt) / 1000)}s)`);
    await closeSlotPage(evicted);
    evicted.locked = true;
    evicted.lastUsedAt = Date.now();
    return { slot: evicted, conversationCached: false };
  }

  // Priority 5: All slots busy — wait for one to be released
  console.log(`[PagePool] All ${pool.length} slots busy — waiting for release...`);
  return new Promise<AcquireResult>((resolve, reject) => {
    const waiterResolve = (slot: PageSlot) => {
      slot.conversationHash = null;
      slot.conversationLength = 0;
      resolve({ slot, conversationCached: false });
    };

    const timer = setTimeout(() => {
      const idx = getWaiters().findIndex(w => w.resolve === waiterResolve);
      if (idx !== -1) getWaiters().splice(idx, 1);
      reject(new Error(`Pool acquire timeout: all ${MAX_POOL_SIZE} slots busy for ${ACQUIRE_TIMEOUT_MS / 1000}s`));
    }, ACQUIRE_TIMEOUT_MS);

    getWaiters().push({
      resolve: (slot) => {
        clearTimeout(timer);
        waiterResolve(slot);
      },
      reject: (err) => {
        clearTimeout(timer);
        reject(err);
      },
      timer,
    });
  });
}

/**
 * Release a slot back to the pool after request completion.
 * Optionally updates the conversation hash for future cache hits.
 */
export function releaseSlot(
  slot: PageSlot,
  conversationHash?: string | null,
  conversationLength?: number,
  model?: string | null,
): void {
  slot.locked = false;
  slot.lastUsedAt = Date.now();

  if (conversationHash !== undefined) {
    slot.conversationHash = conversationHash;
  }
  if (conversationLength !== undefined) {
    slot.conversationLength = conversationLength;
  }
  if (model !== undefined) {
    slot.currentModel = model;
  }

  // Wake up the first waiter, if any
  const waiters = getWaiters();
  if (waiters.length > 0) {
    const waiter = waiters.shift()!;
    slot.locked = true;
    slot.lastUsedAt = Date.now();
    console.log(`[PagePool] Slot ${slot.index}: handed to waiting request`);
    waiter.resolve(slot);
  }
}

/**
 * Set a slot's page reference (called after browser creates a new page).
 */
export function setSlotPage(slot: PageSlot, page: Page, accountId: string): void {
  slot.page = page;
  slot.accountId = accountId;
  slot.isReady = true;
}

/**
 * Close a specific slot's page.
 */
async function closeSlotPage(slot: PageSlot): Promise<void> {
  if (slot.page) {
    try {
      await slot.page.close();
    } catch {
      // Page may already be closed
    }
  }
  slot.page = null;
  slot.isReady = false;
  slot.conversationHash = null;
  slot.conversationLength = 0;
  slot.currentModel = null;
  slot.accountId = null;
}

/**
 * Close all pages in the pool and reset state.
 * Called when the browser is being fully closed (account switch, restart, etc.)
 */
export async function closeAllSlots(): Promise<void> {
  const pool = getPool();
  for (const slot of pool) {
    await closeSlotPage(slot);
    slot.locked = false;
  }
  globalThis._pagePool = [];

  // Reject all waiters
  const waiters = getWaiters();
  for (const waiter of waiters) {
    clearTimeout(waiter.timer);
    waiter.reject(new Error('Pool closed'));
  }
  globalThis._poolWaiters = [];

  console.log('[PagePool] All slots closed and pool reset');
}

/**
 * Get pool status for monitoring/health checks.
 */
export function getPoolStatus(): {
  totalSlots: number;
  busySlots: number;
  idleSlots: number;
  cachedConversations: number;
  maxSize: number;
  waitingRequests: number;
} {
  const pool = getPool();
  const busy = pool.filter(s => s.locked).length;
  const cached = pool.filter(s => s.conversationHash !== null).length;

  return {
    totalSlots: pool.length,
    busySlots: busy,
    idleSlots: pool.length - busy,
    cachedConversations: cached,
    maxSize: MAX_POOL_SIZE,
    waitingRequests: getWaiters().length,
  };
}

/**
 * Periodically clean up idle pages to free resources.
 * Called on a timer or after request completion.
 */
export async function evictIdleSlots(): Promise<void> {
  const pool = getPool();
  const now = Date.now();

  for (const slot of pool) {
    if (!slot.locked && slot.page && (now - slot.lastUsedAt) > IDLE_TIMEOUT_MS) {
      console.log(`[PagePool] Evicting idle slot ${slot.index} (idle ${Math.round((now - slot.lastUsedAt) / 1000)}s)`);
      await closeSlotPage(slot);
    }
  }
}

// ── Internal ────────────────────────────────────────────────────────────

function createSlot(index: number): PageSlot {
  return {
    index,
    page: null,
    locked: false,
    accountId: null,
    conversationHash: null,
    conversationLength: 0,
    currentModel: null,
    lastUsedAt: 0,
    isReady: false,
  };
}
