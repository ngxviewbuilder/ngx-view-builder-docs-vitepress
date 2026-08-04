---
title: API service reference
description: Every public method of NgxViewBuilderApiService, area by area.
---

# API service reference

`NgxViewBuilderApiService` is a root-provided façade. Inject it anywhere in the host app to read, mutate, and observe the active view. This page lists **every public method**; events are listed separately in the [Events reference](./events).

```ts
import { inject } from '@angular/core';
import { NgxViewBuilderApiService } from 'ngx-view-builder';

private api = inject(NgxViewBuilderApiService);
```

::: tip Scoped instances
When several runtime views render at once (e.g. a view inside a dialog), each gets a scoped child API. Data calls on the root service (`setData`, `getData`, `setValue`, table settings/filters) automatically delegate to the most recently created scoped child, so host code usually just talks to the root instance.
:::

## Structure & settings

| Method | Description |
| --- | --- |
| `getStructure(): IStructure \| null` | Returns the current view definition as plain JSON (the source snapshot if one was captured, otherwise serialized from the live model). |
| `getStructureModel(): IStructure \| null` | Returns the **live structure model** (signal-based class instances) instead of plain JSON. |
| `setStructure(structure: IStructure): void` | Replaces the whole view: rebuilds the model, syncs the builder, applies runtime-variable definitions, and re-runs init rules. |
| `updateStructure(updater: (s: IStructure) => void): boolean` | Mutates the structure in place and notifies/rebuilds. Changes flow into Undo history and `structureChanged`. |
| `getSettings(): IStructure['settings'] \| null` | Copy of the view-wide settings object. |
| `getSetting(key: string): unknown` | One setting by key; supports nested paths (`'header.title'`). |
| `setSetting(key: string, value: unknown): boolean` | Sets one setting (nested paths supported). No-op when the value is already equal. |
| `patchSettings(patch: Record<string, unknown>): boolean` | Sets several settings at once; keys may be nested paths. |
| `replaceSettings(settings): boolean` | Replaces the settings object wholesale. |
| `updateSettings(updater: (settings) => void): boolean` | Mutates settings via callback. |
| `notifyStructureChanged(): void` | Emits `onStructureChanged` manually (rarely needed, since mutation methods call it for you). |
| `captureStructureSource(structure): void` | Stores a structure snapshot used as the mutable source for `updateStructure`/`setSetting`. Called automatically by `setStructure`. |
| `clearCapturedStructureSource(): void` | Drops the captured snapshot. |
| `markPristine(): void` | Resets the dirty flag (e.g. right after saving). |
| `isDirty(): boolean` | Whether form data changed since load / last `markPristine()`. |

```ts
api.updateStructure((s) => {
  s.settings.header = { ...s.settings.header, title: 'Client onboarding' };
});
api.markPristine();
```

## Data & values

| Method | Description |
| --- | --- |
| `getData(): Record<string, unknown>` | Current form data snapshot. |
| `setData(data): void` | Replaces the form data. |
| `setElementsData(data): void` | Merges several values into the current data (partial update). |
| `setValue(dataPath, value): Promise<void>` | Sets one value by data path (`'addresses[0].city'`), running the same change pipeline as user input (expressions, dependencies, events). |
| `setElementValue(elementDataPath, value): Promise<void>` | Alias of `setValue` targeted at an element's data path. |
| `getElementValue(elementDataPath): unknown` | Reads a value by element data path. |
| `setElementErrors(nameOrPath, errors: string[]): boolean` | Attaches external error messages to an element (e.g. server-side validation). |
| `clearElementErrors(nameOrPath): boolean` | Removes external errors from an element. |
| `getElementErrors(nameOrPath): string[]` | Current external errors of an element. |

```ts
await api.setValue('client.country', 'LT');
api.setElementErrors('email', ['This e-mail is already registered']);
```

## Element lookup & manipulation

All lookup methods accept an element **name, data path, or schema path**.

