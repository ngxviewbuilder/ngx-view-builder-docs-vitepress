---
title: E2E testing
description: Every control in a view and in the builder has a stable data-testid. How the ids are built, how they work in repeaters, and how to use them from Playwright or Cypress.
---

# E2E testing

Every interactive control NGX View Builder renders has a `data-testid`: inputs, select triggers and their options, date pickers, table menus and dialogs, rich text toolbars, dynamic panel rows, and in the builder every property editor and canvas action. You never have to reach for CSS classes or text in a test.

The ids are built from the element's **data path**, so they stay the same when you restyle a view, change a label or translate it. Two fields of the same type never share an id, which matters because Playwright's locators are strict: if `getByTestId()` matches two nodes, the test fails instead of picking one.

## How an id is built

```
nvb-<element type>-<part>-<data path>
```

| Piece | What it is | Example |
| --- | --- | --- |
| `nvb-<element type>` | the element that owns the control | `nvb-select` |
| `<part>` | which control inside it | `trigger`, `search`, `option` |
| `<data path>` | where the value lives in the data, written as one token | `country`, `orders-0-status` |

The data path is the element's `dataPath`, or its `name` when it has none. Dots, brackets and any other characters that are not letters, digits or `_` become a single dash, and the case is kept, so `orders[0].status` becomes `orders-0-status` and `billing.city` becomes `billing-city`. Nothing is shortened.

A field called `firstName` and a select called `country` render, among others:

```
nvb-element-firstName          the element's wrapper
nvb-label-firstName            its label
nvb-text-input-firstName       the input itself
nvb-select-trigger-country     the select's button
nvb-select-search-country      its search box
nvb-country-option-LT          the option whose value is LT
nvb-button-trigger-save        a button named save
```

Option ids end with the option's **value**, not its label, so they do not change when the labels are translated.

## Repeaters

Inside a dynamic panel or a dynamic table the data path already carries the row, so the ids do too. For a dynamic panel called `orders` with a text field `sku` in it:

```
nvb-dynamic-panel-row-orders-0          the first row
nvb-text-input-orders-0-sku             the sku field in the first row
nvb-text-input-orders-1-sku             the same field in the second row
nvb-dynamic-panel-delete-row-orders-1   delete button of the second row
```

Fields in an object panel work the same way through their path: `address.city` gives `nvb-text-input-address-city`.

## Playwright

`data-testid` is Playwright's default test id attribute, so `getByTestId()` works without any configuration.

```ts
import { test, expect } from '@playwright/test';

test('new order', async ({ page }) => {
  await page.goto('/orders/new');

  await page.getByTestId('nvb-text-input-firstName').fill('Ada');

  // A select: open it, then pick the option by its value.
  await page.getByTestId('nvb-select-trigger-country').click();
  await page.getByTestId('nvb-country-option-LT').click();

  // A repeater row.
  await page.getByTestId('nvb-text-input-orders-0-sku').fill('A-100');

  await page.getByTestId('nvb-button-trigger-save').click();
  await expect(page.getByTestId('nvb-element-firstName')).toBeVisible();
});
```

With Cypress, use the attribute selector: `cy.get('[data-testid="nvb-text-input-firstName"]')`.

The fastest way to find an id is the browser's element inspector: select the control and read its `data-testid`. Every id you see there is stable as long as the element keeps its name.

## Testing a page with the builder in it

The builder's own controls use the `builder-` prefix (and `sidebar-` for the element library), followed by the area and, where there are several, the element or property they belong to:

```
sidebar-element-search              the library search box
sidebar-element-text                the Text input tile in the library
builder-canvas                      the canvas
builder-column-firstName            the firstName element on the canvas
builder-element-duplicate-firstName its Duplicate action
builder-element-delete-firstName    its Delete action
builder-ai-status                   what a connected AI client is doing
```

Library tiles add an element on double click or Enter, and dragging works like any HTML5 drag and drop.

## Your own elements

A [custom element](/developers/custom-elements) gets the same scheme from `createElementTestId()`:

```ts
import { createElementTestId } from '@ngxviewbuilder/runtime';

export class RatingElement {
  readonly model = input.required<RatingModel>();

  protected readonly tid = createElementTestId(this.model, 'nvb-rating', 'rating');
}
```

```html
@for (star of stars; track star) {
  <button [attr.data-testid]="tid('star', star)">…</button>
}
```

`tid('star', 3)` on an element named `score` gives `nvb-rating-star-score-3`. The extra arguments are for parts that repeat inside one element, like the stars here or the options of a list. `toTestIdToken()` is exported too, for building a token from your own values.

## Upgrading from 0.11 or earlier

Before 0.12.0 a data path kept its dots and brackets (`nvb-text-input-orders[0].sku`), option ids were lower case and cut at 50 characters, and dynamic panel rows were not namespaced by the panel. Selectors written against those ids need the new form shown above.
