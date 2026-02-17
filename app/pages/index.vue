<script setup lang="ts">
import type { AccountRecord, SuitemakerCreds } from "~~/shared/types";

// ── Types ───────────────────────────────────────────────────────────────
interface HealthStatus {
  status: string;
  browser_ready: boolean;
  current_model: string | null;
  accounts: number | { total: number; available: number; rate_limited: number };
  queue_length?: number;
  is_processing?: boolean;
  queue?: { length: number; is_processing: boolean };
  auth_enabled?: boolean;
  uptime_seconds?: number;
}

interface QueueStatus {
  queue_length: number;
  is_processing: boolean;
  browser_ready: boolean;
  current_model: string | null;
}

// ── Setup ───────────────────────────────────────────────────────────────
const url = useRequestURL();
const proxyOrigin = computed(() => `${url.protocol}//${url.host}`);
const apiEndpoint = computed(() => `${proxyOrigin.value}/api/v1`);
const installUrl = '/api/script/install.user.js';
const extensionUrl = '/api/extension/install';

// ── Data Fetching ───────────────────────────────────────────────────────
const { data: accounts, refresh } = await useFetch<AccountRecord[]>('/api/accounts');

// ── Live Status Polling ─────────────────────────────────────────────────
const health = ref<HealthStatus | null>(null);
const queue = ref<QueueStatus | null>(null);
const statusError = ref(false);

async function pollStatus() {
  try {
    const [h, q] = await Promise.all([
      $fetch<HealthStatus>('/api/health'),
      $fetch<QueueStatus>('/api/v1/queue'),
    ]);
    health.value = h;
    queue.value = q;
    statusError.value = false;
  } catch {
    statusError.value = true;
  }
}

// ── SSE + Polling ───────────────────────────────────────────────────────
let statusInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // SSE for account changes
  const sse = new EventSource('/api/accounts/events');
  sse.onmessage = () => refresh();
  sse.addEventListener('update', () => refresh());
  sse.onerror = () => console.log("SSE reconnecting...");

  // Poll status every 3s
  pollStatus();
  statusInterval = setInterval(pollStatus, 3000);

  onUnmounted(() => {
    sse.close();
    if (statusInterval) clearInterval(statusInterval);
  });
});

