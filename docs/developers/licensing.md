---
title: Licensing
description: "How NGX View Builder licensing works: what is free, how to supply and validate the license key, perpetual fallback, and what end users see."
---

# Licensing

> Licenses are on sale at [console.ngxviewbuilder.io/purchase](https://console.ngxviewbuilder.io/purchase). The builder asks for a key from 1.0.0; every builder version released before it stays free. Before you buy, read the [Terms of Sale](/terms) and the [Refund Policy](/refund).

**The runtime is free forever and never requires a license key, at 1.0.0 or any version after.** The same goes for the Templates plugin. Everything else on this page describes the commercial license for the builder and its other plugins.

Since 0.5.0 that split is enforced by packaging rather than by promise. `@ngxviewbuilder/runtime`
and `@ngxviewbuilder/designer` are separate npm packages with separate license files:

| Package | `LICENSE.md` |
| --- | --- |
| `@ngxviewbuilder/runtime` | Proprietary but free, perpetual, no key. Commercial and client work allowed. You may not resell it on its own, build a competing product from it, or build a visual editor on top of it. |
| `@ngxviewbuilder/designer` | The commercial agreement described on this page. |
| `@ngxviewbuilder/plugin-templates` | Proprietary but free, perpetual, no key, like the runtime. It plugs into the designer, which keeps its own license. |
| `@ngxviewbuilder/plugin-logic-map`, `@ngxviewbuilder/plugin-docs`, `@ngxviewbuilder/plugin-openapi`, `@ngxviewbuilder/plugin-shared` | Commercial, under the designer's agreement, on the same license key. |

An application that only renders views therefore installs no commercially licensed code
at all, which is the answer to the question procurement usually asks first. Writing the
view JSON by hand, or generating it with an AI agent, is explicitly allowed by the
runtime license: what you cannot do is ship your own editor UI on top of it.

## Is this open source?

**No.** None of the packages is open source (not MIT, Apache, GPL, or any OSI-approved license). The runtime and the Templates plugin are free to use but proprietary; the designer and the other plugins are commercial. Installing them from npm gives you the right to use them under the terms in each package's `LICENSE.md`. It does not grant a license to fork, redistribute, or build a competing product from them.

If you've used commercial component libraries before, the model will feel familiar: install from the public npm registry, evaluate for free with a watermark, unlock full use with a paid key.

**Attempting to remove, disable, or circumvent the license check (the watermark, the signature validation, or the server check) is a breach of the license agreement**, regardless of how it's done (patching the package, monkey-patching at runtime, stripping the check at build time, etc.). See [Restrictions](#license-terms) below.

## Supplying the key

The key is read by the designer. There is nowhere to put one in a runtime-only
application, and nothing there would check it.

Pass it through `runtimeSettings`:

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

The reminder modal can be closed with **Continue without updates** (or **Continue without license** when the key does not check out) once a 15 second countdown on the button has run out.

**The runtime never shows any license UI.** Rendering views in production is unaffected; license messaging is builder-facing only. The check itself lives in the designer package, so a runtime-only application does not even ship the code that draws a watermark.

## AI access

Letting an AI assistant work in the builder over MCP comes with the license, there is nothing extra to buy. It is also the one part that needs a key in builder versions before 1.0.0 too. The builder only opens the connection for a key that is genuine and not expired, whether it goes to our hosted server through the **Connect** button or to [a server you run yourself](./ai-command-api#running-the-mcp-server). Without such a key the AI access (MCP) group in the settings says what is missing. Our hosted server also checks the key with the license service before it pairs anything, and again every hour. It lets as many browsers use AI access at the same time as the license has seats (see [Seats](./ai-command-api#seats)). The server only relays requests between the AI client and the builder and stores none of your views or data ([what it keeps](./ai-command-api#what-the-mcp-server-keeps)).

## Licensed plugins

The [Logic map](./plugin-logic-map), [Documentation](./plugin-docs) and [OpenAPI](./plugin-openapi) plugins come with the license as well. Like AI access, they need a key in builder versions before 1.0.0 too: their tab and panel open for a key that is genuine and not expired, and otherwise say what is missing and where the key goes. The check is the one AI access uses in the builder: the key's signature and its expiry date, done in the browser with no network call, so it works in air-gapped environments too. The public demo runs them without a key. The Templates plugin needs no key.

To know in your own code whether the key unlocks them, read `proAccess` on the designer's `LicenseService`. It is a signal that holds `'ready'` once the key checks out, `'checking'` while the check runs, and `'missing'`, `'invalid'` or `'expired'` otherwise:

```ts
import { LicenseService } from '@ngxviewbuilder/designer';

const license = inject(LicenseService);
const unlocked = computed(() => license.proAccess() === 'ready');
```

The licensed plugins wrap their own screens in `<nvb-pro-feature-gate>` from `@ngxviewbuilder/plugin-shared`. It shows what is inside it while the key unlocks them, and otherwise explains what is missing and where the key goes, in the builder's language. `feature` names the feature in that explanation, and `compact` fits it into the Properties panel:

```html
<nvb-pro-feature-gate feature="Logic map">
  <my-logic-view />
</nvb-pro-feature-gate>
```

## License terms

The designer is **commercial software**, distributed under the NGX View Builder Commercial License Agreement, and the full text ships as `LICENSE.md` inside the published npm package (also shown on the npm package page). The runtime package ships its own, free license text instead. In short: a paid key covers all versions released during your license term perpetually; **client work is included and either side can hold the license**: an agency's key covers the applications it builds for its clients, or the end customer buys the key and it covers contractors developing their application (operating a delivered application never needs a key); evaluation without a key is free but watermarked; redistributing the library on its own or circumventing license enforcement is prohibited. The open-source parts keep their own licenses, listed under [Open-source components](#open-source-components).

## Open-source components

NGX View Builder stands on a few open-source libraries, and we are grateful to the people who write them. They come into your project as ordinary npm dependencies of our packages, each one stays under its own license, and its license text sits in its own folder in `node_modules`. Our licenses cover our code only, never theirs.

| Component | What it does here | License | Installed with |
| --- | --- | --- | --- |
| [Jexl](https://github.com/TomFrost/Jexl) | Evaluates expressions: `visibleIf`, `expression`, `disableIf` and the other logic properties | MIT | runtime |
| [Lodash](https://lodash.com) (`lodash-es`) | Reads and writes values by path and compares them | MIT | runtime, designer |
| [CodeMirror](https://codemirror.net) (`@codemirror/*`, `@lezer/highlight`) | The code editor for JSON, expressions, templates, HTML, CSS and JavaScript, and the side by side JSON comparison | MIT | designer |
| [Prettier](https://prettier.io) | Formats code in the editor and template HTML | MIT | designer, Templates plugin |
| [tslib](https://github.com/microsoft/tslib) | TypeScript helper functions used by the compiled code | 0BSD | every Angular package |
| [Material Symbols](https://github.com/google/material-design-icons) | The built-in icons, embedded in the runtime as SVG | Apache 2.0 | runtime |

The self hosted MCP server (`ngx-view-builder-mcp`, see [AI command API](./ai-command-api)) adds four more, all MIT: the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) for the protocol, [Express](https://expressjs.com) for HTTP, [ws](https://github.com/websockets/ws) for the connection to the builder tab, and [Zod](https://zod.dev) for checking tool arguments.

Angular, the Angular CDK and RxJS are peer dependencies, so they come from your own application, also under MIT.

## Notes

- Keep the key out of client repositories where possible; inject it from environment configuration.
- The `domain` sent to the validation server is `window.location.hostname`; issue keys per environment if you validate domains.

Licensing questions: **[info@heydelabs.com](mailto:info@heydelabs.com)**.
