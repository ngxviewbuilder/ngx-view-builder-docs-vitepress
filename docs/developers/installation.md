---
title: Installation
description: Install the package, register providers, and initialize the runtime.
---

# Installation

## Requirements

- Angular 22+ (`@angular/common`, `@angular/core`, `@angular/cdk` as peer dependencies;
  the designer additionally needs `@angular/forms`)
- Node.js 22.22+ (or 24.15+ / 26+)

The library works with zoneless change detection and standalone components.

## The two packages

NGX View Builder ships as two npm packages, and which ones you install depends on
what your application does.

| Package | You need it when | License |
| --- | --- | --- |
| `ngx-view-builder-runtime` | Your app renders saved views | Free forever, no key |
| `ngx-view-builder-designer` | Your app also hosts the visual editor | Commercial |

The runtime stands on its own. The designer does not: it declares the runtime as a
peer dependency pinned to the exact same version, because both halves are built from
one source tree and released together.

**Rendering views only**, which is the common case for the applications your end users
open:

```bash
npm install ngx-view-builder-runtime
```

**Hosting the editor as well.** Installing the designer pulls in the runtime, so name
both and npm keeps the versions honest:

```bash
npm install ngx-view-builder-runtime ngx-view-builder-designer
```

The optional Templates plugin is a third package, version-locked to the designer:

```bash
npm install ngx-view-builder-plugin-templates
```

### Why it is split

Up to and including 0.4.1 both halves lived in one `ngx-view-builder` package. An application that
only rendered views still installed the whole visual editor, roughly 28% of the code
it would never execute, under a commercial license it did not need. Splitting the
package means a runtime-only application now installs neither the editor code nor the
license terms that come with it.

If you are upgrading from `ngx-view-builder`, see [Migrating from the single
package](#migrating-from-the-single-package) at the bottom of this page.

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

Each component carries its own scoped styles, but the design tokens and the shared element rules live in one global stylesheet. It ships with the runtime and covers both packages, so the path is the same whether or not you installed the designer. Import it once:

```css
@import 'ngx-view-builder-runtime/styles/index.css';
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
import { provideNgxViewBuilderRuntime } from 'ngx-view-builder-runtime';

providers: [
  provideNgxViewBuilderRuntime({ preloadRuntimeServices: true }),
]
```

…or imperatively in a component:

```ts
import { ForgeInitializerService } from 'ngx-view-builder-runtime';

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

Plugins extend the editor, so they depend on `ngx-view-builder-designer` rather than on
the runtime. A runtime-only application has nothing to register them into.

## Which package to import from

Both packages export from their root, and the designer re-exports the entire runtime
surface. That gives you a simple rule:

- **Runtime-only app**: import everything from `ngx-view-builder-runtime`.
- **App that hosts the editor**: import everything from `ngx-view-builder-designer`.
  Structures, models and the API service all come through it, so you keep one import
  site instead of two. Nothing is duplicated in your bundle, because the runtime
  remains a separate package that both resolve to.

Import only from package roots. Deep imports into `src/lib/...` are internal and break
between releases.

The runtime also exports a block of symbols marked `Internal API` in its `public-api.ts`.
Those exist so the designer can reach into the runtime; they carry no stability
guarantee and change without a major version. Build against the documented surface.

## Migrating from the single package

Views themselves are unaffected. Your stored JSON, structures and data need no
migration; this is a packaging change, not a schema change.

1. Uninstall `ngx-view-builder` and install the packages you actually need, as above.
2. Rewrite imports. In an app that only renders views, `from 'ngx-view-builder'`
   becomes `from 'ngx-view-builder-runtime'`. In an app that hosts the editor, use
   `from 'ngx-view-builder-designer'` in the files that touch the editor, and the
   runtime package elsewhere.
3. Update the stylesheet path to `ngx-view-builder-runtime/styles/index.css`. The
   tokens and element rules live in the runtime, so it stays the same file whichever
   packages you installed.
4. If you use the Templates plugin, its peer dependency now points at the designer.
5. Optionally rename the editor component. Since 0.5.1 it is
   `<ngx-view-builder-designer>` / `NgxViewBuilderDesigner`, so that it matches its
   package. The old `<ngx-view-builder-builder>` selector and `NgxViewBuilderBuilder`
   class name are kept as aliases, so this step can wait.

One thing worth checking after the move: `licenseKey` belongs to the designer. It was
previously accepted by a package that also contained the free runtime, which made it
easy to set in the wrong place. A runtime-only application never needs a key and never
shows license UI.
