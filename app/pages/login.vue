<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: 'Login — SuiteProxy' });

const key = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { key: key.value },
    });
    await navigateTo('/');
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } };
    error.value = err?.data?.statusMessage || 'Invalid API key';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-white italic tracking-tighter">
          SUITE<span class="text-blue-500">PROXY</span>
        </h1>
        <p class="text-slate-700 text-[10px] mt-1 font-mono uppercase tracking-[0.2em]">
          AI Studio Gateway
        </p>
      </div>

      <!-- Login Card -->
      <form
        @submit.prevent="handleLogin"
        class="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6"
      >
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] mb-3">
          API Key
        </div>

        <input
          v-model="key"
          type="password"
          placeholder="Enter your PROXY_API_KEY"
          autofocus
          autocomplete="current-password"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-700 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors"
        />

        <!-- Error -->
        <div
          v-if="error"
          class="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading || !key.trim()"
          class="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm rounded-xl px-4 py-3 transition-all"
        >
          {{ loading ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>

      <!-- Hint -->
      <p class="text-center text-[10px] text-slate-700 mt-4 font-mono">
        Set <code class="text-slate-600">PROXY_API_KEY</code> in your .env file
      </p>
    </div>
  </div>
</template>
