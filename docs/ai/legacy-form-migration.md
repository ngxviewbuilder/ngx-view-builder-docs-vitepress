---
title: "AI: Legacy form migration"
description: How an AI agent converts a legacy form-builder JSON format to NGX View Builder JSON — element, property, and expression mapping.
---

# AI: Legacy form migration

This page is intended for the AI agent when a user asks to convert a form defined in a legacy form-builder JSON format to NGX View Builder JSON.

## Core rule

- Do not copy the source JSON 1:1.
- First recognize the semantics of the source form.
- Then map them to the closest supported NGX View Builder structure.

## Element map

| Source JSON | NGX View Builder |
| --- | --- |
| `text` | `text` or `number` / `phoneInput` depending on `inputType` |
| `comment` | `textarea` |
| `radiogroup` | `radio` |
| `dropdown` | `select` |
| `dropdown_list` | `autocomplete` |
| `tagbox` | `multiSelect` |
| `checkbox` | `checkbox` or `singleCheckbox` |
| `boolean` | `singleCheckbox` |
| `date` / `date_picker` | `datepicker` |
| `file_uploader` / `file_list` | `fileUpload` |
| `html` | `customHtml` |
| `message_box` | `messageCard` |
| `panel` | `panel` |
| `paneldynamic` | `dynamicPanel` |
| `matrixdynamic` / `matrixdropdown` | `dynamicTable` |
| `dialog` | `dialog` |

## Property map

- `visibleIf` maps directly to `visibleIf` — same field name, same polarity, no inversion needed.
- `enableIf` is typically mapped to `disableIf`, but the logic must be inverted.
- `requiredIf` maps to `requireIf`.
- `resetValueIf` maps to `resetIf`.
- `setValueExpression` typically maps to `expression`.
- `defaultValue` stays as `defaultValue` if it is a static value.
- `defaultValueExpression` can become `defaultValue` if it is a literal, or `expression` if it is a computed value.
- `choices` maps to `options`.
- `validators` maps to `validators`.

## Expression translation rules

In the final NGX View Builder JSON, use NGX View Builder / `JEXL`-style syntax.

### Operators

- `and` -> `&&`
- `or` -> `||`
- `<>` -> `!=`
- `=` in comparisons -> `==`
- `iif(cond, a, b)` -> `cond ? a : b`

### Empty values

- `x notempty` -> `notEmpty(x)`
- `x empty` -> `isEmpty(x)`

### Collections

- `anyof` -> `containsAny(left, values)`
- `allof` -> `containsAll(left, values)`
- `contains` -> `contains(left, value)`
- `{field.length}` -> `len({field})`

### Dynamic contexts

- `{panelIndex}` -> `panel.index`
- `{rowIndex}` -> `row.index`
- `{parentIndex}` -> `parentIndex`
- `{panel.field}` -> `panel.field`
- `{row.field}` -> `row.field`

## Important safeguards

- Do not use source-library property names in the final NGX View Builder JSON if NGX View Builder does not have that property.
- Do not use `and`, `or`, `notempty`, `empty`, `<>`, or `iif(...)` in final NGX View Builder expression strings.
- Do not use self-reference expressions — a field must not reference itself in a fallback branch.
- If `expression`, `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, or `resetIf` is added, `logicExecutionMode: "onChange"` is typically required.

## When a 1:1 mapping is not possible

- If a source-library feature has no direct NGX View Builder equivalent, produce the closest safe result.
- In that case, briefly explain in a `warnings` section what was simplified or lost.
