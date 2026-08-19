---
title: Standalone elements
description: Use the built-in elements directly in your own templates, without rendering a saved view.
---

# Standalone elements

The runtime renders a whole saved view. Sometimes you only want one element, or a handful,
placed inside a screen you wrote by hand. `<nvb-element>` does that: it takes the same
configuration JSON the builder saves and renders that single element wherever you put it.

This is meant for the screens you keep writing yourself. The checkout page, the settings
form, the admin tool that never fitted the builder. Those screens can now use the same
controls, the same tokens and the same conditional logic as everything else in your app,
instead of a second set of components that only look similar.

## Setup

Register the runtime providers once, exactly as you would for the runtime component, and
import the stylesheet:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNgxViewBuilderRuntime } from 'ngx-view-builder';

bootstrapApplication(AppComponent, {
  providers: [provideNgxViewBuilderRuntime()],
});
```

```css
@import 'ngx-view-builder/styles/index.css';
```

Icons need no setup. The plus and minus of a number stepper, the chevron of an accordion,
the calendar of a datepicker: every glyph a built-in element draws is inline SVG that ships
with the package, swapped in as the element renders. There is no icon font to install and
nothing to load over the network. Your own icons go in through
[Custom SVG icons](./icons), the same way they do in the runtime.

The stylesheet is not optional here. Element components carry their own layout, but every
size, colour and radius comes from tokens that only this file declares, so without it the
controls render at the wrong height with no theme at all. If your application already uses
cascade layers, read [Layer order](./installation#layer-order) as well: ours has to be
placed among yours or unlayered host CSS quietly wins over all of it.

## One element

```ts
import { Component, signal } from '@angular/core';
import { NvbElement, NvbScope } from 'ngx-view-builder';

@Component({
  selector: 'app-quick-form',
  imports: [NvbScope, NvbElement],
  template: `
    <nvb-scope [(data)]="form">
      <nvb-element type="text" [config]="emailConfig" />
    </nvb-scope>
  `,
})
export class QuickFormComponent {
  form = signal<Record<string, unknown>>({});

  emailConfig = {
    name: 'email',
    label: 'Email',
    placeholder: 'jane@company.com',
    required: true,
  };
}
```

`type` is the element type, the same string the builder writes in a view. `config` is that
element's own JSON. You can copy a definition out of a saved view and paste it here
unchanged, which also means the property reference in these docs applies as is.

## Scopes

`<nvb-scope>` gives the elements inside it one shared data object and one shared namespace.
That is what lets them see each other:

```html
<nvb-scope [(data)]="form">
  <nvb-element type="select" [config]="countryConfig" />
  <nvb-element type="text" [config]="vatConfig" />
</nvb-scope>
```

```ts
countryConfig = {
  name: 'country',
  label: 'Country',
  options: [
    { label: 'Lithuania', value: 'LT' },
    { label: 'Latvia', value: 'LV' },
  ],
};

