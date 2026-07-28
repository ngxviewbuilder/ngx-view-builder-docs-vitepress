---
title: Using plugins
description: The official Templates plugin and how the plugin system works.
---

# Using plugins

Plugins are separate npm packages that add builder tabs and capabilities. The core never bundles or auto-loads them: install what you need, register its provider, done.

```bash
npm install ngx-view-builder-plugin-templates
```

```ts
import { provideNgxViewBuilderTemplates } from 'ngx-view-builder-plugin-templates';

providers: [ provideNgxViewBuilderTemplates() ],
```

## Official plugins

| Package                             | Provider                           | Adds                                                                                                                                                                                                                                                              |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ngx-view-builder-plugin-templates` | `provideNgxViewBuilderTemplates()` | The **Templates** tab, holding the reusable HTML [template library](../creators/templates) used by option templates, card templates, row templates, and header templates full syntax and host persistence in the [Templates plugin reference](./plugin-templates) |

## How gating works

A plugin registers a **feature pack** (id + capabilities + tabs). Parts of the core UI are capability-aware: the _Option template_ property on Select elements, for example, appears only when the Templates feature pack is present. So an uninstalled plugin cleanly hides everything that depends on it.

## Version rule

Keep every `ngx-view-builder-plugin-*` version aligned with the core `ngx-view-builder` version. Mixed versions are unsupported.

Want to build your own tab? See [Building a plugin](./plugin-development).
