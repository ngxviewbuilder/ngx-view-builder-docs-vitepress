---
title: Pricing
description: The runtime that renders your views in production is free forever and never needs a license key. The builder is free to use today and becomes a licensed product at the 1.0.0 release.
sidebar: false
aside: false
pageClass: pricing-layout
lastUpdated: 2026-08-05
---

<div class="pricing-page">

# Pricing

<p class="pricing-page__lede">The runtime that renders your views in production is free and never needs a license key. The builder is free to use today, and becomes a licensed product at the 1.0.0 release.</p>

<div class="plans">

<div class="plan">
  <p class="plan__name">Free</p>
  <p class="plan__price"><span class="plan__amount">€0</span></p>
  <p class="plan__terms">no license key, no expiry</p>
  <p class="plan__summary">The runtime. Everything that renders your views to your users, in production, at no cost.</p>
  <a class="plan__cta plan__cta--ghost" href="/developers/installation">Install it now</a>
  <p class="plan__features-head">The runtime, free forever</p>
  <ul class="plan__features">
    <li>The complete runtime, nothing held back</li>
    <li>Unlimited apps, views and end users</li>
    <li>Commercial and production use</li>
    <li>Every runtime version, forever</li>
    <li>Bug reports and questions on GitHub</li>
  </ul>
</div>

<div class="plan plan--featured">
  <p class="plan__name">Base<span class="plan__flag">Free until 1.0.0</span></p>
  <p class="plan__price"><span class="plan__amount">€399</span></p>
  <p class="plan__terms">once, per developer<br>includes updates and support for the first 12 months</p>
  <p class="plan__summary">The builder. The visual editor your team designs those views in, on top of everything in Free.</p>
  <button class="plan__cta" disabled>Available at 1.0.0</button>
  <p class="plan__features-head">Everything in Free, plus</p>
  <ul class="plan__features">
    <li>The complete builder, nothing held back</li>
    <li>No watermarks, nag screens or license banners</li>
    <li>Perpetual license<span>Every builder version released during your 12 months keeps working forever.</span></li>
    <li>Elements, functions or plugins built on request<span>When they make sense for everyone using the library.</span></li>
    <li>Support for 12 months</li>
  </ul>
</div>

</div>

<p class="plans__note"><strong>Nothing is for sale yet.</strong> Until the 1.0.0 release the builder is free for everyone, with no key and no watermark. The price is published now only so you can plan a budget around it. Checkout opens at 1.0.0.</p>

## What the license actually covers

The paid license does not unlock hidden features. The free build and the licensed build are the same package. What you pay for is the right to use the builder, the visual editor your team designs views in, without a watermark, and to keep the versions released during your license term.

The runtime is a separate matter. It renders your views to your end users, it never checks a license, and it never expires, in any version, before or after 1.0.0. Shipping it to production and to your customers costs nothing. That is not a beta promotion, it is the model.

## What changes at 1.0.0

- The builder starts requiring a license key. **The runtime is not affected and never will be.**
- Pre-1.0.0 builder versions stay free to keep using.
- Without a key, the builder still runs in full, with a watermark on the canvas and a banner above it. See [what users see](/developers/licensing#what-users-see).
- Every builder version released during your 12 months keeps working, watermark-free, forever. Read the [full license terms](/developers/licensing).

## Questions?

Email **[support@ngxviewbuilder.io](mailto:support@ngxviewbuilder.io)**. Happy to talk through your use case ahead of launch, including team and volume pricing.

<p class="pricing-page__note">For bigger conversations (strategic partnerships, exclusive licensing, or acquiring the product outright) the same address reaches us directly.</p>

</div>

<style>
/* The plan cards need more than the 688px doc column; widen only this page
   (pageClass) and keep the prose blocks below capped for readability. */
.pricing-layout .VPContent .VPDoc .container,
.pricing-layout .VPContent .VPDoc .content,
.pricing-layout .VPContent .VPDoc .content-container {
  max-width: 1152px;
}

.pricing-page > h1,
.pricing-page > h2,
.pricing-page > p,
.pricing-page > ul {
  max-width: 780px;
}

.pricing-page__lede {
  font-size: 17px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.plans {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin: 44px 0 20px;
  align-items: start;
}

.plan {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 32px 32px 36px;
}

.plan--featured {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  box-shadow: 0 14px 34px -22px rgba(12, 32, 90, 0.34);
}

.dark .plan--featured {
  box-shadow: 0 18px 40px -24px rgba(0, 0, 0, 0.7);
}

.plan__name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin: 0 0 16px;
}

.plan__flag {
  font-family: var(--vp-font-family-base);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.plan__price {
  margin: 0 0 8px;
}

.plan__amount {
  font-size: 46px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--vp-c-text-1);
}

.plan__terms {
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

.plan__summary {
  margin: 0 0 24px;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  min-height: 48px;
}

.plan__cta {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #fff;
  background: var(--vp-c-brand-1);
}

.plan__cta:disabled {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-soft);
  cursor: not-allowed;
}

.plan a.plan__cta--ghost {
  background: transparent;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.plan a.plan__cta--ghost:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.plan__features-head {
  margin: 28px 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
  font-weight: 650;
  color: var(--vp-c-text-1);
}

.plan ul.plan__features {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

/* The line right after the check mark is the claim, so it carries the weight;
   anything qualifying it drops to a quieter second line. */
.plan__features li {
  margin: 0;
  position: relative;
  padding-left: 24px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 650;
  color: var(--vp-c-text-1);
}

.plan__features li span {
  display: block;
  margin-top: 3px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

/* A check mark, drawn rather than an emoji, so it inherits the brand colour
   and stays crisp in both themes. */
.plan__features li::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 5px;
  width: 5px;
  height: 9px;
  border: solid var(--vp-c-brand-1);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.plans__note {
  max-width: 780px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-soft);
  background: var(--vp-c-brand-soft);
}

.pricing-page__note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

@media (max-width: 860px) {
  .plans {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .plan {
    padding: 26px 22px 30px;
  }
  .plan__summary {
    min-height: 0;
  }
}
</style>
