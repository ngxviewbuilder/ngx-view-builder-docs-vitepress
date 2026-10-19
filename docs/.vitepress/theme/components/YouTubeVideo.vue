<script setup lang="ts">
import { computed, ref } from 'vue';
import { withBase } from 'vitepress';
import { trackEvent } from '../analytics';
import { findVideo, formatTime } from '../videos';

// Click to play: until the visitor presses play the page holds only a local
// thumbnail, so YouTube loads nothing and sets nothing on a docs visit.
// The player then comes from youtube-nocookie.com.
// `start` (seconds) opens a lesson at the part a page is about.
const props = defineProps<{ id: string; start?: number }>();

const video = computed(() => findVideo(props.id));
const playing = ref(false);
const playFrom = ref(0);

const src = computed(
  () =>
    `https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0&playsinline=1${playFrom.value ? `&start=${playFrom.value}` : ''}`,
);
const watchUrl = computed(() => `https://www.youtube.com/watch?v=${props.id}`);

function play(at = props.start ?? 0): void {
  playFrom.value = at;
  if (!playing.value || at) trackEvent('video_play', { video_id: props.id, lesson: video.value?.lesson, start: at });
  playing.value = true;
}
</script>

<template>
  <figure v-if="video" class="yt-video">
    <div class="yt-video__frame">
      <iframe
        v-if="playing"
        :key="playFrom"
        :src="src"
        :title="video.youtubeTitle"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <button
        v-else
        type="button"
        class="yt-video__poster"
        :aria-label="`Play video: ${video.title} (${formatTime(video.seconds)})${start ? `, from ${formatTime(start)}` : ''}`"
        @click="play()"
      >
        <img
          :src="withBase(`/videos/${video.id}.webp`)"
          :alt="`Video lesson ${video.lesson}: ${video.title}`"
          width="960"
          height="540"
          loading="lazy"
          decoding="async"
        />
        <span class="yt-video__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
        </span>
        <span class="yt-video__time">{{ start ? `from ${formatTime(start)} · ` : '' }}{{ formatTime(video.seconds) }}</span>
      </button>
    </div>
    <figcaption class="yt-video__caption">
      <span class="yt-video__label">Lesson {{ video.lesson }}</span>
      <strong class="yt-video__title">{{ video.title }}</strong>
      <a class="yt-video__out" :href="watchUrl" target="_blank" rel="noopener">Watch on YouTube</a>
    </figcaption>
    <details class="yt-video__chapters">
      <summary>Chapters ({{ video.chapters.length }})</summary>
      <ol>
        <li v-for="chapter in video.chapters" :key="chapter.at">
          <button type="button" @click="play(chapter.at)">
            <span class="yt-video__at">{{ formatTime(chapter.at) }}</span>{{ chapter.title }}
          </button>
        </li>
      </ol>
    </details>
  </figure>
</template>

<style scoped>
.yt-video {
  margin: 20px 0 28px;
}

.yt-video__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.yt-video__frame iframe,
.yt-video__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.yt-video__poster {
  display: block;
  padding: 0;
  cursor: pointer;
}

.yt-video__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin: 0;
  transition: filter 0.2s;
}

.yt-video__poster:hover img,
.yt-video__poster:focus-visible img {
  filter: brightness(0.92);
}

.yt-video__play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: -32px 0 0 -32px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.25);
  transition: transform 0.15s;
}

.yt-video__play svg {
  margin-left: 3px;
}

.yt-video__poster:hover .yt-video__play,
.yt-video__poster:focus-visible .yt-video__play {
  transform: scale(1.08);
}

.yt-video__time {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgb(0 0 0 / 0.75);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 20px;
}

.yt-video__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.yt-video__label {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.yt-video__title {
  color: var(--vp-c-text-1);
}

.yt-video__out {
  margin-left: auto;
  font-size: 13px;
}

.yt-video__chapters {
  margin-top: 6px;
  font-size: 14px;
}

.yt-video__chapters summary {
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.yt-video__chapters ol {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2px 16px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.yt-video__chapters li {
  margin: 0;
}

.yt-video__chapters button {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 3px 0;
  text-align: left;
  color: var(--vp-c-text-1);
}

.yt-video__chapters button:hover {
  color: var(--vp-c-brand-1);
}

.yt-video__at {
  min-width: 2.6em;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .yt-video__play,
  .yt-video__poster img {
    transition: none;
  }
}
</style>
