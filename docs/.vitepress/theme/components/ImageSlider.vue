<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type SliderItem = {
  src: string;
  thumb?: string;
  alt?: string;
  title?: string;
  source?: string;
  description?: string;
};

const props = withDefaults(
  defineProps<{
    items: SliderItem[];
    startIndex?: number;
  }>(),
  {
    startIndex: 0,
  },
);

const activeIndex = ref(normalizeIndex(props.startIndex));
const sliderRef = ref<HTMLElement | null>(null);
const canFullscreen = ref(false);
const isFullscreen = ref(false);

const activeItem = computed(() => props.items[activeIndex.value]);
const hasItems = computed(() => props.items.length > 0);

onMounted(() => {
  canFullscreen.value = Boolean(document.fullscreenEnabled);
  document.addEventListener('fullscreenchange', syncFullscreen);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen);
});

watch(
  () => [props.items.length, props.startIndex],
  () => {
    activeIndex.value = normalizeIndex(activeIndex.value);
  },
);

function normalizeIndex(index: number) {
  if (!props.items.length) return 0;
  return Math.min(Math.max(index, 0), props.items.length - 1);
}

function select(index: number) {
  activeIndex.value = normalizeIndex(index);
}

function previous() {
  if (!props.items.length) return;
  activeIndex.value = activeIndex.value === 0 ? props.items.length - 1 : activeIndex.value - 1;
}

function next() {
  if (!props.items.length) return;
  activeIndex.value = activeIndex.value === props.items.length - 1 ? 0 : activeIndex.value + 1;
}

function syncFullscreen() {
  isFullscreen.value = document.fullscreenElement === sliderRef.value;
}

async function toggleFullscreen() {
  if (!sliderRef.value) return;

  if (document.fullscreenElement === sliderRef.value) {
    await document.exitFullscreen();
  } else {
    await sliderRef.value.requestFullscreen();
  }

  syncFullscreen();
}
</script>

<template>
  <section
    ref="sliderRef"
    class="image-slider"
    :class="{ 'image-slider--fullscreen': isFullscreen }"
    aria-label="Image slider"
    tabindex="0"
    @keydown.left.prevent="previous"
    @keydown.right.prevent="next"
    @keydown.esc="syncFullscreen"
  >
    <div v-if="hasItems && activeItem" class="image-slider__stage">
      <button class="image-slider__arrow image-slider__arrow--prev" type="button" aria-label="Previous image" @click="previous">
        &#8249;
      </button>

      <img class="image-slider__image" :src="activeItem.src" :alt="activeItem.alt || activeItem.title || ''">

      <div class="image-slider__controls">
        <div class="image-slider__counter" aria-live="polite">
          {{ activeIndex + 1 }} / {{ items.length }}
        </div>

        <button
          v-if="canFullscreen"
          class="image-slider__control-button"
          type="button"
          :aria-label="isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'"
          :title="isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'"
          @click="toggleFullscreen"
        >
          <span class="image-slider__fullscreen-icon" :class="{ 'image-slider__fullscreen-icon--active': isFullscreen }" aria-hidden="true"></span>
        </button>
      </div>

      <button class="image-slider__arrow image-slider__arrow--next" type="button" aria-label="Next image" @click="next">
        &#8250;
      </button>
    </div>

    <div v-else class="image-slider__empty">
      No images configured.
    </div>

    <div v-if="hasItems" class="image-slider__thumbs" aria-label="Image thumbnails">
      <button
        v-for="(item, index) in items"
        :key="`${item.src}-${index}`"
        class="image-slider__thumb"
        :class="{ 'image-slider__thumb--active': index === activeIndex }"
        type="button"
        :aria-label="`Show image ${index + 1}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="select(index)"
      >
        <img :src="item.thumb || item.src" :alt="item.alt || item.title || ''">
      </button>
    </div>

    <div v-if="activeItem?.title || activeItem?.source || activeItem?.description" class="image-slider__caption">
      <h3 v-if="activeItem.title">{{ activeItem.title }}</h3>
      <p v-if="activeItem.source" class="image-slider__source">{{ activeItem.source }}</p>
      <p v-if="activeItem.description" class="image-slider__description">{{ activeItem.description }}</p>
    </div>
  </section>