| Method | Description |
| --- | --- |
| `getElement(nameOrPath): unknown` | Raw element model (untyped). |
| `getElementModel(nameOrPath): ElementBaseModel \| null` | Typed element model. |
| `getElementByDataPath(dataPath)` / `getElementBySchemaPath(schemaPath)` | Lookup by a specific path kind. |
| `getElementLookup(nameOrPath): INgxViewBuilderElementLookupResult \| null` | Full lookup record: name, paths, type, id, testId, model, and DOM node. |
| `getRenderedElements(): INgxViewBuilderElementLookupResult[]` | Lookup records for everything currently rendered. |
| `getElementName(nameOrPath)` / `getElementDataPath(...)` / `getElementSchemaPath(...)` / `getElementType(...)` / `getElementId(...)` / `getElementTestId(...)` | Convenience accessors for individual lookup fields. |
| `getElementProperty(nameOrPath, propertyKey): unknown` | Reads one element property (`'hidden'`, `'label'`, …). |
| `setElementProperty(nameOrPath, propertyKey, value): boolean` | Sets one element property and re-renders. |
| `setElementProperties(nameOrPath, props: Record<string, unknown>): boolean` | Sets several properties at once. |
| `updateElement(nameOrPath, updater: (el) => void): boolean` | Mutates the element model via callback. |
| `refreshElement(nameOrPath): boolean` | Forces the element to re-render. |

```ts
api.setElementProperty('email', 'disabled', true);
api.updateElement('summaryPanel', (el: any) => { el.title = 'Order summary'; });
```

## Render root & DOM access

| Method | Description |
| --- | --- |
| `registerRenderRoot(root: HTMLElement \| ShadowRoot \| null): void` | Registers the root node views render into (the runtime component does this for you). Also hosts toast styles. |
| `getRenderRoot(): HTMLElement \| ShadowRoot \| null` | The registered render root. |
| `getElementDom(nameOrPath): HTMLElement \| null` | DOM node of a rendered element. |
| `getElementDomById(id)` / `getElementDomByTestId(testId)` | DOM lookup by element id / test id. |
| `queryRenderDom(selector): HTMLElement \| null` | `querySelector` scoped to the render root. |
| `queryRenderDomAll(selector): HTMLElement[]` | `querySelectorAll` scoped to the render root. |

## Validation, completion & lifecycle

| Method | Description |
| --- | --- |
| `validateData(formJson, dataJson, options?): Promise<INgxViewBuilderValidationEvent>` | **Headless validation**: builds the structure, applies data, evaluates expressions and validators, and returns `{ isValid, issues[] }`, with no UI needed. See [Headless validation](./validator). |
| `showToast(payload: INgxViewBuilderToastPayload): void` | Shows a runtime toast (`title`, `message`, `variant`, `position`, `autoHideMs`, `icon`…). |
| `notifyValidationResult(isValid, issues): void` | Emits `onValidated`/`onValidating` and fires the `validated` platform trigger. Called by the runtime after UI validation. |
| `notifyComplete(isValid, data, issues): void` | Emits `onComplete` and the `completed` trigger. Called on Submit. |
| `notifySaveRequested(source?): void` | Emits `onSaveRequested` (`source`: `'header' \| 'api'`), a programmatic "Save" click. |
| `notifyBeforeRender(tab)` / `notifyRender(tab)` / `notifyAfterRender(tab)` | Emit the render-phase events and matching `beforeLoad`/`onLoad`/`afterLoad` triggers. The builder/runtime call these; hosts rarely need to. |
| `notifyTabChanged(tab): void` | Announces that the builder tab changed (emits `onTabChanged`). |
| `notifyCurrentPageChanged(pageIndex, pageName): void` | Announces a page switch (emits `onCurrentPageChanged` + `pageChanged` trigger). |
| `notifyDialogClosed(pageIndex, pageName, dialogTitle?, reason?): void` | Announces a dialog-mode close (emits `onDialogClosed` + `dialogClosed` trigger). |

