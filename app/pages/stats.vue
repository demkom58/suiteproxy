<script setup lang="ts">
/**
 * Statistics — Detailed request analytics computed from ring buffer + global counters.
 *
 * Shows: request volume, success/error rates, latency distribution,
 * per-model breakdown, per-account usage, feature usage, status breakdown.
 */
useHead({ title: 'Statistics — SuiteProxy' });

interface LogEntry {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  model: string | null;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  statusCode: number | null;
  duration: number | null;
  account: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  error: string | null;
  stream: boolean;
  features: string[];
}

interface RequestStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgDuration: number;
  requestsPerMinute: number;
  modelCounts: Record<string, number>;
}

// ── Data ────────────────────────────────────────────────────────────────

const { data: logs, refresh: refreshLogs } = await useFetch<LogEntry[]>('/api/logs');
const { data: globalStats, refresh: refreshStats } = await useFetch<RequestStats>('/api/logs/stats');

// Auto-refresh every 5s
let refreshInterval: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  refreshInterval = setInterval(() => {
    refreshLogs();
    refreshStats();
  }, 5000);
});
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

// ── Computed Analytics ──────────────────────────────────────────────────

const entries = computed(() => logs.value ?? []);

const successRate = computed(() => {
  const s = globalStats.value;
  if (!s || s.totalRequests === 0) return 100;
  return Math.round((s.successCount / s.totalRequests) * 1000) / 10;
});

const errorRate = computed(() => {
  const s = globalStats.value;
  if (!s || s.totalRequests === 0) return 0;
  return Math.round((s.errorCount / s.totalRequests) * 1000) / 10;
});