// ── Actions ─────────────────────────────────────────────────────────────
async function deleteAccount(id: string) {
  if (!confirm(`Disconnect ${id}?`)) return;
  await $fetch(`/api/accounts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  refresh();
}

const manualEmail = ref('');
const manualCookie = ref('');
const isSubmitting = ref(false);

async function handleManualSubmit() {
  if (!manualCookie.value || !manualEmail.value) return alert("Please fill in both fields.");
  isSubmitting.value = true;
  try {
    await $fetch('/api/manual-link', {
      method: 'POST',
      body: { email: manualEmail.value, cookie: manualCookie.value }
    });
    manualCookie.value = "";
    manualEmail.value = "";
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    alert("Failed: " + (err.data?.message || err.message));
  } finally {
    isSubmitting.value = false;
  }
}

// ── Clipboard ───────────────────────────────────────────────────────────
const copied = ref(false);

async function copyEndpoint() {
  try {
    await navigator.clipboard.writeText(apiEndpoint.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = apiEndpoint.value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────
const isLimited = (ts: number) => ts > Date.now();

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function parseCreds(credsStr: string): { status: string; color: string; msg: string; cookieCount: number } {
  try {
    const creds = JSON.parse(credsStr) as SuitemakerCreds;
    const cookieCount = creds.cookie ? creds.cookie.split(';').length : 0;
    if (!creds.cookie.includes('SSID')) {
      return { status: 'Invalid', color: 'text-red-400', msg: 'Missing SSID', cookieCount };
    }
    const hasHttpOnly = creds.cookie.includes('HSID') && creds.cookie.includes('NID');
    return {
      status: hasHttpOnly ? 'Complete' : 'Partial',
      color: hasHttpOnly ? 'text-emerald-400' : 'text-amber-400',
      msg: `AuthUser ${creds.authUser || '0'}`,
      cookieCount,
    };
  } catch {
    return { status: 'Corrupt', color: 'text-red-400', msg: 'Parse Error', cookieCount: 0 };
  }
}

const systemStatus = computed(() => {
  if (statusError.value) return { label: 'OFFLINE', color: 'text-red-500', dot: 'bg-red-500' };
  if (!health.value) return { label: 'LOADING', color: 'text-slate-500', dot: 'bg-slate-500' };
  const acctCount = typeof health.value.accounts === 'object'
    ? health.value.accounts.total
    : health.value.accounts;
  if (!acctCount) return { label: 'NO ACCOUNTS', color: 'text-amber-500', dot: 'bg-amber-500' };
  if (health.value.browser_ready) return { label: 'READY', color: 'text-emerald-500', dot: 'bg-emerald-500' };
  return { label: 'STANDBY', color: 'text-blue-400', dot: 'bg-blue-400' };
});

const activeAccounts = computed(() =>
  accounts.value?.filter(acc => !isLimited(acc.limited_until)) ?? []
);
const limitedAccounts = computed(() =>
  accounts.value?.filter(acc => isLimited(acc.limited_until)) ?? []
);
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
    <div class="max-w-3xl mx-auto p-4 md:p-8">

      <!-- ═══ Header ═══ -->
      <header class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-white italic tracking-tighter">
            SUITE<span class="text-blue-500">PROXY</span>
          </h1>
          <p class="text-slate-600 text-[10px] mt-0.5 font-mono uppercase tracking-[0.2em]">
            AI Studio Proxy &middot; v3
          </p>
        </div>
        <div class="text-right">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Status</div>
          <div :class="systemStatus.color" class="text-xs font-black flex items-center justify-end gap-1.5">
            <span :class="systemStatus.dot" class="w-2 h-2 rounded-full animate-pulse" />
            {{ systemStatus.label }}
          </div>
        </div>
      </header>

      <!-- ═══ Live Status Bar ═══ -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div class="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-center">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Browser</div>
          <div class="text-lg font-black" :class="health?.browser_ready ? 'text-emerald-400' : 'text-slate-600'">
            {{ health?.browser_ready ? 'Active' : 'Idle' }}
          </div>
        </div>
        <div class="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-center">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Queue</div>
          <div class="text-lg font-black" :class="(queue?.queue_length ?? 0) > 0 ? 'text-amber-400' : 'text-slate-400'">
            {{ queue?.queue_length ?? 0 }}
            <span v-if="queue?.is_processing" class="text-[10px] text-blue-400 font-normal ml-1">processing</span>
          </div>
        </div>
        <div class="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-center">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Accounts</div>
          <div class="text-lg font-black text-slate-300">
            {{ activeAccounts.length }}<span class="text-slate-600 text-sm">/{{ accounts?.length ?? 0 }}</span>
          </div>
        </div>
        <div class="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-center">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Model</div>
          <div class="text-sm font-bold truncate" :class="queue?.current_model ? 'text-blue-400' : 'text-slate-600'">
            {{ queue?.current_model || 'None' }}
          </div>
        </div>
      </div>

      <!-- ═══ API Endpoint ═══ -->
      <section class="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 mb-8">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em]">API Endpoint</div>
          <button
            @click="copyEndpoint"
            class="text-[11px] font-bold px-3 py-1 rounded-lg transition-all"
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
          <div class="mt-2 font-mono text-[11px] text-slate-500 bg-slate-950 rounded-xl px-4 py-3 border border-slate-800/50 whitespace-pre overflow-x-auto">curl {{ apiEndpoint }}/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.5-flash","messages":[{"role":"user","content":"hi"}]}'</div>
        </details>
      </section>

      <!-- ═══ Connect Account ═══ -->
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-lg font-bold text-white mb-1.5">Connect Account</h2>
          <p class="text-slate-500 mb-5 text-sm leading-relaxed">
            Browser extension captures HttpOnly cookies automatically.
            Works on Chrome, Edge, and Firefox.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <a
              :href="extensionUrl"
              class="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-xl font-black text-white shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm w-full sm:w-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              Setup Extension
            </a>

            <a
              href="https://aistudio.google.com/prompts/new_chat"
              target="_blank"
              class="inline-flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 px-6 py-3.5 rounded-xl font-bold text-slate-300 transition-all border border-slate-700 text-sm w-full sm:w-auto"
            >
              Open AI Studio
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
            </a>
          </div>

          <!-- Alternatives -->
          <details class="mt-5 pt-5 border-t border-slate-800/50 group">
            <summary class="list-none cursor-pointer flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-widest hover:text-slate-500 transition-colors">
              <span class="group-open:rotate-90 transition-transform text-[8px]">&#9654;</span>
              Other methods
            </summary>
            <div class="mt-3 flex flex-wrap gap-3">
              <a
                :href="installUrl"
                target="_blank"
                class="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg font-bold text-slate-400 text-[11px] transition-all border border-slate-700"
              >
                Tampermonkey Script
              </a>
              <button
                @click="manualEmail = ''; manualCookie = ''"
                onclick="document.getElementById('manualSection')?.removeAttribute('hidden')"
                class="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg font-bold text-slate-400 text-[11px] transition-all border border-slate-700"
              >
                Manual Cookie Paste
              </button>
            </div>
          </details>
        </div>
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px]" />
      </section>

      <!-- ═══ Manual Link (hidden by default) ═══ -->
      <section id="manualSection" hidden class="mb-6">
        <div class="p-5 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <div class="flex items-center justify-between mb-3">
            <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Manual Cookie Paste</div>
            <button
              onclick="document.getElementById('manualSection')?.setAttribute('hidden', '')"
              class="text-slate-600 hover:text-slate-400 text-xs"
            >
              Close
            </button>
          </div>
          <div class="space-y-2.5">
            <input
              v-model="manualEmail"
              type="email"
              placeholder="Email address"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-slate-200 placeholder:text-slate-700"
            >
            <textarea
              v-model="manualCookie"
              rows="2"
              placeholder="Paste full Cookie header string..."
              class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono focus:border-blue-500 outline-none text-slate-300 placeholder:text-slate-700"
            />
            <button
              @click="handleManualSubmit"
              :disabled="isSubmitting"
              class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg w-full text-xs uppercase tracking-wide transition-all disabled:opacity-50"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Credentials' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ═══ Account Pool ═══ -->
      <section class="mb-8">
        <div class="flex justify-between items-end px-1 mb-3">
          <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
            Account Pool
          </h3>
          <span class="text-[10px] font-mono text-slate-700">
            {{ activeAccounts.length }} active<span v-if="limitedAccounts.length" class="text-amber-600"> &middot; {{ limitedAccounts.length }} limited</span>
          </span>
        </div>

        <!-- Account Cards -->
        <div v-if="accounts?.length" class="space-y-2.5">
          <div
            v-for="acc in accounts"
            :key="acc.id"
            class="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex justify-between items-center group hover:border-slate-700 transition-all"
          >
            <div class="flex-1 min-w-0">
              <!-- Top row: email + status -->
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono font-bold text-sm truncate" :class="isLimited(acc.limited_until) ? 'text-slate-500' : 'text-blue-400'">
                  {{ acc.id }}
                </span>
                <span
                  class="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md"
                  :class="isLimited(acc.limited_until)
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'"
                >
                  {{ isLimited(acc.limited_until) ? 'LIMITED' : 'READY' }}
                </span>
              </div>
              <!-- Bottom row: details -->
              <div class="flex items-center gap-3 text-[10px] text-slate-600">
                <span class="font-mono">Synced {{ timeAgo(acc.last_sync) }}</span>
                <span class="text-slate-800">&middot;</span>
                <span :class="parseCreds(acc.creds).color" class="font-bold">
                  {{ parseCreds(acc.creds).msg }}
                </span>
                <span class="text-slate-800">&middot;</span>
                <span class="font-mono">{{ parseCreds(acc.creds).cookieCount }} cookies</span>
              </div>
            </div>

            <button
              @click="deleteAccount(acc.id)"
              class="ml-3 shrink-0 text-slate-700 hover:text-red-400 w-8 h-8 rounded-lg transition-all flex items-center justify-center hover:bg-red-500/10"
              title="Disconnect"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 border border-dashed border-slate-800/60 rounded-2xl">
          <div class="text-3xl mb-3 opacity-20">&#128274;</div>
          <p class="text-slate-600 text-sm font-medium">No accounts linked</p>
          <p class="text-slate-700 text-xs mt-1">Use the extension above to sync your AI Studio session.</p>
        </div>
      </section>

      <!-- ═══ Footer ═══ -->
      <footer class="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between gap-2 text-[10px] text-slate-700 font-mono">
        <div>
          ENDPOINT <span class="text-slate-500">{{ apiEndpoint }}/chat/completions</span>
        </div>
        <div class="uppercase tracking-widest">
          SuiteProxy v3 &middot; Browser Automation
        </div>
      </footer>
    </div>
  </div>
</template>
