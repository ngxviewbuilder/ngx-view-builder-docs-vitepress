---
title: "AI: Common mistakes and anti-patterns"
description: Known anti-patterns AI agents repeat when generating NGX View Builder JSON, with corrections.
---

# AI: Common mistakes and anti-patterns

This page exists so that the agent does not keep repeating the same mistakes when generating NGX View Builder JSON.

## 1. Wrong element selection

### Mistake

The user asks for a "dynamic table" and the agent generates `table`.

### What to do correctly

- Use `dynamicTable` for editable rows with `add row` and `delete row`.
- Use `table` for server-side data grid scenarios.

## 2. Self-reference expression

### Mistake

```json
{
  "name": "lastName",
  "expression": "{firstName} == 'John' ? 'Doe' : {lastName}"
}
```

### Problem

- the element references itself
- the logic may not work or may behave unpredictably

### Correct

```json
{
  "name": "lastName",
  "expression": "{firstName} == 'John' ? 'Doe' : ''",
  "logicExecutionMode": "onChange"
}
```

## 3. Mixing `pages` and `elements`

### Mistake

- the agent places a full element object directly in `pages.rows.columns`

### Correct

- `pages` holds only layout
- `columns[*].elementRef` points to `elements`

## 4. Missing `page` entry in the `elements` map

### Mistake

Present:

```json
{
  "pages": [{ "name": "page1", "rows": [] }]
}
```

but missing:

```json
{
  "elements": {
    "page1": {
      "name": "page1",
      "type": "page",
      "label": "Page 1"
    }
  }
}
```

## 5. Generating non-existent properties

### Mistake

- the agent invents custom properties that NGX View Builder does not have

### Rule

- if you cannot find a property in the documentation or catalog, do not use it

## 6. Too much metadata

### Mistake

- unnecessary `settings` or extra wrappers are added

### Rule

- keep only properties that are actually used
- if a feature is not active, it is better to omit its child properties

## 7. Wrong value shape

Typical mistakes:

- `dateRange` returns a string instead of `{ dateFrom, dateTo }`
- `multiSelect` returns a single value instead of an array
- `singleCheckbox` returns a string instead of `boolean`
- `dynamicPanel` or `dynamicTable` does not return an array

## 8. Logic without `onChange` when recalculation is needed

### Symptom

- the form renders, but the interdependency logic does not work as expected

### Why

- the correct logic execution mode is missing

### Rule

- if one field's value must immediately affect another field, `logicExecutionMode: "onChange"` is often required

## 9. Overly aggressive rewrite of an existing form

### Mistake

- the user asks to add one field, and the agent rebuilds the entire form from scratch

### Rule

- in extension mode, change only what is relevant to the task
- do not remove `dataSources`, `localization`, `settings`, or other sections without reason

## 10. Broken datasource references

### Mistake

- an element references `dataSourceName` but no such datasource exists
- a datasource exists but the item path or value/label mapping is wrong

### Rule

- every datasource reference must point to a real, documented object

## 11. Using `name` instead of `key` in `table` columns

### Mistake

```json
{
  "type": "table",
  "columnsConfig": [
    {
      "name": "firstName",
      "label": "First Name",
      "type": "text"
    }
  ]
}
```

### Problem

- `table` renders columns by `columnsConfig[*].key`
- if only `name` is present, the column may not be rendered at all

### Correct

```json
{
  "type": "table",
  "columnsConfig": [
    {
      "key": "firstName",
      "label": "First Name",
      "type": "text",
      "showInTable": true
    }
  ]
}
```

## 12. Custom frontend instead of NGX View Builder

### Mistake

- the agent starts suggesting `Angular` components, custom templates, or an API layer, even though an NGX View Builder form was requested

### Rule

- the first choice is always the built-in NGX View Builder JSON model

## 13. Prose instead of JSON

### Mistake

- the user asks to generate a form, and the agent writes an explanation followed by JSON

### Rule

- in generation mode, return only JSON

