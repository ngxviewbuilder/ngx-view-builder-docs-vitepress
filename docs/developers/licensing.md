---
title: Licensing
description: Supplying and validating the license key.
---

# Licensing

> NGX View Builder is in public beta, so licenses aren't for sale yet. See [Pricing](/pricing) for current status. Everything below describes the license model you'll buy into at launch.

**The runtime is free forever and never requires a license key, at 1.0.0 or any version after.** Everything on this page describes the commercial license for the builder only.

## Is this open source?

**No.** NGX View Builder is commercial software, not open source (not MIT, Apache, GPL, or any OSI-approved license). Installing it from npm gives you the right to use it under the terms below. It does not grant a license to fork, redistribute, or build a competing product from it.

If you've used commercial component libraries before, the model will feel familiar: install from the public npm registry, evaluate for free with a watermark, unlock full use with a paid key.

**Attempting to remove, disable, or circumvent the license check (the watermark, the signature validation, or the server check) is a breach of the license agreement**, regardless of how it's done (patching the package, monkey-patching at runtime, stripping the check at build time, etc.). See [Restrictions](#license-terms) below.

## Supplying the key

Pass the license key through `runtimeSettings`:

```ts
readonly builderSettings: INgxViewBuilderBuilderSettings = {
  licenseKey: 'NVB-eyJjdXN0b21lcklkIjo...',
};
```

```html
<ngx-view-builder-builder [runtimeSettings]="builderSettings" ... />
```

## How validation works

1. **Local check**: the key embeds `customerId`, `plan`, and `expiresAt`; version coverage is checked immediately (see below).
2. **Offline signature check**: keys are ECDSA P-256 signed; the builder verifies the signature against an embedded public key (WebCrypto). Tampered or self-made keys are treated as invalid. No network required.
3. **Server check**: the builder additionally calls the official license service (fixed, non-configurable URL) with `{ key, domain }`. The result is cached in localStorage for 7 days; network failures fall back silently to the local checks, so air-gapped environments keep working. A revoked key always shows the watermark.

## Version coverage (perpetual fallback)

Every published build embeds its release date. A license covers **all versions released before its `expiresAt`**, permanently:

- While the license is active, every update is covered.
- After the license expires, the versions you already use **keep working forever, without a watermark**.
- Versions released *after* the license expired run in degraded mode (watermark) until the license is renewed, so installing the latest package from npm without an active license does not grant access to new features.

## What users see

| State | UI |
| --- | --- |
| Valid for this version | Nothing |
| **No key supplied** | A diagonal “NO LICENSE” watermark across the builder canvas + a banner |
| Version not covered (released after license expiry) | The canvas watermark + a banner + a reminder modal (at most once per 24 h) |
| Invalid / tampered / unparseable / revoked | The canvas watermark + an invalid-license banner + modal (at most once per 24 h) |

**The runtime never shows any license UI.** Rendering views in production is unaffected; license messaging is builder-facing only.

## License terms

NGX View Builder is **commercial software**, distributed under the NGX View Builder Commercial License Agreement, and the full text ships as `LICENSE.md` inside every published npm package (also shown on the npm package page). In short: a paid key covers all versions released during your license term perpetually; **client work is included and either side can hold the license**: an agency's key covers the applications it builds for its clients, or the end customer buys the key and it covers contractors developing their application (operating a delivered application never needs a key); evaluation without a key is free but watermarked; redistributing the library on its own or circumventing license enforcement is prohibited. The open-source dependencies the package installs (CodeMirror, Jexl, Prettier and Lodash under MIT; tslib under 0BSD) keep their own licenses.

## Notes

- Keep the key out of client repositories where possible; inject it from environment configuration.
- The `domain` sent to the validation server is `window.location.hostname`; issue keys per environment if you validate domains.

Licensing questions: **[support@ngxviewbuilder.io](mailto:support@ngxviewbuilder.io)**.
