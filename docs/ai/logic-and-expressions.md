---
title: "AI: Logic and expression properties"
description: Which expression fields an AI agent may use in NGX View Builder JSON and the rules they must follow.
---

# AI: Logic and expression properties

This page defines which expression fields the agent may use and which rules it must follow.

## Primary expression properties

| Property | When to use | Must return |
| --- | --- | --- |
| `visibleIf` | Show an element (native field; return `false` to hide) | `true` or `false` |
| `disableIf` | Make an element inactive | `true` or `false` |
| `requireIf` | Make an element required | `true` or `false` |
| `readonlyIf` | Make an element read-only | `true` or `false` |
| `resetIf` | Clear an element under a condition | `true` or `false` |
| `expression` | Compute and write a value | `string`, `number`, `boolean`, `array`, or `object` |
| `validators[].applyIf` | Enable a validator conditionally | `true` or `false` |
| `validators[].condition` | Failing check, error shown while `true` | `true` or `false` |

## Other expression usage points

The agent must know that expression logic does not live only in the main fields.

### Data source parameters

The field is called `params`, never `paramMap`:

- an element's `dataSource.params[*].value`, shaped `[{ "name": ..., "value": ... }]`
- an action's `params[*].value`, the same shape
- a `table`'s own lazy-load request params, which are different: `[{ "paramName": ..., "paramValue": ... }]`
- `{placeholder}` tokens inside a REST source's `params.url` and `params.body`

These can use expression fragments such as:

```
{personCode}
{row.id}
{__variables.route.mode}
```

### Table columns

`table.columnsConfig[*]` can use:

- `visibleIf`
- `controlActiveIf`
- `controlEnabledIf`

Inside a column of `type: "element"`, the hosted element's own texts, templates, and event params resolve against the row it renders: `{row.field}`, a bare `{field}` for a sibling of the same row, `{index}`, and `{value}`. The same tokens work in a `dynamicTable` cell and a `dynamicPanel` row.

### Event and action logic

Expressions are often used in actions in:

- `params[*].value`
- `condition`, which gates whether the action runs at all (per row for a table row action)
- `setValueValue` when `setValueMode` is `template` or `expression`

## When to use `logicExecutionMode`

If there is a dependency between fields, especially when `expression` is used, you typically need:

```json
{
  "logicExecutionMode": "onChange"
}
```

This is especially important when:

- one field fills another
- one field changes another's required state
- one field hides or disables another

## Core writing rules

- Use only NGX View Builder expression syntax, not full `JavaScript`.
- Read field values via `{fieldName}` or `{object.field}`.
- Use quotes for string values.
- Use `toNumber(...)` for calculations to be safe.
- Use `isEmpty(...)` and `notEmpty(...)` for empty checks.
- Use `contains`, `containsAny`, `containsAll`, and `len` for arrays.

## Correct examples

### Auto-fill

```json
{
  "name": "lastName",
  "type": "text",
  "expression": "{firstName} == 'John' ? 'Doe' : ''",
  "logicExecutionMode": "onChange"
}
```

### Conditional required

```json
{
  "name": "companyCode",
  "type": "text",
  "requireIf": "{personType} == 'company'",
  "logicExecutionMode": "onChange"
}
```

### Show/hide

```json
{
  "name": "vatCode",
  "type": "text",
  "visibleIf": "{country} == 'LT'"
}
```

### Calculation

```json
{
  "name": "totalAmount",
  "type": "number",
  "expression": "toNumber({price}) * toNumber({quantity})",
  "logicExecutionMode": "onChange"
}
```

## Bad examples

### Self-reference expression

Incorrect:

```json
{
  "name": "el2",
  "expression": "{el1} == 'John' ? 'Doe' : {el2}"
}
```

Why it is wrong:

- the element references itself
- this leads to unstable or non-functioning logic

Correct:

```json
{
  "name": "el2",
  "expression": "{el1} == 'John' ? 'Doe' : ''",
  "logicExecutionMode": "onChange"
}
```

### Wrong type for a boolean property

Incorrect:

```json
{
  "visibleIf": "'yes'"
}
```

`visibleIf` must return `true` or `false`, not a string.

### Reference to a non-existent field

Incorrect:

```json
{
  "disableIf": "{customerType} == 'vip'"
}
```

if `customerType` does not exist in the form.

## Expression property map by need

