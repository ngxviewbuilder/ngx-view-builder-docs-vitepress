---
title: "AI: JSON authoring rules"
description: The structure skeleton and hard rules an AI agent must follow when constructing NGX View Builder JSON.
---

# AI: JSON authoring rules

This page defines how an agent must construct NGX View Builder JSON.

::: warning Read the layout model first
A structure has two independent halves: `pages` is a **layout tree of positions**, `elements` is a **flat dictionary of definitions**, and `elementRef` is the only bridge between them. Containers do not hold their children; the column that references a container holds them in its own `rows`. Widths belong to elements, never to columns. The complete rules, with the exact object shapes and a full worked example, are in [Layout model](./layout-model). Do not write layout JSON before reading it.
:::

## Minimal skeleton

```json
{
  "settings": {
    "language": "en",
    "locale": "en-US",
    "renderMode": "page"
  },
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            { "elementRef": "field1" }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": {
      "name": "page1",
      "label": "Page 1",
      "type": "page"
    },
    "field1": {
      "name": "field1",
      "label": "Field 1",
      "type": "text"
    }
  },
  "localization": {
    "defaultLanguage": "en",
    "languages": ["en"]
  }
}
```

## Element type name rules

**Type strings are case-sensitive. Copy them exactly.** Never invent casing variants.

| Correct | Wrong (do not use) |
|---|---|
| `"datepicker"` | `"datePicker"`, `"DatePicker"`, `"date-picker"` |
| `"singleCheckbox"` | `"SingleCheckbox"`, `"single_checkbox"` |
| `"dynamicTable"` | `"DynamicTable"`, `"dynamic-table"` |
| `"dynamicPanel"` | `"DynamicPanel"` |
| `"multiSelect"` | `"MultiSelect"`, `"multi-select"` |
| `"toggleSwitch"` | `"ToggleSwitch"`, `"toggle-switch"` |
| `"richText"` | `"richtext"`, `"RichText"` |
| `"fileUpload"` | `"fileupload"`, `"FileUpload"` |
| `"phoneInput"` | `"PhoneInput"`, `"phone-input"` |
| `"listGrid"` | `"ListGrid"`, `"list-grid"` |

