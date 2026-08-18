---
title: Form validation
description: Required fields, validator rules, custom conditions, and error messages, covering every field of the validator editor.
---

# Validation

Validation runs when the user submits, when a page changes in stepper mode, and (depending on settings) while editing. Failing elements show their error message and block submission.

## Required

Turn on **Required** in the Validation section, or use **Require if** for conditional requirement. Set the error text in **Required field message**.

The red asterisk that marks a required field belongs to the label. An element with no label text and no help tooltip renders no label row at all, so the asterisk is not drawn either: floating above an empty space it marks nothing. The field is still required and still validated. When a bare field has to advertise that it is mandatory, give it a label, or say so in its placeholder or description.

## The validator editor

The **Validators** property holds a list of rules. Click **Add validator** to create one; each rule has these fields:

| Field | What it does |
| --- | --- |
| **Type** | Which check to run, see the table below. |
| **Value** | The rule's setting (a length, a bound, a pattern…). |
| **Error message** | Shown when this rule fails. Each rule carries its own message. |
| **Condition (error when true)** | For `custom` rules: an expression that flags an **error while it is true**. |
| **Apply if (optional)** | A guard expression: the whole rule is checked only while this is true. |

| Type | Checks | Example value |
| --- | --- | --- |
| `required` | value present | - |
| `minLength` / `maxLength` | text length | `3` / `50` |
| `min` / `max` | numeric bounds | `0` / `100` |
| `pattern` | regular expression | `^[0-9]{9}$` |
| `email` | email format | - |
| `strictOptions` | value exists in the option list | - |
| `custom` | your own condition | see below |

The list can be longer in your application: developers can register named rules such as *LT personal code* or *IBAN*, which then appear in **Type** exactly like the built-ins. See [custom validator types](../developers/custom-validators). A rule shown as `(not registered)` comes from a view built in another application that had such a rule; it is skipped until that application registers it.

## Custom validators

A `custom` rule is a true/false [expression](./expressions) that describes the **error**: the message shows while the condition is true. You can write it directly or assemble it in the visual rule builder (field + operator + value, joined with and/or).

```text
dateDiffDays({startDate}, {endDate}) < 1        error: end date not after start
{password} != {passwordRepeat}                  error: fields don't match
{advance} > {total}                             error: advance exceeds total
len({phone}) > 0 && !startsWithAny({phone}, "+370")   error: filled but wrong prefix
```

The last pattern (*filled AND wrong*) makes a rule optional: it only fires once the user typed something.

**Apply if** solves the same thing declaratively: set *Apply if* to `len({phone}) > 0` and the condition to `!startsWithAny({phone}, "+370")`.

## When validation runs

**Validation execution mode** (per element, in *Execution modes*) controls the trigger:

| Mode | Validates |
| --- | --- |
| `onBlur` (default) | when leaving the field |
| `onChange` | when the value changes |
| `onInput` | on every keystroke |

## Input masks vs. validators

Masks (Text element) *prevent* wrong input while typing; validators *check* afterwards. For strict formats use both: a `date` mask plus a `pattern` validator.

## Error summary

**Form settings → Show validation issues modal** lists all failing fields in a dialog after a failed submit, which helps on long, multi-page forms.

## Server-side errors

Developers can attach extra errors to any element from the host application (`setElementErrors`), e.g. *"E-mail already registered"* after a backend check. They render exactly like validator errors.

## Good error messages

- Say what is expected, not just "invalid": `Company code is 9 digits`, not `Wrong format`.
- Keep the message next to the rule that triggers it; each validator has its own message.
- For translated views, provide messages in each language via the [Translations](./translations) tab.
