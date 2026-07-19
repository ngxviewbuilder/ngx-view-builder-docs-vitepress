---
title: Custom expression functions
description: Add project-specific functions to the expression language.
---

# Custom expression functions

Creators write expressions like `isEmpty({email})`. You can add your own functions so they can write `vatAmount({netPrice})` or `isWorkday({date})`.

## Registration

```ts
import { provideNgxViewBuilderExtensions, IJexlFunctionRegistration } from 'ngx-view-builder';

const functions: IJexlFunctionRegistration[] = [
  {
    name: 'vatAmount',
    args: ['net', 'rate(optional)'],
    description: 'Net price + VAT (default 21%)',
    example: 'vatAmount({netPrice})',
    handler: (net: unknown, rate?: unknown) =>
      Number(net || 0) * (1 + (Number(rate) || 0.21)),
  },
  {
    name: 'formatIban',
    args: ['iban'],
    description: 'Groups an IBAN into blocks of 4',
    example: 'formatIban({accountNumber})',
    handler: (iban: unknown) =>
      String(iban ?? '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim(),
  },
];

providers: [
  provideNgxViewBuilderExtensions({ expressionFunctions: functions }),
]
```

Or at runtime: `api.registerExpressionFunction(fn)` / `api.registerExpressionFunctions(fns)`.

## Registration fields

| Field | Purpose |
| --- | --- |
| `name` | The identifier used in expressions (re-registering a name replaces it) |
| `handler` | The implementation — may return a value or a `Promise` |
| `args` | Argument names, shown in the expression editor's help |
| `description` / `example` | Shown in the editor's function list — write them well; creators rely on this |

Custom functions are flagged `isCustom` and appear alongside the [built-ins](../creators/functions) in the editor's help panel.

## Async functions

Handlers may be async (the built-in `runDataSource` is). Note that *synchronous* evaluation contexts (e.g. inline default-value evaluation) skip expressions containing async functions — keep functions used in `defaultValue` synchronous.

## Guidelines

- **Be forgiving with inputs.** Creators will pass empty strings and `null` — coerce (`Number(x) || 0`, `String(x ?? '')`) instead of throwing. A thrown error silently fails the whole expression.
- **Return simple types** (string, number, boolean, array, plain object) that JSON-serialise cleanly.
- **Keep them pure** where possible. Functions with side effects (like `setElementProperty`) are powerful but make views harder to reason about.
- **Namespace by convention** if you register many: `acmeVat()`, `acmeRound()` — function names are global.
