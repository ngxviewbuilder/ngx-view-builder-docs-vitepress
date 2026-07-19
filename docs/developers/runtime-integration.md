---
title: Rendering views (runtime)
description: Render saved view definitions to end users and collect their data.
---

# Rendering views (runtime)

## Minimal setup

```ts
import { Component, ViewChild, signal } from '@angular/core';
import { IStructure, NgxViewBuilderRuntime } from 'ngx-view-builder';

@Component({
  selector: 'app-client-form',
  imports: [NgxViewBuilderRuntime],
  template: `
    <ngx-view-builder-runtime
      [pageJson]="structure()"
      [dataJson]="initialData()"
      [theme]="'light'"
      [language]="'en'"
    />
  `,
})
export class ClientFormComponent {
  @ViewChild(NgxViewBuilderRuntime) runtime?: NgxViewBuilderRuntime;

  structure = signal<IStructure>(/* loaded from your backend */);
  initialData = signal<Record<string, unknown>>({ clientType: 'person' });

  save(): void {
    const data = this.runtime?.getDataSnapshot() ?? {};
    // send to backend
  }
}
```

`pageJson` and `dataJson` accept an object or a JSON string.

## Inputs

| Input | Type | Purpose |
| --- | --- | --- |
| `pageJson` | `IStructure \| string` | The view definition |
| `dataJson` | `Record<string, unknown> \| string` | Initial form data (edit scenarios) |
| `language` / `theme` | `string` / `'light'\|'dark'` | Localisation & scheme |
| `runtimeSettings` | `INgxViewBuilderBuilderSettings` | Variables, data sources, license… |
| `contentTranslations` / `uiDictionaries` | dictionaries | Translations |
| `cssVariables` | `Record<string,string>` | Token overrides |
| `externalConfig` / `externalConfigUrl` | object / URL | Host config |

## Getting data out

Three complementary channels:

1. **Snapshot** — `runtime.getDataSnapshot()` whenever you need the current object.
2. **Outputs** — `(valueChanged)` per-field, `(structureChanged)` if the runtime mutates structure.
3. **API service** — the full event set:

```ts
import { NgxViewBuilderApiService } from 'ngx-view-builder';

private api = inject(NgxViewBuilderApiService);

ngOnInit(): void {
  this.api.onComplete.subscribe(({ isValid, data, issues }) => {
    if (isValid) this.clientService.save(data);
  });

  this.api.onValidated.subscribe(({ isValid, issues }) => { /* ... */ });
  this.api.onElementValueChanged.subscribe((e) => { /* per-field hook */ });
}
```

`onComplete` fires when the built-in Submit button finishes; it carries validity, the data object, and any issues. Full list: [Events reference](./events).

The runtime keeps its own isolated API instance internally, but every event it fires is forwarded to the root `NgxViewBuilderApiService` automatically — the root-injected subscriptions above receive everything, including render lifecycle (`onAfterRender`, `onElementAfterRender`) and element interaction events (`onDynamicTableRowAdded`, `onDynamicPanelItemRemoved`, …).

## Programmatic control

```ts
await this.api.validateData();                        // run validation
await this.api.setValue('clientType', 'company');     // set a field
this.api.setData({ ...bigObject });                   // replace all data
this.api.setElementProperty('step2', 'disabled', true);
await this.api.reloadDataSource('loadClients');
this.api.showToast({ title: 'Saved', variant: 'success' });
```

## Table personalisation events

Tables emit column-settings and saved-filters events so hosts can persist per-user preferences (`tableSettingsChanged`, `tableSavedFiltersChanged`, and their request/save counterparts). Store them by `tableName` + user, feed them back with `api.setTableSettings(...)` / `api.setTableSavedFilters(...)`.

## Dialog render mode

If the view's settings use `renderMode: 'dialog'`, the runtime renders it as a modal. Track closure via `api.onDialogClosed`.

## Renderer & unified components

`<ngx-view-builder>` (unified) exposes the same runtime inputs plus optional builder-tab chrome; `<ngx-view-builder-renderer>` is the raw renderer beneath it. Prefer `<ngx-view-builder-runtime>` unless you are composing something unusual.
