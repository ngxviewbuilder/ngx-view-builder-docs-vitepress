---
title: Angular form & view builder for developers
description: Embed the Angular form and view builder, render saved views with a native runtime, and extend it with custom elements, functions, themes, and plugins.
---

# Introduction for developers

NGX View Builder is an Angular library with two halves:

- **Builder**: the visual editor your creators use to design views.
- **Runtime**: the engine that renders a saved view definition (JSON) to end users.

You embed one or both as standalone components, persist the JSON wherever you like, and control everything else (data, theming, custom elements, plugins) through providers and a typed API service.

## The five components

| Component | Selector | Purpose |
| --- | --- | --- |
| Builder | `<ngx-view-builder-builder>` | Full editing shell: canvas, sidebars, tabs, history |
| Runtime | `<ngx-view-builder-runtime>` | Renders a view definition with live logic and data |
| Unified | `<ngx-view-builder>` | Runtime-oriented host that can also take a `BuilderModel` |
| Renderer | `<ngx-view-builder-renderer>` | Low-level renderer used by the unified wrapper |
| Validator | `<ngx-view-builder-validator>` | Headless validation for server-side scenarios |

## The flow

```
Creator designs in <ngx-view-builder-builder>
        │  (structureChanged) → IStructure JSON
        ▼
Your backend / storage
        │  [pageJson]
        ▼
<ngx-view-builder-runtime> renders to end users
        │  values, events, validation
        ▼
Your app (via outputs and NgxViewBuilderApiService)
```

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

1. [Installation](./installation): package, providers, initialization.
2. [Embedding the builder](./builder-integration) and [Rendering views](./runtime-integration).
3. [API service overview](./api-service): the programmatic surface.
4. [Extensions overview](./extensions): one config object for everything custom.
