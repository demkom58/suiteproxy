<script setup lang="ts">
import bridgeRaw from '~/utils/bridge.raw.js?raw';
import type { AccountRecord } from "~~/shared/types";

// 1. Setup Origins and Bookmarklet
const url = useRequestURL();
const proxyOrigin = computed(() => `${url.protocol}//${url.host}`);

const bookmarkletCode = computed(() => {
  // Inject proxy origin into the JS file and minify whitespace
  const processed = bridgeRaw
    .replace(/{{ORIGIN}}/g, proxyOrigin.value)
    .replace(/\s+/g, ' '); 
    
  return `javascript:${processed}`;
});

// 2. Data Fetching
const { data: accounts, refresh } = await useFetch<AccountRecord[]>('/api/accounts');

// 3. Real-time SSE Updates
onMounted(() => {
  const sse = new EventSource('/api/accounts/events');
  
  sse.onmessage = (e) => {
    // This catches generic messages
    refresh();
  };

  sse.addEventListener('update', () => {
    // This catches our specific 'update' event
    refresh();
  });

  // If the server restarts, SSE will auto-reconnect
  sse.onerror = () => {
    console.log("SSE Connection lost. Reconnecting...");
  };

  onUnmounted(() => sse.close());
});

// 4. Actions
async function deleteAccount(id: string) {
  // Encode ID to handle @ symbols safely in URL
  await globalThis.$fetch(`/api/accounts/${encodeURIComponent(id)}`, { 
    method: 'DELETE' 
  });
  // Note: We don't need to manually refresh() because the server 
  // will emit an SSE 'update' event when the deletion is done.
}

function handleBookmarkClick() {
  alert("🛑 STOP! Don't click me.\n\nDrag this button to your Bookmarks Bar (Ctrl+Shift+B).\nThen go to AI Studio and click the bookmark there.");
}

// 5. Helpers
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString();
const isLimited = (ts: number) => ts > Date.now();
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
    <div class="max-w-2xl mx-auto">
      
      <!-- Header -->
      <header class="mb-12 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-black text-white italic tracking-tighter">
            SUITE<span class="text-blue-500">PROXY</span>
          </h1>
          <p class="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">
            Gemini Auth Bridge v2
          </p>
        </div>
        <div class="hidden md:block text-right">
          <div class="text-[10px] text-slate-600 font-bold uppercase">System Status</div>
          <div class="text-emerald-500 text-xs font-black">● OPERATIONAL</div>
        </div>
      </header>

      <!-- Setup Section -->
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-xl font-bold text-white mb-2">Connect Google Account</h2>
          <p class="text-slate-400 mb-8 text-sm leading-relaxed">
            Drag the button below to your browser's <span class="text-blue-400 font-bold">Bookmarks Bar</span>. 
            Navigate to <a href="https://aistudio.google.com" target="_blank" class="underline hover:text-white">AI Studio</a> 
            and click the bookmark to link your session.
          </p>
          
          <a 
            :href="bookmarkletCode" 
            @click.prevent="handleBookmarkClick"
            class="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-move group"
          >
             <span class="text-2xl group-hover:rotate-12 transition-transform">🚀</span>
             SYNC TO PROXY
          </a>
        </div>
        <!-- Decorative Glow -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
      </section>

      <!-- Account Pool Section -->
      <section class="space-y-4">
        <div class="flex justify-between items-end px-2 mb-2">
          <h3 class="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
            Active Account Pool
          </h3>
          <span class="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded">
            COUNT: {{ accounts?.length || 0 }}
          </span>
        </div>

        <div v-if="accounts?.length" class="grid gap-3">
          <div 
            v-for="acc in accounts" 
            :key="acc.id" 
            class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-slate-700 transition-all hover:bg-slate-900/60"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-blue-400 text-sm md:text-base">{{ acc.id }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                  Sync: {{ formatTime(acc.last_sync) }}
                </span>
                <span 
                  :class="isLimited(acc.limited_until) ? 'text-orange-500' : 'text-emerald-500'" 
                  class="text-[10px] font-black uppercase flex items-center gap-1"
                >
                  <span class="text-[8px]">●</span> {{ isLimited(acc.limited_until) ? 'Rate Limited' : 'Ready' }}
                </span>
              </div>
            </div>
            
            <button 
              @click="deleteAccount(acc.id)" 
              class="bg-slate-800 text-slate-500 hover:bg-red-500/10 hover:text-red-500 w-10 h-10 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-red-500/50"
              title="Disconnect Account"
            >
              <span class="text-lg">✕</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 border-2 border-dashed border-slate-900 rounded-3xl">
          <p class="text-slate-600 italic text-sm">No accounts found. Use the sync tool above to start.</p>
        </div>
      </section>

      <!-- Footer / Info -->
      <footer class="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between gap-4">
        <div class="text-[10px] text-slate-700 font-mono">
          API ENDPOINT: <span class="text-slate-500">{{ proxyOrigin }}/v1</span>
        </div>
        <div class="text-[10px] text-slate-700 font-mono uppercase tracking-widest">
          Heartbeat interval: 25m
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
/* Custom drag cursor for the bookmarklet */
.cursor-move {
  cursor: move; /* Fallback */
  cursor: grab;
}
.cursor-move:active {
  cursor: grabbing;
}
</style>