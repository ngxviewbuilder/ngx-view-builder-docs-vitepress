<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import ComingSoonCard from './components/ComingSoonCard.vue';
import CookieConsent from './components/CookieConsent.vue';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-after>
      <ComingSoonCard />
    </template>
  </Layout>
  <CookieConsent />
</template>
