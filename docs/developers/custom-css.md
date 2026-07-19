---
title: Custom CSS
description: Per-view and host-injected CSS on top of the theme system.
---

# Custom CSS

Tokens ([Theming](./theming)) restyle the system consistently. Custom CSS is the escape hatch for anything more specific.

## Three injection points

| Where | Scope | Set by |
| --- | --- | --- |
| **Form settings → Custom CSS** | one view | creator (stored in `settings.customCss`) |
| `api.setCustomCss(css)` | current session | host |
| `api.setCustomCssUrls([url])` | current session, external files | host |

```ts
api.setCustomCss(`
  .nvb-panel { border-radius: 12px; }
  .invoice-total { font-weight: 700; font-size: 18px; }
`);

api.setCustomCssUrls(['/assets/builder-overrides.css']);
```

Declarative equivalents exist on `runtimeSettings` (`customCss`, `customCssUrls`) and in the structure itself.

## Targeting elements

- Elements render with stable identity hooks — prefer targeting by the element's id/test-id attributes or by classes you add in templates, rather than by internal DOM structure.
- Template HTML ([template library](../creators/templates)) carries its own scoped CSS — for card layouts, prefer a template's CSS over global custom CSS.
- Custom-HTML elements can include class names that your custom CSS styles.

## Sanitisation

Injected CSS is passed through markup security processing. Keep it to plain rules; imports of arbitrary origins should go through `customCssUrls` where the host controls the list.

## Recommended layering

1. **Tokens** for colors, fonts, radii → whole-system consistency.
2. **Template CSS** for repeatable card/option layouts.
3. **View Custom CSS** for one-off tweaks a creator owns.
4. **Host CSS URLs** for org-wide overrides versioned with the app.

Track changes via `onCustomCssChanged` / `onCustomCssUrlsChanged`.
