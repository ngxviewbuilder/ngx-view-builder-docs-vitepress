---
title: Standalone element examples
description: Working recipes for using the built-in elements inside your own templates.
---

# Examples

Each recipe below is complete enough to paste into a component. They assume the setup from
[Overview](/developers/standalone-elements): runtime providers registered, stylesheet
imported, icon font available.

## A single field

The smallest useful case. One input, one signal, nothing else.

```ts
import { Component, signal } from '@angular/core';
import { NvbElement, NvbScope } from 'ngx-view-builder';

@Component({
  selector: 'app-search-bar',
  imports: [NvbScope, NvbElement],
  template: `
    <nvb-scope [(data)]="filters">
      <nvb-element type="text" [config]="queryConfig" />
    </nvb-scope>
  `,
})
export class SearchBarComponent {
  filters = signal<Record<string, unknown>>({ query: '' });

  queryConfig = {
    name: 'query',
    label: 'Search',
    placeholder: 'Order number, customer, VAT code',
  };
}
```

`filters()` always holds the current value, so a computed can filter a list off it without
any subscription.

## Reacting to one field

When you care about a single value rather than the whole object.

```html
<nvb-scope [(data)]="form">
  <nvb-element type="select" [config]="warehouseConfig" (valueChange)="onWarehouse($event)" />
</nvb-scope>
```

```ts
warehouseConfig = {
  name: 'warehouse',
  label: 'Warehouse',
  options: [
    { label: 'Vilnius', value: 'VNO' },
    { label: 'Kaunas', value: 'KUN' },
  ],
};

onWarehouse(event: INvbElementValueChange): void {
  this.loadStock(event.value as string);
}
```

The event also fires when an expression writes the value, which is usually what you want.
If you only care about what a person typed, compare `event.previousValue` or listen on the
scope instead.

## A button that runs your code

Actions are declarative, so a button that should call your service gets an `actionCode` and
no `type`. The library then does nothing on its own and simply reports it.

```ts
submitConfig = {
  name: 'submit',
  text: 'Create invoice',
  icon: 'check',
  tone: 'primary',
  events: [{ trigger: 'click', actionCode: 'createInvoice' }],
};
```

```html
<nvb-element type="button" [config]="submitConfig" (action)="onAction($event)" />
```

```ts
onAction(event: IElementActionRunEvent): void {
  if (event.actionCode === 'createInvoice') {
    this.invoices.create(this.form());
  }
}
```

To confirm first, keep it in the configuration rather than in your handler. The action only
reaches you if the user agreed:

```ts
events: [
  {
    trigger: 'click',
    actionCode: 'deleteInvoice',
    confirmEnabled: true,
    confirmTitle: 'Delete invoice',
    confirmMessage: 'This cannot be undone.',
  },
],
```

## A form section with conditional fields

The reason to put several elements in one scope: they can see each other.

```html
<nvb-scope [(data)]="form">
  <nvb-element type="panel" [config]="deliveryPanel">
    <nvb-element type="selectButton" [config]="methodConfig" />
    <nvb-element type="text" [config]="addressConfig" />
    <nvb-element type="select" [config]="pickupPointConfig" />
  </nvb-element>
</nvb-scope>
```

```ts
deliveryPanel = { name: 'deliveryPanel', label: 'Delivery' };

methodConfig = {
  name: 'method',
  label: 'Method',
  options: [
    { label: 'Courier', value: 'courier' },
    { label: 'Pickup point', value: 'pickup' },
  ],
};

addressConfig = {
  name: 'address',
  label: 'Address',
  visibleIf: "method == 'courier'",
  requireIf: "method == 'courier'",
  resetOnHide: true,
};

pickupPointConfig = {
  name: 'pickupPoint',
  label: 'Pickup point',
  visibleIf: "method == 'pickup'",
  options: [
    { label: 'Vilnius, Gedimino 1', value: 'vno-1' },
    { label: 'Kaunas, Laisvės 10', value: 'kun-1' },
  ],
};
```

`resetOnHide` matters here. Without it the address the user typed stays in the data after
they switch to pickup, and you post a shipment with both.

## Calculated totals

An expression writes into an element, and a validator guards the result.

```html
<nvb-scope [(data)]="order">
  <nvb-element type="number" [config]="qtyConfig" />
  <nvb-element type="number" [config]="priceConfig" />
  <nvb-element type="number" [config]="totalConfig" />
</nvb-scope>
```

```ts
order = signal({ qty: 1, price: 49.9 });

qtyConfig = { name: 'qty', label: 'Quantity', min: 1 };
priceConfig = { name: 'price', label: 'Unit price' };

totalConfig = {
  name: 'total',
  label: 'Total',
  readOnly: true,
  expression: '{qty} * {price}',
  validators: [{ type: 'max', value: 10000, message: 'Order too large for self service' }],
};
```

Both operands are number elements, so they already hold numbers and the expression needs no
conversion. `toNumber()` belongs where a value arrives as text, or where an empty field
should count as zero.

## A tabbed form

Each tab declares its own children.

```html
<nvb-scope [(data)]="product">
  <nvb-element type="tabs" [config]="tabsConfig">
    <nvb-tab value="general">
      <nvb-element type="text" [config]="nameConfig" />
      <nvb-element type="textarea" [config]="descriptionConfig" />
    </nvb-tab>
    <nvb-tab value="pricing">
      <nvb-element type="number" [config]="priceConfig" />
      <nvb-element type="number" [config]="vatConfig" />
    </nvb-tab>
  </nvb-element>
</nvb-scope>
```

