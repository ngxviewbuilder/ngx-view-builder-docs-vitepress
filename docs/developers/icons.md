---
title: Custom SVG icons
description: Register icons by name for elements, buttons, and the builder UI.
---

# Custom SVG icons

Icons are referenced by **name** everywhere (element `icon` properties, buttons, sidebar groups, header actions). Register your own names once; creators then use them like built-ins.

## Inline registration

```ts
provideNgxViewBuilderExtensions({
  svgIcons: {
    acmeLogo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">…</svg>`,
    rocket:   `<svg viewBox="0 0 24 24">…</svg>`,
  },
});
```

Runtime: `api.registerSvgIcon(name, svg)` / `api.registerSvgIcons(map)` (both accept `overwrite`).

## Loading from asset folders

```ts
provideNgxViewBuilderExtensions({
  svgIconDirectory: {
    basePath: '/assets/icons',
    names: ['invoice', 'shipment', 'warehouse'],
    extension: 'svg',        // default
    prefix: 'acme',          // registered as acmeInvoice, acmeShipment, …
  },
});
```

Multiple folders via `svgIconDirectories: [...]`. Runtime loading (`await api.registerSvgIconDirectory(cfg)`) resolves fetches and returns `{ loaded, failed }`.

## Using icons

- **Creators**: type the icon name into any `Icon` property (button icon, Icon element, sidebar group…).
- **In your components**: the exported `NvbIcon` component renders any registered icon:

```html
<nvb-icon name="acmeLogo" />
```

## SVG guidelines

- Use `viewBox` and no fixed `width`/`height`; the host sizes the icon.
- Use `currentColor` for strokes/fills so icons follow text color and theme.
- Keep markup minimal; icons are inlined into the DOM.
- Registered SVG is sanitised, so keep icons to plain vector markup (no scripts or foreignObject).