```ts
const result = await api.validateData(structureJson, dataJson);
if (!result.isValid) console.table(result.issues);
```

## Data sources

| Method | Description |
| --- | --- |
| `reloadDataSource(elementNameOrPath, dataSourceName?, runtimeContext?): Promise<unknown \| null>` | Reloads the data source bound to an element (or a named source), with optional extra runtime context for placeholders. |
| `reloadElementDataSource(elementNameOrPath, runtimeContext?): Promise<unknown \| null>` | Shorthand: reload whatever source the element uses. |
| `reloadElementsByDataSource(dataSourceName, runtimeContext?): Promise<unknown[]>` | Reloads **every element** consuming the named source (falls back to the raw source when nothing consumes it). |
| `setDefaultDataSources(dataSources: IDataSource[], overwriteExisting?): void` | Injects host-defined sources into the current structure so every view can use them (by name; existing names kept unless `overwriteExisting`). |
| `setDataSourceTypeSettings(settings): void` | Enables optional source types in the builder UI: `{ enableWebsocket }`. |
| `getDataSourceTypeSettings(): INgxViewBuilderDataSourceTypeSettings` | Current source-type switches. |
| `setWebsocketAuthorizer(authorizer): void` | Puts this runtime instance's websocket connections under host control: rewrite the url or the subprotocols to carry credentials. Runs before every connection and reconnection, and may return a promise. See [WebSocket security](./data-sources#security-authorizing-the-connection). |

```ts
await api.reloadElementsByDataSource('loadClients');
api.setDefaultDataSources([{ name: 'countries', type: 'rest', url: '/api/countries' }]);
```

## Runtime variables

| Method | Description |
| --- | --- |
| `setRuntimeVariableDefinitions(definitions, replace = true): void` | Writes the variable definitions into `structure.settings` and (re)binds them. |
| `getRuntimeVariableDefinitions(): IRuntimeVariableDefinition[]` | Current definitions. |
| `setRuntimeVariableContext(values, merge = true): void` | Sets the **external context** available as `{__external.*}` in expressions. |
| `getRuntimeVariableContext(): Record<string, unknown>` | Current external context. |
| `clearRuntimeVariableContext(): void` | Clears the external context. |
| `configureRuntimeVariables({ mappings?, external?, mergeExternal? }): void` | One-call setup: definitions + external context. |

Details: [Runtime variables](./runtime-variables).

## Language, locale & translations

| Method | Description |
| --- | --- |
| `getLanguage(): string` | Active content/UI language. |
| `setLanguage(language): void` | Switches the language (UI dictionaries + structure `settings.language`; registers the language in localization if new). |
| `resolveHostLanguage(options?): INgxViewBuilderResolvedLanguage` | Resolves the best `{ language, locale }` from document/system language against `supportedLanguages` with a `fallbackLanguage`. |
| `applyHostLanguage(options?): INgxViewBuilderResolvedLanguage` | `resolveHostLanguage` + applies it (`setLanguage`, and `setApplicationLocale` unless `applyLocale: false`). |
| `startLanguageSync(options?): INgxViewBuilderLanguageSyncHandle` | Keeps the view in sync with the host page language: watches `<html lang>` and the browser `languagechange` event. Returns `{ refresh, stop }`. |
| `setApplicationLocale(locale): void` | Overrides the locale used for number/date formatting (e.g. `'de-DE'`), independent of the UI language. Until called, formatting falls back to the structure's `settings.language`, then the visitor's browser locale. |
| `getApplicationLocale(): string` | The explicitly-set application locale, or `''` if `setApplicationLocale` was never called (formatting is still active via the fallback chain above). |
| `setLocale(locale): void` | Convenience: sets the locale in both the application locale service and structure settings. |
| `setContentTranslations(translations, merge = true): void` | Adds content translations (`{ lt: { 'First name': 'Vardas' } }`) into the structure's localization. |
| `setUiDictionaries(dictionaries, merge = true): void` | Overrides builder/runtime UI dictionaries (see [UI translations](./ui-translations)). |
| `setUiTranslations(dictionaries, merge = true): void` | Alias of `setUiDictionaries`. |
| `translateUi(key, fallback?): string` | Translates a UI dictionary key. |
| `setPropertyHints(hints): void` | Overrides the help texts shown next to builder properties. |
| `setPropertyTypeHints(hints): void` | Overrides the help texts for property *types* (text, options, validators…). |

