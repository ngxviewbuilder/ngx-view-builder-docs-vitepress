---
title: Calculated values
description: Expression and Default value — computing field values from other fields.
---

# Calculated values

Two Logic properties produce values instead of true/false.

## Expression

**Expression** continuously calculates the element's value. Whenever a referenced field changes, the result is recomputed and written into the field.

```text
toNumber({price}) * toNumber({quantity})        line total
{firstName} + " " + {lastName}                  full name
{isCompany} ? {companyCode} : {personalCode}    pick one of two codes
sumInArray({orderLines}, "total")               sum over table rows
```

Rules of thumb:

- A field with an Expression is effectively computed — combine with **Read only** so users don't fight the recalculation.
- Never reference the field itself; self-referencing expressions are skipped with a console warning.
- On **Number** elements the result respects the element's formatting settings (fraction digits, locale).
- If the expression errors or returns nothing, the value is cleared.

## Default value

**Default value** sets the initial value once, on load. The user can overwrite it.

Three forms:

| Form | Example | Result |
| --- | --- | --- |
| Static text | `Draft` | literal "Draft" |
| Token | `{__variables.route.id}` | resolved at load |
| Expression (prefix `=`) | `=today()` | evaluated at load |

Common defaults:

```text
=today()                        today's date
{__external.userName}           current user from the host app
{__variables.route.clientId}    id from the URL
"LT"                            fixed country pre-selection
```

## Expression vs. Default value

| | Expression | Default value |
| --- | --- | --- |
| When it runs | continuously | once at load |
| User can override | no (recalculated) | yes |
| Use for | totals, derived fields | sensible starting values |

## Worked example — invoice line

| Element | Type | Setup |
| --- | --- | --- |
| `quantity` | Number | Default value `1` |
| `unitPrice` | Number | filled from a product data source |
| `discount` | Number | Default value `0` |
| `lineTotal` | Number, read-only | Expression: `toNumber({quantity}) * toNumber({unitPrice}) * (1 - toNumber({discount}) / 100)` |