// Per-model breakdown from ring buffer
const modelBreakdown = computed(() => {
  const map = new Map<string, { count: number; errors: number; totalDuration: number; durCount: number }>();
  for (const e of entries.value) {
    const model = e.model?.replace('models/', '') ?? 'unknown';
    const existing = map.get(model) ?? { count: 0, errors: 0, totalDuration: 0, durCount: 0 };
    existing.count++;
    if (e.status === 'error') existing.errors++;
    if (e.duration) {
      existing.totalDuration += e.duration;
      existing.durCount++;
    }
    map.set(model, existing);
  }
  return Array.from(map.entries())
    .map(([model, data]) => ({
      model,
      count: data.count,
      errors: data.errors,
      avgDuration: data.durCount > 0 ? Math.round(data.totalDuration / data.durCount) : 0,
      errorRate: data.count > 0 ? Math.round((data.errors / data.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
});

// Per-account breakdown
const accountBreakdown = computed(() => {
  const map = new Map<string, { count: number; errors: number }>();
  for (const e of entries.value) {
    const account = e.account ?? 'unknown';
    const existing = map.get(account) ?? { count: 0, errors: 0 };
    existing.count++;
    if (e.status === 'error') existing.errors++;
    map.set(account, existing);
  }
  return Array.from(map.entries())
    .map(([account, data]) => ({
      account,
      count: data.count,
      errors: data.errors,
    }))
    .sort((a, b) => b.count - a.count);
});

// Feature usage
const featureUsage = computed(() => {
  const map = new Map<string, number>();
  for (const e of entries.value) {
    for (const f of e.features) {
      map.set(f, (map.get(f) ?? 0) + 1);
    }
    if (e.stream) {
      map.set('stream', (map.get('stream') ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count);
});

// Latency distribution (from ring buffer)
const latencyDistribution = computed(() => {
  const buckets = [
    { label: '<1s', max: 1000, count: 0 },
    { label: '1-3s', max: 3000, count: 0 },
    { label: '3-5s', max: 5000, count: 0 },
    { label: '5-10s', max: 10000, count: 0 },
    { label: '10-30s', max: 30000, count: 0 },
    { label: '>30s', max: Infinity, count: 0 },
  ];
  for (const e of entries.value) {
    if (e.duration === null) continue;
    for (const bucket of buckets) {
      if (e.duration <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  }
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  return buckets.map(b => ({ ...b, percent: Math.round((b.count / maxCount) * 100) }));
});

// Status breakdown
const statusBreakdown = computed(() => {
  const counts = { completed: 0, streaming: 0, pending: 0, error: 0 };
  for (const e of entries.value) {
    counts[e.status]++;
  }
  return counts;
});

// HTTP status code breakdown
const statusCodeBreakdown = computed(() => {
  const map = new Map<number, number>();
  for (const e of entries.value) {
    if (e.statusCode) {
      map.set(e.statusCode, (map.get(e.statusCode) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => a.code - b.code);
});

// Recent errors
const recentErrors = computed(() =>
  entries.value
    .filter(e => e.status === 'error')
    .slice(-10)
    .reverse(),
);

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function statusCodeColor(code: number): string {
  if (code < 300) return 'text-emerald-400';
  if (code < 400) return 'text-amber-400';
  return 'text-red-400';
}

function featureColor(feature: string): string {
  const colors: Record<string, string> = {
    stream: 'bg-blue-500/15 text-blue-400',
    thinking: 'bg-purple-500/15 text-purple-400',
    vision: 'bg-cyan-500/15 text-cyan-400',
    function_calling: 'bg-amber-500/15 text-amber-400',
    json_mode: 'bg-emerald-500/15 text-emerald-400',
    json_schema: 'bg-emerald-500/15 text-emerald-400',
    search: 'bg-orange-500/15 text-orange-400',
    code_execution: 'bg-rose-500/15 text-rose-400',
    url_context: 'bg-indigo-500/15 text-indigo-400',
  };
  return colors[feature] ?? 'bg-slate-500/15 text-slate-400';
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">Statistics</h2>
        <p class="text-slate-600 text-sm mt-1">
          Analytics from {{ entries.length }} buffered requests &middot; auto-refreshes every 5s
        </p>
      </div>
    </div>

    <!-- ═══ Top-Level KPIs ═══ -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Total Requests</div>
        <div class="text-3xl font-black text-white">{{ globalStats?.totalRequests ?? 0 }}</div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">lifetime (since restart)</div>
      </div>
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Success Rate</div>
        <div class="text-3xl font-black" :class="successRate >= 95 ? 'text-emerald-400' : successRate >= 80 ? 'text-amber-400' : 'text-red-400'">
          {{ successRate }}%
        </div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">{{ globalStats?.successCount ?? 0 }} succeeded</div>
      </div>
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Error Rate</div>
        <div class="text-3xl font-black" :class="errorRate === 0 ? 'text-slate-500' : errorRate <= 5 ? 'text-amber-400' : 'text-red-400'">
          {{ errorRate }}%
        </div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">{{ globalStats?.errorCount ?? 0 }} failed</div>
      </div>
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Avg Latency</div>
        <div class="text-3xl font-black text-slate-300">
          {{ globalStats?.avgDuration ? formatDuration(globalStats.avgDuration) : '--' }}
        </div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">all completed requests</div>
      </div>
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Req/min</div>
        <div class="text-3xl font-black text-blue-400">{{ globalStats?.requestsPerMinute ?? 0 }}</div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">sliding window</div>
      </div>
    </div>

    <!-- ═══ Two Column Layout ═══ -->
    <div class="grid lg:grid-cols-2 gap-6 mb-8">

      <!-- Model Breakdown -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-4">Model Usage</div>
        <div v-if="modelBreakdown.length" class="space-y-2.5">
          <div v-for="m in modelBreakdown" :key="m.model" class="flex items-center gap-3">
            <span class="text-xs font-mono text-slate-300 truncate flex-1 min-w-0">{{ m.model }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="m.errorRate > 20 ? 'bg-red-500/60' : 'bg-blue-500/60'"
                  :style="{ width: `${Math.min((m.count / (modelBreakdown[0]?.count || 1)) * 100, 100)}%` }"
                />
              </div>
              <span class="text-[10px] text-slate-500 font-mono w-8 text-right">{{ m.count }}</span>
              <span class="text-[10px] font-mono w-12 text-right" :class="m.avgDuration > 10000 ? 'text-amber-400' : 'text-slate-600'">
                {{ m.avgDuration ? formatDuration(m.avgDuration) : '--' }}
              </span>
              <span v-if="m.errors" class="text-[9px] text-red-400 font-bold">{{ m.errors }} err</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-slate-700 text-sm">No requests yet</p>
        </div>
      </section>

      <!-- Latency Distribution -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-4">Latency Distribution</div>
        <div class="space-y-2.5">
          <div v-for="bucket in latencyDistribution" :key="bucket.label" class="flex items-center gap-3">
            <span class="text-xs font-mono text-slate-500 w-14 shrink-0">{{ bucket.label }}</span>
            <div class="flex-1 h-5 bg-slate-800/50 rounded-md overflow-hidden relative">
              <div
                class="h-full rounded-md transition-all duration-500"
                :class="bucket.label === '>30s' ? 'bg-red-500/40' : bucket.label.includes('10') ? 'bg-amber-500/40' : 'bg-blue-500/40'"
                :style="{ width: `${bucket.percent}%` }"
              />
              <span v-if="bucket.count" class="absolute inset-y-0 right-2 flex items-center text-[10px] font-bold text-slate-400">
                {{ bucket.count }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ═══ Second Row ═══ -->
    <div class="grid lg:grid-cols-3 gap-6 mb-8">

      <!-- Account Usage -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-4">Account Usage</div>
        <div v-if="accountBreakdown.length" class="space-y-2">
          <div v-for="a in accountBreakdown" :key="a.account" class="flex items-center justify-between">
            <span class="text-xs font-mono text-slate-400 truncate flex-1 min-w-0 mr-2">{{ a.account }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-sm font-bold text-white">{{ a.count }}</span>
              <span v-if="a.errors" class="text-[9px] text-red-400 font-bold">({{ a.errors }} err)</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6 text-slate-700 text-sm">No data</div>
      </section>

      <!-- Feature Usage -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-4">Feature Usage</div>
        <div v-if="featureUsage.length" class="flex flex-wrap gap-2">
          <div
            v-for="f in featureUsage"
            :key="f.feature"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold"
            :class="featureColor(f.feature)"
          >
            {{ f.feature }}
            <span class="text-[10px] opacity-70">{{ f.count }}</span>
          </div>
        </div>
        <div v-else class="text-center py-6 text-slate-700 text-sm">No features used</div>
      </section>

      <!-- Status Codes -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-4">HTTP Status Codes</div>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 text-center">
            <div class="text-lg font-black text-emerald-400">{{ statusBreakdown.completed }}</div>
            <div class="text-[8px] text-slate-600 font-bold uppercase">Completed</div>
          </div>
          <div class="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5 text-center">
            <div class="text-lg font-black text-red-400">{{ statusBreakdown.error }}</div>
            <div class="text-[8px] text-slate-600 font-bold uppercase">Errors</div>
          </div>
          <div class="bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5 text-center">
            <div class="text-lg font-black text-blue-400">{{ statusBreakdown.streaming }}</div>
            <div class="text-[8px] text-slate-600 font-bold uppercase">Streaming</div>
          </div>
          <div class="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 text-center">
            <div class="text-lg font-black text-amber-400">{{ statusBreakdown.pending }}</div>
            <div class="text-[8px] text-slate-600 font-bold uppercase">Pending</div>
          </div>
        </div>
        <div v-if="statusCodeBreakdown.length" class="space-y-1.5">
          <div v-for="sc in statusCodeBreakdown" :key="sc.code" class="flex items-center justify-between text-xs">
            <span class="font-mono font-bold" :class="statusCodeColor(sc.code)">{{ sc.code }}</span>
            <span class="text-slate-500 font-mono">{{ sc.count }}x</span>
          </div>
        </div>
      </section>
    </div>

    <!-- ═══ Recent Errors ═══ -->
    <section v-if="recentErrors.length" class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
      <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-4">Recent Errors</div>
      <div class="space-y-2">
        <div
          v-for="e in recentErrors"
          :key="e.id"
          class="bg-red-950/10 border border-red-900/20 rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono text-red-400 font-bold">{{ e.statusCode ?? 'ERR' }}</span>
              <span class="text-xs font-mono text-slate-400">{{ e.model?.replace('models/', '') ?? 'unknown' }}</span>
              <span class="text-[10px] text-slate-600 font-mono">{{ new Date(e.timestamp).toLocaleTimeString() }}</span>
            </div>
            <div class="text-[11px] text-red-400/70 font-mono truncate">{{ e.error ?? 'No error message' }}</div>
          </div>
          <span v-if="e.duration" class="text-[10px] text-slate-600 font-mono shrink-0 ml-3">
            {{ formatDuration(e.duration) }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
