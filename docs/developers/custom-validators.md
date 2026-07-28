---
title: Custom validator types
description: Register your own named validation rules so creators pick them from the Type list instead of writing regular expressions.
---

# Custom validator types

The built-in validator types (`required`, `minLength`, `pattern`, `email`, …) are deliberately generic. Anything country-specific a personal code, a tax ID, a phone number, a bank account differs per market, so those rules live in _your_ application, not in the library.

A registered type appears in the builder's **Type** list next to the built-ins, and from then on a creator picks _LT personal code_ the same way they pick _email_. No regular expression, no expression language.

## Registration

```ts
import {
  provideNgxViewBuilderExtensions,
  INgxViewBuilderValidatorTypeRegistration,
} from "ngx-view-builder";

const validatorTypes: INgxViewBuilderValidatorTypeRegistration[] = [
  {
    type: "ltPersonalCode",
    label: "LT personal code",
    defaultMessage: "Invalid personal code",
    appliesTo: ["text"],
    isValid: ({ value }) => isValidLtPersonalCode(String(value ?? "")),
  },
  {
    type: "minWords",
    label: "Minimum words",
    defaultMessage: "Please write at least {value} words",
    hasValue: true,
    valueLabel: "Words",
    valuePlaceholder: "20",
    appliesTo: ["textarea"],
    isValid: ({ value, validatorValue }) =>
      String(value ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length >= Number(validatorValue || 0),
  },
];

providers: [provideNgxViewBuilderExtensions({ validatorTypes })];
```

Or at runtime: `api.registerValidatorType(definition)` / `api.registerValidatorTypes(definitions)`. Register early in an `APP_INITIALIZER` or the host component's `ngOnInit` so the types exist before a view is rendered.

## Registration fields

| Field                             | Purpose                                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`                            | The identifier stored in the view JSON. Lower-cased on save, so `ltPersonalCode` and `ltpersonalcode` are the same rule. Built-in names cannot be overridden |
| `isValid`                         | The check. **Returns `true` when the value is valid** the opposite polarity of a `custom` rule's condition. May return a `Promise`                           |
| `label`                           | Text shown in the Type list (defaults to `type`)                                                                                                             |
| `defaultMessage`                  | Pre-filled into the rule's _Error message_ field when a creator picks the type, and used at runtime when the message is left empty                           |
| `hasValue`                        | Set `true` when the rule needs a setting, which shows the **Value** input (like `minLength`)                                                                 |
| `valueLabel` / `valuePlaceholder` | Label and placeholder for that Value input                                                                                                                   |
| `appliesTo`                       | Element types the rule is offered for, e.g. `['text', 'textarea']`. Omit to offer it everywhere                                                              |
| `validateEmpty`                   | By default an empty value passes (matching `email` and `pattern`) so the rule stays optional; set `true` to check empty values too                           |

::: warning Polarity
`isValid` returns **true = valid**. A `custom` rule's _Condition_ field is the other way round it describes the **error** and fires while it is true. The names match the behaviour in both cases; do not copy a condition expression into an `isValid` handler unchanged.
:::

## What `isValid` receives

```ts
isValid: ({ value, validatorValue, validator, element, data }) =>
  boolean | Promise<boolean>;
```

| Field            | Contents                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| `value`          | The current value of the field being validated                             |
| `validatorValue` | The rule's **Value** setting (present when `hasValue` is on)               |
| `validator`      | The whole rule object (`type`, `message`, `value`, `condition`, `applyIf`) |
| `element`        | The element model being validated                                          |
| `data`           | The full runtime data object, for rules that depend on other fields        |

Everything else keeps working as usual: the creator can still set a per-rule error message, translate it, and guard the rule with **Apply if**.

## Async rules

`isValid` may return a `Promise`, which makes server-side checks possible (verifying a VAT number against a registry, for example):

```ts
{
  type: 'vatNumber',
  label: 'VAT number',
  defaultMessage: 'This VAT number was not found',
  isValid: async ({ value }) => {
    const response = await fetch(`/api/vat/${encodeURIComponent(String(value ?? ''))}`);
    return response.ok;
  },
}
```

If you do this, set the element's **Validation execution mode** to `onBlur` (the default) rather than `onInput`, or every keystroke becomes a request.

## Portability

The rule _definition_ lives in your application; the view JSON only stores the name:

```json
{ "type": "ltPersonalCode", "message": "Invalid personal code" }
```

That keeps views portable, but it also means a view using `ltPersonalCode` needs that type registered wherever it is rendered. In an application where it is not registered the rule is **skipped** (the field validates as if the rule were absent) and a warning is logged to the console once per unknown type. The builder still shows the rule and marks it `(not registered)` instead of silently rewriting it, so opening a view in another app never destroys the rule.

If several applications share views, register the shared types from one small library rather than copy-pasting the handlers.

## Guidelines

- **Be forgiving with input.** Creators and users will hand you `null`, `''`, and stray whitespace. Coerce (`String(value ?? '').trim()`) instead of throwing a handler that throws is treated as invalid and logs an error.
- **Keep the message useful.** `Company code must be 9 digits` beats `Invalid value`. See [good error messages](../creators/validation#good-error-messages).
- **Namespace country rules** by prefix (`ltPersonalCode`, `lvPersonalCode`) so the Type list stays readable as it grows.
- **Do not re-implement the built-ins.** Length, range, pattern, and email are already there; a custom type is for logic those cannot express.

## Related

- [Validation](../creators/validation) how creators use validators, including `custom` conditions and _Apply if_
- [Custom expression functions](./custom-functions) when the rule is better expressed as an expression creators can reuse
- [Headless validation](./validator) running the same rules outside the UI
