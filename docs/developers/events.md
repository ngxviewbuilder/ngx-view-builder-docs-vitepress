---
title: Events reference
description: Every event of NgxViewBuilderApiService, when it fires and what its payload holds.
---

# Events reference

All events live on `NgxViewBuilderApiService`. They are small emitters of the library's own, not RxJS:

```ts
const dispose = api.onValueChanged.add((e) => { /* ... */ });   // returns a function that detaches
const sub = api.onValueChanged.subscribe((e) => { /* ... */ });  // { unsubscribe(), closed }
api.onValueChanged.once((e) => { /* ... */ });                    // first time only
api.onValueChanged.remove(handler);
```

Detach in `ngOnDestroy`. A runtime view, a scope and the builder's Preview each fire on their own instance, and every event is forwarded to the root service you inject, so the same subscription works on any page. When several views are on screen, `elementName` and `elementDataPath` in the payload tell them apart.

For one element only, the [element handle](./api/elements#element-getelementapi) has its own `onValueChanged`, `onValueChanging` and `onPropertyChanged`.

## Values & data

| Event | Fires when | Payload |
| --- | --- | --- |
| `onValueChanging` / `onValueChanged` | a value is about to change / changed, by a person, an expression, an action or `setValue()` | `{ dataPath, newValue, oldValue, sender, trigger }` |
| `onElementValueChanging` / `onElementValueChanged` | the same, with the element resolved | `{ elementDataPath, newValue, oldValue, trigger, element, host, api }` |
| `onElementPropertyChanging` / `onElementPropertyChanged` | a property (label, hidden, disabled...) is written | `{ propertyKey, newValue, oldValue, elementName, elementDataPath, elementType, element, elementDom }` |

`trigger` is `'input'`, `'change'` or `'blur'` for a person, `'programmatic'` for code and expressions, `'load'` while the view opens. `api` is the [element handle](./api/elements#element-getelementapi).

```ts
api.onElementValueChanged.add(({ elementDataPath, newValue, trigger }) => {
  if (elementDataPath === 'country' && trigger !== 'programmatic') {
    void api.reloadDataSource('city');
  }
});
```

## Validation & completion

| Event | Fires when | Payload |
| --- | --- | --- |
| `onValidating` / `onValidated` | validation runs: Validate, Submit, a validate action, `validateData()` | `{ isValid, issues }` |
| `onComplete` | Submit (the button or a submit action) | `{ isValid, data, issues }` |
| `onSaveRequested` | the builder's Save, Ctrl+S, or `notifySaveRequested()` | `{ source: 'header' \| 'api', timestamp }` |

`issues` is a list of `{ elementName, dataPath, errors: string[] }`.

```ts
api.onComplete.add(async ({ isValid, data }) => {
  if (!isValid) return;
  await firstValueFrom(http.post('/api/applications', data));
  api.markPristine();
});
```

## Structure & navigation

| Event | Fires when | Payload |
| --- | --- | --- |
| `onStructureChanged` | the view definition changed (builder edit, API write, `setStructure`) | `{ structure }` |
| `onCurrentPageChanged` | another page is shown | `{ pageIndex, pageName }` |
| `onDialogClosed` | a view rendered as a dialog closed | `{ pageIndex, pageName, dialogTitle, reason: 'close-button' \| 'api', timestamp }` |
| `onTabChanged` / `onTabChangeRequested` | the builder's tab changed / was asked to change | `{ tab }` |
| `onLanguageChanged` | the language switched | `{ language }` |

## Rendering

| Event | Fires when | Payload |
| --- | --- | --- |
| `onBeforeRender` / `onRender` / `onAfterRender` | a view starts rendering / rendered its models / is in the DOM | `{ tab, root, phase }` |
| `onElementRender` / `onElementAfterRender` | once per element in each of those phases | `{ tab, root, phase, elementName, elementDataPath, elementType, elementTestId, element, elementDom, index, total }` |

They fire on the first render, on a new `[pageJson]` and on [`setStructure()`](./api/structure#setstructure). Use them for DOM level integrations: tooltips, analytics attributes, measuring.

```ts
api.onElementAfterRender.add(({ elementName, elementDom }) => {
  elementDom?.setAttribute('data-analytics-id', `form.${elementName}`);
});
```

## Element interactions

| Event | Fires when | Payload, besides `elementName`, `elementDataPath`, `element`, `timestamp` |
| --- | --- | --- |
| `onDynamicTableRowAdded` / `onDynamicTableRowRemoved` | a row of a `dynamicTable` was added / removed | `rowIndex, row, rows, total` |
| `onDynamicPanelItemAdded` / `onDynamicPanelItemRemoved` | an entry of a `dynamicPanel` was added / removed | `rowIndex, row, rows, total` |
| `onFileUploadFilesAdded` / `onFileUploadFileRemoved` | files were attached / one removed | `files, addedFiles` / `files, removedFile, removedIndex` |
| `onElementTabChanged` | a `tabs` element switched tab | `previousTabValue, tabValue, tabIndex` |
| `onAccordionItemToggled` | an accordion section opened or closed | `itemIndex, itemValue, expanded` |

The buttons, the [rows handle](./api/elements#rows-of-a-dynamic-table-or-panel) and `setValue()` on a repeater all fire them.

```ts
api.onDynamicTableRowAdded.add(({ elementName, total }) => {
  if (elementName === 'familyMembers' && total >= 5) {
    api.showToast({ title: 'Limit', message: 'At most 5 family members', variant: 'warning' });
  }
});
```

## Data sources

Every payload has `sourceName`, `sourceType`, `contextElementName`, `contextElementDataPath`, `fromCache` and `runtimeContext`.

| Event | Fires when | Payload adds |
| --- | --- | --- |
| `onDataSourceLoading` | a request starts | `startedAt` |
| `onDataSourceLoaded` | it succeeded | `startedAt, finishedAt, durationMs, result` |
| `onDataSourceLoadFailed` | it failed | `startedAt, finishedAt, durationMs, error, errorMessage` |
| `onDataSourceReloaded` | an element or the API asked for a reload | `timestamp, result` |

One handler covers spinners and error toasts for every view:

```ts
let pending = 0;
api.onDataSourceLoading.add(() => this.loading.set(++pending > 0));
api.onDataSourceLoaded.add(() => this.loading.set(--pending > 0));
api.onDataSourceLoadFailed.add(({ sourceName, errorMessage }) => {
  this.loading.set(--pending > 0);
  api.showToast({ title: `Could not load ${sourceName}`, message: errorMessage, variant: 'error' });
});
```

## Appearance & configuration

| Event | Fires when | Payload |
| --- | --- | --- |
| `onThemeModeChanged` | light or dark was set | `{ theme }` |
| `onCustomThemeChanged` | a custom theme was set | `{ theme }` |
| `onCssVariablesChanged` | tokens were overridden | `{ cssVariables }` |
| `onCustomCssChanged` | custom CSS changed | `{ cssText }` |
| `onCustomCssUrlsChanged` | stylesheet urls changed | `{ urls }` |
| `onDataSourceTypeSettingsChanged` | optional source types were switched | `{ settings }` |
| `onElementDefaultsChanged` | element defaults were registered or cleared | `{ defaults, changedTypes }` |
| `onAiAssistantConfigChanged` | the AI assistant config was set | `{ config }` |

## Templates & sidebar library

These are the persistence hooks of the [template library and the element library](./api/builder): store what they hand you, load it back on startup.

| Event | Fires when | Payload |
| --- | --- | --- |
| `onTemplateSaved` | a template was saved in the Templates tab or with `saveTemplate()` | `{ template, previousCode, timestamp }` |
| `onTemplateDeleted` | a template was deleted | `{ code, timestamp }` |
| `onTemplatesLoaded` | `loadTemplates()` ran | `{ templates, replace, timestamp }` |
| `onSidebarGroupSaved` | an element was saved to the library (right click, *Copy to library*) or with `saveSidebarGroup()` | `{ group, previousCode, timestamp }` |
| `onSidebarTemplateSaved` | the same save from the builder, with the item as `item` | `{ item, timestamp }` |
| `onSidebarGroupDeleted` | a library item was deleted | `{ code, timestamp }` |
| `onSidebarGroupsLoaded` | `loadSidebarGroups()` ran | `{ groups, replace, timestamp }` |

The components expose the same as outputs: `(templateSaved)`, `(templateDeleted)`, `(templatesLoaded)`, `(sidebarGroupSaved)`, `(sidebarGroupDeleted)`, `(sidebarGroupsLoaded)`.

## Tables

| Event | Fires when | Payload |
| --- | --- | --- |
| `onTableSettingsChanged` / `onTableSettingsApplied` | columns were changed by a person or applied from the host | `{ tableName, elementName, settings, source }` |
| `onTableSettingsRequested` | a table asks for stored settings | `{ tableName, elementName, currentSettings }` |
| `onTableSettingsSaveRequested` | a table asks the host to store settings | `{ tableName, elementName, settings }` |
| `onTableFiltersChanged` / `onTableFiltersApplied` | filters changed / were applied | `{ tableName, elementName, filters, source, savedFilter }` |
| `onTableSavedFiltersChanged` | the saved filter list changed | `{ tableName, elementName, filters, source }` |
| `onTableSavedFiltersRequested` | a table asks for stored filter sets | `{ tableName, elementName, currentFilters }` |
| `onTableSavedFilterSaveRequested` | a person saved a filter set | `{ tableName, elementName, filter, currentFilters }` |

## Automation

Triggers and rules defined in a view's `settings.triggers` and `settings.rules`, or registered through [extensions](./extensions), run in every runtime view and report here.

| Event | Fires when | Payload |
| --- | --- | --- |
| `onTriggerHandling` / `onTriggerHandled` | a trigger matched its event / finished | `{ eventName, triggerId, trigger, startedAt, actionCount }` plus `finishedAt, durationMs, executed, reason` |
| `onRuleEvaluating` / `onRuleEvaluated` | a rule is evaluated / finished | `{ runMode, ruleId, rule, startedAt, actionCount, otherwiseActionCount }` plus `executedBranch: 'actions' \| 'otherwise' \| 'skipped'` |

A `valueChanged` trigger reacts to values a person changes.

## Example: a full save pipeline

```ts
private readonly disposers: Array<() => void> = [];

ngOnInit(): void {
  this.disposers.push(
    this.api.onComplete.add(async ({ isValid, data }) => {
      if (!isValid) return;
      await firstValueFrom(this.http.post('/api/forms', data));
      this.api.markPristine();
      this.api.showToast({ title: 'Saved', variant: 'success' });
    }),
    this.api.onDataSourceLoadFailed.add((e) => this.logger.error('Data source failed', e.sourceName, e.errorMessage)),
  );
}

ngOnDestroy(): void {
  this.disposers.forEach((dispose) => dispose());
}
```
