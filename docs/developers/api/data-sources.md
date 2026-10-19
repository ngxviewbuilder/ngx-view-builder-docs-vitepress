---
title: "API: data sources & variables"
description: Reload data sources, add host sources to every view, authorize websockets, and feed runtime variables and external context from the host.
---

# Data sources & variables

| Method | Returns | In short |
| --- | --- | --- |
| [`reloadDataSource(element, source?, context?)`](#reloaddatasource) | `Promise<unknown \| null>` | Reload one element's source |
| [`reloadElementDataSource(element, context?)`](#reloadelementdatasource) | `Promise<unknown \| null>` | Same, the element's own source |
| [`reloadElementsByDataSource(source, context?)`](#reloadelementsbydatasource) | `Promise<unknown[]>` | Every element using a source |
| [`setDefaultDataSources(sources, overwrite?)`](#setdefaultdatasources) | `void` | Add host sources to every view |
| [`setDataSourceTypeSettings` / `getDataSourceTypeSettings`](#setdatasourcetypesettings-getdatasourcetypesettings) | `void` / settings | Switch optional source types on |
| [`setWebsocketAuthorizer(fn)`](#setwebsocketauthorizer) | `void` | Put credentials on websocket connections |
| [`setRuntimeVariableContext(values, merge?)`](#setruntimevariablecontext) | `void` | The `{__external.*}` context |
| [`getRuntimeVariableContext` / `clearRuntimeVariableContext`](#getruntimevariablecontext-clearruntimevariablecontext) | object / `void` | Read or clear it |
| [`setRuntimeVariableDefinitions(defs, replace?)`](#setruntimevariabledefinitions) | `void` | Define `{__variables.*}` |
| [`getRuntimeVariableDefinitions()`](#getruntimevariabledefinitions) | `IRuntimeVariableDefinition[]` | Read them |
| [`configureRuntimeVariables(config)`](#configureruntimevariables) | `void` | Both in one call |

## Data sources

Requests go through your Angular `HttpClient`, so interceptors apply. Every load fires [`onDataSourceLoading`, `onDataSourceLoaded` or `onDataSourceLoadFailed`](../events#data-sources).

### `reloadDataSource()`

```ts
reloadDataSource(elementNameOrPath: string, dataSourceName?: string, runtimeContext?: Record<string, unknown>): Promise<unknown | null>
```

Loads the source bound to an element again (or another source, for that element) and returns the result. `runtimeContext` fills placeholders the element's own parameters do not.

```ts
await api.reloadDataSource('country');
// [{ code: 'LT', name: 'Lithuania' }, { code: 'LV', name: 'Latvia' }, { code: 'EE', name: 'Estonia' }]

await api.reloadDataSource('clientCard', 'loadClient', { id: 42 });
// { id: 42, name: 'Harbor Foods', ... }  with url /api/clients/{id}
```

Resolves to `null` when the element or source does not exist. A failed request fires `onDataSourceLoadFailed` with the error, so one global handler can report it.

### `reloadElementDataSource()`

```ts
reloadElementDataSource(elementNameOrPath: string, runtimeContext?: Record<string, unknown>): Promise<unknown | null>
```

The element's own source, no name needed.

### `reloadElementsByDataSource()`

```ts
reloadElementsByDataSource(dataSourceName: string, runtimeContext?: Record<string, unknown>): Promise<unknown[]>
```

Reloads every element bound to the source, one result per element. Handy after a save: everything that shows clients refreshes.

```ts
await http.post('/api/clients', client);
await api.reloadElementsByDataSource('loadClients');
```

### `setDefaultDataSources()`

```ts
setDefaultDataSources(dataSources: IDataSource[], overwriteExisting = false): void
```

Adds sources your application owns to the view, so creators can bind elements to them without defining them. They are remembered: a view loaded or a runtime created later gets them too. A view's own source of the same name wins unless you pass `overwriteExisting`.

```ts
api.setDefaultDataSources([
  { name: 'countries', title: 'Countries', type: 'rest', params: { url: '/api/countries', method: 'GET' } },
  { name: 'currentUser', type: 'rest', params: { url: '/api/me', method: 'GET' } },
]);

api.getStructure()?.dataSources?.map((s) => s.name);
// ['loadClients', 'countries', 'currentUser']
```

`runtimeSettings.defaultDataSources` on the components does the same declaratively.

### `setDataSourceTypeSettings()` / `getDataSourceTypeSettings()`

```ts
setDataSourceTypeSettings(settings: { enableWebsocket?: boolean }): void
getDataSourceTypeSettings(): { enableWebsocket?: boolean }
```

Optional source types creators may pick in the builder. Fires `onDataSourceTypeSettingsChanged`.

```ts
api.setDataSourceTypeSettings({ enableWebsocket: true });
api.getDataSourceTypeSettings(); // { enableWebsocket: true }
```

### `setWebsocketAuthorizer()`

```ts
setWebsocketAuthorizer(authorizer: (context: { sourceName: string; url: string; protocols: string[] }) =>
  { url?: string; protocols?: string[] } | null | Promise<{ url?: string; protocols?: string[] } | null>): void
```

Runs before every websocket connection and reconnection; return a changed url or subprotocol list to carry credentials, or `null` to leave it.

```ts
api.setWebsocketAuthorizer(async ({ url }) => {
  const token = await auth.getToken();
  return { url: `${url}?token=${encodeURIComponent(token)}` };
});
```

See [WebSocket security](../data-sources#security-authorizing-the-connection).

## Runtime variables

Expressions read host context as `{__external.name}` and variables as `{__variables.name}`. The [Runtime variables](../runtime-variables) page explains the variable types.

### `setRuntimeVariableContext()`

```ts
setRuntimeVariableContext(values: Record<string, unknown>, merge = true): void
```

The external context. Set it once at startup and every view sees it; change it later and expressions that read it recalculate.

```ts
api.setRuntimeVariableContext({ userId: 'u-42', userRole: 'admin', tenant: 'acme' });
// in the view:  disableIf: {__external.userRole} != "admin"
```

### `getRuntimeVariableContext()` / `clearRuntimeVariableContext()`

```ts
getRuntimeVariableContext(): Record<string, unknown>
clearRuntimeVariableContext(): void
```

```ts
api.getRuntimeVariableContext(); // { userId: 'u-42', userRole: 'admin', tenant: 'acme' }
```

### `setRuntimeVariableDefinitions()`

```ts
setRuntimeVariableDefinitions(definitions: IRuntimeVariableDefinition[], replace = true): void
```

Writes the view's variable definitions (the Variables tab) and resolves them. With `replace = false` they are added to the view's own, a definition with the same name replacing the old one.

```ts
api.setRuntimeVariableDefinitions([
  { name: 'clientId', sourceType: 'route', source: 'id', fallbackValue: '' },
  { name: 'isEdit', sourceType: 'expression', expression: 'notEmpty({__variables.clientId})' },
  { name: 'apiBase', sourceType: 'constant', constantValue: '/api/v2' },
], false);

api.getData().__variables; // { route: {...}, clientId: '42', isEdit: true, apiBase: '/api/v2', ... }
```

### `getRuntimeVariableDefinitions()`

```ts
getRuntimeVariableDefinitions(): IRuntimeVariableDefinition[]
```

```ts
api.getRuntimeVariableDefinitions().map((d) => d.name); // ['clientId', 'isEdit', 'apiBase']
```

### `configureRuntimeVariables()`

```ts
configureRuntimeVariables(config: { mappings?: IRuntimeVariableDefinition[]; external?: Record<string, unknown>; mergeExternal?: boolean }): void
```

Definitions and context in one call.

```ts
api.configureRuntimeVariables({
  mappings: [{ name: 'clientId', sourceType: 'route', source: 'id' }],
  external: { userName: auth.userName },
});
```

Values an action or `setValue()` writes into `__variables` stay through navigation, including a change of the query string; they belong to the session until the view is closed.