```ts
const handle = api.startLanguageSync({
  supportedLanguages: ['en', 'lt'],
  fallbackLanguage: 'en',
});
// later: handle.stop();
```

## Theme & CSS

| Method | Description |
| --- | --- |
| `setThemeMode(theme: 'light' \| 'dark'): void` | Switches light/dark mode. |
| `getThemeMode(): 'light' \| 'dark' \| null` | Current mode (null until first set). |
| `setTheme(theme): void` | Accepts either a mode string (`'dark'`) or a CSS-variable map, one call for both cases. |
| `setCustomTheme(theme): void` | Registers a custom theme: `{ mergeWithDefaults?, shared?, light?, dark? }` variable maps. Re-applies variables for the active mode. |
| `getCustomTheme(): INgxViewBuilderCustomThemeDefinition \| null` | Current custom theme. |
| `setCssVariables(cssVariables): void` | Sets raw CSS custom properties (names are auto-prefixed with `--`). |
| `getCssVariables(): Record<string, string>` | Currently applied variables. |
| `setCustomCss(cssText): void` | Injects a raw CSS string into the render scope. |
| `getCustomCss(): string` | Current custom CSS. |
| `setCustomCssUrls(urls): void` | Loads external stylesheets into the render scope. |
| `getCustomCssUrls(): string[]` | Current stylesheet URLs. |

Details: [Theming & design tokens](./theming), [Custom CSS](./custom-css).

## Extensions & registration

Everything from [`provideNgxViewBuilderExtensions`](./extensions) is also callable imperatively:

