<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import CookieConsent from './components/CookieConsent.vue';
// Laikinai isjungtas GitHub zvaigzduciu badge.
// import GitHubStarBadge from './components/GitHubStarBadge.vue';
import NpmBadges from './components/NpmBadges.vue';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <!-- <GitHubStarBadge /> -->
      <NpmBadges />
    </template>
  </Layout>
  <CookieConsent />
</template>