## 14. Wrong element type casing

### Mistake

```json
{ "type": "datePicker" }
{ "type": "SingleCheckbox" }
{ "type": "DynamicTable" }
{ "type": "richtext" }
{ "type": "fileupload" }
```

### Rule

Type strings are **exact lowercase camelCase**. The canonical list:

```
text | textarea | number | slider | phoneInput | code | fileUpload | button | numberStepper | signaturePad
select | multiSelect | radio | checkbox | singleCheckbox | toggleSwitch | toggleButton | dropdown | autocomplete | selectButton | listBox
datepicker | dateRange | timePicker
panel | dynamicPanel | tabs | tabsPro | accordion | dialog | splitter | progressFlow | emptyBlock
dynamicTable | table | listGrid | chart
richText | richTextViewer | customHtml | htmlSnippet | image | video | iframe | avatar | icon
divider | spacer | breadcrumbs | pageTitle | badge | messageCard | statsCard | toast | progressBar
page
```

Never invent capitalization variants. Copy from the list above.

## 15. Wrong validator field names

### Mistake

```json
{
  "validators": [
    {
      "type": "minLength",
      "expression": "{firstName}.length > 0",
      "message": "Required"
    }
  ]
}
```

### Problem

- `expression` does not exist on `IValidator`
- `visibleIf` does not exist on `IValidator`

### Correct validator schema

```json
{
  "validators": [
    {
      "type": "minLength",
      "value": 3,
      "message": "Minimum 3 characters",
      "applyIf": "{otherField} != ''"
    },
    {
      "type": "custom",
      "condition": "dateDiffDays({startDate}, {endDate}) < 1",
      "message": "End date must be after start date"
    }
  ]
}
```

Exact fields allowed on a validator:
- `type` — validator type string (required)
- `value` — threshold value when applicable (`number | string`)
- `message` — error message shown to user
- `condition` — JEXL expression; the *failing* check — when it evaluates to `true` the validator error is shown
- `applyIf` — JEXL expression; validator runs only when this is truthy

**Never use `expression`, `visibleIf`, `disableIf`, or any other logic field on a validator object.**

## 16. Using logic field names that belong to elements on validators

### Mistake

Copying `visibleIf`, `requireIf`, `readonlyIf`, `disableIf`, `expression`, `resetIf` from element-level logic into a validator object. Those fields do not exist on `IValidator`.

### Rule

Element-level logic (`visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`, `expression`) belongs directly on the element, not inside the `validators` array.

```json
{
  "name": "birthDate",
  "type": "datepicker",
  "requireIf": "{needsBirthDate} == true",
  "validators": [
    {
      "type": "maxDate",
      "value": "today",
      "message": "Cannot be in the future"
    }
  ]
}
```

## 17. Wrapping logic fields in a `logic` object

### Mistake

```json
{
  "name": "totalAmount",
  "type": "number",
  "logic": {
    "expression": "{price} * {qty}",
    "logicExecutionMode": "onChange"
  }
}
```

### Problem

- There is no `logic` key in the NGX View Builder element schema.
- The renderer ignores the `logic` wrapper — the expression will never execute.

### Correct

Logic fields are **direct element-level properties** — never nested:

```json
{
  "name": "totalAmount",
  "type": "number",
  "expression": "{price} * {qty}",
  "logicExecutionMode": "onChange"
}
```

The same rule applies to `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, and `resetIf`.

## Final anti-pattern checklist

Before returning a response, the agent must verify:

1. Is the correct element chosen.
2. Are `pages` and `elements` not mixed up.
3. Do all `elementRef` values point to valid entries.
4. Is there no self-reference expression.
5. Is the value shape correct.
6. Are there no invented properties.
7. Do `table.columnsConfig[*]` entries use `key`, not `name`.
8. Is the existing form context preserved.
9. Are logic fields (`expression`, `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`, `logicExecutionMode`) placed directly on the element — not inside a `logic` wrapper.
