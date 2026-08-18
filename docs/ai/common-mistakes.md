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

- the execution mode is missing, and the default is `onBlur`

With `onBlur` the logic only re-runs once the field loses focus, so someone typing in the form sees nothing happen and reports the logic as broken.

### Rule

- if one field's value must immediately affect another field, set `logicExecutionMode: "onChange"`
- if validation has to follow the typing, set `validationExecutionMode: "onChange"` as well

## 8b. `hideIf` and other logic keys that do not exist

### Mistake

```json
{
  "name": "companyCode",
  "hideIf": "{customerType} != 'company'"
}
```

### Problem

There is no `hideIf`. The logic keys are exactly `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf` and `expression`, and they are matched exactly, so `readOnlyIf` with a capital O misses too.

This is the worst kind of mistake to debug, because nothing complains. The property is stored, the JSON reviews as correct, no dependency is ever registered for it, and the field simply stays visible forever. Deleting the element and adding the same rule by hand in the builder makes it work, which sends everyone hunting for a bug that is not there.

### Correct

`visibleIf` states when the element **is** shown, so invert the condition instead of renaming the key.

```json
{
  "name": "companyCode",
  "visibleIf": "{customerType} == 'company'",
  "logicExecutionMode": "onChange"
}
```

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

<!-- deliberately incorrect: kept as the counter-example -->

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
text | textarea | number | slider | phoneInput | fileUpload | button | numberStepper | signaturePad
select | multiSelect | radio | checkbox | singleCheckbox | toggleSwitch | toggleButton | autocomplete | selectButton | listBox
datepicker | dateRange | timePicker
panel | dynamicPanel | tabs | tabsPro | accordion | dialog | splitter | progressFlow | emptyBlock
dynamicTable | table | listGrid | chart
richText | richTextViewer | customHtml | htmlSnippet | image | video | iframe | avatar | icon | routerOutlet
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
- `type`: validator type string (required)
- `value`: threshold value when applicable (`number | string`)
- `message`: error message shown to user
- `condition`: JEXL expression, the *failing* check. The validator error is shown while it evaluates to `true`
- `applyIf`: JEXL expression, the validator runs only when this is truthy

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
- The renderer ignores the `logic` wrapper, so the expression never runs.

### Correct

Logic fields are **direct element-level properties**, never nested:

```json
{
  "name": "totalAmount",
  "type": "number",
  "expression": "{price} * {qty}",
  "logicExecutionMode": "onChange"
}
```