</template>

<style scoped>
.image-slider {
  margin: 28px 0;
  outline: none;
}

.image-slider--fullscreen {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: auto;
  padding: 18px;
  background: var(--vp-c-bg);
}

.image-slider:focus-visible {
  border-radius: 8px;
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.image-slider__stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.image-slider--fullscreen .image-slider__stage {
  height: min(74vh, calc(100vh - 184px));
  min-height: 240px;
  background: #0f1720;
}

.image-slider__image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.image-slider--fullscreen .image-slider__image {
  height: 100%;
  aspect-ratio: auto;
  object-fit: contain;
}

.image-slider__controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 7px;
  padding: 4px;
  background: color-mix(in srgb, var(--vp-c-bg) 74%, transparent);
  backdrop-filter: blur(10px);
}

.image-slider__counter {
  min-width: 48px;
  padding: 3px 6px;
  color: var(--vp-c-text-1);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.25;
}

.image-slider__control-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 5px;
  padding: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease;
}

.image-slider__control-button:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.image-slider__control-button:focus-visible {
  outline: 3px solid var(--vp-c-brand-soft);
  outline-offset: 2px;
}

.image-slider__fullscreen-icon {
  position: relative;
  display: block;
  width: 14px;
  height: 14px;
}

.image-slider__fullscreen-icon::before,
.image-slider__fullscreen-icon::after {
  position: absolute;
  width: 6px;
  height: 6px;
  border-color: currentColor;
  border-style: solid;
  content: "";
}

.image-slider__fullscreen-icon::before {
  top: 1px;
  left: 1px;
  border-width: 2px 0 0 2px;
}

.image-slider__fullscreen-icon::after {
  right: 1px;
  bottom: 1px;
  border-width: 0 2px 2px 0;
}

.image-slider__fullscreen-icon--active::before {
  top: 0;
  left: 0;
  border-width: 0 2px 2px 0;
}

.image-slider__fullscreen-icon--active::after {
  right: 0;
  bottom: 0;
  border-width: 2px 0 0 2px;
}

.image-slider__arrow {
  position: absolute;
  z-index: 1;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 44px;
  border: 0;
  border-radius: 6px;
  background: color-mix(in srgb, var(--vp-c-bg) 84%, transparent);
  color: var(--vp-c-text-1);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.image-slider__arrow:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.image-slider__arrow:focus-visible {
  outline: 3px solid var(--vp-c-brand-soft);
  outline-offset: 2px;
}

.image-slider__arrow--prev {
  left: 10px;
}

.image-slider__arrow--next {
  right: 10px;
}

.image-slider__thumbs {
  display: grid;
  grid-auto-columns: minmax(78px, 1fr);
  grid-auto-flow: column;
  gap: 10px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.image-slider__thumb {
  height: 58px;
  min-width: 78px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  opacity: 0.68;
  transition: border-color 0.16s ease, opacity 0.16s ease, transform 0.16s ease;
}

.image-slider__thumb:hover,
.image-slider__thumb--active {
  opacity: 1;
}

.image-slider__thumb--active {
  border-color: var(--vp-c-brand-1);
}

.image-slider__thumb:focus-visible {
  outline: 3px solid var(--vp-c-brand-soft);
  outline-offset: 2px;
}

.image-slider__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slider__caption {
  margin-top: 14px;
}

.image-slider__caption h3 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 1.2rem;
  line-height: 1.35;
}

.image-slider__source {
  margin: 3px 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.86rem;
}

.image-slider__description {
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.image-slider__empty {
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 28px;
  color: var(--vp-c-text-2);
  text-align: center;
}

@media (max-width: 640px) {
  .image-slider__stage {
    min-height: 180px;
  }

  .image-slider__arrow {
    width: 30px;
    height: 38px;
    font-size: 1.8rem;
  }

  .image-slider__arrow--prev {
    left: 8px;
  }

  .image-slider__arrow--next {
    right: 8px;
  }

  .image-slider__controls {
    top: 8px;
    right: 8px;
  }
}
</style>
