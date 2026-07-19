---
title: "AI: JSON authoring rules"
description: The structure skeleton and hard rules an AI agent must follow when constructing NGX View Builder JSON.
---

# AI: JSON authoring rules

This page defines how an agent must construct NGX View Builder JSON.

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

**Type strings are exact — copy them exactly.** Never invent casing variants.

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
- Every page must have a `name`.
- `rows[*].columns[*].elementRef` points to the `elements` map.
- Do not embed full element objects inside `pages`.

### `elements`

- `elements` is an object, not an array.
- The key must match `element.name`.
- Every element must have at least `name`, `label`, and `type`.
- If `pages[*].name = "pageCustomer"`, there must be an `elements.pageCustomer` entry with `type: "page"`.

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

- A single `row` can have one or more `columns`.
- `panel`, `tabs`, `accordion`, `dynamicPanel`, `dialog`, and `splitter` can have an inner layout.
- Container inner layouts must remain in the NGX View Builder model, not via custom HTML.
- For a simple two-column layout, one `row` with two `columns` is sufficient.

## Value shape rules

- `text`, `textarea`, `richText`, `code` typically store a `string`.
- `number`, `slider` store a `number` or `string` depending on `valueStorageType`.
- `singleCheckbox`, `toggleSwitch`, `toggleButton` typically store a `boolean`.
- `checkbox`, `multiSelect` typically store an array.
- `select`, `radio`, `dropdown`, `autocomplete` typically store a single value.
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

Never put `visibleIf`, `requireIf`, `readonlyIf`, `disableIf`, `expression`, or `resetIf` inside a validator object. Never use the field name `expression` on a validator — the correct field is `condition`.

**Polarity:** `condition` is the *failing* check — the validator error is shown while `condition` evaluates to `true`. Use `applyIf` to run a validator only in certain cases (it runs while `applyIf` is truthy).

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
8. Do validators use `condition` (error when `true`) and `applyIf` — not `expression`, `visibleIf`, or other element-level field names?
