---
title: Expressions basics
description: "How NGX View Builder expressions work: referencing fields, operators, functions, context tokens, when expressions run and how to debug them."
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

If the referenced field is empty, the token resolves to an empty value, so use `isEmpty()` / `notEmpty()` to test for that.

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

69 built-in functions cover text, arrays, numbers, and dates:

```text
isEmpty({companyCode})
contains({roles}, "admin")
{price} * {quantity}
dateDiffDays({startDate}, {endDate})
```

Full list with examples: [Function reference](./functions).

## Writing a value

An expression can also write. Put the target on the left and it becomes a write instead of a comparison:

```text
{variable1} = {price} * {quantity}
{variable1} += {row.column3}
```

`=` sets the value, `+=` adds to it. The same thing spelled out is `setValue()` and `sumValue()`. Use `+=` from an action, since it adds again on every run. See [Writing values back](./functions#writing-values-back).

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

## Ask AI to write it

If your developer connected the builder to an AI client (Settings, AI access), every expression editor has an **Ask AI** button: in the Logic dialog it sits next to the title, in the code editor in its header.

1. Press **Ask AI** and write what the rule should do, in your own words and your own language: *show when the total is over 1000 and the customer is not VIP*.
2. Press **Write expression** (or Enter).
3. You get the expression and a sentence or two saying what it does. Press **Use this**, **Try again** or **Discard**.

You can also type the words straight into the expression field and press Ask AI; the builder sees that it is a sentence, not an expression, and sends it.

Before you see anything, the builder checks the answer: the expression has to work and may only read fields and variables this view has. If it does not, the AI is told why and fixes it by itself. Still read it before you use it: the AI picks the most likely meaning, and the sentence under the expression says which one it picked. Use this is one undo step, like any other edit, and in the Logic dialog nothing is kept until you press Save.

**Explain current** does the opposite: it describes an existing expression in plain words, which helps when you open a view someone else built.

If the box says your AI client is not listening, go to its chat and ask it to listen to the builder. The request waits five minutes.

The AI gets your words and the names, types and labels of the fields, never what anyone typed into the form.

## Debugging

An expression the parser cannot read never runs: `{qty} >= (` is neither true nor false, so a rule written that way silently does nothing. The builder says so as you type. The Logic panel and the code editor show the reason under the expression (*Unexpected end of expression*), and the rule's card keeps the warning after you save, until the expression is fixed.

Wrap any part in `dbg(value, "label")`. It logs the value to the browser console and passes it through unchanged:

```text
visibleIf: dbg({clientType}, "clientType") == "company"
```

The expression editor also shows an inline help panel with tokens, functions, and example patterns for the property you are editing.
