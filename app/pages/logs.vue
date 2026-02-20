<script setup lang="ts">
/**
 * Logs — Real-time API request log viewer.
 *
 * Streams entries via SSE from /api/logs/events and loads initial batch from /api/logs.
 * Supports filtering by status, model, and features.
 */
useHead({ title: 'Request Logs — SuiteProxy' });

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

// ── State ───────────────────────────────────────────────────────────────

const logs = ref<LogEntry[]>([]);
const connected = ref(false);
const autoScroll = ref(true);
const filterStatus = ref<string>('all');
const filterModel = ref('');
const expandedId = ref<string | null>(null);

// ── Load initial logs + connect SSE ─────────────────────────────────────

const { data: initialLogs } = await useFetch<LogEntry[]>('/api/logs');
if (initialLogs.value) {
  logs.value = [...initialLogs.value].reverse(); // newest first
}

let sse: EventSource | null = null;

onMounted(() => {
  sse = new EventSource('/api/logs/events');

  sse.addEventListener('new', (e) => {
    const entry: LogEntry = JSON.parse(e.data);
    logs.value.unshift(entry); // prepend (newest first)
    // Cap at 500 entries in the UI
    if (logs.value.length > 500) logs.value.pop();
  });

  sse.addEventListener('update', (e) => {
    const updated: LogEntry = JSON.parse(e.data);
    const idx = logs.value.findIndex(l => l.id === updated.id);
    if (idx !== -1) {
      logs.value[idx] = updated;
    }
  });

  sse.onopen = () => { connected.value = true; };
  sse.onerror = () => { connected.value = false; };
});

onUnmounted(() => {
  sse?.close();
});

// ── Filtering ───────────────────────────────────────────────────────────

const filteredLogs = computed(() => {
  let result = logs.value;

  if (filterStatus.value !== 'all') {
    result = result.filter(l => l.status === filterStatus.value);
  }

  if (filterModel.value) {
    const q = filterModel.value.toLowerCase();
    result = result.filter(l => l.model?.toLowerCase().includes(q));
  }

  return result;
});

const uniqueModels = computed(() => {
  const models = new Set<string>();
  for (const l of logs.value) {
    if (l.model) models.add(l.model.replace('models/', ''));
  }
  return [...models].sort();
});

// ── Helpers ─────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '--';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-400';
    case 'streaming': return 'text-blue-400';
    case 'pending': return 'text-amber-400';
    case 'error': return 'text-red-400';
    default: return 'text-slate-500';
  }
}

function statusDot(status: string): string {
  switch (status) {
    case 'completed': return 'bg-emerald-500';
    case 'streaming': return 'bg-blue-500 animate-pulse';
    case 'pending': return 'bg-amber-500 animate-pulse';
    case 'error': return 'bg-red-500';
    default: return 'bg-slate-600';
  }
}

function statusCodeColor(code: number | null): string {
  if (code === null) return 'text-slate-600';
  if (code < 300) return 'text-emerald-400';
  if (code < 400) return 'text-amber-400';
  return 'text-red-400';
}

