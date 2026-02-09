<script setup lang="ts">
import type { AccountRecord, SuitemakerCreds } from "~~/shared/types";

// 1. Setup
const url = useRequestURL();
const proxyOrigin = computed(() => `${url.protocol}//${url.host}`);
const installUrl = '/api/script/install.user.js';

// 2. Data Fetching
const { data: accounts, refresh } = await useFetch<AccountRecord[]>('/api/accounts');

// 3. Real-time SSE Updates
onMounted(() => {
  const sse = new EventSource('/api/accounts/events');
  sse.onmessage = () => refresh(); // Catch generic messages
  sse.addEventListener('update', () => refresh()); // Catch named events
  
  sse.onerror = () => {
    // Optional: handle reconnection logic or logging
    console.log("SSE Reconnecting...");
  };

  onUnmounted(() => sse.close());
});

// 4. Actions
async function deleteAccount(id: string) {
  if (!confirm(`Disconnect ${id}?`)) return;
  await globalThis.$fetch(`/api/accounts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  // SSE will trigger refresh, but we can do it optimistically too
  refresh();
}

// Manual Link Fallback
const manualEmail = ref('');
const manualCookie = ref('');
const isSubmitting = ref(false);

async function handleManualSubmit() {
  if (!manualCookie.value || !manualEmail.value) return alert("Please fill in both fields.");
  isSubmitting.value = true;
  try {
    await $fetch(`/api/manual-link`, {
      method: 'POST',
      body: { email: manualEmail.value, cookie: manualCookie.value }
    });
    alert("✅ Account linked successfully!");
    manualCookie.value = "";
    manualEmail.value = "";
  } catch (e: any) {
    alert("❌ Failed: " + (e.data?.message || e.message));
  } finally {
    isSubmitting.value = false;
  }
}

// 5. Helpers
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString();
const isLimited = (ts: number) => ts > Date.now();

// Parse the JSON creds string to check for specific cookies/fields
const getAccountStatus = (credsStr: string) => {
    try {
        const creds = JSON.parse(credsStr) as SuitemakerCreds;
        if (!creds.cookie.includes('SSID')) return { status: 'Invalid', color: 'text-red-500', msg: 'Missing SSID' };
        return { status: 'Active', color: 'text-blue-400', msg: `AuthUser: ${creds.authUser}` };
    } catch(e) {
        return { status: 'Corrupt', color: 'text-red-500', msg: 'Data Error' };
    }
};
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

      <!-- Primary Setup Section (Userscript) -->
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-xl font-bold text-white mb-2">Connect Account</h2>
          <p class="text-slate-400 mb-6 text-sm leading-relaxed">
            Install the <b>SuiteProxy Bridge</b> Userscript. It automatically detects your 
            AI Studio session and syncs the required HttpOnly cookies to this server.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4">
             <a 
               :href="installUrl" 
               target="_blank"
               class="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-black text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95 group w-full sm:w-auto"
             >
                <span class="text-xl group-hover:-rotate-12 transition-transform">🐵</span>
                INSTALL SCRIPT
             </a>
             
             <a 
               href="https://aistudio.google.com/prompts/new_chat" 
               target="_blank"
               class="inline-flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-xl font-bold text-slate-200 transition-all border border-slate-700 w-full sm:w-auto"
             >
                OPEN AI STUDIO ↗
             </a>
          </div>
          
          <div class="mt-6 pt-6 border-t border-slate-800/50 flex flex-col gap-2 text-xs text-slate-500 font-mono">
            <div class="flex items-center gap-2">
                <span class="bg-slate-800 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold">1</span>
                <span>Install <a href="https://www.tampermonkey.net/" target="_blank" class="underline hover:text-blue-400">Tampermonkey</a> extension.</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="bg-slate-800 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold">2</span>
                <span>Click <b>INSTALL SCRIPT</b> above.</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="bg-slate-800 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
                <span>Refresh AI Studio. Click the blue <b>⚡ SYNC</b> button in the corner.</span>
            </div>
          </div>
        </div>
        <!-- Decorative Glow -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
      </section>

      <!-- Manual Fallback Section -->
      <section class="mb-10">
        <details class="group">
            <summary class="list-none cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors">
                <span class="group-open:rotate-90 transition-transform">▶</span>
                <span>Advanced: Manual Link</span>
            </summary>
            <div class="mt-4 p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <p class="text-slate-400 mb-4 text-xs">
                    If the script fails, paste the full <code>Cookie</code> header from your browser network tab here.
                </p>
                <div class="space-y-3">
                    <input v-model="manualEmail" type="email" placeholder="Email Address" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-blue-500 outline-none text-slate-200 placeholder:text-slate-700 transition-colors">
                    <textarea v-model="manualCookie" rows="2" placeholder="Paste full Cookie string here..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono focus:border-blue-500 outline-none text-slate-300 placeholder:text-slate-700 transition-colors"></textarea>
                    <button @click="handleManualSubmit" :disabled="isSubmitting" class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg w-full text-xs uppercase tracking-wide transition-all disabled:opacity-50">
                        {{ isSubmitting ? 'Verifying...' : 'Save Credentials' }}
                    </button>
                </div>
            </div>
        </details>
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
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-blue-400 text-sm md:text-base">{{ acc.id }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                  {{ formatTime(acc.last_sync) }}
                </span>
                
                <!-- Status Badge -->
                <span 
                  :class="isLimited(acc.limited_until) ? 'text-orange-500' : 'text-emerald-500'" 
                  class="text-[10px] font-black uppercase flex items-center gap-1"
                >
                  <span class="text-[8px]">●</span> {{ isLimited(acc.limited_until) ? 'Rate Limited' : 'Ready' }}
                </span>

                <!-- Credential Health -->
                <span 
                  :class="getAccountStatus(acc.creds).color"
                  class="text-[10px] font-bold uppercase tracking-tighter opacity-75"
                >
                   {{ getAccountStatus(acc.creds).msg }}
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
          <div class="text-4xl mb-4 grayscale opacity-20">📭</div>
          <p class="text-slate-600 italic text-sm">No accounts linked yet.</p>
          <p class="text-slate-700 text-xs mt-2">Use the tool above to add one.</p>
        </div>
      </section>

      <!-- Footer -->
      <footer class="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between gap-4 opacity-50 hover:opacity-100 transition-opacity">
        <div class="text-[10px] text-slate-700 font-mono">
          ENDPOINT: <span class="text-slate-500">{{ proxyOrigin }}/v1</span>
        </div>
        <div class="text-[10px] text-slate-700 font-mono uppercase tracking-widest">
           v2.1 • Tampermonkey Edition
        </div>
      </footer>
    </div>
  </div>
</template>