vatConfig = {
  name: 'vat',
  label: 'VAT code',
  visibleIf: "country == 'LT'",
};
```

The element name is the key in the data object and the name expressions refer to. Rename an
element and every expression pointing at the old name quietly stops matching, so treat the
name as part of the contract.

Use one scope per screen. Two scopes never see each other, which means two different pages
can both have a field called `amount` without any risk of collision. An element written
without a surrounding scope falls back to a shared application wide scope, which is fine for
a single isolated control but becomes a trap as soon as names repeat, so prefer to always
write the scope.

## Getting data out

Three ways, from the broadest to the narrowest.

**The whole scope.** `[(data)]` is a two way binding to your own signal. It updates after
every change, including values written by an expression rather than typed by a person, and
writing to the signal pushes the values back into the elements.

**One element.** `(valueChange)` fires when that element's own value changes, whoever
changed it:

```html
<nvb-element type="select" [config]="countryConfig" (valueChange)="onCountry($event)" />
```

```ts
onCountry(event: INvbElementValueChange): void {
  // event.name, event.value, event.previousValue
}
```

**Actions.** Buttons and other elements run the actions configured in their `events`. Give
an action an `actionCode` and listen for it, which is how you run your own code from a
button:

```ts
saveConfig = {
  name: 'save',
  text: 'Save',
  tone: 'primary',
  events: [{ trigger: 'click', actionCode: 'saveInvoice' }],
};
```

```html
<nvb-element type="button" [config]="saveConfig" (action)="onAction($event)" />
```

The event carries `actionCode`, `trigger`, the whole action configuration and whether it
succeeded. Actions with a built in `type`, such as `navigate` or `dataSource`, still do
their own work; the output simply lets you react to them as well.

Reactive forms are not supported yet. There is no `ControlValueAccessor`, so
`formControlName` will not bind. Use `[(data)]` or `(valueChange)` instead.

## Containers

Nest the tags to express containment:

```html
<nvb-scope [(data)]="form">
  <nvb-element type="panel" [config]="addressPanel">
    <nvb-element type="text" [config]="streetConfig" />
    <nvb-element type="text" [config]="zipConfig" />
  </nvb-element>
</nvb-scope>
```

A nested tag renders nothing by itself. It contributes its definition and its position in
the tree, and the container decides where and how many times its children appear. That is
why an accordion shows its content inside the open section and a dialog shows it inside the
overlay, without you arranging anything.

`panel`, `dialog`, `accordion`, `progressFlow` and `emptyBlock` all work this way.

### Tabs

Tabs keep their children per tab, so the tab each child belongs to has to be stated:

```html
<nvb-element type="tabs" [config]="tabsConfig">
  <nvb-tab value="details">
    <nvb-element type="text" [config]="titleConfig" />
  </nvb-tab>
  <nvb-tab value="pricing">
    <nvb-element type="number" [config]="priceConfig" />
  </nvb-tab>
</nvb-element>
```

```ts
tabsConfig = {
  name: 'productTabs',
  tabs: [
    { label: 'Details', value: 'details' },
    { label: 'Pricing', value: 'pricing' },
  ],
};
```

The `value` of an `<nvb-tab>` has to match the `value` of one of the tabs in the config.

### Not supported yet

`dynamicPanel` and `splitter` are runtime only for now. The repeater builds a model per
data row, and the splitter needs a marker per pane in the same way tabs do. For a screen
that leans on either of them, render a saved view with `<ngx-view-builder-runtime>`
instead.

## Tables

Both table elements work, and they take their data from different places.

`dynamicTable` is the editable one. Its columns come from the configuration, and each
column is an element definition:

```ts
linesConfig = {
  name: 'lines',
  label: 'Order lines',
  addRowButtonText: 'Add line',
  columns: [
    { type: 'text', name: 'product', label: 'Product' },
    { type: 'number', name: 'qty', label: 'Qty' },
  ],
};
```

`table` is the read only one. Without a data source it reads its rows straight from the
scope data, so an array is all it needs. Sorting, quick search and paging then run in the
browser:

```ts
form = signal({
  invoices: [
    { number: '2026-011', customer: 'Alfa UAB', total: 1240.5 },
    { number: '2026-012', customer: 'Beta AB', total: 890 },
  ],
});

