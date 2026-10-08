---
title: "API: structure & settings"
description: Read, replace and patch the view definition and its settings through NgxViewBuilderApiService, with return values and examples.
---

# Structure & settings

The structure is the view itself: pages, elements, data sources, settings. These methods read it, swap it for another one, or change parts of it while the view stays on screen. The JSON format is described in [Structure JSON](../structure-json).

| Method | Returns | In short |
| --- | --- | --- |
| [`getStructure()`](#getstructure) | `IStructure \| null` | The view as plain JSON, ready to save |
| [`getStructureModel()`](#getstructuremodel) | `IStructure \| null` | The live models the view renders from |
| [`setStructure(structure)`](#setstructure) | `void` | Replace the whole view |
| [`updateStructure(updater)`](#updatestructure) | `boolean` | Change the view in a callback |
| [`notifyStructureChanged()`](#notifystructurechanged) | `void` | Fire `onStructureChanged` yourself |
| [`getSettings()`](#getsettings) | `ISettings \| null` | All view-wide settings |
| [`getSetting(key)`](#getsetting) | `unknown` | One setting, nested paths allowed |
| [`setSetting(key, value)`](#setsetting) | `boolean` | Change one setting |
| [`patchSettings(patch)`](#patchsettings) | `boolean` | Change several settings |
| [`updateSettings(updater)`](#updatesettings) | `boolean` | Change settings in a callback |
| [`replaceSettings(settings)`](#replacesettings) | `boolean` | Swap the settings object |
| [`captureStructureSource()` / `clearCapturedStructureSource()`](#capturestructuresource-clearcapturedstructuresource) | `void` | Low level: the copy a runtime renders from |

Every change made here shows on screen straight away, lands in `getStructure()` and fires [`onStructureChanged`](../events#structure-navigation). In the builder it also becomes an undo step.

## Reading

### `getStructure()`

```ts
getStructure(): IStructure | null
```

The view as plain JSON. This is what you save: no class instances, no runtime state, nothing that does not survive `JSON.stringify`. Properties you changed through the API are included.

```ts
const structure = api.getStructure();
await http.put(`/api/views/${id}`, structure);
```

Returns:

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "showSubmitButton": true },
  "pages": [{ "name": "page1", "rows": [{ "columns": [{ "elementRef": "firstName" }] }] }],
  "elements": {
    "page1": { "name": "page1", "type": "page", "label": "Page 1" },
    "firstName": { "name": "firstName", "type": "text", "label": "First name", "required": true }
  },
  "dataSources": []
}
```

`null` while no view exists. In the builder, the template library is not part of it: an exported structure carries only the templates its elements use (see [templates](./builder#templates)).

### `getStructureModel()`

```ts
getStructureModel(): IStructure | null
```

The live models instead of JSON: every element is an instance of its model class (`TextInputModel`, `SelectInputModel` and so on) with the state the view is rendering right now, such as values and hidden flags set by logic. Use it to inspect, not to save.

```ts
const model = api.getStructureModel();
model?.elements['firstName'].hidden; // false
```

To change an element, prefer [`setElementProperty`](./elements#setelementproperty): writing to a live model directly does not refresh the screen.

## Replacing and changing the view

### `setStructure()`

```ts
setStructure(structure: IStructure): void
```

Replaces the whole view. The structure is migrated to the current schema first, its runtime variables are applied and the view renders again. In a runtime, render listeners get `onBeforeRender`, `onRender` and `onAfterRender` like for a new `[pageJson]`.

```ts
const next = await firstValueFrom(http.get<IStructure>(`/api/views/${id}`));
api.setStructure(next);
```

Form data is kept: values whose element still exists show up in the new view. In the builder the current template library is kept as well when the incoming structure does not define those templates.

### `updateStructure()`

```ts
updateStructure(updater: (structure: IStructure) => void): boolean
```

Hands you the structure as JSON; change it in place and the view is updated. Returns `false` when there is no view.

```ts
api.updateStructure((s) => {
  s.elements['email'].label = 'Work e-mail';
  s.elements['email'].required = true;
  s.pages[0].rows.push({ columns: [{ elementRef: 'notes' }] });
  s.elements['notes'] = { name: 'notes', type: 'textarea', label: 'Notes' };
});
// true
```

Use it for changes to the layout (pages, rows, new elements). For one property of one element, [`setElementProperty`](./elements#setelementproperty) is lighter: it does not rebuild anything.

### `notifyStructureChanged()`

```ts
notifyStructureChanged(): void
```

Fires `onStructureChanged` (and the `(structureChanged)` output) on the next tick with the current structure, even when nothing changed. The methods on this page do it for you; call it after you changed a live model by hand.

## Settings

Settings are the view-wide options from the builder's Form settings dialog: language, submit and validate buttons, navigation, render mode, custom CSS, variables. Keys accept dot paths.

### `getSettings()`

```ts
getSettings(): ISettings | null
```

```ts
api.getSettings();
// { language: 'en', locale: 'lt-LT', showSubmitButton: true, renderMode: 'page', variables: [...] }
```

### `getSetting()`

```ts
getSetting(key: string): unknown
```

```ts
api.getSetting('language');      // 'en'
api.getSetting('header.title');  // 'Client onboarding'
api.getSetting('missing.key');   // undefined
```

### `setSetting()`

```ts
setSetting(key: string, value: unknown): boolean
```

Changes one setting and updates the view. Returns `true` (also when the value was already equal), `false` without a view.

```ts
api.setSetting('showSubmitButton', false);    // the Submit button disappears
api.setSetting('header.title', 'New client');
```

### `patchSettings()`

```ts
patchSettings(patch: Record<string, unknown>): boolean
```

Several settings in one go; keys may be dot paths.

```ts
api.patchSettings({
  showValidateButton: true,
  'header.title': 'New client',
  pageNavigationMode: 'stepper',
});
```

### `updateSettings()`

```ts
updateSettings(updater: (settings: ISettings) => void): boolean
```

```ts
api.updateSettings((settings) => {
  settings.locale = 'de-DE';
  settings.customCss = '.invoice-total { font-weight: 700; }';
});
```

### `replaceSettings()`

```ts
replaceSettings(settings: ISettings | null | undefined): boolean
```

Swaps the whole settings object. Anything you leave out is gone, so start from `getSettings()`:

```ts
api.replaceSettings({ ...api.getSettings(), renderMode: 'dialog', dialogTitle: 'Order {orderNo}' });
```

## Low level

### `captureStructureSource()` / `clearCapturedStructureSource()`

```ts
captureStructureSource(structure: IStructure | null | undefined): void
clearCapturedStructureSource(): void
```

A runtime keeps a plain copy of the structure it rendered; `getStructure()` returns it and the methods above write into it. `<ngx-view-builder-runtime>` and `setStructure()` capture it for you, so hosts rarely touch these. Clearing makes `getStructure()` serialize the live models instead.
