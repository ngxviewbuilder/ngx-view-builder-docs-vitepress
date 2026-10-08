---
title: "API: extensions"
description: Register expression functions, validator types, custom elements and properties, SVG icons and table cell types at runtime, with what each call returns.
---

# Extensions

Everything here can also go into [`provideNgxViewBuilderExtensions`](../extensions) at bootstrap, which is usually the better place. Use these methods when what you register is only known later, for example after loading a tenant's configuration.

Registrations reach every view: the builder, its Preview, every `<ngx-view-builder-runtime>` and every `<nvb-scope>`, including the ones created after the call.

| Method | Returns | In short |
| --- | --- | --- |
| [`registerExtensions` / `registerExtensionsAsync`](#registerextensions-registerextensionsasync) | `void` / `Promise<void>` | A whole extensions config |
| [`registerExpressionFunction(s)`](#registerexpressionfunction-registerexpressionfunctions) | `void` | Functions for expressions |
| [`registerValidatorType(s)`](#registervalidatortype-registervalidatortypes) | `void` | Named validator rules |
| [`getRegisteredValidatorTypes` / `clearRegisteredValidatorTypes`](#getregisteredvalidatortypes-clearregisteredvalidatortypes) | descriptors / `void` | List or drop them |
| [`registerCustomElement(s)`](#registercustomelement-registercustomelements) | `void` | Your own element types |
| [`registerElementGroup`](#registerelementgroup) | `void` | A group in the builder's library |
| [element properties](#element-properties) | `void` | Extra or changed properties in the panel |
| [SVG icons](#svg-icons) | names / results | Icons by name |
| [table cell types](#table-cell-element-types) | `void` / list | Elements offered in table cells |
| [`getTableHeaderCenterExtensions`](#gettableheadercenterextensions) | definitions | Elements allowed in a table header |

### `registerExtensions()` / `registerExtensionsAsync()`

```ts
registerExtensions(config: INgxViewBuilderExtensionsConfig): void
registerExtensionsAsync(config: INgxViewBuilderExtensionsConfig): Promise<void>
```

The same object `provideNgxViewBuilderExtensions` takes. The async variant waits for icon directories to load.

```ts
const config = await firstValueFrom(http.get<TenantConfig>('/api/tenant/builder-config'));
await api.registerExtensionsAsync({
  expressionFunctions: [{ name: 'vat', handler: (net: unknown) => Number(net || 0) * config.vatRate }],
  runtimeVariableContext: { tenant: config.code },
  svgIconDirectory: { basePath: '/assets/icons', names: config.icons, prefix: 'acme' },
});
```

### `registerExpressionFunction()` / `registerExpressionFunctions()`

```ts
registerExpressionFunction(fn: IJexlFunctionRegistration): void
registerExpressionFunctions(fns: IJexlFunctionRegistration[]): void
```

```ts
api.registerExpressionFunction({
  name: 'workdaysBetween',
  args: ['from', 'to'],
  description: 'Working days between two dates',
  example: 'workdaysBetween({start}, {end})',
  handler: (from: unknown, to: unknown) => countWorkdays(String(from ?? ''), String(to ?? '')),
});
// in the view:  expression: workdaysBetween({start}, {end})
```

Expressions using it recalculate when their fields change. See [Custom functions](../custom-functions).

### `registerValidatorType()` / `registerValidatorTypes()`

```ts
registerValidatorType(definition: INgxViewBuilderValidatorTypeRegistration): void
registerValidatorTypes(definitions: INgxViewBuilderValidatorTypeRegistration[]): void
```

A named rule creators pick from the validator Type list. `isValid` returns `true` for a valid value.

```ts
api.registerValidatorType({
  type: 'ltPersonalCode',
  label: 'LT personal code',
  defaultMessage: 'Invalid personal code',
  appliesTo: ['text'],
  isValid: ({ value }) => /^[3-6]\d{10}$/.test(String(value ?? '')),
});
```

The rule runs on blur, on Validate, on Submit and in `validateData()`. See [Custom validator types](../custom-validators).

### `getRegisteredValidatorTypes()` / `clearRegisteredValidatorTypes()`

```ts
getRegisteredValidatorTypes(): INgxViewBuilderValidatorTypeDescriptor[]
clearRegisteredValidatorTypes(): void
```

```ts
api.getRegisteredValidatorTypes();
// [{ type: 'ltpersonalcode', label: 'LT personal code', defaultMessage: 'Invalid personal code',
//    hasValue: false, valueLabel: '', valuePlaceholder: '', appliesTo: ['text'], ... }]
```

Type names are stored lower case.

### `registerCustomElement()` / `registerCustomElements()`

```ts
registerCustomElement(definition: INgxViewBuilderCustomElementDefinition): void
registerCustomElements(definitions: INgxViewBuilderCustomElementDefinition[]): void
```

```ts
api.registerCustomElement({
  type: 'ratingWidget',
  label: 'Rating',
  icon: 'star',
  groupCode: 'custom',
  component: RatingWidgetComponent,
  model: RatingWidgetModel,
  allowInTableCell: true,
  properties: {
    max: { label: 'Stars', type: 'number', category: 'general' },
  },
});
```

The model class is used everywhere the type appears, in runtime views and scopes too, so its own fields survive loading a view. See [Custom elements](../custom-elements).

### `registerElementGroup()`

```ts
registerElementGroup(group: { code: string; label: string; icon?: string; order?: number }): void
```

```ts
api.registerElementGroup({ code: 'acme', label: 'ACME widgets', icon: 'acmeLogo', order: 10 });
```

### Element properties

```ts
registerElementProperties(type: string, properties: Record<string, PropertyDefinition>, merge = true): void
registerElementPropertiesMap(map: Record<string, Record<string, PropertyDefinition>>, merge = true): void
registerGlobalElementProperties(properties: Record<string, PropertyDefinition>, merge = true): void
```

Add properties to the builder's panel, or change built-in ones, for one type, several types, or every type. Values are saved on the element and readable with [`getElementProperty`](./elements#getelementproperty).

```ts
api.registerGlobalElementProperties({
  trackingId: { label: 'Tracking ID', type: 'text', category: 'general' },
});
api.registerElementProperties('button', {
  analyticsEvent: { label: 'Analytics event', type: 'text', category: 'general' },
});

api.getElementProperty('save', 'analyticsEvent'); // 'checkout_submit'
```

See [Custom properties](../custom-properties) for editor types and fields.

### SVG icons

```ts
registerSvgIcon(name: string, svgMarkup: string, overwrite = true): boolean
registerSvgIcons(icons: Record<string, string>, overwrite = true): string[]
registerSvgIconDirectory(config: { basePath: string; names: string[]; extension?: string; prefix?: string; overwrite?: boolean }): Promise<{ loaded: string[]; failed: string[] }>
registerSvgIconDirectories(configs: INgxViewBuilderSvgIconDirectoryConfig[]): Promise<{ loaded: string[]; failed: string[] }[]>
clearRegisteredSvgIcons(): void
```

```ts
api.registerSvgIcon('acmeLogo', '<svg viewBox="0 0 24 24">...</svg>'); // true
api.registerSvgIcons({ invoice: '<svg>...</svg>', shipment: '<svg>...</svg>' }); // ['invoice', 'shipment']

await api.registerSvgIconDirectory({ basePath: '/assets/icons', names: ['truck', 'box', 'missing'], prefix: 'acme' });
// { loaded: ['acmeTruck', 'acmeBox'], failed: ['missing'] }
```

A registered name works in every icon property at once, for example a button's `icon`. See [Custom SVG icons](../icons).

### Table cell element types

```ts
registerTableCellElementType(type: string | { type: string; label?: string; order?: number }): void
registerTableCellElementTypes(types: Array<string | { type: string; label?: string; order?: number }>): void
removeTableCellElementType(type: string): void
getTableCellElementTypes(): ITableCellElementType[]
```

The elements creators can pick for a table column of type *Element (control)*.

```ts
api.registerTableCellElementTypes(['autocomplete', 'listBox']);
api.registerTableCellElementType({ type: 'ratingWidget', label: 'Rating', order: 2500 });
api.removeTableCellElementType('fileUpload');
api.getTableCellElementTypes().map((t) => t.type);
// ['text', 'number', 'select', ..., 'autocomplete', 'listBox', 'ratingWidget']
```

### `getTableHeaderCenterExtensions()`

```ts
getTableHeaderCenterExtensions(): INgxViewBuilderCustomElementDefinition[]
```

Custom elements registered with `allowInTableHeader: true`.
