---
title: Custom SVG icons
description: "Register custom SVG icons in NGX View Builder by name, inline or from an asset folder, and use them on elements, buttons and in the builder."
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

- **Creators**: pick an icon in any `Icon` property (button, card, page title, toast, Icon element). The picker lists your registered icons first, under *This application*, then the built-in ones, and flags a name that does not exist. A one-off icon can also be pasted as SVG markup: the value then holds the markup itself, sanitised the same way as a registered icon.
- **AI clients** get the same list: the system instructions name every registered and built-in icon, `help().icons` returns them, and `execute()` warns about an icon name nothing draws.
- **In code**: `IconSvgService.listIconNames()` returns `{ builtIn, registered }`, `isKnownIcon(value)` tells whether a value draws a real icon, and `isInlineSvgIcon(value)` whether it is markup.
- **In your components**: the exported `NvbIcon` component renders any registered icon:

```html
<nvb-icon name="acmeLogo" />
```

## SVG guidelines

- Use `viewBox` and no fixed `width`/`height`; the host sizes the icon. An SVG with only `width` and `height` gets a matching `viewBox` added when it is sanitised, so it still scales.
- Use `currentColor` for strokes/fills so icons follow text color and theme.
- Keep markup minimal; icons are inlined into the DOM.
- Registered SVG is sanitised, so keep icons to plain vector markup (no scripts or foreignObject).
