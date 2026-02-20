<script setup lang="ts">
import type { AccountRecord, SuitemakerCreds, FingerprintConfig, ProxyConfig, ProxyEntry, FingerprintOS, ProxyProtocol } from '~~/shared/types';

useHead({ title: 'Accounts — SuiteProxy' });

const { data: accounts, refresh } = await useFetch<AccountRecord[]>('/api/accounts');

// SSE for live account changes
onMounted(() => {
  const sse = new EventSource('/api/accounts/events');
  sse.onmessage = () => refresh();
  sse.addEventListener('update', () => refresh());
  sse.onerror = () => console.log('SSE reconnecting...');
  onUnmounted(() => sse.close());
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
const showManual = ref(false);

async function handleManualSubmit() {
  if (!manualCookie.value || !manualEmail.value) return alert('Please fill in both fields.');
  isSubmitting.value = true;
  try {
    await $fetch('/api/manual-link', {
      method: 'POST',
      body: { email: manualEmail.value, cookie: manualCookie.value },
    });
    manualCookie.value = '';
    manualEmail.value = '';
    showManual.value = false;
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    alert('Failed: ' + (err.data?.message || err.message));
  } finally {
    isSubmitting.value = false;
  }
}

// ── Config Panel State ──────────────────────────────────────────────────
const expandedId = ref<string | null>(null);
const saving = ref<string | null>(null);

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

// ── Fingerprint editing ─────────────────────────────────────────────────
function getFingerprint(acc: AccountRecord): FingerprintConfig {
  if (!acc.fingerprint) return {};
  try { return JSON.parse(acc.fingerprint) as FingerprintConfig; }
  catch { return {}; }
}

function getProxy(acc: AccountRecord): ProxyConfig {
  if (!acc.proxy) return { enabled: false, chain: [] };
  try { return JSON.parse(acc.proxy) as ProxyConfig; }
  catch { return { enabled: false, chain: [] }; }
}

// Reactive edit state per account
const fpEdits = ref<Record<string, FingerprintConfig>>({});
const proxyEdits = ref<Record<string, ProxyConfig>>({});

function initEdits(acc: AccountRecord) {
  if (!fpEdits.value[acc.id]) fpEdits.value[acc.id] = { ...getFingerprint(acc) };
  if (!proxyEdits.value[acc.id]) proxyEdits.value[acc.id] = { ...getProxy(acc), chain: [...getProxy(acc).chain] };
}

function getFpEdit(id: string): FingerprintConfig {
  return fpEdits.value[id] ?? {};
}

function getProxyEdit(id: string): ProxyConfig {
  return proxyEdits.value[id] ?? { enabled: false, chain: [] };
}

function addProxyEntry(id: string) {
  const p = getProxyEdit(id);
  if (!p.chain) p.chain = [];
  p.chain.push({ protocol: 'http', host: '', port: 8080 });
}

function removeProxyEntry(id: string, idx: number) {
  const p = getProxyEdit(id);
  p.chain.splice(idx, 1);
}

const lastSaveRestarted = ref<string | null>(null);

async function saveConfig(acc: AccountRecord) {
  saving.value = acc.id;
  lastSaveRestarted.value = null;
  try {
    const fp = fpEdits.value[acc.id];
    const px = proxyEdits.value[acc.id];
    // Clean: remove empty fingerprint
    const cleanFp = fp && Object.keys(fp).some(k => (fp as Record<string, unknown>)[k] != null && (fp as Record<string, unknown>)[k] !== '' && (fp as Record<string, unknown>)[k] !== 0) ? fp : null;
    // Clean: disable proxy if no chain entries
    const cleanProxy = px?.enabled && px.chain?.length ? px : px?.chain?.length ? px : null;

    const result = await $fetch<{ success: boolean; browserRestarted: boolean }>(`/api/accounts/${encodeURIComponent(acc.id)}`, {
      method: 'PATCH',
      body: { fingerprint: cleanFp, proxy: cleanProxy },
    });
    if (result.browserRestarted) {
      lastSaveRestarted.value = acc.id;
    }
    refresh();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    alert('Save failed: ' + (err.data?.message || err.message));
  } finally {
    saving.value = null;
  }
}

const restarting = ref(false);

async function restartBrowser() {
  restarting.value = true;
  try {
    await $fetch('/api/browser/restart', { method: 'POST' });
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string };
    alert('Restart failed: ' + (err.data?.statusMessage || err.message));
  } finally {
    restarting.value = false;
  }
}

async function resetConfig(acc: AccountRecord) {
  saving.value = acc.id;
  try {
    await $fetch(`/api/accounts/${encodeURIComponent(acc.id)}`, {
      method: 'PATCH',
      body: { fingerprint: null, proxy: null },
    });
    delete fpEdits.value[acc.id];
    delete proxyEdits.value[acc.id];
    refresh();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    alert('Reset failed: ' + (err.data?.message || err.message));
  } finally {
    saving.value = null;
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
  return `${Math.floor(hours / 24)}d ago`;
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

function hasConfig(acc: AccountRecord): boolean {
  return !!(acc.fingerprint || acc.proxy);
}

const activeAccounts = computed(() => accounts.value?.filter(acc => !isLimited(acc.limited_until)) ?? []);
const limitedAccounts = computed(() => accounts.value?.filter(acc => isLimited(acc.limited_until)) ?? []);

const osOptions: FingerprintOS[] = ['windows', 'macos', 'linux'];
const protocolOptions: ProxyProtocol[] = ['http', 'https', 'socks4', 'socks5'];
const rotationOptions = ['none', 'round-robin', 'random'] as const;

const inputClass = 'w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-slate-600 outline-none text-slate-300 placeholder:text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
const selectClass = 'bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-slate-600 outline-none text-slate-300';
const labelClass = 'text-[10px] text-slate-500 font-bold uppercase tracking-wider';
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">Accounts</h2>
        <p class="text-slate-600 text-sm mt-1">
          {{ activeAccounts.length }} active<span v-if="limitedAccounts.length" class="text-amber-600"> &middot; {{ limitedAccounts.length }} rate limited</span>
        </p>
      </div>
    </div>

    <!-- Connect Section -->
    <section class="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div class="relative z-10">
        <h3 class="text-base font-bold text-white mb-1">Connect Account</h3>
        <p class="text-slate-500 mb-4 text-sm">
          Browser extension captures HttpOnly cookies automatically.
        </p>

        <div class="flex flex-wrap gap-3">
          <a
            href="/api/extension/install"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            Setup Extension
          </a>
          <a
            href="https://aistudio.google.com/prompts/new_chat"
            target="_blank"
            class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl font-medium text-slate-300 transition-all border border-slate-700 text-sm"
          >
            Open AI Studio
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
          </a>
          <a
            href="/api/script/install.user.js"
            target="_blank"
            class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl font-medium text-slate-400 transition-all border border-slate-700 text-sm"
          >
            Tampermonkey Script
          </a>
          <button
            @click="showManual = !showManual"
            class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl font-medium text-slate-400 transition-all border border-slate-700 text-sm"
          >
            Manual Paste
          </button>
        </div>
      </div>
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 blur-[100px]" />
    </section>

    <!-- Manual Link -->
    <section v-if="showManual" class="mb-6 p-5 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
      <div class="flex items-center justify-between mb-3">
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Manual Cookie Paste</div>
        <button @click="showManual = false" class="text-slate-600 hover:text-slate-400 text-xs">Close</button>
      </div>
      <div class="space-y-2.5">
        <input
          v-model="manualEmail"
          type="email"
          placeholder="Email address"
          :class="inputClass"
          class="!text-sm !py-2.5"
        >
        <textarea
          v-model="manualCookie"
          rows="3"
          placeholder="Paste full Cookie header string..."
          :class="inputClass"
          class="resize-none"
        />
        <button
          @click="handleManualSubmit"
          :disabled="isSubmitting"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg w-full text-sm transition-all disabled:opacity-50"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Credentials' }}
        </button>
      </div>
    </section>

    <!-- Account List -->
    <div v-if="accounts?.length" class="space-y-2">
      <div
        v-for="acc in accounts"
        :key="acc.id"
        class="bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden transition-all"
        :class="expandedId === acc.id ? 'border-slate-700/60' : 'hover:border-slate-700/60'"
      >
        <!-- Account Header Row -->
        <div class="p-5 flex justify-between items-center group">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5 mb-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :class="isLimited(acc.limited_until) ? 'bg-amber-500' : 'bg-emerald-500'" />
              <span class="font-mono font-bold text-sm truncate" :class="isLimited(acc.limited_until) ? 'text-slate-500' : 'text-white'">
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
              <!-- Config indicator badges -->
              <span v-if="acc.fingerprint" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">FP</span>
              <span v-if="acc.proxy" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">PROXY</span>
            </div>
            <div class="flex items-center gap-3 text-[10px] text-slate-600 ml-4.5">
              <span class="font-mono">Synced {{ timeAgo(acc.last_sync) }}</span>
              <span class="text-slate-800">&middot;</span>
              <span :class="parseCreds(acc.creds).color" class="font-bold">
                {{ parseCreds(acc.creds).status }}
              </span>
              <span class="text-slate-800">&middot;</span>
              <span class="font-mono">{{ parseCreds(acc.creds).msg }}</span>
              <span class="text-slate-800">&middot;</span>
              <span class="font-mono">{{ parseCreds(acc.creds).cookieCount }} cookies</span>
            </div>
          </div>

          <div class="flex items-center gap-1 ml-3 shrink-0">
            <!-- Settings button -->
            <button
              @click="toggleExpand(acc.id); initEdits(acc)"
              class="text-slate-700 hover:text-slate-400 w-9 h-9 rounded-xl transition-all flex items-center justify-center hover:bg-slate-800"
              :class="expandedId === acc.id ? 'text-slate-400 bg-slate-800' : ''"
              title="Configure"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
            <!-- Delete button -->
            <button
              @click="deleteAccount(acc.id)"
              class="text-slate-700 hover:text-red-400 w-9 h-9 rounded-xl transition-all flex items-center justify-center hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
              title="Disconnect"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Expanded Config Panel -->
        <div v-if="expandedId === acc.id" class="border-t border-slate-800/50 bg-slate-950/40 px-5 py-5">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- ═══ Fingerprint Config ═══ -->
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.36 8.775M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm-9.75 3.488A48.09 48.09 0 003.75 21h16.5" /></svg>
                Fingerprint
              </h4>
              <div class="space-y-3">
                <!-- OS -->
                <div>
                  <label :class="labelClass">Operating System</label>
                  <select v-model="getFpEdit(acc.id).os" :class="selectClass" class="w-full mt-1">
                    <option :value="undefined">Auto (random)</option>
                    <option v-for="os in osOptions" :key="os" :value="os">{{ os }}</option>
                  </select>
                </div>
                <!-- Window Size -->
                <div>
                  <label :class="labelClass">Window Size</label>
                  <div class="grid grid-cols-2 gap-2 mt-1">
                    <input
                      type="number"
                      :value="getFpEdit(acc.id).window?.[0] ?? ''"
                      @input="(e) => { const v = +(e.target as HTMLInputElement).value; if (v > 0) { if (!getFpEdit(acc.id).window) getFpEdit(acc.id).window = [1280, 720]; getFpEdit(acc.id).window![0] = v; } else { getFpEdit(acc.id).window = undefined; } }"
                      placeholder="Width"
                      :class="inputClass"
                    >
                    <input
                      type="number"
                      :value="getFpEdit(acc.id).window?.[1] ?? ''"
                      @input="(e) => { const v = +(e.target as HTMLInputElement).value; if (v > 0) { if (!getFpEdit(acc.id).window) getFpEdit(acc.id).window = [1280, 720]; getFpEdit(acc.id).window![1] = v; } else { getFpEdit(acc.id).window = undefined; } }"
                      placeholder="Height"
                      :class="inputClass"
                    >
                  </div>
                </div>
                <!-- WebGL -->
                <div>
                  <label :class="labelClass">WebGL Vendor / Renderer</label>
                  <div class="grid grid-cols-2 gap-2 mt-1">
                    <input
                      :value="getFpEdit(acc.id).webgl?.[0] ?? ''"
                      @input="(e) => { const v = (e.target as HTMLInputElement).value; if (v) { if (!getFpEdit(acc.id).webgl) getFpEdit(acc.id).webgl = ['', '']; getFpEdit(acc.id).webgl![0] = v; } else { getFpEdit(acc.id).webgl = undefined; } }"
                      placeholder="e.g. Intel Inc."
                      :class="inputClass"
                    >
                    <input
                      :value="getFpEdit(acc.id).webgl?.[1] ?? ''"
                      @input="(e) => { const v = (e.target as HTMLInputElement).value; if (v && getFpEdit(acc.id).webgl) { getFpEdit(acc.id).webgl![1] = v; } }"
                      placeholder="e.g. Intel UHD 630"
                      :class="inputClass"
                    >
                  </div>
                </div>
                <!-- Locale -->
                <div>
                  <label :class="labelClass">Locale</label>
                  <input
                    :value="typeof getFpEdit(acc.id).locale === 'string' ? getFpEdit(acc.id).locale : (Array.isArray(getFpEdit(acc.id).locale) ? (getFpEdit(acc.id).locale as string[]).join(', ') : '')"
                    @input="(e) => { const v = (e.target as HTMLInputElement).value; getFpEdit(acc.id).locale = v || undefined; }"
                    placeholder="e.g. en-US (auto if empty)"
                    :class="inputClass"
                    class="mt-1"
                  >
                </div>
                <!-- Toggles -->
                <div class="flex items-center gap-4 pt-1">
                  <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input type="checkbox" v-model="getFpEdit(acc.id).blockWebrtc" class="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0">
                    Block WebRTC
                  </label>
                  <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="number"
                      :value="getFpEdit(acc.id).humanize ?? 0"
                      @input="(e) => { getFpEdit(acc.id).humanize = +(e.target as HTMLInputElement).value || undefined; }"
                      min="0"
                      max="10"
                      step="0.5"
                      class="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    >
                    Humanize (sec)
                  </label>
                </div>
              </div>
            </div>

            <!-- ═══ Proxy Config ═══ -->
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.73-3.56" /></svg>
                Proxy
              </h4>
              <div class="space-y-3">
                <!-- Enable toggle -->
                <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" v-model="getProxyEdit(acc.id).enabled" class="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0">
                  Enable proxy
                </label>

                <template v-if="getProxyEdit(acc.id).enabled">
                  <!-- Proxy chain entries -->
                  <div v-for="(entry, idx) in getProxyEdit(acc.id).chain" :key="idx" class="p-3 bg-slate-900/60 border border-slate-800/50 rounded-xl space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[9px] font-bold text-slate-600 uppercase">Proxy {{ idx + 1 }}</span>
                      <button
                        @click="removeProxyEntry(acc.id, idx)"
                        class="text-slate-700 hover:text-red-400 text-xs transition-all"
                      >&times;</button>
                    </div>
                    <div class="grid grid-cols-[100px_1fr_80px] gap-2">
                      <select v-model="entry.protocol" :class="selectClass">
                        <option v-for="p in protocolOptions" :key="p" :value="p">{{ p }}</option>
                      </select>
                      <input v-model="entry.host" placeholder="host or IP" :class="inputClass">
                      <input v-model.number="entry.port" type="number" placeholder="port" :class="inputClass">
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <input v-model="entry.username" placeholder="username (optional)" :class="inputClass">
                      <input v-model="entry.password" type="password" placeholder="password (optional)" :class="inputClass">
                    </div>
                  </div>

                  <!-- Add proxy button -->
                  <button
                    @click="addProxyEntry(acc.id)"
                    class="w-full text-xs text-slate-600 hover:text-slate-400 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl py-2 transition-all"
                  >
                    + Add proxy to chain
                  </button>

                  <!-- Proxy options -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label :class="labelClass">Rotation</label>
                      <select v-model="getProxyEdit(acc.id).rotation" :class="selectClass" class="w-full mt-1">
                        <option v-for="r in rotationOptions" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label :class="labelClass">Bypass</label>
                      <input
                        v-model="getProxyEdit(acc.id).bypass"
                        placeholder="localhost,127.0.0.1"
                        :class="inputClass"
                        class="mt-1"
                      >
                    </div>
                  </div>
                  <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input type="checkbox" v-model="getProxyEdit(acc.id).geoip" class="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0">
                    Auto-detect geolocation from proxy IP
                  </label>
                </template>
              </div>
            </div>
          </div>

          <!-- Save / Reset / Restart buttons -->
          <div class="flex items-center gap-3 mt-5 pt-4 border-t border-slate-800/50">
            <button
              @click="saveConfig(acc)"
              :disabled="saving === acc.id"
              class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition-all disabled:opacity-50"
            >
              {{ saving === acc.id ? 'Saving...' : 'Save Configuration' }}
            </button>
            <button
              v-if="hasConfig(acc)"
              @click="resetConfig(acc)"
              :disabled="saving === acc.id"
              class="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium py-2 px-5 rounded-xl text-xs transition-all border border-slate-700 disabled:opacity-50"
            >
              Reset to Default
            </button>
            <button
              @click="restartBrowser()"
              :disabled="restarting"
              class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium py-2 px-5 rounded-xl text-xs transition-all border border-slate-700 disabled:opacity-50"
              title="Close browser — will relaunch with new config on next request"
            >
              {{ restarting ? 'Restarting...' : 'Restart Browser' }}
            </button>
            <span v-if="lastSaveRestarted === acc.id" class="text-[10px] text-emerald-500 ml-auto">Saved &amp; browser restarted</span>
            <span v-else class="text-[10px] text-slate-700 ml-auto">Browser auto-restarts when active account config changes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 border border-dashed border-slate-800/40 rounded-2xl">
      <div class="text-4xl mb-3 opacity-15">&#128274;</div>
      <p class="text-slate-600 text-sm font-medium">No accounts linked</p>
      <p class="text-slate-700 text-xs mt-1">Use the extension above to sync your AI Studio session.</p>
    </div>
  </div>
</template>
