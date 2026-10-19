---
title: "API: elements"
description: Find elements, read and write their properties, use the element handle, control rows of dynamic tables and panels, and set defaults per element type.
---

# Elements

Every element of a view can be found by name, data path or schema path, and every property the builder shows can be read and written from code. A write shows on screen at once: change `label`, `required`, `disabled`, `readOnly` or `hidden` and the field updates, whatever its type. The change also lands in [`getStructure()`](./structure#getstructure).

All methods below accept a **name** (`email`), a **data path** (`address.city`, `orders[0].sku`) or a **schema path**.

| Method | Returns | In short |
| --- | --- | --- |
| [`getElementModel(nameOrPath)`](#getelementmodel) | `ElementBaseModel \| null` | The live model |
| [`getElement(nameOrPath)`](#getelement) | `unknown` | Same, untyped |
| [`getElementLookup(nameOrPath)`](#getelementlookup) | `INgxViewBuilderElementLookupResult \| null` | Model, paths, ids and DOM in one record |
| [`getElementByDataPath(path)` / `getElementBySchemaPath(path)`](#getelementbydatapath) | model or `null` | Lookup by one kind of path |
| [`getRenderedElements()`](#getrenderedelements) | lookup records | Everything currently on screen |
| [single lookup fields](#single-lookup-fields) | `string \| null` | Name, paths, type, id, test id |
| [`describeElement(nameOrPath)`](#describeelement) | `Record<string, unknown> \| null` | Readable dump of the set properties |
| [`getElementDom(nameOrPath)` and friends](#getelementdom) | `HTMLElement \| null` | DOM nodes |
| [`getElementProperty` / `setElementProperty`](#getelementproperty) | `unknown` / `boolean` | Read or write one property |
| [`setElementProperties`](#setelementproperties) | `boolean` | Write several |
| [`removeElementProperty(ies)`](#removeelementproperty-removeelementproperties) | `boolean` | Delete keys |
| [`resetElementProperty(ies)`](#resetelementproperty-resetelementproperties) | `boolean` | Back to the type's built-in value |
| [`updateElement` / `refreshElement`](#updateelement) | `boolean` | Change in a callback, force a redraw |
| [`element(nameOrPath)`](#element-getelementapi) | `INgxViewBuilderElementApi` | A handle with all of the above plus rows and columns |
| [element defaults](#element-defaults) | | Defaults for every element of a type |

## Finding elements

### `getElementModel()`

```ts
getElementModel(nameOrPath: string): ElementBaseModel | null
```

The live model the element renders from.

```ts
const email = api.getElementModel('email');
email?.type;      // 'text'
email?.required;  // true
email?.value;     // 'ada@example.com'
```

### `getElement()`

```ts
getElement(nameOrPath: string): unknown
```

The same model, typed as `unknown` for code that does not import model classes.

### `getElementLookup()`

```ts
getElementLookup(nameOrPath: string): INgxViewBuilderElementLookupResult | null
```

Everything about one element in one record.

```ts
api.getElementLookup('email');
// {
//   key: 'email',
//   elementName: 'email',
//   elementDataPath: 'email',
//   elementSchemaPath: 'email',
//   elementType: 'text',
//   elementId: 'nvb-text-input-email',
//   elementTestId: 'nvb-element-email',
//   element: TextInputModel,      // the live model
//   host: TextInputModel,
//   elementDom: HTMLElement,      // the element's wrapper
//   dom: HTMLElement
// }
```

`elementId` is the id of the element's control (the input of a text field), which [`getElementDomById`](#getelementdombyid) finds again.

### `getElementByDataPath()`

```ts
getElementByDataPath(dataPath: string): ElementBaseModel | null
getElementBySchemaPath(schemaPath: string): ElementBaseModel | null
```

For code that knows which kind of path it holds, for example the `elementDataPath` of an event.

```ts
api.onElementValueChanged.add((e) => {
  const model = api.getElementByDataPath(e.elementDataPath);
});
```

### `getRenderedElements()`

```ts
getRenderedElements(): INgxViewBuilderElementLookupResult[]
```

A lookup record for every element currently on screen, in page order.

```ts
api.getRenderedElements().map((e) => e.elementName);
// ['page1', 'firstName', 'email', 'clientType', ...]
```

### Single lookup fields

```ts
getElementName(nameOrPath: string): string | null
getElementDataPath(nameOrPath: string): string | null
getElementSchemaPath(nameOrPath: string): string | null
getElementType(nameOrPath: string): string | null
getElementId(nameOrPath: string): string | null
getElementTestId(nameOrPath: string): string | null
```

```ts
api.getElementType('email');    // 'text'
api.getElementTestId('email');  // 'nvb-element-email'
api.getElementDataPath('city'); // 'address.city' inside an object panel
```

### `describeElement()`

```ts
describeElement(nameOrPath: string, options?: { depth?: number; includeRuntimeFields?: boolean; includeInternalFields?: boolean }): Record<string, unknown> | null
```

Only the properties that hold a value, readable in a console log.

```ts
console.log(api.describeElement('email'));
// { name: 'email', type: 'text', label: 'Email', dataPath: 'email', required: true, validators: [...] }
```

## DOM

A runtime renders inside a shadow root, so `document.querySelector` does not see into it. These do.

### `getElementDom()`

```ts
getElementDom(nameOrPath: string): HTMLElement | null
```

The element's wrapper (`data-testid="nvb-element-<name>"`).

### `getElementDomById()`

```ts
getElementDomById(id: string): HTMLElement | null
```

```ts
api.getElementDomById(api.getElementId('email')!)?.focus();
```

### `getElementDomByTestId()`

```ts
getElementDomByTestId(testId: string): HTMLElement | null
```

```ts
api.getElementDomByTestId('nvb-element-email')?.scrollIntoView({ behavior: 'smooth' });
```

### `queryRenderDom()`

```ts
queryRenderDom(selector: string): HTMLElement | null
queryRenderDomAll(selector: string): HTMLElement[]
```

`querySelector` and `querySelectorAll` inside the view.

```ts
api.queryRenderDomAll('[data-testid^="nvb-element-"]').length; // 24
```

### `getRenderRoot()` / `registerRenderRoot()`

```ts
getRenderRoot(): HTMLElement | ShadowRoot | null
registerRenderRoot(root: HTMLElement | ShadowRoot | null): void
```

The node the view renders into. The runtime registers it; you only need `registerRenderRoot` when you render a view somewhere yourself.

## Properties

Property keys are the ones in the view JSON and in the builder's property panel: `label`, `placeholder`, `description`, `labelTooltip`, `required`, `disabled`, `readOnly`, `hidden`, `width`, `options`, `text` (buttons), `icon`, `validators`, `visibleIf`, and every property of the [element pages](../../creators/elements/) or one you [registered](./extensions#element-properties). Nested keys use dots: `dataSource.name`, `options[0].label`.

### `getElementProperty()`

```ts
getElementProperty(nameOrPath: string, propertyKey: string): unknown
```

```ts
api.getElementProperty('email', 'label');            // 'Email'
api.getElementProperty('country', 'dataSource.name'); // 'loadCountries'
api.getElementProperty('status', 'options[0].label'); // 'Open'
```

### `setElementProperty()`

```ts
setElementProperty(nameOrPath: string, propertyKey: string, value: unknown): boolean
```

Writes one property; the element redraws. Returns `false` when the element does not exist.

```ts
api.setElementProperty('email', 'required', true);        // asterisk appears, validation requires it
api.setElementProperty('email', 'disabled', true);        // the input is disabled
api.setElementProperty('notes', 'hidden', true);          // the field disappears
api.setElementProperty('save', 'text', 'Save draft');     // button caption
api.setElementProperty('country', 'options', [
  { label: 'Lithuania', value: 'LT' },
  { label: 'Latvia', value: 'LV' },
]);
api.setElementProperty('discount', 'width', '120px');
```

Fires [`onElementPropertyChanging` and `onElementPropertyChanged`](../events#values-data).

### `setElementProperties()`

```ts
setElementProperties(nameOrPath: string, props: Record<string, unknown>): boolean
```

```ts
api.setElementProperties('email', { label: 'Work e-mail', required: true, placeholder: 'name@company.com' });
```

### `removeElementProperty()` / `removeElementProperties()`

```ts
removeElementProperty(nameOrPath: string, propertyKey: string): boolean
removeElementProperties(nameOrPath: string, propertyKeys: readonly string[]): boolean
```

Deletes the keys; the property becomes `undefined`.

```ts
api.removeElementProperties('email', ['placeholder', 'description']);
```

### `resetElementProperty()` / `resetElementProperties()`

```ts
resetElementProperty(nameOrPath: string, propertyKey: string): boolean
resetElementProperties(nameOrPath: string, propertyKeys?: readonly string[]): boolean
```

Back to the element type's built-in value (`false` for `required`, `disabled`, `readOnly`, `hidden`). Without keys, every built-in property is reset.

```ts
api.resetElementProperties('email', ['disabled', 'readOnly']);
```

### `updateElement()`

```ts
updateElement(nameOrPath: string, updater: (element: ElementBaseModel) => void): boolean
```

Change the live model in a callback; whatever you changed is redrawn and saved into the structure.

```ts
api.updateElement('summary', (el) => {
  el.label = 'Order summary';
  el['description'] = `Updated ${new Date().toLocaleTimeString()}`;
});
```

### `refreshElement()`

```ts
refreshElement(nameOrPath: string): boolean
```

Redraws the element from its model, for when you wrote to `getElementModel()` directly.

## The element handle

### `element()` / `getElementApi()`

```ts
element(nameOrPath: string): INgxViewBuilderElementApi
getElementApi(nameOrPath: string): INgxViewBuilderElementApi
```

A handle for one element with everything above as methods, plus subscriptions and row control. It finds the element again on every call, so it keeps working after re-renders and after rows are added or removed.

```ts
const email = api.element('email');

email.exists;               // true
email.type;                 // 'text'
email.dataPath;             // 'email'
email.setLabel('Work e-mail');
email.setRequired();        // true by default; setRequired(false) undoes it
email.setDisabled(false);
email.setReadOnly(true);
email.setHidden(false);
email.getValue();           // 'ada@example.com'
await email.setValue('ada@company.com');
await email.reset();        // back to its default value
email.clearValue();
email.setErrors('Already registered');
email.getErrors();          // ['Already registered']
email.clearErrors();
email.describe();           // { name: 'email', type: 'text', ... }
```

| Member | Returns |
| --- | --- |
| `name`, `dataPath`, `type`, `model`, `exists` | read only fields |
| `getProperty`, `setProperty`, `setProperties`, `removeProperty`, `removeProperties`, `resetProperty`, `resetProperties` | as the methods above |
| `setLabel`, `setRequired`, `setDisabled`, `setReadOnly`, `setHidden`, `setOptions` | `boolean` |
| `update(updater)`, `refresh()` | `boolean` |
| `getValue()`, `setValue(value)`, `clearValue()`, `reset()` | value, `Promise<void>`, `boolean`, `Promise<boolean>` |
| `setErrors`, `clearErrors`, `getErrors` | `boolean`, `boolean`, `string[]` |
| `onValueChanged(cb)`, `onValueChanging(cb)`, `onPropertyChanged(cb)` | a function that unsubscribes |
| `rows`, `column(name)`, `cell(row, column)` | see below |
| `describe()` | `Record<string, unknown> \| null` |

Subscriptions only fire for this element:

```ts
const off = api.element('country').onValueChanged((e) => {
  // e = { name: 'country', dataPath: 'country', value: 'LT', oldValue: null, trigger: 'change',
  //       rowIndex: null, indexPath: [], rowPath: [], element, api }
  void api.reloadDataSource('city');
});
// later
off();
```

Pass `{ includeChildren: true }` on a panel or repeater to hear its children too; `rowIndex` and `rowPath` then say which row changed.

### Rows of a dynamic table or panel

`element('orders').rows` controls the rows of a `dynamicTable` or `dynamicPanel`. Every change shows on screen and fires the same events as the add and delete buttons.

```ts
const rows = api.element('orders').rows;

rows.supported;                          // true for dynamicTable / dynamicPanel
rows.count();                            // 2
rows.get();                              // [{ sku: 'A', amount: 1 }, { sku: 'B', amount: 2 }]
await rows.add();                        // 2, new row seeded with the columns' default values
await rows.add({ sku: 'C', amount: 5 }); // 3
await rows.insert(0, { sku: 'FIRST' });  // 0
await rows.move(0, 3);                   // true
await rows.remove(1);                    // true
await rows.set([{ sku: 'ONLY' }]);       // true, replaces all rows
await rows.clear();                      // true

const row = rows.at(0);                  // one row
row.index;                               // 0
row.get();                               // { sku: 'ONLY' }
await row.patch({ amount: 3 });          // merge
await row.set({ sku: 'X', amount: 1 });  // replace
row.cell('sku').setDisabled(true);       // one cell
await row.remove();
rows.all();                              // a handle per row
```

| Member | Returns |
| --- | --- |
| `supported` | `boolean` |
| `count()` / `get()` | `number` / `Record<string, unknown>[]` |
| `add(values?)` / `insert(index, values?)` | `Promise<number>`, the new row's index (`-1` on failure) |
| `remove(index)` / `move(from, to)` / `set(rows)` / `clear()` | `Promise<boolean>` |
| `at(index)` / `all()` | row handles: `index`, `get()`, `set()`, `patch()`, `remove()`, `cell(column)` |

### Columns of a repeater

```ts
column(columnName: string): INgxViewBuilderElementColumnApi
```

A column is the definition every row is built from. Writing to it changes the definition **and** every row already on screen, which a plain `setElementProperty` on one cell cannot do.

```ts
const sku = api.element('orders').column('sku');

sku.exists;                   // true
sku.setLabel('Article no.');  // header text
sku.setDisabled(true);        // every row's sku field
sku.setRequired();
sku.setProperty('placeholder', 'A-000');
sku.cells();                  // a handle per row's sku field
sku.column('lines');          // nested repeater inside a column
```

### Cells

```ts
cell(rowIndex: number, columnName: string): INgxViewBuilderElementApi
```

One field in one row, as a full element handle.

```ts
await api.element('orders').cell(0, 'amount').setValue(10);
api.element('orders').cell(1, 'sku').setErrors('Unknown article');
```

## Element defaults

Defaults decide what a newly created element of a type looks like, in the builder and from `setStructure`. With `applyToExisting` (on by default) they also reach elements already in the view, but only where the element still has the built-in value, so nothing an author set is overwritten.

### `setElementTypeDefault()` / `setElementTypeDefaults()`

```ts
setElementTypeDefault(type: string, propertyKey: string, value: unknown, options?: { merge?: boolean; applyToExisting?: boolean }): boolean
setElementTypeDefaults(type: string, patch: Record<string, unknown>, options?): boolean
```

```ts
api.setElementTypeDefault('text', 'autocomplete', 'off');
api.setElementTypeDefaults('number', { visualFormatMinFractionDigits: 2, visualFormatMaxFractionDigits: 2 });
```

### `setElementDefaults()` / `defaults()`

```ts
setElementDefaults(defaults: INgxViewBuilderElementDefaults | null, options?): boolean
defaults(defaults?: INgxViewBuilderElementDefaults | null, options?): INgxViewBuilderElementDefaults
```

Several types at once; `*` stands for every type. `defaults()` without arguments returns what is registered, with arguments it sets and returns the result.

```ts
api.setElementDefaults({
  '*': { logicExecutionMode: 'onChange' },
  textarea: { rows: 6 },
  select: { placeholder: 'Choose one' },
});
```

### `getElementDefaults()` / `clearElementDefaults()`

```ts
getElementDefaults(type?: string): INgxViewBuilderElementDefaults | Record<string, unknown>
clearElementDefaults(type?: string): boolean
```

```ts
api.getElementDefaults('textarea'); // { rows: 6 }
api.getElementDefaults();           // { '*': {...}, textarea: {...}, select: {...} }
api.clearElementDefaults('select'); // true
```

### `getElementTypeBuiltInDefaults()`

```ts
getElementTypeBuiltInDefaults(type: string): Record<string, unknown>
```

The values a fresh element of the type has before any default you registered.

```ts
api.getElementTypeBuiltInDefaults('text');
// { showMaxLengthCounter: true, hidden: false, disabled: false, readOnly: false, required: false }
```

Changing defaults fires [`onElementDefaultsChanged`](../events#appearance-configuration).