```ts
tabsConfig = {
  name: 'productTabs',
  tabs: [
    { label: 'General', value: 'general' },
    { label: 'Pricing', value: 'pricing' },
  ],
};
```

Values from a tab that is not open are still in the data and still visible to expressions,
so a condition on the general tab can depend on the price.

Give tabs room. Below roughly 768 pixels of container width they switch to the stacked
layout, which inside a narrow column looks like a bug but is the responsive behaviour.

## A dialog

The trigger and the content are one element.

```html
<nvb-scope [(data)]="form">
  <nvb-element type="dialog" [config]="addressDialog">
    <nvb-element type="text" [config]="streetConfig" />
    <nvb-element type="text" [config]="cityConfig" />
  </nvb-element>
</nvb-scope>
```

```ts
addressDialog = { name: 'addressDialog', label: 'Edit address' };
```

The dialog renders its own button, opens over the page and keeps its state under
`__dialog.addressDialog` in the data, which you can read if you need to know whether it is
open.

## An editable line item table

`dynamicTable` builds its columns from the configuration, and every column is an element,
so each cell is a real control.

```ts
order = signal({
  lines: [
    { product: 'Keyboard', qty: 2, unit: 'pcs' },
    { product: 'Coffee', qty: 1, unit: 'kg' },
  ],
});

linesConfig = {
  name: 'lines',
  label: 'Order lines',
  addRowButtonText: 'Add line',
  confirmRowDeletion: true,
  columns: [
    { type: 'text', name: 'product', label: 'Product' },
    { type: 'number', name: 'qty', label: 'Qty' },
    {
      type: 'select',
      name: 'unit',
      label: 'Unit',
      options: [
        { label: 'pcs', value: 'pcs' },
        { label: 'kg', value: 'kg' },
      ],
    },
  ],
};
```

`order().lines` is an array of row objects, so posting it needs no transformation.

## A read only data table

`table` without a data source reads its rows from the scope data. Sorting, search and paging
run in the browser.

```ts
data = signal({
  invoices: [
    { number: '2026-011', customer: 'Alfa UAB', issued: '2026-08-02', total: 1240.5 },
    { number: '2026-012', customer: 'Beta AB', issued: '2026-08-05', total: 890 },
  ],
});

invoicesConfig = {
  name: 'invoices',
  paginator: true,
  pageSize: 10,
  showQuickSearch: true,
  quickSearchPlaceholder: 'Search invoices',
  columnsConfig: [
    { key: 'number', label: 'Number', sortable: true, width: 120 },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'issued', label: 'Issued', type: 'date', sortable: true },
    {
      key: 'total',
      label: 'Total',
      type: 'number',
      align: 'right',
      sortable: true,
      numberMinFractionDigits: 2,
      numberMaxFractionDigits: 2,
    },
  ],
};
```

Replacing the array in the signal replaces the rows, so this works just as well with data
you fetched yourself.

Watch the property names. `table` uses `columnsConfig` with a `key` per column,
`dynamicTable` uses `columns` with a `name` per column. They are not interchangeable.

## Validation before saving

Validators live on the elements. To block a save, check the data yourself or let a
`validateForm` action do it.

```ts
emailConfig = {
  name: 'email',
  label: 'Email',
  required: true,
  requiredMessage: 'We need an email to send the invoice',
  validators: [{ type: 'email', message: 'That does not look like an email' }],
};

saveConfig = {
  name: 'save',
  text: 'Save',
  tone: 'primary',
  events: [{ trigger: 'click', actionCode: 'save', validateForm: true }],
};
```

With `validateForm: true` the action stops when the form is invalid, so your `(action)`
handler only runs on valid data.

## A themed section

Themes are CSS variables on the scope element, which keeps them local to that part of the
screen.

```html
<nvb-scope [(data)]="form" [attr.style]="compactTheme">
  <nvb-element type="text" [config]="codeConfig" />
</nvb-scope>
```

```ts
compactTheme = [
  '--nvb-control-height: 28px',
  '--nvb-input-height: 28px',
  '--nvb-input-font-size: 12px',
  '--nvb-input-radius: 2px',
].join('; ');
```

Written as an attribute string rather than an object binding, because Angular's style object
binding does not pass CSS custom properties through. It has to sit on the scope element
itself, not on a wrapper around it.

## A translated form

```html
<nvb-scope [(data)]="form" [language]="lang()" [translations]="texts">
  <nvb-element type="text" [config]="emailConfig" />
</nvb-scope>
```

```ts
lang = signal('lt');

texts = {
  lt: {
    'elements.email.label': 'El. paštas',
    'elements.email.placeholder': 'jonas@imone.lt',
  },
};
```

Keys are structure paths, the same ones the builder exports. Anything without a translation
keeps the text from the configuration, so a partial dictionary is fine.

## Two independent forms on one screen

Each scope is its own namespace, so the same field name in both is two unrelated keys.

```html
<nvb-scope [(data)]="sender">
  <nvb-element type="text" [config]="addressConfig" />
</nvb-scope>

<nvb-scope [(data)]="receiver">
  <nvb-element type="text" [config]="addressConfig" />
</nvb-scope>
```

The same `addressConfig` object can be reused, because the name only has to be unique inside
one scope. Expressions cannot cross the boundary either, which is exactly what you want
here.