The canonical full list is in [Common mistakes, entry 14](./common-mistakes#_14-wrong-element-type-casing).

## Structure rules

### `settings`

- Keep only settings that are actually used.
- If the user does not request a complex modal/dialog mode, `language`, `locale`, and `renderMode` are sufficient.
- Do not invent unnecessary `dialog*`, `stepper*`, or `pageNavigation*` properties if they are not in use.

### `pages`

- `pages` describes layout only.
- Every page must have a `name` and a `rows` array. Those are its only structural keys.
- A row object has exactly one key: `columns`.
- A column object has `elementRef`, plus `rows` or `tabRows` when it references a container. Nothing else. `width`, `mobileWidth`, `span`, `label`, `type` on a column are silently dropped.
- `rows[*].columns[*].elementRef` is a **string key** into the `elements` map, not an object.
- Do not embed full element objects inside `pages`.
- A `page` is a step or screen. Titled sections on one screen are `panel` elements inside a single page, not separate pages.

### `elements`

- `elements` is an object, not an array, and it is **flat**. It never nests.
- The key must match `element.name`.
- Every element must have at least `name`, `label`, and `type`.
- If `pages[*].name = "pageCustomer"`, there must be an `elements.pageCustomer` entry with `type: "page"`.
- **No element definition lists its children.** `rows`, `columns`, `children`, `items`, `fields` on a `panel` / `dynamicPanel` / `tabs` / `dialog` do not exist and are ignored. The exception is the two tables, whose cells are not layout: `table` declares them in `columnsConfig` keyed by `key`, and `dynamicTable` declares them in `columns` keyed by `name`.

### `localization`

- For a single-language form, the minimum is:
  - `defaultLanguage`
  - `languages`
- For multi-language forms, a `texts` section may also be present.

### `dataSources`

- Create only when the user genuinely needs external data or actions.
- `dataSourceName` references in elements must point to a real datasource.
- If the form has no integration scenarios, it is better to omit `dataSources`.

## Name and reference rules

- All `name` values must be unique throughout the structure.
- `elementRef` must point to an existing `elements` entry.
- If an element is a container with inner fields, those child elements must also have unique `name` values.
- Do not reuse the same `name` for multiple different elements.

## What the agent must do when extending an existing form

- Preserve existing `settings`, `pages`, `elements`, `localization`, and `dataSources` unless the user explicitly asks to rebuild everything from scratch.
- Modify only the related sections.
- When adding a new element, you must:
  - add it to `elements`
  - insert the `elementRef` in the appropriate `page/row/column`
- When adding logic between fields, verify that both fields already exist.

## Layout rules

- A single `row` is a horizontal band; its `columns` sit side by side. Vertical order is the order of `rows`.
- **A column with no width takes an equal share of the row.** For a two-column layout, one `row` with two `columns` and no widths is sufficient. Never write `"width": "50%"` to get halves.
- Widths (`width`, `tabletWidth`, `mobileWidth`, `fitContent`) are **element** properties, set in the `elements` map, and only when the split must be uneven.
- Exactly ten types accept children: `page`, `panel`, `dynamicPanel`, `dialog`, `emptyBlock` (via `column.rows`) and `tabs`, `tabsPro`, `accordion`, `splitter`, `progressFlow` (via `column.tabRows`, keyed by each tab/item/panel/step `value`). Every other type is a leaf.
- Container inner layouts must remain in the NGX View Builder model, not via custom HTML.
- `parentName` is not how parentage is declared. The layout tree is.

Worked examples and the exact interfaces: [Layout model](./layout-model).

## Value shape rules

- `text`, `textarea`, `richText` typically store a `string`.
- `number`, `slider` store a `number` or `string` depending on `valueStorageType`.
- `singleCheckbox`, `toggleSwitch`, `toggleButton` typically store a `boolean`.
- `checkbox`, `multiSelect` typically store an array.
- `select`, `radio`, `autocomplete` typically store a single value.
- `dateRange` must return an object with `dateFrom` and `dateTo`.
- `dynamicPanel` and `dynamicTable` typically store an array of objects.
- `numberStepper` stores a `number`; `timePicker` stores a time string.
- `signaturePad` stores signature image data keyed under the element's `name`.
- `listBox`, `selectButton` store a single value, or an array when multi-select/`multiple` is enabled.
- `progressBar` stores a `number`.

## Logic rules

- Use `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf` for boolean conditions.
- Use `expression` to compute and write a value.
- When logic depends on changes in another field, typically add `logicExecutionMode: "onChange"`.
- Do not use self-reference `expression`.

## Validator field rules

Validators are separate sub-objects in the `validators` array. They have their own field names that differ from element-level logic fields:

| Element-level (correct placement) | Validator-level (correct placement) |
|---|---|
| `element.visibleIf` | `validator.condition` |
| `element.requireIf` | `validator.applyIf` |
| `element.expression` | _(does not exist on validators)_ |

Never put `visibleIf`, `requireIf`, `readonlyIf`, `disableIf`, `expression`, or `resetIf` inside a validator object. Never use the field name `expression` on a validator; the correct field is `condition`.

**Polarity:** `condition` is the *failing* check. The validator error is shown while `condition` evaluates to `true`. Use `applyIf` to run a validator only in certain cases (it runs while `applyIf` is truthy).

Correct:

```json
{
  "name": "age",
  "type": "number",
  "visibleIf": "{skipAge} != true",
  "validators": [
    { "type": "min", "value": 0, "message": "Cannot be negative" },
    { "type": "max", "value": 120, "message": "Invalid age", "applyIf": "{country} == 'LT'" }
  ]
}
```

## What must not be generated

- Custom `Angular` components.
- Non-existent NGX View Builder properties.
- Full element objects embedded in `pages`.
- Pseudo-code instead of real JSON.
- Empty wrappers or meta-properties with no real purpose.

## Pre-return checklist

1. Do all `elementRef` values point to an existing element.
2. Does every `page` have a corresponding `elements[pageName]` entry.
3. Do logic fields return the correct type.
4. Are there no self-reference expressions.
5. Is the correct element chosen for the task.
6. Are there no unnecessary properties added.
7. Are all `type` strings exact-cased (e.g. `datepicker`, not `datePicker`)?
8. Do validators use `condition` (error when `true`) and `applyIf`, rather than `expression`, `visibleIf`, or other element-level field names?
9. Is every container's content attached to the referencing **column**, and does no element definition contain a `rows` / `children` / `items` array?
10. Do all column objects carry only `elementRef` (plus `rows` / `tabRows` where applicable), with no widths or other properties?
