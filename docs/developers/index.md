---
title: Angular form & view builder for developers
description: Embed the Angular form and view builder, render saved views with a native runtime, and extend it with custom elements, functions, themes, and plugins.
---

# Introduction for developers

NGX View Builder is an Angular library with two halves, and each half is its own npm
package:

- **`ngx-view-builder-runtime`**: the engine that renders a saved view definition
  (JSON) to end users. Free forever, no license key.
- **`ngx-view-builder-designer`**: the visual editor your creators use to design those
  views. Commercially licensed, and it depends on the runtime.

Install one or both depending on what your app does. Most applications render views and
never open the editor, so they only need the runtime. See
[Installation](./installation) for the split, and
[Architecture](./architecture#two-packages) for why the line falls where it does.

You embed the components you need as standalone components, persist the JSON wherever
you like, and control everything else (data, theming, custom elements, plugins) through
providers and a typed API service.

## The five components

| Component | Selector | Package | Purpose |
| --- | --- | --- | --- |
| Designer | `<ngx-view-builder-designer>` | designer | Full editing shell: canvas, sidebars, tabs, history |
| Runtime | `<ngx-view-builder-runtime>` | runtime | Renders a view definition with live logic and data |
| Unified | `<ngx-view-builder>` | runtime | Runtime-oriented host that can also take a `BuilderModel` |
| Renderer | `<ngx-view-builder-renderer>` | runtime | Low-level renderer used by the unified wrapper |
| Validator | `<ngx-view-builder-validator>` | runtime | Headless validation for server-side scenarios |

## The flow

```
Creator designs in <ngx-view-builder-designer>       ← designer package
        │  (structureChanged) → IStructure JSON
        ▼
Your backend / storage
        │  [pageJson]
        ▼
<ngx-view-builder-runtime> renders to end users      ← runtime package
        │  values, events, validation
        ▼
Your app (via outputs and NgxViewBuilderApiService)
```

The JSON in the middle is the whole contract between the two packages, which is why an
app on either side of it can be deployed and licensed independently of the other.

## What you can extend

| Extension | How |
| --- | --- |
| Custom elements (component + model + properties) | [Custom elements](./custom-elements) |
| Expression functions | [Custom functions](./custom-functions) |
| Extra/changed element properties | [Custom properties](./custom-properties) |
| SVG icons | [Icons](./icons) |
| Theme tokens, light/dark palettes | [Theming](./theming) |
| Builder UI language | [UI translations](./ui-translations) |
| Whole builder tabs | [Plugins](./plugin-development) |

## Reading order

1. [Installation](./installation): which packages to install, providers, initialization.
2. [Embedding the builder](./builder-integration) and [Rendering views](./runtime-integration).
3. [API service overview](./api-service): the programmatic surface.
4. [Extensions overview](./extensions): one config object for everything custom.
