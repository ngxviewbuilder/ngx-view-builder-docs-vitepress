---
title: Installation
description: Install the package, register providers, and initialize the runtime.
---

# Installation

## Requirements

- Angular 21+ (`@angular/common`, `@angular/core`, `@angular/cdk` as peer dependencies)
- Node.js 20+

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

Component styles ship with the components themselves, so no global stylesheet import is required. Standalone CSS entry points are exported for advanced setups (e.g. styling outside the components):

```css
@import 'ngx-view-builder/styles/index.css';
```

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
