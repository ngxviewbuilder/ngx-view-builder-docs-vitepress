<script setup lang="ts">
// "Coming soon" kortele iskart po hero, matoma atidarius puslapi be scroll.
</script>

<template>
  <div class="coming-soon-card">
    <div class="coming-soon-card__badge">Public beta</div>
    <h2 class="coming-soon-card__title">NGX View Builder is in public beta</h2>
    <p class="coming-soon-card__text">
      Build and test with the full builder and runtime for free, right now, in the
      <a href="/demo">live demo</a>. Commercial licenses aren't for sale yet. We're finishing
      pricing and checkout before general availability. See the
      <a href="/pricing">pricing page</a> for current status.
    </p>
  </div>
</template>

<style scoped>
.coming-soon-card {
  margin: 8px auto 40px;
  max-width: 1152px;
  padding: 28px 36px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg-alt) 100%);
  text-align: center;
}

@media (min-width: 640px) {
  .coming-soon-card {
    margin: 12px 48px 40px;
  }
}

@media (min-width: 960px) {
  .coming-soon-card {
    margin: 12px 64px 40px;
  }
}

@media (min-width: 1280px) {
  .coming-soon-card {
    margin: 12px auto 40px;
  }
}

.coming-soon-card__badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.coming-soon-card__title {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
}

.coming-soon-card__text {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
  color: var(--vp-c-text-2);
}

.coming-soon-card__text a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}
</style>
