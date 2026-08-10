---
title: JSON editor
description: Edit the raw view definition when the visual editor is slower.
---

# JSON editor

The **JSON** tab shows the entire view definition, the same JSON the application loads at runtime. Everything you configure visually is stored here; everything you type here appears in the visual editor.

## When to use it

- **Bulk edits**: rename a value across many expressions with find & replace.
- **Copying**: move an element or a whole page between views.
- **Fixing**: resolve an odd state faster than clicking through properties.
- **Reviewing**: see exactly what will be handed to developers.

## Structure at a glance

```json
{
  "settings":     { "width": "1182", "language": "en" },
  "pages":        [ { "name": "page1", "rows": [ { "columns": [ { "elementRef": "firstName" } ] } ] } ],
  "elements":     {
    "page1":     { "name": "page1", "label": "Page 1", "type": "page" },
    "firstName": { "name": "firstName", "label": "First name", "type": "text", "required": true }
  },
  "dataSources":  [ { "name": "loadCountries", "type": "rest", "params": { "url": "..." } } ],
  "localization": { "defaultLanguage": "en", "languages": ["en"], "texts": {} }
}
```

Key ideas:

- `pages[].rows[].columns[]` describe **layout**; each column points at an element by `elementRef`.
- `elements` is a flat map of **every element's configuration**, keyed by name.
- Logic properties are plain strings: `"visibleIf": "{clientType} == \"company\""`.

Full field-by-field reference: [Structure JSON](../developers/structure-json) (developer docs).

## Safety

- The editor validates JSON as you type, so syntax errors are flagged before they can break the view.
- An element referenced in `rows` must exist in `elements` (and vice versa), so keep both sides in sync when hand-editing.
- Copy the whole JSON to a scratch file before large manual edits.
