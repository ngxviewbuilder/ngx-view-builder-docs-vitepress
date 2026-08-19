---
title: Installation
description: Install the package, register providers, and initialize the runtime.
---

# Installation

## Requirements

- Angular 22+ (`@angular/common`, `@angular/core`, `@angular/cdk` as peer dependencies)
- Node.js 22.22+ (or 24.15+ / 26+)

The library works with zoneless change detection and standalone components.

## Install

```bash
npm install ngx-view-builder
```

The optional Templates plugin is a separate package, version-locked to the core:

```bash
npm install ngx-view-builder-plugin-templates
```

## Minimal app config

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),   // required for REST data sources
    provideRouter(routes), // required for route variables & navigate actions
  ],
};
```

## Stylesheet

Each component carries its own scoped styles, but the design tokens and the shared element rules live in one global stylesheet. Import it once:

```css
@import 'ngx-view-builder/styles/index.css';
```

Leaving it out does not blank the UI, which is what makes it easy to miss. The components still render and still have their own layout, they simply lose every token: inputs come out around 26px instead of 40px, labels fall back to plain black, and surfaces turn transparent.

### Layer order

Everything in the stylesheet lives in `@layer reset, tokens, components, fpUtilities, elements`. Cascade layers only help if the host takes part in them, and two rules decide whether it does.

Unlayered CSS beats layered CSS whatever the specificity. A host that writes its styles outside any layer, which is the default for Tailwind v3 and for most hand written stylesheets, will override every rule the library ships.

A plain CSS `@import` is always hoisted to the top of the bundle, so the layer order cannot be fixed by moving the import line around. Declare the order yourself, in a stylesheet loaded before everything else:

```css
/* src/layers.css, with Tailwind as the example host */
@layer theme, base, reset, tokens, components, fpUtilities, elements, utilities;
```

```json
"styles": ["src/layers.css", "src/styles.scss"]
```

Our layers now sit after the host's base and reset, and the host's utilities still win over element styles, which is usually what you want.

### Name collisions

Every class and every custom property the library ships is prefixed with `nvb-`, so `nvb-field`, `nvb-dropdown`, `--nvb-color-neutral-300`. Nothing in the package answers to a generic name, which leaves you free to keep your own `.field` or `--color-neutral-300` meaning whatever they mean in your application.

## Initialization

Runtime services can be pre-warmed either with a provider:

```ts
import { provideNgxViewBuilderRuntime } from 'ngx-view-builder';

providers: [
  provideNgxViewBuilderRuntime({ preloadRuntimeServices: true }),
]
```

…or imperatively in a component:

```ts
import { ForgeInitializerService } from 'ngx-view-builder';

constructor() {
  inject(ForgeInitializerService).load({ preloadRuntimeServices: true });
}
```

Options:

| Option | What it does |
| --- | --- |
| `preloadRuntimeServices` | Instantiates structure/expression/validator services upfront |
| `exposeHeadlessValidationApi` | Publishes a global validation API (for headless/E2E use) |
| `headlessValidationApiKey` | The global key it registers under |

## Registering plugins

Installing a plugin package does nothing by itself. Register its provider:

```ts
import { provideNgxViewBuilderTemplates } from 'ngx-view-builder-plugin-templates';

providers: [
  provideNgxViewBuilderTemplates(),
]
```

Each registered plugin adds its tab to the builder automatically. See [Using plugins](./plugins).

## Import rule

Import only from package roots (`ngx-view-builder`, `ngx-view-builder-plugin-*`). Deep imports into `src/lib/...` are internal and break between releases.
