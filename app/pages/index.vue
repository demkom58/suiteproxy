<script setup lang="ts">
useHead({ title: 'Dashboard — SuiteProxy' });

const { health, queue, stats, uptime, isOnline } = useProxyStatus();

const url = useRequestURL();
const apiEndpoint = computed(() => `${url.protocol}//${url.host}/api/v1`);

const copied = ref(false);
async function copyEndpoint() {
  try {
    await navigator.clipboard.writeText(apiEndpoint.value);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = apiEndpoint.value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

const topModels = computed(() => {
  if (!stats.value?.modelCounts) return [];
  return Object.entries(stats.value.modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([model, count]) => ({ model: model.replace('models/', ''), count }));
});

const errorRate = computed(() => {
  if (!stats.value || stats.value.totalRequests === 0) return '0';
  return ((stats.value.errorCount / stats.value.totalRequests) * 100).toFixed(1);
});

const successRate = computed(() => {
  if (!stats.value || stats.value.totalRequests === 0) return '100';
  return ((stats.value.successCount / stats.value.totalRequests) * 100).toFixed(1);
});
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-black text-white tracking-tight">Dashboard</h2>
      <p class="text-slate-600 text-sm mt-1">System overview and live metrics</p>
    </div>

    <!-- ═══ Metrics Grid ═══ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <!-- Browser -->
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Browser</div>
        <div class="text-2xl font-black" :class="health?.browser_ready ? 'text-emerald-400' : 'text-slate-600'">
          {{ health?.browser_ready ? 'Active' : 'Idle' }}
        </div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">
          {{ queue?.current_model?.replace('models/', '') || 'no model loaded' }}
        </div>
      </div>

      <!-- Pool -->
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Pool</div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black" :class="(queue?.pool?.busy_slots ?? 0) > 0 ? 'text-blue-400' : 'text-slate-400'">
            {{ queue?.pool?.busy_slots ?? 0 }}/{{ queue?.pool?.max_size ?? 3 }}
          </span>
          <span v-if="(queue?.pool?.cached_conversations ?? 0) > 0" class="text-[10px] text-violet-400 font-bold">{{ queue?.pool?.cached_conversations }} cached</span>
          <span v-if="(queue?.pool?.waiting_requests ?? 0) > 0" class="text-[10px] text-amber-400 font-bold animate-pulse">{{ queue?.pool?.waiting_requests }} waiting</span>
        </div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">concurrent pages</div>
      </div>

      <!-- Accounts -->
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Accounts</div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-black text-emerald-400">{{ health?.accounts?.available ?? 0 }}</span>
          <span class="text-sm text-slate-600 font-bold">/</span>
          <span class="text-sm text-slate-500 font-bold">{{ health?.accounts?.total ?? 0 }}</span>
        </div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">
          <span v-if="health?.accounts?.rate_limited" class="text-amber-600">{{ health.accounts.rate_limited }} rate limited</span>
          <span v-else>all available</span>
        </div>
      </div>

      <!-- Uptime -->
      <div class="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2">Uptime</div>
        <div class="text-2xl font-black text-slate-300">{{ uptime }}</div>
        <div class="text-[10px] text-slate-700 mt-1 font-mono">
          {{ isOnline ? 'server online' : 'connection lost' }}
        </div>
      </div>
    </div>

    <!-- ═══ Request Stats Row ═══ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <div class="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Total Requests</div>
        <div class="text-xl font-black text-white">{{ stats?.totalRequests ?? 0 }}</div>
      </div>
      <div class="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Success Rate</div>
        <div class="text-xl font-black" :class="parseFloat(successRate) >= 95 ? 'text-emerald-400' : parseFloat(successRate) >= 80 ? 'text-amber-400' : 'text-red-400'">
          {{ successRate }}%
        </div>
      </div>
      <div class="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Avg Latency</div>
        <div class="text-xl font-black text-slate-300">
          {{ stats?.avgDuration ? (stats.avgDuration / 1000).toFixed(1) + 's' : '--' }}
        </div>
      </div>
      <div class="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Req/min</div>
        <div class="text-xl font-black text-blue-400">{{ stats?.requestsPerMinute ?? 0 }}</div>
      </div>
    </div>

    <!-- ═══ Two Column Layout ═══ -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- API Endpoint -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em]">API Endpoint</div>
          <button
            @click="copyEndpoint"
            class="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
            :class="copied
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600'"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="font-mono text-sm text-blue-400 bg-slate-950 rounded-xl px-4 py-3 border border-slate-800/50 select-all break-all">
          {{ apiEndpoint }}
        </div>
        <details class="mt-3 group">
          <summary class="list-none cursor-pointer text-[10px] font-bold text-slate-700 uppercase tracking-widest hover:text-slate-500 transition-colors flex items-center gap-1.5">
            <span class="group-open:rotate-90 transition-transform text-[8px]">&#9654;</span>
            Quick test
          </summary>
          <div class="mt-2 font-mono text-[10px] text-slate-500 bg-slate-950 rounded-xl px-4 py-3 border border-slate-800/50 whitespace-pre overflow-x-auto leading-relaxed">curl {{ apiEndpoint }}/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.5-flash","messages":[{"role":"user","content":"hi"}]}'</div>
        </details>
      </section>

      <!-- Top Models -->
      <section class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-3">Top Models</div>
        <div v-if="topModels.length" class="space-y-2">
          <div v-for="m in topModels" :key="m.model" class="flex items-center justify-between">
            <span class="text-sm font-mono text-slate-300 truncate">{{ m.model }}</span>
            <div class="flex items-center gap-2">
              <div class="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500/60 rounded-full"
                  :style="{ width: `${Math.min((m.count / (topModels[0]?.count || 1)) * 100, 100)}%` }"
                />
              </div>
              <span class="text-[10px] text-slate-600 font-mono w-8 text-right">{{ m.count }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6">
          <p class="text-slate-700 text-sm">No requests yet</p>
        </div>
      </section>
    </div>

    <!-- ═══ Quick Links ═══ -->
    <div class="mt-8 flex flex-wrap gap-3">
      <NuxtLink to="/accounts" class="inline-flex items-center gap-2 bg-slate-900/40 border border-slate-800/50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Connect Account
      </NuxtLink>
      <NuxtLink to="/logs" class="inline-flex items-center gap-2 bg-slate-900/40 border border-slate-800/50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
        View Logs
      </NuxtLink>
      <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" class="inline-flex items-center gap-2 bg-slate-900/40 border border-slate-800/50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
        Open AI Studio
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
      </a>
    </div>
  </div>
</template>
