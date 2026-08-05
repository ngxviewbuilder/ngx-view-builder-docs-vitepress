---
title: Architecture
description: How the builder, runtime, shared core, and plugins fit together.
---

# Architecture

## Package layout

```
ngx-view-builder
├─ ngx-view-builder-builder/    builder shell (tabs, sidebars, history)
├─ ngx-view-builder-runtime/    runtime shell (rendering + runtime services)
├─ ngx-view-builder/            unified host component
├─ ngx-view-builder-renderer/   low-level renderer
├─ ngx-view-builder-validator/  headless validation component
└─ core/
   ├─ builder/    builder-only: drag & drop, property editing, registries, datasets
   ├─ runtime/    runtime-only: rendering helpers, lazy element loading
   └─ shared/     both sides: models, elements, services, providers, expressions
```

Optional plugins are sibling npm packages (`ngx-view-builder-plugin-*`) that register builder tabs and feature packs through the extensions API. The core never auto-loads them.

## Key concepts

### Structure (`IStructure`)

The single JSON document that describes a view: `settings`, `pages` (layout as rows/columns), `elements` (flat map of element configs keyed by name), `dataSources`, and `localization`. The builder edits it; the runtime executes it. Reference: [Structure JSON](./structure-json).

### Element model

Every element type has a model class extending `ElementBaseModel` (name, label, type, widths, logic fields, value) and an Angular component that renders it. Built-ins live in `core/shared/elements`; you add your own via [custom elements](./custom-elements).

### Data

Runtime values live in a data object keyed by element name (nested for repeaters: `addresses[0].city`). Reads and writes flow through the data service, which fires value-change events that drive expression re-evaluation.

### Expressions

Logic strings (`visibleIf`, `expression`, …) are evaluated with [JEXL](https://github.com/TomFrost/Jexl). The expression service tracks dependencies between elements and re-evaluates dependents in topological order when a value changes. `{tokens}` compile to `getVal()` lookups; `row.`/`panel.` prefixes resolve against the element's position in repeaters.

### Host API

`NgxViewBuilderApiService` (root-provided) is the façade the host app uses: get/set structure and data, look up elements, react to 59 typed events, register extensions at runtime, control theming and language. Reference: [API service](./api-service).

## Render pipeline

1. Structure JSON is parsed into element models (`flatModelMap`).
2. Runtime variables resolve (route, external, constants, data sources).
3. Default values apply; expressions evaluate in dependency order.
4. Pages render rows → columns → element components (optionally lazily).
5. User input → data service → dependent expressions → validation → events.

## Builder vs. runtime boundary

Builder-side code (property sidebars, drag & drop, datasets) is never needed to *render* a view. If your end-user app only displays views, you ship the runtime component and pay no builder cost at runtime (lazy element rendering and preloading are tunable).
