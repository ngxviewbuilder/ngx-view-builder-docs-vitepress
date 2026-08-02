<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import ComingSoonCard from './components/ComingSoonCard.vue';
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
    <template #home-hero-after>
      <ComingSoonCard />
    </template>
  </Layout>
  <CookieConsent />
</template>
