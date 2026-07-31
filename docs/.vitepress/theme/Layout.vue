<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import ComingSoonCard from './components/ComingSoonCard.vue';
import CookieConsent from './components/CookieConsent.vue';
import GitHubStarBadge from './components/GitHubStarBadge.vue';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <GitHubStarBadge />
    </template>
    <template #home-hero-after>
      <ComingSoonCard />
    </template>
  </Layout>
  <CookieConsent />
</template>
