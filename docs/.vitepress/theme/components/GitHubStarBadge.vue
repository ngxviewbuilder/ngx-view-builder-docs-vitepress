<script setup lang="ts">
// Navbar badge: [octicon] GitHub | * <zvaigzduciu skaicius>.
//
// Pakeicia numatytaji VitePress `socialLinks` ikonos mygtuka (jis is config.mts
// pasalintas), tad zvaigzduciu skaicius matomas visuose puslapiuose, o ne tik
// pagrindiniame, kaip anksciau buvo su hero LaunchBadges.
import { computed, onMounted, ref } from 'vue';

const REPO = 'ngxviewbuilder/ngx-view-builder-community';
const REPO_URL = `https://github.com/${REPO}`;

// Neautentifikuota GitHub API leidzia 60 uzklausu per valanda vienam IP, o sis
// badge dabar yra kiekviename puslapyje. Todel skaicius cachuojamas dviem
// lygiais: modulyje (SPA navigacijai per viena seansa) ir localStorage
// (perkrovimams tarp seansu).
const CACHE_KEY = 'nvb:gh-stars';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cachedStars: number | null = null;

const stars = ref<number | null>(cachedStars);

const starsLabel = computed(() => {
  const n = stars.value;
  if (n === null) return '';
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
});

function readStoredStars(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw);
    if (typeof value !== 'number' || typeof at !== 'number') return null;
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return value;
  } catch {
    return null; // sugadintas irasas arba uzdrausta saugykla
  }
}

onMounted(async () => {
  if (cachedStars !== null) return;

  const stored = readStoredStars();
  if (stored !== null) {
    cachedStars = stored;
    stars.value = stored;
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`);
    if (!res.ok) return; // pvz. pasiektas rate limitas
    const data = await res.json();
    if (typeof data.stargazers_count !== 'number') return;

    cachedStars = data.stargazers_count;
    stars.value = cachedStars;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ value: cachedStars, at: Date.now() }));
    } catch {
      // Privatus rezimas ar pilna saugykla - badge veikia ir be cache.
    }
  } catch {
    // Be skaiciaus badge lieka tik su pavadinimu, nuoroda vis tiek veikia.
  }
});
</script>

<template>
  <a
    class="gh-star"
    :href="REPO_URL"
    target="_blank"
    rel="noopener"
    :aria-label="
      stars === null
        ? 'NGX View Builder on GitHub'
        : `NGX View Builder on GitHub, ${stars} stars`
    "
  >
    <svg class="gh-star__mark" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
    <span class="gh-star__name">GitHub</span>

    <!-- Skaiciaus dalis rodoma tik ja gavus: kitaip liktu kabantis skirtukas. -->
    <template v-if="stars !== null">
      <span class="gh-star__sep" aria-hidden="true"></span>
      <svg class="gh-star__icon" width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
        />
      </svg>
      <span class="gh-star__count">{{ starsLabel }}</span>
    </template>
  </a>
</template>

<style scoped>
/*
 * Slepiamas tuose paciuose plociuose kaip numatytosios VitePress socialLinks
 * ikonos: siauroje navbar juostoje GitHub pasiekiamas per "Community" punkta.
 */
.gh-star {
  display: none;
}

@media (min-width: 768px) {
  .gh-star {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    margin-left: 12px;
    padding: 0 10px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    color: var(--vp-c-text-2);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    transition: border-color 0.25s, color 0.25s;
  }
}

.gh-star:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.gh-star__mark,
.gh-star__icon {
  flex-shrink: 0;
  fill: currentColor;
}

.gh-star__sep {
  width: 1px;
  height: 14px;
  margin: 0 2px;
  background: var(--vp-c-divider);
}

/* Kad badge plotis nesokinetu, kai skaicius pasikeicia. */
.gh-star__count {
  font-variant-numeric: tabular-nums;
}
</style>