| Method | Description |
| --- | --- |
| `registerExtensions(config): void` | Registers a whole extensions config (icons, dictionaries, elements, functions, properties…) at runtime. |
| `registerExtensionsAsync(config): Promise<void>` | Same, but awaits async icon directories. |
| `registerElementGroup(group): void` | Adds a custom group to the elements sidebar. |
| `registerCustomElement(definition): void` | Registers one [custom element](./custom-elements). |
| `registerCustomElements(definitions): void` | Registers several custom elements. |
| `registerElementProperties(type, properties, merge = true): void` | Adds/overrides builder properties for one element type ([custom properties](./custom-properties)). |
| `registerElementPropertiesMap(map, merge = true): void` | Properties for several types at once. |
| `registerGlobalElementProperties(properties, merge = true): void` | Properties added to **every** element type. |
| `registerExpressionFunction(fn)` / `registerExpressionFunctions(fns)` | Adds [custom expression functions](./custom-functions) to the expression language. |
| `registerSvgIcon(name, svgMarkup, overwrite = true): boolean` | Registers one inline [SVG icon](./icons). |
| `registerSvgIcons(icons, overwrite = true): string[]` | Registers a map of icons; returns the registered names. |
| `clearRegisteredSvgIcons(): void` | Removes all registered SVG icons. |
| `registerSvgIconDirectory(config): Promise<{ loaded, failed }>` | Loads a directory of `.svg` files by URL manifest. |
| `registerSvgIconDirectories(configs): Promise<...[]>` | Several directories at once. |
| `getTableHeaderCenterExtensions(): INgxViewBuilderCustomElementDefinition[]` | Custom elements flagged `allowInTableHeader` (usable in table header bars). |
| `registerTableCellElementType(type): void` | Adds an element type to the **Cell element** picker of a table column ([cell elements](../creators/elements/tables#cell-elements)). Takes a type id or `{ type, label, order }`. Elements registered with `allowInTableCell: true` are added for you. |
| `registerTableCellElementTypes(types): void` | Several at once. |
| `removeTableCellElementType(type): void` | Takes one back out of the picker. |
| `getTableCellElementTypes(): ITableCellElementType[]` | Built-in cell element types plus everything registered by the host. |
| `attachBuilderAdapter(adapter): void` | Internal bridge between this service and the builder UI. The builder component attaches itself; hosts don't call this. |

## Templates & sidebar library

| Method | Description |
| --- | --- |
| `getTemplates(): ITemplateDefinition[]` | Templates of the current structure. |
| `setTemplates(templates, replace = true)` / `loadTemplates(...)` | Loads host-persisted templates into the builder (both names do the same; `loadTemplates` reads more naturally on startup). |
| `upsertTemplate(template)` / `saveTemplate(template, previousCode?)` | Adds or updates one template (`saveTemplate` also handles renames via `previousCode`). |
| `removeTemplate(name)` / `deleteTemplate(code)` | Deletes a template. |
| `setTemplateActionMap(map): void` | Maps template `action('...')` names to action handlers. |
| `registerTemplateActionDataSource(functionName, dataSourceName): void` | Binds a template function call (e.g. `loadData(id)`) to a data source. |
| `setSidebarTemplates(templates, replace = true)` / `setSidebarGroups(groups, replace = true)` / `loadSidebarGroups(groups, replace = true)` | Loads saved element-library items (the reusable elements/groups panel in the sidebar). |
| `saveSidebarGroup(group, previousCode?)` / `upsertSidebarGroup(group)` | Adds or updates a sidebar library item. |
| `deleteSidebarGroup(code)` / `removeSidebarGroup(code)` | Deletes a sidebar library item. |

Persistence pattern: listen to `onTemplateSaved` / `onSidebarGroupSaved` etc., store items wherever you want, and call `loadTemplates` / `loadSidebarGroups` on startup.

## Tables

| Method | Description |
| --- | --- |
| `setTableSettings(identifier, settings, options?): void` | Applies column settings (visibility/order/width) to a table. `options`: `tableName`, `elementName`, `source` (`'host' \| 'localStorage' \| 'dataSource' \| 'user'`). |
| `getTableSettings(identifier)` | Stored settings for a table. |
| `requestTableSettings(tableName, elementName, currentSettings): void` | Fires `onTableSettingsRequested` so the host can supply persisted settings. |
| `requestTableSettingsSave(tableName, elementName, settings): void` | Fires `onTableSettingsSaveRequested` so the host can persist settings. |
| `setTableFilters(identifier, filters, options?): void` | Applies active detailed-search filters. `options.source`: `'host' \| 'user' \| 'savedFilter'`; may carry the applied `savedFilter`. |
| `getTableFilters(identifier)` | Stored active filters. |
| `setTableSavedFilters(identifier, filters, options?): void` | Supplies the saved-filter list for a table. |
| `getTableSavedFilters(identifier)` | Stored saved filters. |
| `requestTableSavedFilters(tableName, elementName, currentFilters): void` | Fires `onTableSavedFiltersRequested` (host should respond with `setTableSavedFilters`). |
| `requestTableSavedFilterSave(tableName, elementName, filter, currentFilters): void` | Fires `onTableSavedFilterSaveRequested` so the host can persist one saved filter. |

Use together with the table events to persist per-user column layouts and saved filters.

## Builder UI control

| Method | Description |
| --- | --- |
| `switchToTab(tab): void` | Switches the builder to a tab (`'editor'`, `'preview'`, `'jsonEditor'`, `'formSettings'`, `'translations'`, `'variables'`, or a plugin tab code). |
| `requestTabChange(tab): void` | Emits `onTabChangeRequested`. The builder decides whether to honour it (useful when the host wraps tab navigation). |
| `setAiAssistantConfig(config): void` | Sets the [AI assistant](./ai-chat) backend config at runtime (`{ backendUrl }`); emits `onAiAssistantConfigChanged`. |
| `getAiAssistantConfig(): INgxViewBuilderAiAssistantConfig` | Current AI assistant config. |
