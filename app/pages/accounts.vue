<script setup lang="ts">
import type { AccountRecord, SuitemakerCreds } from '~~/shared/types';

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

const activeAccounts = computed(() => accounts.value?.filter(acc => !isLimited(acc.limited_until)) ?? []);
const limitedAccounts = computed(() => accounts.value?.filter(acc => isLimited(acc.limited_until)) ?? []);
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

    <!-- ═══ Connect Section ═══ -->
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

    <!-- ═══ Manual Link ═══ -->
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
          class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-slate-200 placeholder:text-slate-700"
        >
        <textarea
          v-model="manualCookie"
          rows="3"
          placeholder="Paste full Cookie header string..."
          class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono focus:border-blue-500 outline-none text-slate-300 placeholder:text-slate-700 resize-none"
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

    <!-- ═══ Account List ═══ -->
    <div v-if="accounts?.length" class="space-y-2">
      <div
        v-for="acc in accounts"
        :key="acc.id"
        class="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex justify-between items-center group hover:border-slate-700/60 transition-all"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2.5 mb-1.5">
            <!-- Status dot -->
            <span class="w-2 h-2 rounded-full shrink-0" :class="isLimited(acc.limited_until) ? 'bg-amber-500' : 'bg-emerald-500'" />
            <!-- Email -->
            <span class="font-mono font-bold text-sm truncate" :class="isLimited(acc.limited_until) ? 'text-slate-500' : 'text-white'">
              {{ acc.id }}
            </span>
            <!-- Badge -->
            <span
              class="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md"
              :class="isLimited(acc.limited_until)
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'"
            >
              {{ isLimited(acc.limited_until) ? 'LIMITED' : 'READY' }}
            </span>
          </div>
          <!-- Details row -->
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

        <button
          @click="deleteAccount(acc.id)"
          class="ml-3 shrink-0 text-slate-700 hover:text-red-400 w-9 h-9 rounded-xl transition-all flex items-center justify-center hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
          title="Disconnect"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
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
