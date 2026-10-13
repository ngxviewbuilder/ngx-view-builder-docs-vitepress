---
title: Using plugins
description: The official plugins (Templates, Logic map, Documentation) and how the plugin system works.
---

# Using plugins

Plugins are separate npm packages that add builder tabs and capabilities. The core never bundles or auto-loads them: install what you need, register its provider, done.

```bash
npm install @ngxviewbuilder/plugin-templates
```

```ts
import { provideNgxViewBuilderTemplates } from '@ngxviewbuilder/plugin-templates';

providers: [ provideNgxViewBuilderTemplates() ],
```

## Official plugins

| Package                             | Provider                           | Adds                                                                                                                                                                                                                                                              |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ngxviewbuilder/plugin-templates` | `provideNgxViewBuilderTemplates()` | The **Templates** tab, holding the reusable HTML [template library](../creators/templates) used by option templates, card templates, row templates, and header templates full syntax and host persistence in the [Templates plugin reference](./plugin-templates) |
| `@ngxviewbuilder/plugin-logic-map` | `provideNgxViewBuilderLogicMap()` | The **Logic map** tab: every condition, calculation, event and data source of the view on one canvas, with what drives what and what needs attention ([creators](../creators/logic-map), [reference](./plugin-logic-map)) |
| `@ngxviewbuilder/plugin-docs` | `provideNgxViewBuilderDocs({ storage })` | Field documentation: a **Documentation** section in the Properties panel and a **Documentation** tab with a field reference ready for Confluence, kept apart from the view JSON ([creators](../creators/documentation), [reference](./plugin-docs)) |

The Logic map and the Documentation plugin need a license key in the builder settings ([Licensed plugins](./licensing#licensed-plugins)); the Templates plugin does not. Both install `@ngxviewbuilder/plugin-shared` with them, a small package with the logic analysis, the license notice and the plugin icons they share. You never add it yourself.

Every plugin text follows the builder's language; see [Translating the plugins](./ui-translations#translating-the-plugins).

## Where plugin tabs go

Builder, Preview and JSON Editor always come first in the header. Plugin tabs follow after a divider, in their `order`, as long as they fit; the rest move into a **More** menu that shows each tab's icon and a line about what it is for. When the open tab sits in the menu, the menu button takes its name. Nothing to configure: install a fourth or a tenth plugin and the header makes room.

## How gating works

A plugin registers a **feature pack** (id + capabilities + tabs, and optionally Properties panel sections).

Removing a plugin removes everything it added: the core holds only the generic places a plugin plugs into, never the plugin's own code. Parts of the core UI are capability-aware: the _Option template_ property on Select elements, for example, appears only when the Templates feature pack is present. So an uninstalled plugin cleanly hides everything that depends on it.

## Version rule

Keep every `@ngxviewbuilder/plugin-*` version aligned with the `@ngxviewbuilder/designer` version, which in turn pins its `@ngxviewbuilder/runtime` peer to the exact same number. All three move together; mixed versions are unsupported.

Want to build your own tab? See [Building a plugin](./plugin-development).