function featureBadgeColor(feature: string): string {
  const colors: Record<string, string> = {
    'stream': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'thinking': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'vision': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'function_calling': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'json_mode': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'json_schema': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'search': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'code_execution': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'url_context': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };
  return colors[feature] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

function clearLogs() {
  logs.value = [];
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">Request Logs</h2>
        <p class="text-slate-600 text-sm mt-1">
          {{ filteredLogs.length }} entries
          <span v-if="filterStatus !== 'all' || filterModel" class="text-slate-700">(filtered)</span>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- SSE Status -->
        <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          <span class="w-1.5 h-1.5 rounded-full" :class="connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'" />
          <span :class="connected ? 'text-emerald-500' : 'text-red-500'">
            {{ connected ? 'LIVE' : 'DISCONNECTED' }}
          </span>
        </div>
        <!-- Clear -->
        <button
          @click="clearLogs"
          class="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- ═══ Filters ═══ -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <!-- Status Filter -->
      <div class="flex items-center bg-slate-900/60 border border-slate-800/50 rounded-xl overflow-hidden">
        <button
          v-for="s in ['all', 'completed', 'streaming', 'pending', 'error']"
          :key="s"
          @click="filterStatus = s"
          class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
          :class="filterStatus === s
            ? 'bg-slate-800 text-white'
            : 'text-slate-600 hover:text-slate-400'"
        >
          {{ s }}
        </button>
      </div>

      <!-- Model Filter -->
      <div class="relative">
        <input
          v-model="filterModel"
          type="text"
          placeholder="Filter by model..."
          class="bg-slate-900/60 border border-slate-800/50 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-700 outline-none focus:border-slate-700 w-48"
        >
        <button
          v-if="filterModel"
          @click="filterModel = ''"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Model Quick Filters -->
      <div v-if="uniqueModels.length > 0 && uniqueModels.length <= 10" class="flex flex-wrap gap-1">
        <button
          v-for="model in uniqueModels"
          :key="model"
          @click="filterModel = filterModel === model ? '' : model"
          class="text-[9px] font-bold px-2 py-1 rounded-lg border transition-all"
          :class="filterModel === model
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            : 'bg-slate-900/40 text-slate-600 border-slate-800/50 hover:text-slate-400 hover:border-slate-700'"
        >
          {{ model }}
        </button>
      </div>
    </div>

    <!-- ═══ Log Table ═══ -->
    <div class="bg-slate-900/30 border border-slate-800/40 rounded-2xl overflow-hidden">
      <!-- Table Header -->
      <div class="grid grid-cols-[80px_50px_36px_1fr_140px_80px_80px_1fr] gap-2 px-4 py-2.5 border-b border-slate-800/40 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
        <span>Time</span>
        <span>Status</span>
        <span>Code</span>
        <span>Model</span>
        <span>Account</span>
        <span class="text-right">Duration</span>
        <span class="text-right">Tokens</span>
        <span>Features</span>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLogs.length === 0" class="text-center py-16">
        <div class="text-3xl opacity-15 mb-2">&#128466;</div>
        <p class="text-slate-700 text-sm">No log entries{{ filterStatus !== 'all' || filterModel ? ' matching filters' : '' }}</p>
        <p class="text-slate-800 text-xs mt-1">Send an API request to see it appear here in real-time</p>
      </div>

      <!-- Log Rows -->
      <div v-else class="divide-y divide-slate-800/30 max-h-[calc(100vh-300px)] overflow-y-auto">
        <template v-for="entry in filteredLogs" :key="entry.id">
          <!-- Row -->
          <div
            @click="toggleExpand(entry.id)"
            class="grid grid-cols-[80px_50px_36px_1fr_140px_80px_80px_1fr] gap-2 px-4 py-2.5 hover:bg-slate-800/20 cursor-pointer transition-colors items-center"
            :class="entry.status === 'error' ? 'bg-red-950/10' : ''"
          >
            <!-- Time -->
            <span class="text-[11px] font-mono text-slate-500">
              {{ formatTime(entry.timestamp) }}
            </span>

            <!-- Status -->
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot(entry.status)" />
              <span class="text-[9px] font-bold uppercase" :class="statusColor(entry.status)">
                {{ entry.status === 'completed' ? 'OK' : entry.status === 'streaming' ? 'LIVE' : entry.status === 'pending' ? 'WAIT' : 'ERR' }}
              </span>
            </div>

            <!-- Status Code -->
            <span class="text-[11px] font-mono font-bold" :class="statusCodeColor(entry.statusCode)">
              {{ entry.statusCode ?? '--' }}
            </span>

            <!-- Model -->
            <span class="text-xs font-mono text-slate-300 truncate">
              {{ entry.model?.replace('models/', '') || '--' }}
            </span>

            <!-- Account -->
            <span class="text-[10px] font-mono text-slate-600 truncate">
              {{ entry.account || '--' }}
            </span>

            <!-- Duration -->
            <span class="text-[11px] font-mono text-right" :class="(entry.duration ?? 0) > 10000 ? 'text-amber-400' : 'text-slate-500'">
              {{ formatDuration(entry.duration) }}
            </span>

            <!-- Tokens -->
            <span class="text-[10px] font-mono text-slate-600 text-right">
              <template v-if="entry.inputTokens || entry.outputTokens">
                {{ entry.inputTokens ?? '?' }}/{{ entry.outputTokens ?? '?' }}
              </template>
              <template v-else>--</template>
            </span>

            <!-- Features -->
            <div class="flex flex-wrap gap-1">
              <span
                v-for="feat in entry.features"
                :key="feat"
                class="text-[8px] font-bold px-1.5 py-0.5 rounded border"
                :class="featureBadgeColor(feat)"
              >
                {{ feat }}
              </span>
              <span
                v-if="entry.stream"
                class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                stream
              </span>
            </div>
          </div>

          <!-- Expanded Detail -->
          <div v-if="expandedId === entry.id" class="px-6 py-4 bg-slate-900/50 border-l-2 border-blue-500/30">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Request ID</div>
                <div class="font-mono text-slate-400 break-all">{{ entry.id }}</div>
              </div>
              <div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Endpoint</div>
                <div class="font-mono text-slate-400">{{ entry.method }} {{ entry.path }}</div>
              </div>
              <div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Timestamp</div>
                <div class="font-mono text-slate-400">{{ new Date(entry.timestamp).toISOString() }}</div>
              </div>
              <div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Account</div>
                <div class="font-mono text-slate-400">{{ entry.account || 'none' }}</div>
              </div>
            </div>
            <!-- Error detail -->
            <div v-if="entry.error" class="mt-3 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
              <div class="text-[9px] text-red-500 font-bold uppercase tracking-wider mb-1">Error</div>
              <div class="text-xs font-mono text-red-400/80 break-all">{{ entry.error }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
