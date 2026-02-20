<script setup lang="ts">
/**
 * Chat — Built-in chat client for SuiteProxy.
 *
 * Features: model selector, streaming with live display, thinking visible & editable,
 * message edit/delete, markdown rendering, system prompt, temperature/max tokens.
 */
import { marked } from 'marked';

useHead({ title: 'Chat — SuiteProxy' });

// ── Markdown Setup ──────────────────────────────────────────────────────

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked.parse(text, { async: false }) as string;
}

// ── Types ───────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  thinking?: string;
  timestamp: number;
}

interface ModelOption {
  id: string;
  supports_thinking: boolean;
  is_paid: boolean;
}

// ── State ───────────────────────────────────────────────────────────────

const messages = ref<ChatMessage[]>([]);
const input = ref('');
const isStreaming = ref(false);
const abortController = ref<AbortController | null>(null);

// Editing
const editingId = ref<string | null>(null);
const editText = ref('');
const editingThinkingId = ref<string | null>(null);
const editThinkingText = ref('');

// Settings
const selectedModel = ref('gemini-2.5-flash');
const systemPrompt = ref('');
const temperature = ref(1.0);
const maxTokens = ref(8192);
const enableThinking = ref(false);
const thinkingBudget = ref(8192);
const showSettings = ref(false);

// Models
const { data: modelsData } = await useFetch<{ data: ModelOption[] }>('/api/v1/models');
const models = computed(() =>
  (modelsData.value?.data ?? [])
    .filter(m => !m.id.includes('embedding') && !m.id.includes('tts') && !m.id.includes('imagen') && !m.id.includes('veo'))
    .sort((a, b) => a.id.localeCompare(b.id)),
);

const currentModel = computed(() => models.value.find(m => m.id === selectedModel.value));

// Auto-scroll
const chatContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

function genId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Message Actions ─────────────────────────────────────────────────────

function deleteMessage(id: string) {
  const idx = messages.value.findIndex(m => m.id === id);
  if (idx === -1) return;
  messages.value.splice(idx, 1);
}

function startEdit(msg: ChatMessage) {
  editingId.value = msg.id;
  editText.value = msg.content;
}

function saveEdit(id: string) {
  const msg = messages.value.find(m => m.id === id);
  if (msg) msg.content = editText.value;
  editingId.value = null;
  editText.value = '';
}

/**
 * Save the edit and immediately regenerate the response.
 * Removes all messages after the edited one and triggers a new generation.
 */
async function saveEditAndRegenerate(id: string) {
  const idx = messages.value.findIndex(m => m.id === id);
  if (idx === -1) return;

  // Save the edit
  const msg = messages.value[idx]!;
  msg.content = editText.value;
  editingId.value = null;
  editText.value = '';

  // Remove all messages after the edited one
  messages.value = messages.value.slice(0, idx + 1);

  // If we edited an assistant message, remove it too (regenerate from scratch)
  if (msg.role === 'assistant') {
    messages.value.pop();
  }

  // Regenerate
  await doGenerate();
}

function cancelEdit() {
  editingId.value = null;
  editText.value = '';
}

function startEditThinking(msg: ChatMessage) {
  editingThinkingId.value = msg.id;
  editThinkingText.value = msg.thinking ?? '';
}

function saveEditThinking(id: string) {
  const msg = messages.value.find(m => m.id === id);
  if (msg) msg.thinking = editThinkingText.value;
  editingThinkingId.value = null;
  editThinkingText.value = '';
}

function cancelEditThinking() {
  editingThinkingId.value = null;
  editThinkingText.value = '';
}

// ── Send Message ────────────────────────────────────────────────────────

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isStreaming.value) return;

  messages.value.push({
    id: genId(),
    role: 'user',
    content: text,
    timestamp: Date.now(),
  });
  input.value = '';
  scrollToBottom();

  await doGenerate();
}

async function regenerate() {
  // Remove last assistant message and regenerate
  if (messages.value.length > 0 && messages.value[messages.value.length - 1]!.role === 'assistant') {
    messages.value.pop();
  }
  await doGenerate();
}

/**
 * Process a single SSE line and update the assistant message.
 */
