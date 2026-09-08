---
title: Architecture
description: How the runtime and designer packages, the shared core, and plugins fit together.
---

# Architecture

## Two packages

The library is published as two npm packages that split it along the line between
designing a view and running one.

```
ngx-view-builder-runtime            free, no license key
├─ ngx-view-builder-runtime/        runtime shell (rendering + runtime services)
├─ ngx-view-builder/                unified host component
├─ ngx-view-builder-renderer/       low-level renderer
├─ ngx-view-builder-validator/      headless validation component
└─ core/
   ├─ runtime/    rendering helpers, lazy element loading
   └─ shared/     models, the 55 elements, services, providers, expressions

ngx-view-builder-designer           commercial license
├─ ngx-view-builder-designer/       designer shell (tabs, sidebars, history)
└─ builder/                         drag & drop, property editing, registries,
                                    datasets, license service
```

Roughly 72% of the code sits in the runtime, including every element and the whole
service layer: expressions, data sources, validation, i18n, rules and process. The
designer is the remaining 28%, and it is all editor UI.

Dependencies point one way only. The designer imports the runtime; the runtime knows
nothing about the designer and never loads it. That was already true inside the old
single package, which is what made the split a packaging change rather than a rewrite.

Optional plugins are sibling npm packages (`ngx-view-builder-plugin-*`) that register
builder tabs and feature packs through the extensions API. They sit on top of the
designer, since a tab needs an editor to appear in. The core never auto-loads them.

### Why the packages are split

Both halves used to ship as one `ngx-view-builder` package. That put two costs on
applications that only render views, which is most of them:

- **Code they never run.** The editor was installed and resolved even when no user
  could ever open it.
- **A license they do not need.** The runtime is free forever and needs no key, but a
  single package meant a single `LICENSE.md`, and it read as commercial software.
  Procurement reviews the package, not your intentions.

Splitting them also moved `license.service.ts` where it belongs. It used to live in
`core/shared`, which is the half that is free forever, so the free runtime carried the
code that enforced payment for the other half. It now lives in the designer.

The two packages are versioned in lockstep and the designer's peer dependency pins the
exact runtime version, so they cannot drift apart.

### One runtime instance, not two

The designer re-exports the runtime's public surface so a host that embeds the editor
has a single import site. This is a re-export, never a bundled copy: the runtime stays
an external package that both resolve to.

That distinction matters more than it looks. Services like `EventService` and
`NgxViewBuilderApiService` are root-provided singletons. If the runtime were duplicated
into the designer's bundle, Angular would see two distinct classes and create two
instances, and the editor would quietly stop hearing the runtime's events. The
published builds are checked for this: the designer's bundle imports the runtime rather
than inlining it.

### Public and internal surface

The runtime exports two tiers. The documented surface is what host applications build
against and follows semver. Below it, a section marked `Internal API` exports the
components, registries and services the designer needs to do its job. Those are
reachable, but they change without a major version, and code that imports them is
choosing to track the designer's release cycle.

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

## Designer vs. runtime boundary

Designer-side code (property sidebars, drag & drop, datasets) is never needed to
*render* a view. If your end-user app only displays views, it installs
`ngx-view-builder-runtime` alone and pays no editor cost at all: not in the bundle, not
in the dependency tree, and not in licensing. Lazy element rendering and preloading are
tunable on top of that.

The boundary is worth keeping in mind when you split your own application, too. A
common shape is one internal admin app that installs both packages and hosts the
editor, and one or more customer-facing apps that install the runtime only and render
the JSON the first one produced.