The same rule applies to `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, and `resetIf`.

## 18. Putting a container's children inside the element definition

This is the single most damaging generation error. The panel renders, and it is **empty**.

### Mistake

<!-- deliberately incorrect: kept as the counter-example -->

```json
{
  "elements": {
    "panelGeneral": {
      "name": "panelGeneral",
      "type": "panel",
      "label": "General",
      "rows": [
        { "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] }
      ]
    }
  }
}
```

### Problem

- `IBaseElement` has no `rows` property. The array is ignored.
- `firstName` and `lastName` are never placed in the layout tree, so they never render.
- The same applies to invented keys such as `children`, `elements`, `items`, `content`, `fields`.

### Correct

Children belong to the **column that references the container**, in `pages`:

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "panelGeneral",
              "rows": [
                { "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "type": "page", "label": "Page 1" },
    "panelGeneral": { "name": "panelGeneral", "type": "panel", "label": "General" },
    "firstName": { "name": "firstName", "type": "text", "label": "First name" },
    "lastName": { "name": "lastName", "type": "text", "label": "Last name" }
  }
}
```

`elements` is a **flat map**. It never nests. Full rules: [Layout model](./layout-model).

## 19. Widths written on columns

### Mistake

```json
{
  "columns": [
    { "elementRef": "firstName", "width": "50%", "mobileWidth": "100%" },
    { "elementRef": "lastName", "width": "50%", "mobileWidth": "100%" }
  ]
}
```

### Problem

- `IColumn` has exactly these keys: `elementRef`, `rows`, `tabRows`, `fragmentRef`, `fragmentBindings`, `fragmentMode`. Everything else is dropped.
- The width was never applied, and the JSON is now noisier and harder to review.
- Worse, it hides the real intent: two columns in one row **already** split evenly (`flex: 1 1 0`).

### Correct

For an even split, write nothing:

```json
{ "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] }
```

For an uneven split, put `width` / `tabletWidth` / `mobileWidth` on the **element**:

```json
{
  "postCode": { "name": "postCode", "label": "Post code", "type": "text", "width": "160px" }
}
```

## 20. Using `parentName` to declare structure

### Mistake

```json
{ "name": "firstName", "type": "text", "parentName": "panelGeneral" }
```

### Problem

`parentName` exists on `IBaseElement`, but it is runtime bookkeeping, not the structure declaration. Setting it does not place the element anywhere.

### Rule

The layout tree in `pages` is the **only** source of parentage.

## 21. One page per visual section

### Mistake

A screenshot shows four titled sections, and the agent emits four entries in `pages`.

### Problem

A `page` is a **step or screen**, navigated by the pager or stepper. Four pages means a four-step wizard, not four sections stacked on one screen.

### Correct

One page, four `panel` elements at the top level of its `rows`, each panel's `label` being the section heading.

## 22. Invented properties that look plausible

Every one of these has been generated by an agent and none of them exists:

| Invented | What is actually there |
|---|---|
| `panel.rows`, `panel.children`, `panel.items` | children go in `column.rows` |
| `column.width`, `column.mobileWidth`, `column.span` | width goes on the element |
| `singleCheckbox.checkedValue` / `uncheckedValue` | `singleCheckbox` stores `true`/`false`; the side text is `checkboxLabel` |
| `phoneInput.maskType`, `phoneInput.inputMode`, `phoneInput.defaultValue` | `defaultCountryCode` (ISO code such as `"LT"`), `allowedCountryCodes` |
| `text.maskType: "personalCodeLt"` / `"phoneLt"` | masks are exactly `none` `phoneIntl` `date` `time` `dateTime` `digits` `custom` |
| `datepicker.format: "yyyy-MM-dd"` | uppercase tokens only: `YYYY-MM-DD`, `DD.MM.YYYY`, ... |
| `element.logic { ... }` wrapper | logic fields sit directly on the element |
| `validator.expression` | `validator.condition` |
| `"type": "code"`, `"type": "dropdown"` | neither element type exists; use `textarea` and `select` |
| `select.placeholder` for the closed-state text | that text is the UI translation `select.placeholder`; the property only sets the dropdown's search hint |
| `dataSources[*].paramMap` | the field is `params` |
| `"params": [["id", "{row.id}"]]` | `"params": [{ "name": "id", "value": "{row.id}" }]` |
| `table.params: [{ "name", "value" }]` | table request params are `[{ "paramName", "paramValue" }]` |
| `table.columnsConfig[*].name` | `key` |
| `dynamicTable.columns[*].key` | `name` |

### Rule

If a property is not in [the properties reference](./properties-reference), it does not exist. Omitting a nicety is always better than inventing a property: an invented property is silently ignored, so the form ships subtly broken with no error anywhere.

## Final anti-pattern checklist

Before returning a response, the agent must verify:

1. Is the correct element chosen.
2. Are `pages` and `elements` not mixed up.
3. Do all `elementRef` values point to valid entries.
4. Is there no self-reference expression.
5. Is the value shape correct.
6. Are there no invented properties.
7. Do `table.columnsConfig[*]` entries use `key`, and `dynamicTable.columns[*]` entries use `name`. The two tables do not share a column shape.
8. Is the existing form context preserved.
9. Are logic fields (`expression`, `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`, `logicExecutionMode`) placed directly on the element, not inside a `logic` wrapper, and spelled exactly. No `hideIf`, no `readOnlyIf`.
9b. Does every element carrying logic or typing dependent validation set `logicExecutionMode` or `validationExecutionMode` to `onChange`, since both default to `onBlur`.
10. Does any object in `elements` contain `rows`, `columns`, `children` or `items` as a way of holding child elements. It must not.
11. Does any column object carry a key other than `elementRef`, `rows`, `tabRows`, `fragmentRef`, `fragmentBindings`, `fragmentMode`.
12. Are widths on elements rather than columns, and absent entirely wherever an even split is wanted.
13. Is the number of `pages` equal to the number of real steps, not the number of visual sections.