function processSSELine(line: string, assistantMsg: ChatMessage): void {
  if (!line.startsWith('data: ')) return;
  const data = line.slice(6).trim();
  if (data === '[DONE]') return;

  try {
    const chunk = JSON.parse(data);
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) return;

    // Handle thinking/reasoning content
    // Server sends `reasoning_content` (DeepSeek/Gemini convention)
    if (delta.reasoning_content) {
      assistantMsg.thinking = (assistantMsg.thinking ?? '') + delta.reasoning_content;
      messages.value = [...messages.value];
      scrollToBottom();
    }

    // Handle regular content
    if (delta.content) {
      assistantMsg.content += delta.content;
      messages.value = [...messages.value];
      scrollToBottom();
    }
  } catch {
    // Skip malformed chunks
  }
}

async function doGenerate() {
  // Build messages array for API
  const apiMessages: { role: string; content: string }[] = [];
  if (systemPrompt.value.trim()) {
    apiMessages.push({ role: 'system', content: systemPrompt.value.trim() });
  }
  for (const msg of messages.value) {
    if (msg.role !== 'system') {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add placeholder assistant message
  const assistantMsg: ChatMessage = {
    id: genId(),
    role: 'assistant',
    content: '',
    thinking: '',
    timestamp: Date.now(),
  };
  messages.value.push(assistantMsg);
  scrollToBottom();

  isStreaming.value = true;
  abortController.value = new AbortController();

  try {
    const body: Record<string, unknown> = {
      model: selectedModel.value,
      messages: apiMessages,
      stream: true,
      temperature: temperature.value,
      max_tokens: maxTokens.value,
    };

    if (enableThinking.value && currentModel.value?.supports_thinking) {
      body.thinking = {
        type: 'enabled',
        budget_tokens: thinkingBudget.value,
      };
    }

    const response = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortController.value.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Flush any remaining buffer content (final SSE event without trailing newline)
        buffer += decoder.decode();
        if (buffer.trim()) {
          processSSELine(buffer, assistantMsg);
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        processSSELine(line, assistantMsg);
      }
    }
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string };
    if (err.name === 'AbortError') {
      if (!assistantMsg.content) {
        assistantMsg.content = '*Generation stopped*';
      }
    } else {
      assistantMsg.content = `**Error:** ${err.message || 'Unknown error'}`;
    }
    messages.value = [...messages.value];
  } finally {
    // Clean up empty thinking
    if (assistantMsg.thinking === '') {
      assistantMsg.thinking = undefined;
    }
    isStreaming.value = false;
    abortController.value = null;
    scrollToBottom();
  }
}

function stopGeneration() {
  abortController.value?.abort();
}

