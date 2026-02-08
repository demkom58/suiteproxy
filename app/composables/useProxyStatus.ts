/**
 * Composable for polling proxy health and queue status.
 * Shared across dashboard and layout components.
 */

interface HealthStatus {
  status: string;
  browser_ready: boolean;
  current_model: string | null;
  accounts: { total: number; available: number; rate_limited: number };
  queue: { length: number; is_processing: boolean };
  auth_enabled: boolean;
  uptime_seconds: number;
}

interface QueueStatus {
  queue_length: number;
  is_processing: boolean;
  browser_ready: boolean;
  current_model: string | null;
  pool?: {
    total_slots: number;
    busy_slots: number;
    idle_slots: number;
    cached_conversations: number;
    max_size: number;
    waiting_requests: number;
  };
}

interface RequestStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgDuration: number;
  requestsPerMinute: number;
  modelCounts: Record<string, number>;
}

// Shared reactive state (singleton across components)
const health = ref<HealthStatus | null>(null);
const queue = ref<QueueStatus | null>(null);
const stats = ref<RequestStats | null>(null);
const isOnline = ref(true);

let polling = false;

async function poll() {
  try {
    const [h, q, s] = await Promise.all([
      $fetch<HealthStatus>('/api/health'),
      $fetch<QueueStatus>('/api/v1/queue'),
      $fetch<RequestStats>('/api/logs/stats'),
    ]);
    health.value = h;
    queue.value = q;
    stats.value = s;
    isOnline.value = true;
  } catch {
    isOnline.value = false;
  }
}

export function useProxyStatus() {
  // Start polling only once (across all component instances)
  if (!polling && import.meta.client) {
    polling = true;
    poll();
    setInterval(poll, 3000);
  }

  const systemStatus = computed(() => {
    if (!isOnline.value) return { label: 'OFFLINE', color: 'text-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500' };
    if (!health.value) return { label: 'LOADING', color: 'text-slate-500', bg: 'bg-slate-500/10', dot: 'bg-slate-500' };
    const total = health.value.accounts.total;
    if (!total) return { label: 'NO ACCOUNTS', color: 'text-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500' };
    if (health.value.browser_ready) return { label: 'READY', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' };
    return { label: 'STANDBY', color: 'text-blue-400', bg: 'bg-blue-400/10', dot: 'bg-blue-400' };
  });

  const uptime = computed(() => {
    const s = health.value?.uptime_seconds ?? 0;
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
  });

  return {
    health,
    queue,
    stats,
    isOnline,
    systemStatus,
    uptime,
    refresh: poll,
  };
}
