<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { trackEvent } from '../analytics';

const props = defineProps<{ base?: string; prodBase?: string }>();

const { isDark } = useData();

const activeTab = ref<'builder' | 'runtime'>('builder');
const fullscreen = ref(false);
const runtimeKey = ref(0);
const builderFrame = ref<HTMLIFrameElement | null>(null);
const runtimeFrame = ref<HTMLIFrameElement | null>(null);
// Resolved on mount (client only): localhost docs → local demo app, prod docs → hosted demo.
const base = ref('');

// The demo app is a real Angular bundle behind the iframe — it needs a moment
// to boot, which otherwise shows as a blank/white flash before the form
// appears. A brief, deliberate spinner reads as "loading" instead of "broken".
const MIN_LOADER_MS = 1500;
const builderLoading = ref(true);
const runtimeLoading = ref(true);
let builderLoadStartedAt = 0;
let runtimeLoadStartedAt = 0;

function onBuilderLoad(): void {
  const elapsed = Date.now() - builderLoadStartedAt;
  setTimeout(() => {
    builderLoading.value = false;
  }, Math.max(0, MIN_LOADER_MS - elapsed));
}

function onRuntimeLoad(): void {
  const elapsed = Date.now() - runtimeLoadStartedAt;
  setTimeout(() => {
    runtimeLoading.value = false;
  }, Math.max(0, MIN_LOADER_MS - elapsed));
}

const theme = computed(() => (isDark.value ? 'dark' : 'light'));

function resolveBase(): string {
  if (props.base) return props.base;
  const host = window.location.hostname;
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
  return isLocal ? 'http://localhost:4200' : (props.prodBase ?? 'https://demo.ngxviewbuilder.io');
}

// Theme at mount time goes into the URL; later changes go via postMessage,
// so the iframes react live without reloading (and without losing builder state).
const builderSrc = ref('');
const runtimeSrc = computed(
  () => `${base.value}/filler?embed=1&theme=${theme.value}&k=${runtimeKey.value}`,
);

function postTheme(frame: HTMLIFrameElement | null): void {
  frame?.contentWindow?.postMessage({ type: 'nvb-theme', theme: theme.value }, '*');
}

watch(theme, () => {
  postTheme(builderFrame.value);
  postTheme(runtimeFrame.value);
});

function selectTab(tab: 'builder' | 'runtime'): void {
  if (tab === 'runtime') {
    // Re-create the runtime iframe so it picks up the latest structure
    // the builder auto-saved into localStorage.
    runtimeKey.value += 1;
    runtimeLoading.value = true;
    runtimeLoadStartedAt = Date.now();
  }
  if (activeTab.value !== tab) {
    trackEvent('demo_tab_change', { tab });
  }
  activeTab.value = tab;
}

function toggleFullscreen(): void {
  fullscreen.value = !fullscreen.value;
  trackEvent('demo_fullscreen', { action: fullscreen.value ? 'enter' : 'exit' });
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && fullscreen.value) {
    fullscreen.value = false;
  }
}

watch(fullscreen, (value) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = value ? 'hidden' : '';
  }
});

onMounted(() => {
  base.value = resolveBase();
  builderLoadStartedAt = Date.now();
  builderSrc.value = `${base.value}/builder?embed=1&theme=${theme.value}`;
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <div class="demo-embed" :class="{ 'demo-embed--fullscreen': fullscreen }">
    <div class="demo-embed__bar">
      <div class="demo-embed__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="demo-embed__tab"
          :class="{ 'demo-embed__tab--active': activeTab === 'builder' }"
          :aria-selected="activeTab === 'builder'"
          @click="selectTab('builder')"
        >
          Builder
        </button>
        <button
          type="button"
          role="tab"
          class="demo-embed__tab"
          :class="{ 'demo-embed__tab--active': activeTab === 'runtime' }"
          :aria-selected="activeTab === 'runtime'"
          @click="selectTab('runtime')"
        >
          Runtime
        </button>
      </div>
      <button
        type="button"
        class="demo-embed__fullscreen"
        :title="fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'"
        @click="toggleFullscreen"
      >
        <span v-if="!fullscreen">⛶ Fullscreen</span>
        <span v-else>✕ Exit fullscreen</span>
      </button>
    </div>

    <div class="demo-embed__body">
      <!-- Builder stays mounted so switching tabs never loses unsaved edits. -->
      <iframe
        v-if="builderSrc"
        v-show="activeTab === 'builder'"
        ref="builderFrame"
        class="demo-embed__frame"
        :src="builderSrc"
        title="NGX View Builder — Builder"
        allow="clipboard-read; clipboard-write"
        @load="onBuilderLoad"
      />
      <iframe
        v-if="activeTab === 'runtime'"
        ref="runtimeFrame"
        :key="runtimeKey"
        class="demo-embed__frame"
        :src="runtimeSrc"
        title="NGX View Builder — Runtime"
        allow="clipboard-read; clipboard-write"
        @load="onRuntimeLoad"
      />

      <div
        v-if="(activeTab === 'builder' && builderLoading) || (activeTab === 'runtime' && runtimeLoading)"
        class="demo-embed__loader"
      >
        <span class="demo-embed__spinner" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-embed {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
  height: calc(100vh - var(--vp-nav-height) - 140px);
  min-height: 480px;
}

.demo-embed--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 200;
  height: 100vh;
  min-height: 0;
  border: none;
  border-radius: 0;
}

.demo-embed__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex: 0 0 auto;
}

.demo-embed__tabs {
  display: flex;
  gap: 4px;
}

.demo-embed__tab {
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  transition: background 0.15s, color 0.15s;
}

.demo-embed__tab:hover {
  color: var(--vp-c-text-1);
}

.demo-embed__tab--active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.demo-embed__fullscreen {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  transition: color 0.15s, border-color 0.15s;
}

.demo-embed__fullscreen:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.demo-embed__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

.demo-embed__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: var(--vp-c-bg);
}

.demo-embed__loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg);
  z-index: 1;
}

.demo-embed__spinner {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  animation: demo-embed-spin 0.8s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .demo-embed__spinner {
    animation: none;
  }
}

@keyframes demo-embed-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
