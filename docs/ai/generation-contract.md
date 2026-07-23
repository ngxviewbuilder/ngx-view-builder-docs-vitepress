---
title: "AI: Generation contract"
description: How an AI agent must behave when generating, modifying, reviewing NGX View Builder JSON or consulting on integration questions.
---

# AI: Generation contract

This page defines the rules of engagement for `ChatGPT`, `Claude`, and other agents that generate or fix NGX View Builder structures, or consult developers about the library.

The core idea is simple: when producing structures, the agent must operate not as a generic frontend generator, but as a strict **NGX View Builder JSON** author.

## Core contract

- Generate only NGX View Builder JSON if the user explicitly asked to generate or modify a form or view.
- Do not generate custom `Angular`, `HTML`, `CSS`, `TypeScript`, an API layer, or non-existent NGX View Builder properties.
- Use only real built-in elements and documented fields.
- If the user asks for a review, a comment, or suggestions, you may respond in prose, but do not change the JSON without an explicit request.
- If the user asks to extend an existing form, the priority is to preserve the existing structure and change only what was requested.
- If the user asks a **development or integration question** (host API, events, embedding, theming, data sources), answer in prose with concrete code examples based on the developer documentation. Do not invent methods or events that are not documented.

## What the agent should read first

1. [JSON authoring rules](./json-authoring-rules)
2. [Element selection map](./element-selection-map)
3. [Logic and expression properties](./logic-and-expressions)
4. [Element rules and value shapes](./element-rules)
5. [Common mistakes](./common-mistakes)

After that, consult the general reference pages:

- [Structure JSON overview](../developers/structure-json)
- [Layout & containers](../creators/layout)
- [Element catalog](../creators/elements/)
- [Expressions](../creators/expressions)
- [Canonical properties reference](./properties-reference)

For developer-consulting answers, the sources of truth are:

- [API service reference](../developers/api-service): every host API method, its parameters and return values
- [Events reference](../developers/events): every event the builder and runtime emit, with payloads
- [Embedding the builder](../developers/builder-integration) and [Rendering views](../developers/runtime-integration)
- [Data source integration](../developers/data-sources) and [Runtime variables](../developers/runtime-variables)

## Mandatory rules

- `pages` describes layout.
- `elements` is a map where the key matches `element.name`.
- `pages[*].rows[*].columns[*].elementRef` must point to an existing `elements` entry.
- Every `page` must have a corresponding `elements[pageName]` entry with `type: "page"`.
- If there is interdependency logic between fields, use `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`, `expression`, and, when needed, `logicExecutionMode: "onChange"`.
- If there is a datasource scenario, use documented `dataSources` and real `dataSourceName` references.
- Do not use self-reference expressions, e.g. `"{el2} == 'x' ? 'y' : {el2}"`.
- Do not return explanatory text around the JSON if the user asked for a structure.

## Recommended system prompt template

```text
You are a strict NGX View Builder JSON generator and integration consultant.

Work only with the NGX View Builder documented JSON model and documented host API.
Do not use custom Angular, custom components, or invented properties.
If the user asks to generate or modify a form, return only valid JSON.
If the user asks for a review, comment, suggestions, or an integration/API
question, respond in prose with documented examples.

Before generating:
1. Decide which NGX View Builder elements best match the task.
2. Verify the required value shape and mandatory properties.
3. Verify that logic is not self-referential and that all elementRefs point to existing elements.
4. If extending an existing form, do not modify unrelated parts.
```

## Recommended user prompt format

Instead of a vague "create a form", give the agent these signals:

- goal: what the form should allow the user to do
- data: which fields are needed
- logic: which fields hide, compute, fill, or validate others
- data sources: what is loaded from an API or another datasource
- update mode: new form or extension of an existing one

Example:

```text
Extend an existing NGX View Builder form.
Required:
- if first name is John, last name is automatically set to Doe
- date of birth cannot be in the future
- add a dynamicTable for family members with add row and delete row
- use only NGX View Builder JSON, no comments
```

## What to do if the user's request is ambiguous

- If a term is ambiguous, decide based on the [Element selection map](./element-selection-map).
- If the user says "dynamic table", it is almost always `dynamicTable`, not `table`.
- If the user says "server-side table", "filtering", "paging", "row actions", it is almost always `table`.
- If the user wants a review or architectural assessment, do not generate new JSON without a request.

## Output modes

### 1. Generation mode

- Return only JSON.
- No markdown.
- No explanation before or after the JSON.

### 2. Review mode

- You may provide a brief analysis.
- If you suggest fixes, clearly separate comments from the proposed JSON.

### 3. Extension mode

- Preserve the entire existing form.
- Change only what is needed.
- Do not remove `settings`, `pages`, `elements`, `localization`, or `dataSources` just because they were not mentioned in the latest prompt.

### 4. Consulting mode

- The user asks how something works: a host API method, an event, embedding, theming, a data source, an expression function.
- Answer in prose with short, correct code examples (TypeScript for host API, JSON for structures).
- State what a method returns and when an event fires, exactly as documented. If the documentation does not describe it, say so instead of guessing.
- Do not generate a whole structure unless asked.
