---
title: Logic map plugin
description: Install the Logic map tab, its license rule, translations and what AI clients can do with it.
---

# Logic map plugin

`@ngxviewbuilder/plugin-logic-map` adds the **Logic map** tab: every condition, calculation, validator, event action, data source, variable and view rule of the open view on one canvas, with what drives what and what needs attention. How creators use it is on the [Logic map](../creators/logic-map) page.

## Install

```bash
npm install @ngxviewbuilder/plugin-logic-map
```

```ts
import { provideNgxViewBuilderLogicMap } from '@ngxviewbuilder/plugin-logic-map';

providers: [provideNgxViewBuilderLogicMap()],
```

That is all: the plugin reads the view in the builder and keeps itself current as it changes. It brings `@ngxviewbuilder/plugin-shared` along, which holds the logic analysis it shares with the Documentation plugin.

## License

The tab works with a genuine, unexpired license key in the builder settings, the same rule as [AI access](./licensing#ai-access). Without one it shows what is missing and how to add the key; nothing else in the designer changes. See [Licensed plugins](./licensing#licensed-plugins).

## The analysis on its own

The graph behind the map is a plain function of the view JSON, so you can use it in your own tooling, a CI check for broken references for example:

```ts
import { analyzeViewLogic, traceViewLogic } from '@ngxviewbuilder/plugin-shared';

const graph = analyzeViewLogic(viewJson);
graph.issues.forEach((issue) => console.log(issue.severity, issue.message));

const trace = traceViewLogic(graph, 'el:annualRevenue');
// trace.upstream: what it depends on, trace.downstream: what it changes
```

`graph.nodes` are the elements, data sources, variables, view rules and triggers; `graph.rules` are their rules, each with a `summary` sentence; `graph.edges` link them by kind (`visibility`, `required`, `locked`, `value`, `reset`, `validation`, `data`, `action`). Pass `{ translate }` to get the sentences in another language.

## Translations

Every text of the tab follows the builder's language, the rule sentences included. The English texts are in `NGX_VIEW_BUILDER_LOGIC_MAP_UI_EN` (the tab) and `NGX_VIEW_BUILDER_SHARED_UI_EN` from `@ngxviewbuilder/plugin-shared` (the sentences about rules, shared with the Documentation plugin). See [Translating the plugins](./ui-translations#translating-the-plugins).

## AI clients

The plugin registers itself for AI clients as `logicMap` ([AI plugins](./ai-command-api#plugins)):

- **read** returns the graph in a compact shape. With `{ "element": "annualRevenue" }` it returns that element with its rules and everything upstream and downstream; with `{ "kind": "visibility" }` only those links.
- **show** opens the Logic map for the person with one element selected, while the model explains how it works.

Both answer with a clear reason when the license key is missing.
