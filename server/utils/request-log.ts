/**
 * Request Log — in-memory ring buffer for API request tracking.
 *
 * Stores the last N requests with metadata for the dashboard's live log view.
 * Emits events via the global event bus for SSE streaming to clients.
 */
import { EventEmitter } from 'node:events';

// ── Types ───────────────────────────────────────────────────────────────

export interface RequestLogEntry {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  model: string | null;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  statusCode: number | null;
  duration: number | null; // ms
  account: string | null;
  /** Input token estimate */
  inputTokens: number | null;
  /** Output token estimate */
  outputTokens: number | null;
  /** Error message if status is 'error' */
  error: string | null;
  /** Whether this was a streaming request */
  stream: boolean;
  /** Features used in this request */
  features: string[];
}

export interface RequestLogStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgDuration: number;
  requestsPerMinute: number;
  /** Model usage breakdown */
  modelCounts: Record<string, number>;
}

// ── Ring Buffer ─────────────────────────────────────────────────────────

const MAX_LOG_SIZE = 200;
const logBuffer: RequestLogEntry[] = [];
const requestStartTimes = new Map<string, number>();

// Global counters (survive ring buffer eviction)
let _totalRequests = 0;
let _successCount = 0;
let _errorCount = 0;
let _totalDuration = 0;
const _modelCounts: Record<string, number> = {};
// Sliding window for requests-per-minute
const _requestTimestamps: number[] = [];

// ── Event Bus ───────────────────────────────────────────────────────────

const globalForLogBus = global as unknown as { requestLogBus: EventEmitter };
export const requestLogBus = globalForLogBus.requestLogBus || new EventEmitter();
requestLogBus.setMaxListeners(50); // Support many SSE connections
if (process.env.NODE_ENV !== 'production') globalForLogBus.requestLogBus = requestLogBus;

export const LOG_EVENTS = {
  NEW_ENTRY: 'log:new',
  UPDATE_ENTRY: 'log:update',
} as const;

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Record the start of a new API request.
 */
export function logRequestStart(entry: Pick<RequestLogEntry, 'id' | 'method' | 'path' | 'model' | 'stream' | 'features' | 'account'>): void {
  const now = Date.now();
  const full: RequestLogEntry = {
    ...entry,
    timestamp: now,
    status: 'pending',
    statusCode: null,
    duration: null,
    inputTokens: null,
    outputTokens: null,
    error: null,
  };

  requestStartTimes.set(entry.id, now);

  // Add to ring buffer (evict oldest if full)
  if (logBuffer.length >= MAX_LOG_SIZE) {
    logBuffer.shift();
  }
  logBuffer.push(full);

  _totalRequests++;
  _requestTimestamps.push(now);
  if (entry.model) {
    _modelCounts[entry.model] = (_modelCounts[entry.model] ?? 0) + 1;
  }

  requestLogBus.emit(LOG_EVENTS.NEW_ENTRY, full);
}

/**
 * Update a request's status (e.g., streaming started, account selected).
 */
export function logRequestUpdate(id: string, update: Partial<Pick<RequestLogEntry, 'status' | 'statusCode' | 'account'>>): void {
  const entry = logBuffer.find(e => e.id === id);
  if (!entry) return;

  Object.assign(entry, update);
  requestLogBus.emit(LOG_EVENTS.UPDATE_ENTRY, entry);
}

/**
 * Record the completion of an API request.
 */
export function logRequestEnd(
  id: string,
  result: {
    statusCode: number;
    error?: string;
    inputTokens?: number;
    outputTokens?: number;
  },
): void {
  const entry = logBuffer.find(e => e.id === id);
  if (!entry) return;

  const startTime = requestStartTimes.get(id);
  const duration = startTime ? Date.now() - startTime : null;
  requestStartTimes.delete(id);

  entry.status = result.error ? 'error' : 'completed';
  entry.statusCode = result.statusCode;
  entry.duration = duration;
  entry.inputTokens = result.inputTokens ?? null;
  entry.outputTokens = result.outputTokens ?? null;
  entry.error = result.error ?? null;

  // Update global counters
  if (result.error) {
    _errorCount++;
  } else {
    _successCount++;
  }
  if (duration) {
    _totalDuration += duration;
  }

  requestLogBus.emit(LOG_EVENTS.UPDATE_ENTRY, entry);
}

/**
 * Get the full log buffer (most recent last).
 */
export function getRequestLog(): RequestLogEntry[] {
  return [...logBuffer];
}

/**
 * Get aggregated stats.
 */
export function getRequestStats(): RequestLogStats {
  // Clean up old timestamps (older than 1 minute)
  const oneMinAgo = Date.now() - 60_000;
  while (_requestTimestamps.length > 0 && _requestTimestamps[0]! < oneMinAgo) {
    _requestTimestamps.shift();
  }

  const completedCount = _successCount + _errorCount;

  return {
    totalRequests: _totalRequests,
    successCount: _successCount,
    errorCount: _errorCount,
    avgDuration: completedCount > 0 ? Math.round(_totalDuration / completedCount) : 0,
    requestsPerMinute: _requestTimestamps.length,
    modelCounts: { ..._modelCounts },
  };
}
