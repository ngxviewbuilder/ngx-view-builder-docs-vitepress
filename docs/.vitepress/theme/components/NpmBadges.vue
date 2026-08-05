<script setup lang="ts">
// Navbar badge salia GitHubStarBadge: [npm] npm | <versija>.
//
// Stilius tycia toks pat kaip GitHubStarBadge, tik scoped stiliai per komponentus
// nepersiduoda, tad klases cia savos.
import { computed, onMounted, ref } from 'vue';

const PACKAGE = 'ngx-view-builder';
const PACKAGE_URL = `https://www.npmjs.com/package/${PACKAGE}`;

// Tas pats dviguba cache kaip zvaigzduciu badge: modulyje SPA navigacijai ir
// localStorage perkrovimams. npm registry limitu neriboja taip grieztai kaip
// GitHub, bet badge yra kiekviename puslapyje, tad uzklausu neverta kartoti.
const VERSION_CACHE_KEY = 'nvb:npm-version';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cachedVersion: string | null = null;

const version = ref<string | null>(cachedVersion);

const versionLabel = computed(() => (version.value ? `v${version.value}` : ''));

function readCached<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw);
    if (!isValid(value) || typeof at !== 'number') return null;
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return value;
  } catch {
    return null; // sugadintas irasas arba uzdrausta saugykla
  }
}

function writeCached(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // Privatus rezimas ar pilna saugykla - badge veikia ir be cache.
  }
}

const isString = (value: unknown): value is string => typeof value === 'string';

async function loadVersion(): Promise<void> {
  if (cachedVersion !== null) return;

  const stored = readCached(VERSION_CACHE_KEY, isString);
  if (stored !== null) {
    cachedVersion = stored;
    version.value = stored;
    return;
  }

  try {
    const res = await fetch(`https://registry.npmjs.org/${PACKAGE}/latest`);
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.version !== 'string') return;

    cachedVersion = data.version;
    version.value = cachedVersion;
    writeCached(VERSION_CACHE_KEY, cachedVersion);
  } catch {
    // Be reiksmes badge lieka tik su pavadinimu, nuoroda vis tiek veikia.
  }
}

onMounted(() => {
  void loadVersion();
});
</script>

<template>
  <a
    class="npm-badge"
    :href="PACKAGE_URL"
    target="_blank"
    rel="noopener"
    :aria-label="
      version === null
        ? 'ngx-view-builder on npm'
        : `ngx-view-builder on npm, version ${version}`
    "
  >
    <svg class="npm-badge__mark" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
      />
    </svg>
    <span class="npm-badge__name">npm</span>

    <!-- Reiksmes dalis rodoma tik ja gavus: kitaip liktu kabantis skirtukas. -->
    <template v-if="version !== null">
      <span class="npm-badge__sep" aria-hidden="true"></span>
      <svg class="npm-badge__icon" width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
        />
      </svg>
      <span class="npm-badge__value">{{ versionLabel }}</span>
    </template>
  </a>
</template>

<style scoped>
/*
 * Slepiami tuose paciuose plociuose kaip GitHubStarBadge ir numatytosios
 * VitePress socialLinks ikonos.
 */
.npm-badge {
  display: none;
}

@media (min-width: 768px) {
  .npm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    margin-left: 8px;
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

.npm-badge:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.npm-badge__mark,
.npm-badge__icon {
  flex-shrink: 0;
  fill: currentColor;
}

.npm-badge__sep {
  width: 1px;
  height: 14px;
  margin: 0 2px;
  background: var(--vp-c-divider);
}

/* Kad badge plotis nesokinetu, kai reiksme pasikeicia. */
.npm-badge__value {
  font-variant-numeric: tabular-nums;
}
</style>
