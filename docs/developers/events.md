---
title: Events reference
description: Every event exposed by NgxViewBuilderApiService.
---

# Events reference

All events live on `NgxViewBuilderApiService` and share a lightweight emitter API:

```ts
const sub = api.onValueChanged.subscribe((e) => { ... });  // {unsubscribe()}
const dispose = api.onValueChanged.add(handler);           // returns disposer
api.onValueChanged.once(handler);
api.onValueChanged.remove(handler);
```

These are library emitters (not RxJS): `subscribe` returns `{ unsubscribe, closed }`. Always detach in `ngOnDestroy`.

::: tip Events work the same in the runtime and renderer
`<ngx-view-builder-runtime>` and `<ngx-view-builder-renderer>` run on an isolated internal API instance, but every event they fire is automatically forwarded to the root `NgxViewBuilderApiService` your application injects, so the subscriptions below work identically on builder and runtime pages. (If you embed several runtimes on one page, use the payload's `elementName`/`elementDataPath` to tell them apart, or bridge instances yourself with the exported `bridgeNgxViewBuilderApiEvents(source, target)`.)
:::

## Values & data

| Event | Fires |
| --- | --- |
| `onValueChanging` / `onValueChanged` | a field value is about to change / changed (`dataPath`, `newValue`, `oldValue`, `sender`, `trigger`) |
| `onElementValueChanging` / `onElementValueChanged` | same, enriched with element lookup + an `api` handle for the element |
| `onElementPropertyChanging` / `onElementPropertyChanged` | an element property (label, hidden, disabled…) changes |

```ts
api.onElementValueChanged.add(({ elementDataPath, newValue, api: el }) => {
  if (elementDataPath === 'country') {
    void el.reloadDataSource('loadCities');
  }
});
```

## Validation & completion

| Event | Fires |
| --- | --- |
| `onValidating` / `onValidated` | validation runs / finishes (`isValid`, `issues[]`) |
| `onComplete` | the form completes (Submit): `{ isValid, data, issues }` |
| `onSaveRequested` | Save is requested from header or API |

## Structure & navigation

| Event | Fires |
| --- | --- |
| `onStructureChanged` | the structure was edited |
| `onCurrentPageChanged` | the visible page changed |
| `onDialogClosed` | a dialog-mode view closed (`reason: 'close-button' \| 'api'`) |
| `onTabChanged` / `onTabChangeRequested` | builder tab navigation |
| `onLanguageChanged` | active language switched |

## Rendering

| Event | Fires |
| --- | --- |
| `onBeforeRender` / `onRender` / `onAfterRender` | view render phases (with render root) |
| `onElementRender` / `onElementAfterRender` | per-element render, with model + DOM handles |

Use these for DOM-level integrations (tooltips, analytics attributes, measuring).

## Element interactions

| Event | Fires |
| --- | --- |
| `onDynamicTableRowAdded` / `onDynamicTableRowRemoved` | a `dynamicTable` row was added / removed (`elementName`, `rowIndex`, `row`, `rows`, `total`) |
| `onDynamicPanelItemAdded` / `onDynamicPanelItemRemoved` | a `dynamicPanel` item was added / removed (same payload shape) |
| `onFileUploadFilesAdded` / `onFileUploadFileRemoved` | files were attached / a file was removed on a `fileUpload` (`files`, `addedFiles` / `removedFile`, `removedIndex`) |
| `onElementTabChanged` | the active tab of a `tabs` / `tabsPro` element changed (`previousTabValue`, `tabValue`, `tabIndex`) |
| `onAccordionItemToggled` | an `accordion` section expanded or collapsed (`itemIndex`, `itemValue`, `expanded`) |

All payloads carry `elementName`, `elementDataPath`, the element model, and a `timestamp`, so one subscription can serve many elements:

```ts
api.onDynamicTableRowAdded.add(({ elementName, rowIndex, total }) => {
  if (elementName === 'familyMembers' && total >= 5) {
    api.showToast({ title: 'Limit', message: 'Max 5 members', variant: 'warning' });
  }
});

api.onDynamicPanelItemRemoved.add(({ elementDataPath, row }) => {
  this.audit.log('panel item removed', elementDataPath, row);
});
```

## Data sources

| Event | Fires |
| --- | --- |
| `onDataSourceLoading` | request started |
| `onDataSourceLoaded` | success (`result`, `durationMs`, `fromCache`) |
| `onDataSourceLoadFailed` | failure (`error`, `errorMessage`) |
| `onDataSourceReloaded` | explicit reload happened |

Perfect for global spinners and error toasts:

```ts
api.onDataSourceLoadFailed.add(({ sourceName, errorMessage }) =>
  api.showToast({ title: sourceName, message: errorMessage, variant: 'error' }));
```

## Appearance & configuration

| Event | Fires |
| --- | --- |
| `onThemeModeChanged` / `onCustomThemeChanged` | theme switches |
| `onCssVariablesChanged` / `onCustomCssChanged` / `onCustomCssUrlsChanged` | style updates |

## Templates & sidebar library

| Event | Fires |
| --- | --- |
| `onTemplateSaved` / `onTemplateDeleted` / `onTemplatesLoaded` | template persistence hooks |
| `onSidebarTemplateSaved`, `onSidebarGroupSaved` / `onSidebarGroupDeleted` / `onSidebarGroupsLoaded` | element-library hooks |

## Tables

| Event | Fires |
| --- | --- |
| `onTableSettingsChanged` / `Applied` / `Requested` / `SaveRequested` | column layout lifecycle |
| `onTableFiltersChanged` / `Applied` | active filters |
| `onTableSavedFiltersChanged` / `Requested`, `onTableSavedFilterSaveRequested` | saved filter sets |

## Automation (plugins)

| Event | Fires |
| --- | --- |
| `onTriggerHandling` / `onTriggerHandled` | platform triggers execute |
| `onRuleEvaluating` / `onRuleEvaluated` | rules engine runs (`executedBranch`) |

## Example: full save pipeline

```ts
ngOnInit(): void {
  this.disposers.push(
    this.api.onComplete.add(async ({ isValid, data }) => {
      if (!isValid) return;
      const saved = await firstValueFrom(this.http.post('/api/forms', data));
      this.api.showToast({ title: 'Saved', variant: 'success' });
    }),
    this.api.onDataSourceLoadFailed.add((e) =>
      this.logger.error('DS failed', e.sourceName, e.errorMessage)),
  );
}

ngOnDestroy(): void {
  this.disposers.forEach((d) => d());
}
```
