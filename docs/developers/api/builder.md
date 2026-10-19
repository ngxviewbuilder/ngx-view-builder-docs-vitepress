---
title: "API: builder, templates & tables"
description: Persist the template library and the element library through the host, store per-user table settings and filters, and control the builder's tabs.
---

# Builder, templates & tables

| Method | Returns | In short |
| --- | --- | --- |
| [`getTemplates()`](#gettemplates) | `ITemplateDefinition[]` | The template library |
| [`loadTemplates` / `setTemplates`](#loadtemplates-settemplates) | `void` | Hand stored templates in |
| [`saveTemplate` / `upsertTemplate`](#savetemplate-upserttemplate) | `void` | Add or change one |
| [`deleteTemplate` / `removeTemplate`](#deletetemplate-removetemplate) | `void` | Remove one |
| [`setTemplateActionMap` / `registerTemplateActionDataSource`](#settemplateactionmap-registertemplateactiondatasource) | `void` | Wire template actions |
| [`loadSidebarGroups`](#loadsidebargroups) | `void` | Hand stored library items in |
| [`saveSidebarGroup` / `upsertSidebarGroup`](#savesidebargroup-upsertsidebargroup) | `void` | Add or change one |
| [`deleteSidebarGroup` / `removeSidebarGroup`](#deletesidebargroup-removesidebargroup) | `void` | Remove one |
| [`setTableSettings` / `getTableSettings`](#settablesettings-gettablesettings) | `void` / settings | Column layout per table |
| [`setTableFilters` / `getTableFilters`](#settablefilters-gettablefilters) | `void` / filters | Active filters |
| [`setTableSavedFilters` / `getTableSavedFilters`](#settablesavedfilters-gettablesavedfilters) | `void` / list | Saved filter sets |
| [`request*` methods](#asking-the-host-for-table-state) | `void` | Ask the host for stored table state |
| [`switchToTab` / `requestTabChange`](#switchtotab-requesttabchange) | `void` | Builder navigation |
| [`isBuilderAttached`, `getBuilderAdapter`, `attachBuilderAdapter`](#isbuilderattached-getbuilderadapter-attachbuilderadapter) | | Is a builder on screen? |
| [`setAiAssistantConfig` / `getAiAssistantConfig`](#setaiassistantconfig-getaiassistantconfig) | `void` / config | AI assistant backend |

## Templates

Templates are reusable HTML snippets creators manage in the Templates tab and use in tables, lists and cards ([Templates](../../creators/templates)). The library is yours to store: the builder tells you when a creator saves or deletes one (`(templateSaved)`, `(templateDeleted)`), and you hand the stored ones back on startup. A saved view only carries the templates its elements use.

```ts
// startup
api.loadTemplates(await firstValueFrom(http.get<ITemplateDefinition[]>('/api/templates')));

// persistence
api.onTemplateSaved.add(({ template, previousCode }) => http.put(`/api/templates/${template.code}`, template).subscribe());
api.onTemplateDeleted.add(({ code }) => http.delete(`/api/templates/${code}`).subscribe());
```

A template is:

```ts
{
  name: 'clientCard',            // the code elements refer to; `code` is accepted as well
  title: 'Client card',
  content: '<div class="card">{{name}}</div>',   // `html` is accepted as well
  css: '.card { padding: 8px; }',
  requestBodyJson: '',
  extraJsonSettings: '',
}
```

### `getTemplates()`

```ts
getTemplates(): ITemplateDefinition[]
```

The whole library: in the builder every template of the Templates tab, in a runtime every template of the view.

```ts
api.getTemplates().map((t) => t.name); // ['clientCard', 'orderRow']
```

### `loadTemplates()` / `setTemplates()`

```ts
loadTemplates(templates: INgxViewBuilderTemplateInput[], replace = true): void
setTemplates(templates: INgxViewBuilderTemplateInput[], replace = true): void
```

Replaces the library, or merges by name with `replace = false`. Fires `onTemplatesLoaded`; the Templates tab shows them at once.

### `saveTemplate()` / `upsertTemplate()`

```ts
saveTemplate(template: INgxViewBuilderTemplateInput, previousCode?: string): void
upsertTemplate(template: INgxViewBuilderTemplateInput): void
```

Adds or replaces one template; `previousCode` renames. Other templates and the view stay as they are. Fires `onTemplateSaved`.

```ts
api.saveTemplate({ code: 'clientCard', content: '<b>{{name}}</b>' });
api.saveTemplate({ code: 'customerCard', content: '<b>{{name}}</b>' }, 'clientCard'); // rename
```

### `deleteTemplate()` / `removeTemplate()`

```ts
deleteTemplate(code: string): void
removeTemplate(name: string): void
```

Fires `onTemplateDeleted`.

### `setTemplateActionMap()` / `registerTemplateActionDataSource()`

```ts
setTemplateActionMap(map: Record<string, string>): void
registerTemplateActionDataSource(functionName: string, dataSourceName: string): void
```

A template can call a function on click, `(click)="loadClient(row.id)"`. These map such function names to data sources: the click runs the source with the arguments as its parameters. `setTemplateActionMap` replaces the whole map, `registerTemplateActionDataSource` adds one entry.

```ts
api.setTemplateActionMap({ loadClient: 'getClientById', archive: 'archiveClient' });
api.registerTemplateActionDataSource('loadOrders', 'getOrdersByClient');
```

## The element library

Creators save configured elements and whole sections into the builder's library (*Copies*, from an element's right click menu) and drag them into other views. Like templates, the library is yours to store.

```ts
api.loadSidebarGroups(await firstValueFrom(http.get('/api/builder-library')));

api.onSidebarGroupSaved.add(({ group }) => http.put(`/api/builder-library/${group.id}`, group).subscribe());
api.onSidebarGroupDeleted.add(({ code }) => http.delete(`/api/builder-library/${code}`).subscribe());
```

An item carries the element and, for containers, the layout below it:

```ts
{
  id: 'b7c1e0f2',                 // `code` is accepted as well
  label: 'Address block',
  type: 'panel',
  icon: 'dashboard',              // optional, the type's icon by default
  element: { name: 'address', type: 'panel', label: 'Address' },
  segmentRows: [...],             // rows inside the element
  segmentElements: { street: {...}, city: {...} },
  createdAt: '2026-10-08T09:30:00.000Z',
}
```

### `loadSidebarGroups()`

```ts
loadSidebarGroups(groups: INgxViewBuilderSidebarGroupInput[], replace = true): void
setSidebarGroups(groups, replace = true): void
setSidebarTemplates(templates, replace = true): void
```

Replaces the library, or adds to it with `replace = false`. The three names do the same. Fires `onSidebarGroupsLoaded`.

### `saveSidebarGroup()` / `upsertSidebarGroup()`

```ts
saveSidebarGroup(group: INgxViewBuilderSidebarGroupInput, previousCode?: string): void
upsertSidebarGroup(group: INgxViewBuilderSidebarGroupInput): void
```

Adds or replaces one item. Only `element` is required; a missing `id`, `label` or `type` is filled in. Fires `onSidebarGroupSaved`.

```ts
api.saveSidebarGroup({
  id: 'vatField',
  label: 'VAT code',
  element: { name: 'vatCode', type: 'text', label: 'VAT code', placeholder: 'LT100000000000' },
});
```

### `deleteSidebarGroup()` / `removeSidebarGroup()`

```ts
deleteSidebarGroup(code: string): void
removeSidebarGroup(code: string): void
```

Fires `onSidebarGroupDeleted`.

## Tables

Tables let people hide and reorder columns, filter and save filter sets. Store those per user and table and hand them back, so the table opens the way the person left it. Identify a table by its element name.

### `setTableSettings()` / `getTableSettings()`

```ts
setTableSettings(identifier: string, settings: INgxViewBuilderTableColumnSetting[], options?: { tableName?: string; elementName?: string; source?: 'host' | 'localStorage' | 'dataSource' | 'user' }): void
getTableSettings(identifier: string): INgxViewBuilderTableColumnSetting[] | null
```

```ts
api.setTableSettings('clients', [
  { key: 'name', visible: true, order: 0, width: '240px' },
  { key: 'email', visible: true, order: 1 },
  { key: 'createdAt', visible: false, order: 2 },
], { source: 'host' });
```

The table applies it at once. Fires `onTableSettingsChanged` and `onTableSettingsApplied`; when the person changes columns, `onTableSettingsChanged` comes with `source: 'user'`.

### `setTableFilters()` / `getTableFilters()`

```ts
setTableFilters(identifier: string, filters: unknown[], options?: { tableName?: string; elementName?: string; source?: 'host' | 'user' | 'savedFilter'; savedFilter?: INgxViewBuilderTableSavedFilter | null }): void
getTableFilters(identifier: string): unknown[] | null
```

Applies detailed search filters. Each filter names a column, a condition and a value:

```ts
api.setTableFilters('clients', [
  { key: 'status', operator: '=', value: 'active', type: 'text' },
  { key: 'name', operator: '%-%', value: 'har', type: 'text' },
  { key: 'createdAt', operator: '>=', value: '2026-01-01', type: 'date' },
]);
```

| `operator` | Meaning |
| --- | --- |
| `%-%` / `!%-%` | contains / does not contain |
| `%-` / `-%` | starts with / ends with |
| `=` / `!=` | equals / not equals |
| `>` `>=` `<` `<=` | number and date comparisons |

Fires `onTableFiltersChanged` and `onTableFiltersApplied`.

### `setTableSavedFilters()` / `getTableSavedFilters()`

```ts
setTableSavedFilters(identifier: string, filters: INgxViewBuilderTableSavedFilter[], options?): void
getTableSavedFilters(identifier: string): INgxViewBuilderTableSavedFilter[] | null
```

```ts
api.setTableSavedFilters('clients', [
  { id: 'f1', name: 'Active in Vilnius', filters: [
    { key: 'status', operator: '=', value: 'active', type: 'text' },
    { key: 'city', operator: '=', value: 'Vilnius', type: 'text' },
  ] },
]);
```

### Asking the host for table state

```ts
requestTableSettings(tableName: string, elementName: string, currentSettings: INgxViewBuilderTableColumnSetting[]): void
requestTableSettingsSave(tableName: string, elementName: string, settings: INgxViewBuilderTableColumnSetting[]): void
requestTableSavedFilters(tableName: string, elementName: string, currentFilters: INgxViewBuilderTableSavedFilter[]): void
requestTableSavedFilterSave(tableName: string, elementName: string, filter: INgxViewBuilderTableSavedFilter, currentFilters: INgxViewBuilderTableSavedFilter[]): void
```

A table whose settings or saved filters live with the host calls these; each fires the matching `onTable...Requested` event. Answer with the setters above:

```ts
api.onTableSettingsRequested.add(async ({ tableName }) => {
  const stored = await prefs.get(`table:${tableName}`);
  if (stored) api.setTableSettings(tableName, stored, { source: 'host' });
});
api.onTableSettingsSaveRequested.add(({ tableName, settings }) => prefs.set(`table:${tableName}`, settings));
```

## The builder

### `switchToTab()` / `requestTabChange()`

```ts
switchToTab(tab: 'editor' | 'preview' | 'jsonEditor' | 'formSettings' | 'translations' | 'variables' | string): void
requestTabChange(tab: string): void
```

`switchToTab` changes the builder's tab; a plugin tab is addressed by its code (`'templates'`). `requestTabChange` only fires `onTabChangeRequested`, for hosts that wrap the navigation themselves. Without a builder on screen both do nothing visible.

```ts
api.switchToTab('preview');
```

### `isBuilderAttached()` / `getBuilderAdapter()` / `attachBuilderAdapter()`

```ts
isBuilderAttached(): boolean
getBuilderAdapter(): INgxViewBuilderBuilderAdapter | null
attachBuilderAdapter(adapter: INgxViewBuilderBuilderAdapter | null): void
```

`isBuilderAttached()` tells shared code whether it runs next to the builder or a plain runtime. The adapter is how the builder connects itself; hosts do not attach one.

```ts
if (api.isBuilderAttached()) {
  // designer page: the root owns the edited view
}
```

### `setAiAssistantConfig()` / `getAiAssistantConfig()`

```ts
setAiAssistantConfig(config: { backendUrl?: string | null } | null): void
getAiAssistantConfig(): { backendUrl?: string | null }
```

Fires `onAiAssistantConfigChanged`. For connecting an AI client to the builder, see [AI command API](../ai-command-api).
