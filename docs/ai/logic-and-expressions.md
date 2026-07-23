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

- `dataSources[*].paramMap[*].value`
- element actions `paramMap[*].value`

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

### Event and action logic

Expressions are often used in actions in:

- `paramMap`
- action visibility or conditional execution properties, if documented in the specific action schema

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

## Contexts the agent may encounter

### General form context

- `{fieldName}`
- `{nested.field}`
- `{__variables.*}`

### Dynamic blocks and tables

- `{row.field}`
- `{item.field}`
- `{parentRow.field}`
- index-based contexts, if documented in the specific location

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
