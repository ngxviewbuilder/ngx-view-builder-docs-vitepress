---
title: Theming & design tokens
description: Light/dark modes, token overrides, and full custom themes.
---

# Theming & design tokens

All visuals derive from CSS custom properties (design tokens): color scales, fonts, radii. Theming = overriding tokens.

## Token families

| Family | Tokens | Used for |
| --- | --- | --- |
| Primary | `--color-primary-050 … 950` | brand, focus, active states |
| Neutral | `--color-neutral-000 … 950` | surfaces, borders, text |
| Risk / Warning / Caution | `--color-risk-*`, `--color-warning-*` | destructive & warning states |
| Success / Info | `--color-success-*`, `--color-info-*` | positive & informational states |
| Typography | `--nvb-font-family-base` | base font stack |

Values are `oklch(...)` colors on an 050-950 scale (050 lightest). Components mix tokens with `color-mix()`, so overriding a scale re-colors everything consistently.

## Light / dark mode

```html
<ngx-view-builder-builder [theme]="'dark'" ... />
<ngx-view-builder-runtime  [theme]="theme()" ... />
```

or `api.setThemeMode('dark')`. Creators can also set a default in Form settings.

## Overriding tokens

**Quick overrides**, a flat map applied on top of the active theme:

```ts
api.setCssVariables({
  '--color-primary-500': 'oklch(64% 0.19 145)',   // brand green
  '--nvb-font-family-base': "'Inter', sans-serif",
});
```

or declaratively: `[cssVariables]="{ '--color-primary-500': '...' }"`.

**Full custom theme**, with per-mode token sets:

```ts
api.setCustomTheme({
  shared: { '--nvb-font-family-base': "'Inter', sans-serif" },
  light:  { '--color-primary-500': 'oklch(64% 0.19 145)' },
  dark:   { '--color-primary-500': 'oklch(72% 0.17 145)' },
  mergeWithDefaults: true,     // start from the built-in theme
});
```

`runtimeSettings.customTheme` accepts the same object at bootstrap.

## Custom elements & theming

Write custom element styles against the tokens and they follow every theme automatically:

```css
.note {
  background: color-mix(in oklab, var(--color-info-100) 24%, var(--color-neutral-000));
  border: 1px solid var(--color-neutral-300);
  color: var(--color-neutral-900);
}
```

Never hardcode hex colors in element components; dark mode will break.

## Related events

`onThemeModeChanged`, `onCustomThemeChanged`, `onCssVariablesChanged` fire on every change, which is handy for syncing the host app's own chrome.

For per-view CSS (rather than tokens), see [Custom CSS](./custom-css).
