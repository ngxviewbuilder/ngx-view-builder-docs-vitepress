---
title: AI reference
description: The canonical, indexed knowledge base an AI agent needs to generate or modify NGX View Builder structure JSON.
---

# AI reference

This section is the **single indexed knowledge base for AI agents** that generate or modify NGX View Builder structure JSON. It is written for machine consumption first: the reference backend ([`ngx-view-builder-ai-agent`](../developers/ai-chat#the-reference-backend-ngx-view-builder-ai-agent)) loads slices of these pages into its prompts, and any other LLM setup (ChatGPT, Claude, a custom pipeline) can use the same pages as system-prompt material.

Everything here has one goal: the agent must behave as a **strict NGX View Builder JSON author**, using real elements, documented properties and valid references, never as a generic frontend generator.

## Reading order

An agent (or a person building prompts) should consume the pages in this order:

1. [Generation contract](./generation-contract): the core rules of engagement and output modes.
2. [JSON authoring rules](./json-authoring-rules): the structure skeleton and hard rules.
3. [Element selection map](./element-selection-map): mapping user intent to the right element type.
4. [Logic & expression properties](./logic-and-expressions): `visibleIf`, `expression`, and friends.
5. [Element rules & value shapes](./element-rules): per-element expectations.
6. [Canonical properties reference](./properties-reference): the authoritative property list.
7. [Common mistakes](./common-mistakes): anti-patterns to avoid.
8. [Legacy form migration](./legacy-form-migration): only when converting forms from a legacy form-builder JSON format.

## Index

| Page | What it answers | Load when |
| --- | --- | --- |
| [Generation contract](./generation-contract) | How the agent must behave; output modes; prompt templates | Always |
| [JSON authoring rules](./json-authoring-rules) | Skeleton, `pages`/`elements` rules, naming, layout, value shapes | Always |
| [Canonical properties reference](./properties-reference) | Every supported property per element type, settings, data sources | Always |
| [Element rules & value shapes](./element-rules) | Per-element usage rules and value shapes | Always |
| [Common mistakes](./common-mistakes) | Known anti-patterns with corrections | Always; especially in review mode |
| [Element selection map](./element-selection-map) | Which element type fits the user's intent | When element choice is ambiguous |
| [Logic & expression properties](./logic-and-expressions) | Expression fields, syntax rules, correct/incorrect examples | When the request involves logic |
| [Legacy form migration](./legacy-form-migration) | Element/property/expression mapping from a legacy form-builder JSON format | When converting legacy form JSON |
| [API service reference](../developers/api-service), [Events reference](../developers/events) | What every host API method / event does, its parameters, payloads and return values | When the user asks a development or integration question |

The agent does more than write JSON. It also **consults developers**: what an API method means, what it returns, how to wire an event, how to embed the builder or runtime. For those answers the retrieval map has a dedicated `developer` source group pointing at the developer documentation.

The agent also draws on the human documentation ([element pages](../creators/elements/), [expressions](../creators/expressions), [conditional logic](../creators/conditional-logic), [validation](../creators/validation), [events & actions](../creators/events-actions), [data sources](../creators/data-sources) and [variables](../creators/variables)) and on library source files: interfaces, enums and property datasets, which are always the final source of truth.

## The machine index: `retrieval-map.json`

[`retrieval-map.json`](./retrieval-map.json) (next to this page) is the machine-readable index. It maps request profiles and element types to the exact files the agent should load, with per-file character budgets:

- **`roots`**: where the docs and the library live, relative to the workspace root (the folder that contains all `ngx-view-builder*` projects).
- **`universal`**: sources injected into every prompt.
- **`types`**: per element type, which docs page, interface, and property dataset to load.
- **`selection`, `review`, `legacyForms`, `logic`, `validators`, `events`, `actions`, `data`**: sources added when the request profile matches.
- **`groupFallback`**: group-level docs used when no concrete element type was resolved.

Paths use two prefixes: `docs:` (resolved against `roots.docs`, i.e. this documentation) and `lib:` (resolved against `roots.library`, i.e. the library source). The reference backend loads this file at startup and reports missing sources on `/health`, so when documentation moves, updating this map is the only change needed. See [AI assistant backend](../developers/ai-chat) for the backend's configuration.