function clearChat() {
  messages.value = [];
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- ═══ Header Bar ═══ -->
    <div class="shrink-0 px-4 py-2.5 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
      <div class="flex items-center gap-3 flex-wrap">
        <h2 class="text-base font-black text-white tracking-tight shrink-0">Chat</h2>

        <!-- Model Selector -->
        <select
          v-model="selectedModel"
          :disabled="isStreaming"
          class="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 outline-none focus:border-slate-600 disabled:opacity-50"
        >
          <option v-for="m in models" :key="m.id" :value="m.id">
            {{ m.id }}{{ m.is_paid ? ' $' : '' }}
          </option>
        </select>

        <!-- Thinking toggle -->
        <label
          v-if="currentModel?.supports_thinking"
          class="flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <div
            @click="enableThinking = !enableThinking"
            class="w-8 h-[18px] rounded-full transition-colors relative cursor-pointer"
            :class="enableThinking ? 'bg-slate-500' : 'bg-slate-700'"
          >
            <div
              class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all shadow-sm"
              :class="enableThinking ? 'left-[16px]' : 'left-[2px]'"
            />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider" :class="enableThinking ? 'text-slate-300' : 'text-slate-600'">Think</span>
        </label>

        <div class="flex-1" />

        <!-- Right actions -->
        <div class="flex items-center gap-1.5">
          <button
            @click="showSettings = !showSettings"
            class="p-1.5 rounded-lg border transition-all"
            :class="showSettings
              ? 'bg-slate-800 text-slate-300 border-slate-700'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/50 hover:text-slate-300'"
            title="Settings"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button
            v-if="messages.length > 0"
            @click="regenerate"
            :disabled="isStreaming"
            class="p-1.5 rounded-lg bg-slate-800/60 text-slate-500 border border-slate-700/50 hover:text-slate-300 transition-all disabled:opacity-30"
            title="Regenerate last response"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
          </button>
          <button
            v-if="messages.length > 0"
            @click="clearChat"
            :disabled="isStreaming"
            class="p-1.5 rounded-lg bg-slate-800/60 text-slate-500 border border-slate-700/50 hover:text-slate-400 transition-all disabled:opacity-30"
            title="Clear chat"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ Settings Panel ═══ -->
    <div v-if="showSettings" class="shrink-0 px-4 py-3 border-b border-slate-800/40 bg-slate-900/30">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 max-w-4xl">
        <!-- System Prompt -->
        <div class="col-span-2 lg:col-span-5">
          <label class="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mb-1">System Prompt</label>
          <textarea
            v-model="systemPrompt"
            rows="2"
            placeholder="You are a helpful assistant..."
            class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 placeholder:text-slate-700 outline-none focus:border-slate-600 resize-none font-mono leading-relaxed"
          />
        </div>

        <!-- Temperature -->
        <div>
          <label class="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mb-1">
            Temp <span class="text-slate-500">{{ temperature.toFixed(1) }}</span>
          </label>
          <input
            v-model.number="temperature"
            type="range" min="0" max="2" step="0.1"
            class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
          >
        </div>

        <!-- Max Tokens -->
        <div>
          <label class="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Max Tokens</label>
          <input
            v-model.number="maxTokens"
            type="number" min="1" max="65536"
            class="num-clean w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-slate-600 font-mono"
          >
        </div>

        <!-- Thinking Budget -->
        <div v-if="currentModel?.supports_thinking">
          <label class="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Think Budget</label>
          <input
            v-model.number="thinkingBudget"
            type="number" min="1024" max="65536" step="1024"
            class="num-clean w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-slate-600 font-mono"
          >
        </div>
      </div>
    </div>

    <!-- ═══ Chat Messages ═══ -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto">
      <!-- Empty State -->
      <div v-if="!messages.length" class="flex items-center justify-center h-full px-5">
        <div class="text-center max-w-md">
          <div class="text-4xl opacity-10 mb-3">&#9889;</div>
          <h3 class="text-lg font-black text-slate-500 mb-1">Ready to chat</h3>
          <p class="text-slate-700 text-xs">
            Model: <span class="text-slate-400 font-mono">{{ selectedModel }}</span>
          </p>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="max-w-3xl mx-auto px-4 py-5 space-y-4">
        <template v-for="(msg, i) in messages" :key="msg.id">
          <!-- ── User Message ── -->
          <div v-if="msg.role === 'user'" class="group flex justify-end gap-2">
            <!-- Actions -->
            <div class="shrink-0 flex items-start gap-0.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="startEdit(msg)" class="p-1 rounded text-slate-700 hover:text-slate-400 transition-colors" title="Edit">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              </button>
              <button @click="deleteMessage(msg.id)" class="p-1 rounded text-slate-700 hover:text-slate-400 transition-colors" title="Delete">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <!-- Bubble -->
            <div class="bg-slate-800/50 border border-slate-700/40 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-xl">
              <!-- Edit mode -->
              <div v-if="editingId === msg.id" class="space-y-2">
                <textarea
                  v-model="editText"
                  rows="3"
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-slate-600 resize-none min-w-[250px]"
                />
                <div class="flex gap-1.5 justify-end">
                  <button @click="cancelEdit" class="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded">Cancel</button>
                  <button @click="saveEdit(msg.id)" class="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-700/50">Save</button>
                  <button @click="saveEditAndRegenerate(msg.id)" class="text-[10px] text-slate-300 hover:text-white font-bold px-2 py-1 rounded bg-slate-700/50 border border-slate-600/40">Save &amp; Regen</button>
                </div>
              </div>
              <!-- Display mode (markdown) -->
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="chat-md prose prose-invert prose-sm max-w-none" v-html="renderMarkdown(msg.content)" />
            </div>
          </div>

          <!-- ── Assistant Message ── -->
          <div v-else-if="msg.role === 'assistant'" class="group">
            <div class="max-w-full">
              <!-- Thinking Block (always visible, expandable) -->
              <div v-if="msg.thinking" class="mb-2">
                <details :open="isStreaming && i === messages.length - 1" class="group/think">
                  <summary class="list-none cursor-pointer text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors flex items-center gap-1.5 select-none">
                    <svg class="w-2.5 h-2.5 group-open/think:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l8 6-8 6V4z" /></svg>
                    Thinking
                    <span class="text-slate-700 font-mono text-[9px] normal-case tracking-normal">{{ msg.thinking.length }} chars</span>
                    <span v-if="isStreaming && i === messages.length - 1 && !msg.content" class="animate-pulse ml-1">...</span>
                    <!-- Edit thinking button -->
                    <button
                      v-if="!isStreaming"
                      @click.stop="startEditThinking(msg)"
                      class="ml-auto p-0.5 rounded text-slate-700 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Edit thinking"
                    >
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                    </button>
                  </summary>
                  <!-- Thinking edit mode -->
                  <div v-if="editingThinkingId === msg.id" class="mt-1.5 space-y-2">
                    <textarea
                      v-model="editThinkingText"
                      rows="6"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-500 outline-none focus:border-slate-600 resize-y font-mono leading-relaxed"
                    />
                    <div class="flex gap-1.5">
                      <button @click="cancelEditThinking" class="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded">Cancel</button>
                      <button @click="saveEditThinking(msg.id)" class="text-[10px] text-slate-300 hover:text-white font-bold px-2 py-1 rounded bg-slate-700/50">Save</button>
                    </div>
                  </div>
                  <!-- Thinking display (markdown) -->
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="thinking-md mt-1.5 pl-3 border-l-2 border-slate-800 max-h-80 overflow-y-auto prose prose-invert prose-xs max-w-none" v-html="renderMarkdown(msg.thinking)" />
                </details>
              </div>

              <!-- Content -->
              <div v-if="msg.content || (!isStreaming || i !== messages.length - 1)" class="flex gap-2 group/content">
                <!-- Message bubble -->
                <div class="flex-1 min-w-0">
                  <!-- Edit mode -->
                  <div v-if="editingId === msg.id" class="space-y-2 bg-slate-900/40 border border-slate-800/40 rounded-2xl rounded-bl-sm p-3">
                    <textarea
                      v-model="editText"
                      rows="5"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-slate-600 resize-y"
                    />
                    <div class="flex gap-1.5">
                      <button @click="cancelEdit" class="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded">Cancel</button>
                      <button @click="saveEdit(msg.id)" class="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-700/50">Save</button>
                      <button @click="saveEditAndRegenerate(msg.id)" class="text-[10px] text-slate-300 hover:text-white font-bold px-2 py-1 rounded bg-slate-700/50 border border-slate-600/40">Save &amp; Regen</button>
                    </div>
                  </div>
                  <!-- Display mode (markdown) -->
                  <div
                    v-else-if="msg.content"
                    class="bg-slate-900/40 border border-slate-800/30 rounded-2xl rounded-bl-sm px-4 py-3"
                  >
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div class="chat-md prose prose-invert prose-sm max-w-none" v-html="renderMarkdown(msg.content)" />
                  </div>
                  <!-- Empty content while streaming -->
                  <div v-else-if="isStreaming && i === messages.length - 1" class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <span class="flex gap-1">
                        <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
                        <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
                        <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
                      </span>
                      <span class="text-[11px] text-slate-600">
                        {{ msg.thinking ? 'Generating response...' : 'Waiting for model...' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="shrink-0 flex flex-col gap-0.5 pt-2 opacity-0 group-hover/content:opacity-100 transition-opacity">
                  <button @click="startEdit(msg)" class="p-1 rounded text-slate-700 hover:text-slate-400 transition-colors" title="Edit">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  </button>
                  <button @click="deleteMessage(msg.id)" class="p-1 rounded text-slate-700 hover:text-slate-400 transition-colors" title="Delete">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ═══ Input Area ═══ -->
    <div class="shrink-0 border-t border-slate-800/60 bg-slate-950/90 backdrop-blur-sm">
      <div class="max-w-3xl mx-auto px-4 py-3">
        <div class="flex items-end gap-2">
          <textarea
            v-model="input"
            @keydown="handleKeyDown"
            :disabled="isStreaming"
            rows="1"
            placeholder="Message... (Enter to send, Shift+Enter for newline)"
            class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-slate-600 resize-none min-h-[40px] max-h-36 overflow-y-auto disabled:opacity-40"
            style="field-sizing: content;"
          />

          <button
            v-if="isStreaming"
            @click="stopGeneration"
            class="shrink-0 bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-2.5 transition-all active:scale-95"
            title="Stop"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          </button>
          <button
            v-else
            @click="sendMessage"
            :disabled="!input.trim()"
            class="shrink-0 bg-slate-200 hover:bg-white disabled:bg-slate-800 disabled:text-slate-700 text-slate-950 rounded-xl p-2.5 transition-all active:scale-95 disabled:active:scale-100"
            title="Send"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          </button>
        </div>
        <div class="flex items-center justify-between mt-1.5 px-1">
          <span class="text-[9px] text-slate-800 font-mono">
            {{ selectedModel }}{{ enableThinking ? ' + thinking' : '' }}
          </span>
          <span class="text-[9px] text-slate-800">
            {{ messages.filter(m => m.role !== 'system').length }} messages
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* ── Hide number input spinners ── */
.num-clean::-webkit-outer-spin-button,
.num-clean::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.num-clean {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* ── Shared prose overrides for chat markdown ── */
.chat-md {
  --tw-prose-body: rgb(203 213 225);        /* slate-300 */
  --tw-prose-headings: rgb(226 232 240);    /* slate-200 */
  --tw-prose-bold: rgb(255 255 255);
  --tw-prose-links: rgb(148 163 184);       /* slate-400 */
  --tw-prose-code: rgb(148 163 184);        /* slate-400 */
  --tw-prose-quotes: rgb(100 116 139);      /* slate-500 */
  --tw-prose-quote-borders: rgb(51 65 85);  /* slate-700 */
  --tw-prose-counters: rgb(100 116 139);    /* slate-500 */
  --tw-prose-bullets: rgb(71 85 105);       /* slate-600 */
  --tw-prose-hr: rgb(30 41 59);            /* slate-800 */
}
.chat-md :where(code):not(:where(pre *)) {
  background: rgb(15 23 42 / 0.6);
  padding: 0.15em 0.35em;
  border-radius: 0.25em;
  font-size: 0.85em;
  border: 1px solid rgb(51 65 85 / 0.3);
}
.chat-md :where(code):not(:where(pre *))::before,
.chat-md :where(code):not(:where(pre *))::after {
  content: none;
}
.chat-md pre {
  background: rgb(2 6 23) !important;       /* slate-950 */
  border: 1px solid rgb(30 41 59 / 0.5);   /* slate-800 */
}
.chat-md pre code {
  font-size: 11px !important;
  line-height: 1.6 !important;
}
.chat-md a {
  text-decoration-color: rgb(71 85 105);    /* slate-600 */
}
.chat-md a:hover {
  color: rgb(226 232 240);                  /* slate-200 */
}

/* ── Thinking block markdown (dimmed) ── */
.thinking-md {
  --tw-prose-body: rgb(100 116 139 / 0.5);        /* slate-500/50 */
  --tw-prose-headings: rgb(100 116 139 / 0.6);
  --tw-prose-bold: rgb(148 163 184 / 0.6);
  --tw-prose-links: rgb(100 116 139 / 0.5);
  --tw-prose-code: rgb(100 116 139 / 0.6);
  --tw-prose-quotes: rgb(71 85 105 / 0.5);
  --tw-prose-quote-borders: rgb(51 65 85 / 0.3);
  --tw-prose-counters: rgb(71 85 105 / 0.5);
  --tw-prose-bullets: rgb(51 65 85 / 0.5);
  --tw-prose-hr: rgb(30 41 59 / 0.3);
}
.thinking-md p,
.thinking-md li,
.thinking-md h1,
.thinking-md h2,
.thinking-md h3,
.thinking-md h4 {
  font-size: 11px !important;
}
.thinking-md :where(code):not(:where(pre *)) {
  background: rgb(15 23 42 / 0.3);
  padding: 0.1em 0.3em;
  border-radius: 0.2em;
  font-size: 10px;
  border: 1px solid rgb(51 65 85 / 0.15);
}
.thinking-md :where(code):not(:where(pre *))::before,
.thinking-md :where(code):not(:where(pre *))::after {
  content: none;
}
.thinking-md pre {
  background: rgb(2 6 23 / 0.5) !important;
  border: 1px solid rgb(30 41 59 / 0.2);
}
.thinking-md pre code {
  font-size: 10px !important;
  line-height: 1.5 !important;
}
</style>
