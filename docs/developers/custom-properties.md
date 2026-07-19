---
title: Custom properties
description: Add or override properties in the sidebar — per element type or globally.
---

# Custom properties

Property definitions drive the properties sidebar. You can add new properties (persisted into the structure JSON automatically) or override built-in ones.

## Add to every element

```ts
provideNgxViewBuilderExtensions({
  globalProperties: {
    trackingId: {
      label: 'Tracking ID',
      type: 'text',
      category: 'general',
      hint: 'Analytics identifier rendered as data-tracking-id.',
    },
  },
});
```

## Add or override per element type

```ts
provideNgxViewBuilderExtensions({
  elementProperties: {
    button: {                       // element type
      analyticsEvent: {             // new property
        label: 'Analytics event', type: 'text', category: 'general',
      },
      label: { hidden: true },      // hide a built-in property
    },
  },
});
```

Runtime equivalents: `api.registerElementProperties(type, props)`, `api.registerGlobalElementProperties(props)`, `api.registerElementPropertiesMap(map)`.

## Property definition fields

| Field | Purpose |
| --- | --- |
| `label` | Caption in the sidebar |
| `type` | Which editor renders it (table below) |
| `category` | Sidebar section: `general`, `texts`, `dataSet`, `options`, `columns`, `restrictions`, `validators`, `logic`, `events`, `design` |
| `order` | Position within the category |
| `hint` | Help text under the editor |
| `choices` | Options for `select`-style editors (`{ label, value }[]`) |
| `hiddenIf` | Expression over sibling properties — hides the editor conditionally (e.g. `!maskType \|\| maskType.value != "custom"`) |
| `applyConditions` | Other property keys to re-evaluate when this one changes |
| `section` | Optional sub-grouping inside a category |
| `component` | A custom Angular editor component (fully custom editors) |
| `loadChoices` | Async choice loader `(properties) => Promise<ChoiceModel[]>` |

## Editor types

The `type` string picks one of the built-in attribute editors:

| Type | Editor |
| --- | --- |
| `text` / `textarea` / `number` | plain inputs |
| `checkbox` | boolean toggle |
| `select` | dropdown (uses `choices`) |
| `color` | color picker |
| `size` | size with units (px/%/…) |
| `padding` | four-sided padding editor |
| `options` | option-list editor (label/value rows) |
| `validators` | validators rule editor |
| `eventActions` | events & actions editor |
| `sourceMapper` | data source binding editor |
| `variantRules` | conditional variant rules |
| `columns` / `tableColumns` | column schema editors |
| `htmlCode` | code editor |
| `file` | file picker |
| `checklist`, `logic`, `templateName`, `sourceName`, and others | specialised editors used by built-in elements |

For anything unique, supply your own `component` — it receives the property and element context and writes the value back like any built-in editor.

## How values reach the element

A property with key `analyticsEvent` is stored on the element JSON as `"analyticsEvent": ...` and appears on the model at runtime (`model().analyticsEvent` in your component, `getElementProperty(name, 'analyticsEvent')` from the host).

## Property hints

To only *clarify* existing properties (no structural change), set hint texts from the host:

```ts
api.setPropertyHints({ name: 'Unique key — becomes the data field name.' });
api.setPropertyTypeHints({ sourceMapper: 'Binds this element to a data source.' });
```