| Need | Property |
| --- | --- |
| Show/hide a field | `visibleIf` (return `false` to hide) |
| Show but prevent editing | `disableIf` or `readonlyIf` |
| Make required only in certain cases | `requireIf` |
| Reset value when condition changes | `resetIf` |
| Automatically compute a value | `expression` |
| Enable a validator conditionally | `validators[].applyIf` |
| Flag a custom validation error | `validators[].condition` (error while `true`) |

## Working with arrays and element metadata

Conditions inside collection functions are written unquoted and evaluated once per entry. Entry fields are referenced bare, everything else in the view stays reachable through `{...}`:

```text
countInArray({tasks}, status == "OPEN")
filterArray({users}, role == {__variables.requiredRole})
findInArray({products}, id == {selectedId})
existsInArray({items}, status == "ACTIVE")
sumArray({orderItems}, price)
joinInArray(mapArray(filterArray({tasks}, status == "OPEN"), title), "", ", ")
```

Also available: `avgArray`, `getFirst(source, condition?)`, `getLast(source, condition?)`. `countInArray` still accepts a plain field selector, so older structures keep working.

For element metadata rather than values:

| Call | Returns |
| --- | --- |
| `getValue({select1})` | stored value, e.g. `OPEN` |
| `getLabel({select1})` | displayed option label, e.g. `Open issue` |
| `getLabel("select1", "CLOSED")` | label of a specific value |
| `getElementProperty("el1", "label")` | any configured property, nested keys allowed |
| `getProp({el1}, "placeholder")` | alias of `getElementProperty` |
| `translate({row.status})` | value translated through `localization.texts[<language>]` |
| `currentLanguage()` | active language code |

In `getLabel`, `getValue`, and `getProp` the token names the element, it is not replaced by that element's value.

## Writing values from an expression

| Call | Does |
| --- | --- |
| `setValue({variable1}, value)` | writes into a variable or an element data path |
| `sumValue({variable1}, value)` | adds a number to the current value, returns the new total |
| `pushValue({variable1}, value)` | appends to the target's array |
| `flattenArray(source)` | flattens nested arrays into one level |

`setVar`, `sumVar`, and `pushVar` are the same calls with the target always read as a variable name. `addValue` is an alias of `sumValue`.

Shorthand, where the leftmost token is the target and the right side reads normally:

```text
{variable1} = {row.column3} + 40
{variable1} += {row.column3}
```

Rules for the agent:

- The first argument names the target, do not replace it with a value.
- `setValue` is safe in a recalculated expression, writing an unchanged value does nothing.
- `sumValue` and `pushValue` add again on every run, so put them in an action, never in `visibleIf`, `disableIf`, or an `expression` property.
- For a table inside a dynamic panel prefer one aggregate over accumulation: `setValue({variable1}, sumArray({el1}, el5[].column3))`.
- A published column total is read as `{el4.column1-total}`, always in braces.

## Contexts the agent may encounter

### General form context

- `{fieldName}`
- `{nested.field}`
- `{__variables.*}`

### Dynamic blocks and tables

- `{row.field}` inside a `table` cell, a `dynamicTable` row, a row action or a column template
- `{panel.field}` inside a `dynamicPanel` entry
- `{item.field}` for the candidate option in `filterOptionsBy`
- `{index}` and `{value}` inside a cell
- a published `dynamicTable` column total, `{el1.column4-total}`

### A table's own live state

A `table` publishes its state so other elements can read it. `__table.<tableName>.*` is that table, bare `__table.*` is the last one touched:

`rows` `allRows` `rowCount` `totalRecords` `page` `size` `sortField` `sortDirection` `quickSearch` `detailedFilters` `request` `selectedRows` `selectedKeys` `selectedItems` `selectedCount` `selectedRow` `selectedRowKey` `selectedRowIndex` `activeRow` `activeRowKey`

```text
toNumber({__table.el2.selectedCount}) > 0
notEmpty({__table.el2.selectedRowKey})
{__table.el2.selectedRow}.column2
```

This is what drives selection-aware buttons, counters and master/detail screens. Full examples: [Verified examples, 6.5 and 6.6](./examples#_6-5-the-table-s-live-state-table).

In such cases, do not guess. If `table` or `dynamicPanel` is used, consult:

- [Expressions](../creators/expressions)
- [Tables & lists](../creators/elements/tables)

## When to avoid `expression`

- When the user only wants a static default text.
- When `defaultValue` is sufficient.
- When you only need to show or hide a section, not compute new data.

## Final checklist

1. Does the condition reference existing fields.
2. Do boolean properties return a boolean value.
3. Does `expression` not return the wrong type.
4. Is there no self-reference.
5. Is `logicExecutionMode: "onChange"` added where needed.
