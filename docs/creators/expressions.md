---
title: Expressions basics
description: How to reference fields and write conditions in NGX View Builder.
---

# Expressions basics

Expressions are short formulas used across the builder: in logic properties (`visibleIf`, `disableIf`…), calculated values, validators, action conditions, and option filters.

## Referencing fields

Wrap an element **name** in curly braces to get its current value:

```text
{country}                    value of the element named "country"
{clientType} == "company"    comparison
{price} * {quantity}         math
```

If the referenced field is empty, the token resolves to an empty value — use `isEmpty()` / `notEmpty()` to test for that.

## Operators

| Kind | Operators |
| --- | --- |
| Comparison | `==` `!=` `>` `>=` `<` `<=` |
| Logic | `&&` (and), `\|\|` (or), `!` (not) |
| Math | `+` `-` `*` `/` |
| If/else in one line | `condition ? valueIfTrue : valueIfFalse` |

Examples:

```text
{age} >= 18 && {country} == "LT"
{isVip} ? {amount} * 0.9 : {amount}
!isEmpty({email}) || !isEmpty({phone})
```

## Functions

40+ built-in functions cover text, arrays, numbers, and dates:

```text
isEmpty({companyCode})
contains({roles}, "admin")
toNumber({price}) * toNumber({quantity})
dateDiffDays({startDate}, {endDate})
```

Full list with examples: [Function reference](./functions).

## Context tokens

| Token | Available | Meaning |
| --- | --- | --- |
| `{fieldName}` | everywhere | Value of a named element |
| `row.fieldName` / `row.index` | inside tables | Current row's field / index |
| `panel.fieldName` / `panel.index` | inside dynamic panels | Current entry's field / index |
| `parentIndex` | nested repeaters | Index in the surrounding repeater |
| `{__variables.name}` | everywhere | A [variable](./variables) (route param, constant, computed) |
| `{__external.name}` | everywhere | Context provided by the host application (user, role…) |
| `{el1[parentIndex].country}` | nested repeaters | Indexed access into a repeater's data |

Runtime state of some containers is also addressable: `{myTabs.selectedTab}`, `{flow.selectedStepIndex}`.

## Boolean vs. value expressions

- **Condition properties** (`visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`, validator conditions, action conditions) must return **true or false**.
- **Value properties** (`expression`, `defaultValue`) may return text, a number, a boolean, an array, or an object.

## When expressions run

An expression re-evaluates automatically whenever any field it references changes. For text inputs you can tune *when* with **Logic execution mode**: on input (every keystroke), on change, or on blur (leaving the field).

## Debugging

Wrap any part in `dbg(value, "label")` — it logs the value to the browser console and passes it through unchanged:

```text
visibleIf: dbg({clientType}, "clientType") == "company"
```

The expression editor also shows an inline help panel with tokens, functions, and example patterns for the property you are editing.
