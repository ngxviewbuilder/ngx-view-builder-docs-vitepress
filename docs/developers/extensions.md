---
title: Extensions overview
description: One config object registers everything custom, from elements and functions to properties, icons, and tabs.
---

# Extensions overview

All customisation funnels through a single config type, `INgxViewBuilderExtensionsConfig`, registered either at bootstrap or at runtime.

## Registering

**At bootstrap (recommended):**

```ts
import { provideNgxViewBuilderExtensions } from 'ngx-view-builder';

providers: [
  provideNgxViewBuilderExtensions({
    elements: [...],
    expressionFunctions: [...],
    svgIcons: {...},
  }),
]
```

The provider also accepts a factory (sync or async), which helps when the config comes from an API:

```ts
provideNgxViewBuilderExtensions(async () => {
  const cfg = await fetch('/api/builder-config').then((r) => r.json());
  return { runtimeVariableContext: cfg.context, svgIcons: cfg.icons };
}),
```

**At runtime:**

```ts
api.registerExtensions(config);
await api.registerExtensionsAsync(config);   // resolves icon directories etc.
```

Multiple `provideNgxViewBuilderExtensions(...)` calls compose; plugins use the same mechanism.

## What the config can contain

| Key | Registers | Details |
| --- | --- | --- |
| `elements` | custom element types | [Custom elements](./custom-elements) |
| `elementGroups` | new sidebar groups | id, label, icon, order |
| `expressionFunctions` | JEXL functions | [Custom functions](./custom-functions) |
| `globalProperties` | properties added to *every* element | [Custom properties](./custom-properties) |
| `elementProperties` | per-type property overrides/additions | [Custom properties](./custom-properties) |
| `svgIcons` / `svgIconDirectory` / `svgIconDirectories` | icons by name / from asset folders | [Icons](./icons) |
| `builderTabs` | extra builder tabs | [Building a plugin](./plugin-development) |
| `featurePacks` | bundles of tabs + capabilities | [Building a plugin](./plugin-development) |
| `runtimeVariables` / `runtimeVariableContext` | variables for expressions | [Runtime variables](./runtime-variables) |
| `uiDictionaries` | builder UI translations | [UI translations](./ui-translations) |
| `triggers` / `rules` / `process` / `fragments` | automation definitions | consumed by the automation plugins |

## Example: a project preset

```ts
provideNgxViewBuilderExtensions({
  elementGroups: [{ code: 'acme', label: 'ACME widgets', icon: 'acmeLogo', order: 10 }],
  elements: [acmeCardElement, acmeRatingElement],
  expressionFunctions: [
    { name: 'vatAmount', args: ['net'], description: 'Adds 21% VAT',
      example: 'vatAmount({netPrice})',
      handler: (net: unknown) => Number(net || 0) * 1.21 },
  ],
  globalProperties: {
    trackingId: { label: 'Tracking ID', type: 'text', category: 'general' },
  },
  svgIcons: { acmeLogo: '<svg ...>...</svg>' },
  runtimeVariableContext: { brand: 'acme' },
});
```

Everything a creator then sees (the ACME group, the elements, the `vatAmount()` function, the extra property) comes from this one object.
