<script setup lang="ts">
/**
 * Models — Browse available Gemini models and their capabilities.
 *
 * Fetches from /api/v1/models and displays a filterable, sortable grid.
 */
useHead({ title: 'Models — SuiteProxy' });

interface ModelInfo {
  id: string;
  object: string;
  owned_by: string;
  description: string;
  context_window: number;
  max_output_tokens: number;
  supports_thinking: boolean;
  thinking_type: string | null;
  thinking_category: string;
  supports_vision: boolean;
  supports_search_grounding: boolean;
  supports_image_generation: boolean;
  supports_tts: boolean;
  supports_audio_transcription: boolean;
  supports_embeddings: boolean;
  is_paid: boolean;
}

interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}

// ── State ───────────────────────────────────────────────────────────────

const { data: modelsResponse, status, error, refresh } = await useFetch<ModelsResponse>('/api/v1/models');
const search = ref('');
const categoryFilter = ref<string>('all');
const capabilityFilter = ref<string>('all');
const expandedId = ref<string | null>(null);

// ── Computed ────────────────────────────────────────────────────────────

const models = computed<ModelInfo[]>(() => modelsResponse.value?.data ?? []);

const categories = computed(() => {
  const cats = new Set<string>();
  for (const m of models.value) {
    cats.add(getCategory(m.id));
  }
  return ['all', ...Array.from(cats).sort()];
});

const filteredModels = computed(() => {
  let result = models.value;

  // Text search
  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(m =>
      m.id.toLowerCase().includes(q)
      || m.description.toLowerCase().includes(q),
    );
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    result = result.filter(m => getCategory(m.id) === categoryFilter.value);
  }

  // Capability filter
  if (capabilityFilter.value !== 'all') {
    result = result.filter(m => {
      switch (capabilityFilter.value) {
        case 'thinking': return m.supports_thinking;
        case 'vision': return m.supports_vision;
        case 'image_gen': return m.supports_image_generation;
        case 'tts': return m.supports_tts;
        case 'embeddings': return m.supports_embeddings;
        case 'search': return m.supports_search_grounding;
        case 'audio': return m.supports_audio_transcription;
        case 'paid': return m.is_paid;
        case 'free': return !m.is_paid;
        default: return true;
      }
    });
  }

  return result;
});

const modelStats = computed(() => ({
  total: models.value.length,
  free: models.value.filter(m => !m.is_paid).length,
  paid: models.value.filter(m => m.is_paid).length,
  thinking: models.value.filter(m => m.supports_thinking).length,
  vision: models.value.filter(m => m.supports_vision).length,
  imageGen: models.value.filter(m => m.supports_image_generation).length,
  tts: models.value.filter(m => m.supports_tts).length,
  embeddings: models.value.filter(m => m.supports_embeddings).length,
}));

// ── Helpers ─────────────────────────────────────────────────────────────

function getCategory(id: string): string {
  const m = id.toLowerCase();
  if (m.includes('embedding')) return 'Embedding';
  if (m.includes('tts')) return 'TTS';
  if (m.includes('imagen')) return 'Imagen';
  if (m.includes('veo')) return 'Veo';
  if (m.includes('gemini-3')) return 'Gemini 3';
  if (m.includes('gemini-2.5')) return 'Gemini 2.5';
  if (m.includes('gemini-2.0')) return 'Gemini 2.0';
  if (m.includes('gemini-1.5')) return 'Gemini 1.5';
  if (m.includes('gemma')) return 'Gemma';
  return 'Other';
}

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    'Gemini 3': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Gemini 2.5': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Gemini 2.0': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Gemini 1.5': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Imagen': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'TTS': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Embedding': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Gemma': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Veo': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };
  return colors[cat] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

