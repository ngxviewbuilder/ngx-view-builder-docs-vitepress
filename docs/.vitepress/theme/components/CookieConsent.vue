<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getStoredConsent, setConsent } from '../analytics';

const visible = ref(false);

onMounted(() => {
  visible.value = getStoredConsent() === null;
});

function accept(): void {
  setConsent(true);
  visible.value = false;
}

function decline(): void {
  setConsent(false);
  visible.value = false;
}
</script>

<template>
  <div v-if="visible" class="cookie-consent" role="dialog" aria-label="Cookie consent">
    <p class="cookie-consent__text">
      We use Google Analytics to see how these docs are used. Nothing is loaded or set until you
      accept. See the <a href="/privacy">privacy policy</a>.
    </p>
    <div class="cookie-consent__actions">
      <button type="button" class="cookie-consent__decline" @click="decline">Decline</button>
      <button type="button" class="cookie-consent__accept" @click="accept">Accept</button>
    </div>
  </div>
</template>

<style scoped>
.cookie-consent {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 300;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  max-width: 640px;
  margin: 0 auto;
  padding: 14px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.cookie-consent__text {
  flex: 1 1 260px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.cookie-consent__text a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.cookie-consent__actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
  margin-left: auto;
}

.cookie-consent__decline,
.cookie-consent__accept {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.cookie-consent__decline {
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}

.cookie-consent__decline:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.cookie-consent__accept {
  color: #fff;
  background: var(--vp-c-brand-1);
}

.cookie-consent__accept:hover {
  background: var(--vp-c-brand-2);
}
</style>
