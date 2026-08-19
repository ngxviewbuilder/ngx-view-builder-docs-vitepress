---
title: Theming & design tokens
description: Light/dark modes, token overrides, and full custom themes.
---

# Theming & design tokens

All visuals derive from CSS custom properties (design tokens): color scales, fonts, radii. Theming = overriding tokens.

## Token families

| Family | Tokens | Used for |
| --- | --- | --- |
| Primary | `--nvb-color-primary-050 … 950` | brand, focus, active states |
| Neutral | `--nvb-color-neutral-000 … 950` | surfaces, borders, text |
| Risk / Warning / Caution | `--nvb-color-risk-*`, `--nvb-color-warning-*` | destructive & warning states |
| Success / Info | `--nvb-color-success-*`, `--nvb-color-info-*` | positive & informational states |
| Typography | `--nvb-font-family-base` | base font stack |

Values are `oklch(...)` colors on an 050-950 scale (050 lightest). Components mix tokens with `color-mix()`, so overriding a scale re-colors everything consistently.

## Where the tokens live

Every name carries the `nvb-` prefix, and the declarations sit on `.nvb-root` and on the runtime's shadow host, never on `:root`. Both parts matter for a host application.

The prefix keeps our palette out of yours. A design system that stores its colors as HSL channel triplets for Tailwind writes `--color-neutral-300: 214 32% 91%`, and a library declaring that same name as an oklch color would win inside the view. Any host rule that still applied there would then compute `hsl(oklch(...))`, which is not a color at all, so the declaration would fall back to `currentColor` and inputs would come out with thick black borders. Prefixed names cannot collide, so both palettes stay intact.

Not putting them on `:root` keeps the reverse true: importing our stylesheet cannot change how the rest of your application looks.

`--nvb-surface` is the one token meant for the host rather than for us. `.nvb-root` paints its own background so a light theme stays readable on a dark page, and setting `--nvb-surface: transparent` turns that off when the view already sits on a surface you control.

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
  '--nvb-color-primary-500': 'oklch(64% 0.19 145)',   // brand green
  '--nvb-font-family-base': "'Inter', sans-serif",
});
```

or declaratively: `[cssVariables]="{ '--nvb-color-primary-500': '...' }"`.

**Full custom theme**, with per-mode token sets:

```ts
api.setCustomTheme({
  shared: { '--nvb-font-family-base': "'Inter', sans-serif" },
  light:  { '--nvb-color-primary-500': 'oklch(64% 0.19 145)' },
  dark:   { '--nvb-color-primary-500': 'oklch(72% 0.17 145)' },
  mergeWithDefaults: true,     // start from the built-in theme
});
```

`runtimeSettings.customTheme` accepts the same object at bootstrap.

## Custom elements & theming

Write custom element styles against the tokens and they follow every theme automatically:

```css
.note {
  background: color-mix(in oklab, var(--nvb-color-info-100) 24%, var(--nvb-color-neutral-000));
  border: 1px solid var(--nvb-color-neutral-300);
  color: var(--nvb-color-neutral-900);
}
```

Never hardcode hex colors in element components; dark mode will break.

## Related events

`onThemeModeChanged`, `onCustomThemeChanged`, `onCssVariablesChanged` fire on every change, which is handy for syncing the host app's own chrome.

For per-view CSS (rather than tokens), see [Custom CSS](./custom-css).