const capabilities = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
  { key: 'thinking', label: 'Thinking' },
  { key: 'vision', label: 'Vision' },
  { key: 'image_gen', label: 'Image Gen' },
  { key: 'tts', label: 'TTS' },
  { key: 'embeddings', label: 'Embeddings' },
  { key: 'search', label: 'Search' },
  { key: 'audio', label: 'Audio Input' },
];
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">Models</h2>
        <p class="text-slate-600 text-sm mt-1">
          {{ filteredModels.length }} of {{ models.length }} models
        </p>
      </div>
      <button
        @click="refresh()"
        class="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
      >
        <svg class="w-3 h-3" :class="status === 'pending' ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
        Refresh
      </button>
    </div>

    <!-- ═══ Stats Row ═══ -->
    <div class="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-white">{{ modelStats.total }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Total</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-emerald-400">{{ modelStats.free }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Free</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-amber-400">{{ modelStats.paid }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Paid</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-purple-400">{{ modelStats.thinking }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Thinking</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-cyan-400">{{ modelStats.vision }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Vision</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-rose-400">{{ modelStats.imageGen }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Image Gen</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-amber-400">{{ modelStats.tts }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">TTS</div>
      </div>
      <div class="bg-slate-900/40 border border-slate-800/40 rounded-xl px-3 py-2.5 text-center">
        <div class="text-lg font-black text-emerald-400">{{ modelStats.embeddings }}</div>
        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Embeddings</div>
      </div>
    </div>

    <!-- ═══ Filters ═══ -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <!-- Search -->
      <div class="relative flex-1 min-w-[200px] max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search models..."
          class="w-full bg-slate-900/60 border border-slate-800/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-700 outline-none focus:border-slate-700"
        >
      </div>

      <!-- Category Filter -->
      <div class="flex items-center bg-slate-900/60 border border-slate-800/50 rounded-xl overflow-hidden">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="categoryFilter = cat"
          class="px-2.5 py-1.5 text-[10px] font-bold transition-all whitespace-nowrap"
          :class="categoryFilter === cat
            ? 'bg-slate-800 text-white'
            : 'text-slate-600 hover:text-slate-400'"
        >
          {{ cat === 'all' ? 'All' : cat }}
        </button>
      </div>

      <!-- Capability Filter -->
      <div class="flex flex-wrap gap-1">
        <button
          v-for="cap in capabilities"
          :key="cap.key"
          @click="capabilityFilter = capabilityFilter === cap.key ? 'all' : cap.key"
          class="text-[9px] font-bold px-2 py-1 rounded-lg border transition-all"
          :class="capabilityFilter === cap.key
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            : 'bg-slate-900/40 text-slate-600 border-slate-800/50 hover:text-slate-400 hover:border-slate-700'"
        >
          {{ cap.label }}
        </button>
      </div>
    </div>

    <!-- ═══ Error State ═══ -->
    <div v-if="error" class="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 text-center mb-6">
      <p class="text-red-400 text-sm font-medium">Failed to load models</p>
      <p class="text-red-500/60 text-xs mt-1 font-mono">{{ error.message }}</p>
      <button @click="refresh()" class="mt-3 text-xs text-red-400 hover:text-red-300 font-bold">Retry</button>
    </div>

    <!-- ═══ Loading State ═══ -->
    <div v-else-if="status === 'pending' && !models.length" class="text-center py-16">
      <div class="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
      <p class="text-slate-600 text-sm">Loading models...</p>
    </div>

    <!-- ═══ Models Grid ═══ -->
    <div v-else-if="filteredModels.length" class="space-y-2">
      <div
        v-for="model in filteredModels"
        :key="model.id"
        class="bg-slate-900/40 border border-slate-800/50 rounded-2xl hover:border-slate-700/60 transition-all"
      >
        <!-- Main Row -->
        <div
          @click="toggleExpand(model.id)"
          class="px-5 py-4 cursor-pointer flex items-center gap-4"
        >
          <!-- Model Name + Category -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5 mb-1">
              <span class="font-mono font-bold text-sm text-white truncate">{{ model.id }}</span>
              <span
                class="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border"
                :class="getCategoryColor(getCategory(model.id))"
              >
                {{ getCategory(model.id) }}
              </span>
              <span
                v-if="model.is_paid"
                class="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border bg-amber-500/15 text-amber-400 border-amber-500/25"
              >
                Paid
              </span>
              <span
                v-else
                class="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              >
                Free
              </span>
            </div>
            <p class="text-[11px] text-slate-600 truncate">{{ model.description }}</p>
          </div>

          <!-- Context / Output -->
          <div class="hidden lg:flex items-center gap-4 shrink-0">
            <div class="text-center">
              <div class="text-xs font-mono font-bold text-slate-400">{{ formatTokens(model.context_window) }}</div>
              <div class="text-[8px] text-slate-700 font-bold uppercase">Context</div>
            </div>
            <div class="text-center">
              <div class="text-xs font-mono font-bold text-slate-500">{{ formatTokens(model.max_output_tokens) }}</div>
              <div class="text-[8px] text-slate-700 font-bold uppercase">Output</div>
            </div>
          </div>

          <!-- Capability Badges -->
          <div class="flex flex-wrap gap-1 shrink-0 max-w-[280px]">
            <span v-if="model.supports_thinking" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
              Thinking
            </span>
            <span v-if="model.supports_vision" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              Vision
            </span>
            <span v-if="model.supports_image_generation" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20">
              Image Gen
            </span>
            <span v-if="model.supports_tts" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
              TTS
            </span>
            <span v-if="model.supports_embeddings" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Embeddings
            </span>
            <span v-if="model.supports_search_grounding" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20">
              Search
            </span>
            <span v-if="model.supports_audio_transcription" class="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              Audio
            </span>
          </div>

          <!-- Expand Arrow -->
          <svg
            class="w-4 h-4 text-slate-700 shrink-0 transition-transform"
            :class="expandedId === model.id ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <!-- Expanded Detail -->
        <div v-if="expandedId === model.id" class="px-5 pb-5 pt-0 border-t border-slate-800/30">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Context Window</div>
              <div class="text-sm font-mono text-white font-bold">{{ model.context_window.toLocaleString() }} tokens</div>
            </div>
            <div>
              <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Max Output</div>
              <div class="text-sm font-mono text-white font-bold">{{ model.max_output_tokens.toLocaleString() }} tokens</div>
            </div>
            <div>
              <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Thinking</div>
              <div class="text-sm font-bold" :class="model.supports_thinking ? 'text-purple-400' : 'text-slate-700'">
                {{ model.supports_thinking ? (model.thinking_type === 'toggle_budget' ? 'Budget Control' : model.thinking_type === 'level' ? 'Level Control' : 'Yes') : 'No' }}
              </div>
            </div>
            <div>
              <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Category</div>
              <div class="text-sm font-mono text-slate-400">{{ model.thinking_category }}</div>
            </div>
          </div>

          <!-- API Usage Example -->
          <div class="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/40">
            <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-2">Quick Test</div>
            <pre class="text-[10px] font-mono text-slate-500 whitespace-pre-wrap leading-relaxed overflow-x-auto">curl {{ useRequestURL().protocol }}//{{ useRequestURL().host }}/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"{{ model.id }}","messages":[{"role":"user","content":"Hello!"}]}'</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty filtered state -->
    <div v-else class="text-center py-16 border border-dashed border-slate-800/40 rounded-2xl">
      <div class="text-3xl opacity-15 mb-2">&#128270;</div>
      <p class="text-slate-700 text-sm">No models match your filters</p>
      <button
        @click="search = ''; categoryFilter = 'all'; capabilityFilter = 'all'"
        class="mt-2 text-xs text-blue-400 hover:text-blue-300 font-bold"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>