invoicesConfig = {
  name: 'invoices',
  paginator: true,
  pageSize: 5,
  showQuickSearch: true,
  columnsConfig: [
    { key: 'number', label: 'Number', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    {
      key: 'total',
      label: 'Total',
      type: 'number',
      align: 'right',
      numberMinFractionDigits: 2,
      numberMaxFractionDigits: 2,
    },
  ],
};
```

The two use different property names on purpose. `dynamicTable` has `columns`, and every
entry is an element with a `name`, because each cell is an editable control. `table` has
`columnsConfig`, and every entry is a column with a `key` naming the field to read from the
row object.

## Logic

Everything the builder offers in the logic panel works here, because it is the same engine.
Conditions live on the element and refer to other elements by name:

```ts
{ name: 'vat', visibleIf: "country == 'LT'" }
{ name: 'discount', disableIf: 'total < 100' }
{ name: 'total', expression: '{price} * {quantity}' }
{ name: 'shipping', requireIf: "delivery == 'courier'" }
```

Expressions read the shared data object, not the element models. A field whose value sits
in the data still resolves even when the element that owns it is not on screen, for example
because it lives in a tab that is currently closed. A name that is not in the data at all
resolves to `undefined`, which is not an error, just a condition that comes out false.

Validators are configured the same way and run automatically, including on values that an
expression computed rather than a person typed:

```ts
{
  name: 'total',
  expression: '{price} * {quantity}',
  validators: [{ type: 'max', value: 400, message: 'Must not exceed 400' }],
}
```

## Theming

The elements read their appearance from CSS variables. Set them on the element container
and the whole set follows, with no build step:

```css
.nvb-root {
  --nvb-color-primary-500: #0f7b7b;
  --nvb-input-radius: 12px;
  --nvb-control-height: 44px;
}
```

Two things are worth knowing before writing a theme.

The variables have to sit on the element container itself or on something inside it.
`.nvb-root` is where the tokens are declared, so a value set on an ancestor of it loses to
that declaration. Putting the override on the `<nvb-scope>` element works, because an
inline style wins over a class rule.

The neutral ramp is a surface system, not only text. `--nvb-color-neutral-000` paints the
background of panels, tab strips and accordions, `--nvb-color-neutral-300` draws their borders
and `--nvb-color-neutral-800` colours the field labels. A dark theme that sets only the
`--nvb-color-text-*` variables leaves all of those light and ends up half converted.

The full token list is in [Theming and design tokens](/developers/theming).

## Translations

Two separate systems, and both are driven from the scope.

The strings the library ships with, such as the add row button or the confirmation dialog,
come from the UI dictionary registered once in your application:

```ts
provideNgxViewBuilderUiTranslations({
  lt: { 'confirm.confirm': 'Tęsti' },
});
```

The labels and placeholders you wrote in the configuration are translated from a dictionary
you pass to the scope, keyed by the structure path exactly as the builder exports it:

```html
<nvb-scope [(data)]="form" [language]="lang()" [translations]="texts">
```

```ts
texts = {
  lt: {
    'elements.email.label': 'El. paštas',
    'elements.email.placeholder': 'jonas@imone.lt',
  },
};
```

`language` switches both at once. A key with no translation keeps its original text.

## Layout and width

Several elements change their layout when their container gets narrow, and that is a
measurement of the container, not of the window. Tabs stack vertically and tables switch to
a label and value list below roughly 768 pixels of container width. On a wide screen inside
a narrow column that still counts as narrow, so if a table or a tab strip suddenly looks
like its mobile form, check how much width its column actually has.

## Alongside the runtime

A runtime component and standalone elements can sit on the same page. Each runtime creates
its own services, and so does each scope, so identical names on both sides are unrelated
keys and nothing collides. Styling is separate too, because the runtime renders inside a
shadow root and re-declares its tokens there.

One thing is shared. The runtime reports its measured content width to the whole
application, and that is what the width based layout switching reads. A runtime inside a
narrow column therefore makes every standalone element on the page believe the viewport is
that narrow. If you combine the two at very different widths, check the result.

## Reference

| Tag | Input | Purpose |
| --- | --- | --- |
| `<nvb-scope>` | `[(data)]` | Two way binding to the shared data object |
| | `[language]` | Language for both translation systems |
| | `[translations]` | Label translations, keyed by structure path |
| `<nvb-element>` | `[type]` | Element type, as written in a saved view |
| | `[config]` | The element's own configuration JSON |
| | `(valueChange)` | This element's value changed |
| | `(action)` | This element ran one of its actions |
| `<nvb-tab>` | `[value]` | Which tab of the parent tabs element the children belong to |
