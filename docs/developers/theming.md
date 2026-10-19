---
title: Theming & design tokens
description: "Theme NGX View Builder with design tokens: light and dark mode, overriding tokens to match your Angular app, and theming custom elements."
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
| Charts | `--nvb-chart-single`, `--nvb-chart-1 … 8`, `--nvb-chart-other` | chart colors (see below) |

Values are `oklch(...)` colors on an 050-950 scale (050 lightest). Components mix tokens with `color-mix()`, so overriding a scale re-colors everything consistently.

## Where the tokens live

Every name carries the `nvb-` prefix, and the declarations sit on `.nvb-root` and on the runtime's shadow host, never on `:root`. Both parts matter for a host application.

The prefix keeps our palette out of yours. A design system that stores its colors as HSL channel triplets for Tailwind writes `--color-neutral-300: 214 32% 91%`, and a library declaring that same name as an oklch color would win inside the view. Any host rule that still applied there would then compute `hsl(oklch(...))`, which is not a color at all, so the declaration would fall back to `currentColor` and inputs would come out with thick black borders. Prefixed names cannot collide, so both palettes stay intact.

Not putting them on `:root` keeps the reverse true: importing our stylesheet cannot change how the rest of your application looks.

`--nvb-surface` is the one token meant for the host rather than for us. `.nvb-root` paints its own background so a light theme stays readable on a dark page, and setting `--nvb-surface: transparent` turns that off when the view already sits on a surface you control.

### Chart colors

A bar, line or area chart has one series and draws it in `--nvb-chart-single`, which is your primary color by default. Pie and donut slices take `--nvb-chart-1` to `--nvb-chart-8` in order, and the folded *Other* slice `--nvb-chart-other`. The default eight are a palette checked for color blind readers in both modes, and their order is part of that: neighbours were picked to stay apart. To match your brand, override the values but keep a similar spread of hues, and give the dark mode its own steps through `setCustomTheme` if you change them.

## Light / dark mode

```html
<ngx-view-builder-designer [theme]="'dark'" ... />
<ngx-view-builder-runtime  [theme]="theme()" ... />
```

or `api.setThemeMode('dark')`. Creators can also set a default in Form settings.

A panel used as a page section with **Section colours: Dark** takes the dark palette for itself only, inside a light view. It does this by matching the `.nvb-section-theme-dark` class in the same token block as the dark theme, so your dark overrides from `setCustomTheme` apply there too.

## Overriding tokens

**Quick overrides**, a flat map applied on top of the active theme:

```ts
api.setCssVariables({
  '--nvb-color-primary-500': 'oklch(64% 0.19 145)',   // brand green
  '--nvb-font-family-base': "'Inter', sans-serif",
});
```

or declaratively: `[cssVariables]="{ '--nvb-color-primary-500': '...' }"`, or `runtimeSettings.cssVariables` at bootstrap.

These refine the theme, they do not replace it. Only the variables you pass change, and everything else keeps coming from the active light or dark theme. So one brand color in dark mode leaves the rest of the dark palette alone, and when the mode switches the same overrides are applied again on top of the new theme. If you want a different set per mode, that is what `setCustomTheme` below is for.

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

## Motion

The builder and the runtime move a little where it explains a change: an element dropped on the canvas settles into place, dialogs and menus fade in, a validation message or a new table row appears instead of popping, a toast slides in. Everything takes 120 to 180 ms and animates only opacity and position, so large forms are not slowed down.

| Token | Default | Used for |
| --- | --- | --- |
| `--nvb-motion-duration-fast` | `120ms` | messages, menus, backdrops |
| `--nvb-motion-duration` | `180ms` | dialogs, drops, toasts, added rows |
| `--nvb-motion-easing` | `cubic-bezier(0.2, 0, 0, 1)` | all of them |

Set both durations to `0ms` to turn motion off, for example in end-to-end tests that take screenshots:

```ts
api.setCssVariables({ '--nvb-motion-duration-fast': '0ms', '--nvb-motion-duration': '0ms' });
```

A person who asks their system for reduced motion gets it off without anything from you.

## Component tokens

Below the colour scales, elements read their own variables. Each falls back to the scales, so leaving them alone keeps everything consistent, and setting one changes that part of every element that uses it. Pass them like any other token, through `cssVariables` or `setCssVariables`.

| Family | Tokens | Used by |
| --- | --- | --- |
| Inputs | `--nvb-input-height`, `--nvb-input-radius`, `--nvb-input-padding-x`, `--nvb-input-font-size`, `--nvb-input-bg`, `--nvb-input-text-color`, `--nvb-input-border-color`, `--nvb-input-border-width`, `--nvb-input-focus-border-color`, `--nvb-input-placeholder-color`, `--nvb-input-disabled-bg`, `--nvb-input-disabled-text-color`, `--nvb-input-error-border-color` | text fields, selects, date pickers, the quick search boxes |
| Controls | `--nvb-control-height`, `--nvb-control-height-sm`, `--nvb-control-radius`, `--nvb-control-padding-x`, `--nvb-control-font-size`, `--nvb-control-font-weight`, `--nvb-control-button-*` | buttons inside elements, segmented controls |
| Checkbox / radio | `--nvb-checkbox-*`, `--nvb-radio-*` (size, radius, border, checked and disabled colours) | checkboxes, radio groups, toggles |
| Cards | `--nvb-card-bg`, `--nvb-card-border-color`, `--nvb-card-radius`, `--nvb-card-padding`, `--nvb-card-shadow` | panels, dynamic panels, stats cards, list grid cards, tables, tabs, accordions, dialogs, date pickers |
| Textarea | `--nvb-textarea-min-height`, `--nvb-textarea-padding-x`, `--nvb-textarea-padding-y` | textareas |
| Navigation menu | `--nvb-nav-menu-item-height`, `--nvb-nav-menu-item-radius`, `--nvb-nav-menu-item-color`, `--nvb-nav-menu-item-hover-bg`, `--nvb-nav-menu-active-color`, `--nvb-nav-menu-active-bg`, `--nvb-nav-menu-badge-bg`, `--nvb-nav-menu-badge-color`, `--nvb-nav-menu-active-badge-bg`, `--nvb-nav-menu-heading-color`, `--nvb-nav-menu-divider-color`, `--nvb-nav-menu-subitem-indent`, `--nvb-nav-menu-dropdown-bg`, `--nvb-nav-menu-gap`, `--nvb-nav-menu-font-size` | the Navigation menu |
| Dynamic panel search | `--nvb-dynamic-panel-search-width` (plus the input tokens) | the quick search in a dynamic panel's header |
| Stats card goal | `--nvb-stats-card-goal-height`, `--nvb-stats-card-goal-track`, `--nvb-stats-card-goal-fill` | the goal bar of a stats card |

A green sidebar and flatter cards, for example:

```ts
api.setCssVariables({
  '--nvb-nav-menu-active-bg': 'oklch(95% 0.03 145)',
  '--nvb-nav-menu-active-color': 'oklch(42% 0.09 145)',
  '--nvb-card-radius': '10px',
  '--nvb-card-shadow': 'none',
});
```

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
