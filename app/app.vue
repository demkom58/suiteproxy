<script setup lang="ts">
const { systemStatus } = useProxyStatus();

const nav = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/chat', label: 'Chat', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
  { to: '/accounts', label: 'Accounts', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 6.75a3 3 0 11-6 0 3 3 0 016 0zM6.75 9.75a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/logs', label: 'Logs', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z' },
  { to: '/models', label: 'Models', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
  { to: '/stats', label: 'Statistics', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
];

const route = useRoute();
const mobileOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
    <!-- Mobile header -->
    <header class="lg:hidden sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="mobileOpen = !mobileOpen" class="text-slate-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
        </button>
        <h1 class="text-lg font-black text-white italic tracking-tighter">
          SUITE<span class="text-blue-500">PROXY</span>
        </h1>
      </div>
      <div :class="systemStatus.color" class="text-[10px] font-black flex items-center gap-1.5">
        <span :class="systemStatus.dot" class="w-1.5 h-1.5 rounded-full animate-pulse" />
        {{ systemStatus.label }}
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:sticky top-0 left-0 z-40 w-56 h-screen bg-slate-950 border-r border-slate-800/60 flex flex-col transition-transform lg:transition-none"
      >
        <!-- Logo -->
        <div class="px-5 pt-6 pb-4">
          <h1 class="text-xl font-black text-white italic tracking-tighter">
            SUITE<span class="text-blue-500">PROXY</span>
          </h1>
          <p class="text-slate-700 text-[9px] mt-0.5 font-mono uppercase tracking-[0.15em]">
            AI Studio Gateway
          </p>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 space-y-0.5">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            @click="mobileOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
            :class="route.path === item.to
              ? 'bg-blue-500/10 text-blue-400'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'"
          >
            <svg class="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Status footer -->
        <div class="px-5 py-4 border-t border-slate-800/40">
          <div class="flex items-center gap-2">
            <span :class="systemStatus.dot" class="w-2 h-2 rounded-full animate-pulse shrink-0" />
            <span :class="systemStatus.color" class="text-[10px] font-black uppercase tracking-wider">
              {{ systemStatus.label }}
            </span>
          </div>
        </div>
      </aside>

      <!-- Mobile overlay -->
      <div
        v-if="mobileOpen"
        @click="mobileOpen = false"
        class="fixed inset-0 z-30 bg-black/60 lg:hidden"
      />

      <!-- Main content -->
      <main class="flex-1 min-w-0">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
