---
title: "API: data & values"
description: Read and write form data and single values, attach server errors and track unsaved changes through NgxViewBuilderApiService.
---

# Data & values

The data of a view is one object: every element stores its value under its `name` (or its data path inside panels and repeaters). These methods read and write that object, one value or all of it, and keep track of whether the person changed anything.

| Method | Returns | In short |
| --- | --- | --- |
| [`getData()`](#getdata) | `Record<string, unknown>` | The whole data object |
| [`setData(data)`](#setdata) | `void` | Replace all data |
| [`setElementsData(data)`](#setelementsdata) | `Promise<void>` | Merge several values |
| [`setValue(path, value)`](#setvalue) | `Promise<void>` | Set one value like a person would |
| [`setElementValue(path, value)`](#setelementvalue) | `Promise<void>` | Same as `setValue` |
| [`getElementValue(path)`](#getelementvalue) | `unknown` | Read one value |
| [`clearValue(path)`](#clearvalue) | `boolean` | Remove one key from the data |
| [`clearValues(paths)`](#clearvalues) | `number` | Remove several keys |
| [`clearElementValue(nameOrPath)`](#clearelementvalue) | `boolean` | Empty one field |
| [`resetElementValue(nameOrPath)`](#resetelementvalue) | `Promise<boolean>` | Back to the default value |
| [`clearData()`](#cleardata) | `boolean` | Empty the whole form |
| [`isDirty()`](#isdirty) | `boolean` | Did anything change since load? |
| [`markPristine()`](#markpristine) | `void` | Treat the current data as saved |
| [`setElementErrors(nameOrPath, errors)`](#setelementerrors) | `boolean` | Show server errors on a field |
| [`clearElementErrors(nameOrPath)`](#clearelementerrors) | `boolean` | Remove them |
| [`getElementErrors(nameOrPath)`](#getelementerrors) | `string[]` | Read them |

## The data object

### `getData()`

```ts
getData(): Record<string, unknown>
```

A copy of the current data. Keys starting with `__` belong to the library (route, external context, variables); leave them out when you save.

```ts
const data = api.getData();
// {
//   firstName: 'Ada',
//   clientType: 'company',
//   address: { city: 'Vilnius', street: 'Gedimino pr. 1' },
//   orders: [{ sku: 'A-100', amount: 2 }],
//   __variables: { route: {...}, picked: 'V21' },
//   __external: { userRole: 'admin' }
// }

const toSave = Object.fromEntries(Object.entries(data).filter(([key]) => !key.startsWith('__')));
```

The runtime component also has `getDataSnapshot()`, which returns the same object.

### `setData()`

```ts
setData(data: Record<string, unknown>): void
```

Replaces all data, typically with a record loaded for editing. Fields without a key in it become empty. The result counts as the loaded state, so `isDirty()` stays `false`.

```ts
const client = await firstValueFrom(http.get<Client>(`/api/clients/${id}`));
api.setData(client);
```

### `setElementsData()`

```ts
setElementsData(data: Record<string, unknown>): Promise<void>
```

Merges values into the current data and leaves every other field alone. Each key goes through [`setValue`](#setvalue), so expressions, logic and change events run for it.

```ts
await api.setElementsData({ city: 'Kaunas', zip: 'LT-44280' });
api.getData(); // firstName, email and the rest unchanged; city and zip updated
```

## One value

### `setValue()`

```ts
setValue(dataPath: string, value: unknown): Promise<void>
```

Sets one value the way a person typing would: the field shows it, expressions that depend on it recalculate, `visibleIf` and friends re-run, `onValueChanged` fires. Paths reach into panels and repeaters.

```ts
await api.setValue('clientType', 'company');     // the company panel appears
await api.setValue('address.city', 'Vilnius');   // object panel field
await api.setValue('orders[0].amount', 3);       // first row of a repeater
await api.setValue('orders', [{ sku: 'A', amount: 1 }, { sku: 'B', amount: 2 }]); // all rows
```

The promise resolves once the value is written; dependent expressions finish a moment later.

### `setElementValue()`

```ts
setElementValue(elementDataPath: string, value: unknown): Promise<void>
```

Another name for `setValue`, for code that reads better with it.

### `getElementValue()`

```ts
getElementValue(elementDataPath: string): unknown
```

```ts
api.getElementValue('total');          // 30
api.getElementValue('orders[1].sku');  // 'B'
api.getElementValue('unknown');        // undefined
```

### `clearValue()`

```ts
clearValue(dataPath: string, options?: { clearErrors?: boolean }): boolean
```

Removes the key from the data object (it is gone from `getData()`, not set to `null`) and empties the field on screen. Errors shown on it are cleared too unless you pass `clearErrors: false`. Returns `false` when the key was not there.

```ts
api.clearValue('companyCode'); // true
```

### `clearValues()`

```ts
clearValues(dataPaths: readonly string[], options?: { clearErrors?: boolean }): number
```

Several at once; returns how many keys were removed.

```ts
api.clearValues(['companyCode', 'vatCode', 'notThere']); // 2
```

### `clearElementValue()`

```ts
clearElementValue(elementNameOrPath: string, options?: { clearErrors?: boolean }): boolean
```

Like `clearValue`, addressed by element name.

### `resetElementValue()`

```ts
resetElementValue(elementNameOrPath: string): Promise<boolean>
```

Puts the element back on its **Default value**, or empties it when it has none.

```ts
await api.setValue('quantity', 7);
await api.resetElementValue('quantity'); // true, quantity is 1 again (its default)
```

### `clearData()`

```ts
clearData(): boolean
```

Empties every field. The library's own keys stay.

## Unsaved changes

### `isDirty()`

```ts
isDirty(): boolean
```

`true` once the data differs from what was loaded or last marked as saved. Default values, expressions and load events that fill the form when it opens are part of the loaded state, so a view that was only opened is not dirty.

```ts
canDeactivate(): boolean {
  return !this.api.isDirty() || confirm('Leave without saving?');
}
```

### `markPristine()`

```ts
markPristine(): void
```

Takes the current data as the new saved state, typically right after your save succeeded. A successful Submit does this on its own.

```ts
await firstValueFrom(http.put(`/api/clients/${id}`, api.getData()));
api.markPristine();
api.isDirty(); // false
```

## Server errors

Errors you attach show under the field exactly like validator messages, and count in validation until you clear them.

### `setElementErrors()`

```ts
setElementErrors(nameOrPath: string, errors: string | readonly string[]): boolean
```

```ts
const res = await firstValueFrom(http.post('/api/clients', api.getData()), { defaultValue: null });
if (res?.errors?.email) {
  api.setElementErrors('email', ['This e-mail is already registered']);
}
```

Returns `false` when no such element exists.

### `clearElementErrors()`

```ts
clearElementErrors(nameOrPath: string): boolean
```

### `getElementErrors()`

```ts
getElementErrors(nameOrPath: string): string[]
```

```ts
api.getElementErrors('email'); // ['This e-mail is already registered']
```

The [element handle](./elements#element-getelementapi) has the same three as `setErrors`, `clearErrors` and `getErrors`.
