---
title: Data source integration
description: Host-side concerns, including defaults, auth, interceptors, and observability.
---

# Data source integration

Creators configure data sources inside views ([creator guide](../creators/data-sources)). This page covers what the host application controls.

## Requests go through Angular HttpClient

REST sources use the host's `HttpClient`, so your existing **interceptors apply automatically**: auth tokens, tenant headers, error mapping, logging. That's the recommended way to secure view-issued requests.

```ts
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, apiPrefixInterceptor])),
```

An `apiPrefix` interceptor also lets creators use short relative URLs (`/clients`) while the host decides the actual host per environment.

## Table: server-side paging & filtering (`TABLE-POST`)

This only applies to a **`table`** element with **Lazy load** on (creator-side property, `tableDataSourceName`). With Lazy load off, the table's data source is a plain source that must return every row in one response. The table paginates/sorts/filters in the browser and none of the contract below applies.

With Lazy load on, set the source's **Method** to the literal string **`TABLE-POST`** in the DataSources tab. NGX View Builder sends a real `POST` over the wire, but first merges the current page/sort/search state into the request body automatically, so you don't write this merging logic yourself.

- If the source's **Request body** is left empty, the body sent to your endpoint is exactly the object below.
- If you *do* configure a body template (e.g. `{"tenantId":"{el1}"}`), your fields are kept and `pagingParams`/`params`/`extendedParams` are added on top.

### Request body shape

```json
{
  "pagingParams": {
    "cnt": null,
    "orderClause": "lastName DESC",
    "pageSize": 25,
    "skipRows": 50,
    "totalCountUsed": false
  },
  "params": [
    ["tenantId", "42"]
  ],
  "extendedParams": [
    { "paramName": "quickSearch", "paramValue": { "condition": "%-%", "value": "acme", "upperLower": "caseInsensitiveLatin" } },
    { "paramName": "status", "paramValue": { "condition": "=", "value": "active" } },
    { "paramName": "createdAt", "paramValue": { "condition": ">=", "value": "2026-01-01" } }
  ]
}
```

- **`pagingParams`**: `pageSize` and `skipRows` (offset, not page number) drive the page window; `orderClause` is a ready-to-use string like `"lastName DESC"` (column key + `ASC`/`DESC`, taken from whichever column is actively sorted, or the **Order clause** property otherwise). `cnt` and `totalCountUsed` are always sent as `null`/`false`, because the frontend never fills them in; your endpoint owns computing the total.
- **`params`**: an array of `[paramName, value]` **tuples** (not `{name, value}` objects), one per row configured in the element's **Request params** property (up to 5). Values may resolve `{path}`/`{{expression}}` tokens from the form before sending.
- **`extendedParams`**: one entry per active search/filter, each `{ paramName, paramValue: { condition, value, upperLower? } }`:
  - The **quick search** box (if enabled) always contributes one entry; `paramName` is the **Quick search param name** property (default `quickSearch`).
  - **Detailed search** contributes one entry per column that has an active filter; `paramName` is that column's `key`. `value` is already typed for you: a real `boolean`/`number` for boolean/number columns, an array of strings for multi-select filters, otherwise a string.

**Search/filter `condition` values** (same vocabulary for quick search and every per-column filter):

| Value | Meaning (text columns) | Meaning (number/date columns) |
| --- | --- | --- |
| `%-%` | contains | - |
| `!%-%` | does not contain | - |
| `%-` | starts with | - |
| `-%` | ends with | - |
| `=` | equals | equals |
| `!=` | not equals | not equals |
| `>` | - | greater than / after |
| `>=` | - | on/after |
| `<` | - | less than / before |
| `<=` | - | on/before |

### Response shape your endpoint must return

No wrapper is mandatory; the table tries several common shapes automatically before giving up:

```json
{ "items": [ { "id": 101, "lastName": "Smith", "status": "active" } ], "total": 187 }
```

- **Rows**: the whole response if it's already an array; otherwise the **Items path** property if set (e.g. `data.items`); otherwise the first of `items`, `data`, `results`, `rows` that is itself an array.
- **Total** (only read when Lazy load is on): the **Total path** property if set (e.g. `meta.total`); otherwise the first present of `total`, `totalCount`, `totalRecords`, `count`, `cnt`, `paging.total`, `paging.totalCount`, `paging.totalRecords`, `paging.count`, `paging.cnt`. **Total path is optional**: leave it empty, use any of those key names, and it's picked up automatically. If nothing matches, the total silently falls back to the current page's row count (pagination will look "stuck", so set one of the recognized keys, or Total path, to avoid that).

So `{ "data": [...], "totalCount": 187 }` or `{ "results": [...], "paging": { "total": 187 } }` work with zero extra configuration.

### Row actions, inline edit, and export are not part of this contract

- **Row/selection/header actions** and **inline edit save** go through the same generic [action → data source](../creators/events-actions) mechanism as any button; there is no table-specific request shape for them. What reaches your endpoint is whatever URL/body you configured on that action's data source, populated from the action's own runtime context: a row action sees `row`, `selectedRows`, `selectedKeys`; a bulk selection action sees `rows`/`items` for every selected record; inline edit save sees `row` (the full edited row) **and** `changedValues`, a flat `{ "status": "active" }`-style object containing only the columns that actually changed, handy for a PATCH-style endpoint.
- **CSV/Excel/PDF export happens entirely in the browser.** There is no server-side export endpoint to implement; "export all" re-issues the same table request with a much larger `pagingParams.pageSize` (the **Export all page size** property, default 10000) to fetch every matching row, then builds the file client-side.

## File upload requests

`fileUpload` can bind up to three independent data sources (**Upload data source**, **Download data source**, **Delete data source**), each a normal REST source. If **Upload data source** is left empty, files never leave the browser: only local metadata (`name`/`size`/`type`/`lastModified`) is kept as the field's value, which is a common foot-gun for a field that otherwise looks "filled in".

### Upload

Always sent as raw `multipart/form-data` with exactly **one** field, never JSON, never base64:

```
POST {upload data source URL}
Content-Type: multipart/form-data; boundary=...

------WebKitFormBoundary...
Content-Disposition: form-data; name="file"; filename="resume.pdf"
Content-Type: application/pdf

<binary bytes>
------WebKitFormBoundary...--
```

- The field name is the **Upload form field name** property (default `file`).
- Any **Request body** template configured on the upload source is **ignored**; only `{placeholder}` tokens in the **URL** are resolved (against `value`, `file`, `fileName`, `fileType`, `fileSize`, plus the usual form context).
- With **Max files** > 1, each file is uploaded as its **own sequential request**. There is no multi-file batch endpoint and no chunked or resumable upload.
- There is no upload-progress percentage available, only a pending/ready/error state per file.

Your endpoint should respond with an object describing the stored file:

```json
{ "key": "9f2c1e6a-...", "name": "resume.pdf", "size": 245678, "contentType": "application/pdf" }
```

Field names are configurable via the **File key / name / size / type field** properties (defaults shown above: `key`, `name`, `size`, `contentType`); if your backend already uses different keys (including the older `fil_key`/`fil_name`/`fil_size`/`fil_content_type` convention from earlier versions), the parser also recognizes common aliases automatically (`fileKey`/`filKey`/`fil_key`/`id`/`fileId`/`uuid` for the key, `fileName`/`fil_name` for the name, `mimeType`/`fil_content_type` for the type, `fil_size` for the size). The response can also come wrapped as `{ "data": {...} } `/`{ "items": [...] }`/etc., and the first record found is used.

**The entire response object is stored verbatim as the field's value** (or an array of responses when **Max files** > 1). There is never a file-bytes/base64 field in the form's own JSON result, only whatever metadata your endpoint returned.

### Download

Defaults to `GET`. If the source has no configured **Request body**, the fallback request body is `{ "<file key field>": "<fileKey>" }` (only sent for non-`GET` methods). Your response can be **either**:

- a raw binary stream (any `Content-Type` other than JSON, or an `attachment` `Content-Disposition`), or
- a small JSON envelope such as `{ "url": "https://cdn.example.com/files/abc123.pdf" }` or `{ "content": "<base64>", "contentType": "application/pdf" }`.

Both are handled without extra configuration.

### Delete

Defaults to `DELETE`. If no **Request body** template is configured, the fallback body sends the file key under every common alias at once, so it matches almost any backend field naming without extra setup:

```json
{ "key": "9f2c1e6a-...", "fileKey": "9f2c1e6a-...", "filKey": "9f2c1e6a-...", "fil_key": "9f2c1e6a-...", "id": "9f2c1e6a-...", "fileId": "9f2c1e6a-...", "uuid": "9f2c1e6a-..." }
```

Any 2xx response counts as success; the response body itself is ignored.

## Default data sources

Give every view a base catalogue of sources so creators don't retype URLs:

```ts
this.api.setDefaultDataSources([
  { name: 'loadCountries', title: 'Countries', type: 'rest',
    params: { url: '/api/countries', method: 'GET' } },
  { name: 'saveForm', title: 'Save form', type: 'rest',
    params: { url: '/api/forms', method: 'POST' } },
]);
```

Or via `runtimeSettings.defaultDataSources` / `dataSourceDefinitions`.

## Observability

Subscribe to the data source events for global loading states and error handling:

```ts
api.onDataSourceLoading.add(({ sourceName }) => this.spinner.show(sourceName));
api.onDataSourceLoaded.add(({ sourceName, durationMs }) => this.spinner.hide(sourceName));
api.onDataSourceLoadFailed.add(({ sourceName, errorMessage }) => {
  this.spinner.hide(sourceName);
  this.api.showToast({ title: 'Load failed', message: errorMessage, variant: 'error' });
});
```

## Programmatic reloads

```ts
await api.reloadDataSource('loadClients');          // by source name
await api.reloadElementDataSource('clientsTable');  // one element's binding
await api.reloadElementsByDataSource('loadClients');// every element using it
```

Call these after host-side mutations so tables and dropdowns reflect new data.

## Caching & skipped requests

- Responses are cached per request signature (URL + method + payload); identical concurrent requests are coalesced. Force fresh data with the reload APIs.
- A request whose URL/body still contains an **unresolved `{placeholder}`** is skipped and yields empty data. That's by design (dependent dropdowns before their parent has a value).

## WebSocket sources

A `websocket` source is a live connection rather than a request. The runtime opens it the first time anything on the page uses that source, keeps it open, and pushes every message into the bound elements and variables. Creators configure it in the [DataSources tab](../creators/data-sources#websocket); this section is about what the host controls.

Enable the type in the builder UI first, otherwise creators cannot pick it:

```ts
api.setDataSourceTypeSettings({ enableWebsocket: true });
```

The runtime is not gated by that flag. A stored view containing a websocket source connects even if the builder never offered the type.

### Your server side

Plain WebSocket, the kind `new WebSocket(url)` speaks. Not STOMP, not SockJS. Text frames that contain JSON are parsed automatically, anything else is delivered as-is.

### One connection per endpoint

Connections are shared by url, subprotocols, and handshake message. Two sources pointing at the same endpoint with different `messagePath` values use one socket, and so do two elements reading the same source. The socket closes when the last subscriber goes away.

This matters for capacity planning: the number of connections your server sees is the number of distinct endpoints your views use, not the number of bound elements.

### Reconnecting

A closed or failed connection is retried automatically with a growing delay of 1s, 2s, 5s, 10s, then 30s for as long as it takes. The delay resets after a successful connection. Subscribers stay attached throughout, so a view recovers on its own after a deploy or a network blip, with no page refresh.

Each attempt is authorized again, which is what makes token refresh possible.

### Connection status

The runtime publishes each source's state under `__socket.<sourceName>`, which creators can bind to and expressions can read:

```
{__socket.liveFeed.connected}       // boolean
{__socket.liveFeed.lastMessageAt}   // epoch milliseconds
{__socket.liveFeed.reconnects}      // how many times it came back
{__socket.liveFeed.url}             // endpoint actually connected to
```

Use it to show an offline banner. A frozen live view that still looks live is the failure mode worth designing against.

### Security: authorizing the connection

REST sources go through Angular `HttpClient`, so your interceptors add tokens automatically. **A browser `WebSocket` cannot send headers**, which means nothing you installed for HTTP applies to it. That leaves two ways to authenticate, and both are the host's decision: a query parameter on the url, or a subprotocol entry.

Register an authorizer once, at app level, and every runtime instance uses it:

```ts
// app.config.ts
provideNgxViewBuilderProjectLayer({
  id: 'websocket-security',
  authorizeWebsocket: async ({ sourceName, url, protocols }) => {
    const token = await auth.getFreshToken();
    return { url: `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` };
  },
});
```

The hook runs before every connection and before every reconnection, and it may return a promise, so an expired token can be refreshed before the socket is opened again. Return `{ url }`, `{ protocols }`, both, or nothing at all to connect exactly as configured.

Subprotocols are the alternative when you would rather keep tokens out of urls:

```ts
authorizeWebsocket: async ({ protocols }) => ({
  protocols: [...protocols, `auth.${await auth.getFreshToken()}`],
});
```

Your server reads it from the `Sec-WebSocket-Protocol` header during the handshake and must echo back one of the offered values.

::: warning A token in a url is a token in a log
Query strings end up in access logs, proxy logs, and referrer headers. Prefer short-lived tokens issued for this purpose, validate them at the handshake, and reject unauthorized handshakes with a 401 before the connection is established.
:::

`NgxViewBuilderApiService.setWebsocketAuthorizer()` sets the same hook on a single runtime instance, which is useful when one embedded view needs different credentials than the rest of the app. An authorizer set that way wins over the project layer for that instance.

### Proxies and timeouts

Sockets die for reasons that have nothing to do with your code. Load balancers and reverse proxies need WebSocket upgrade enabled on the route, and their idle timeout decides how long a quiet connection survives. A server-side heartbeat keeps long-lived views connected instead of relying on the reconnect loop.

## Mock data in development

Use an interceptor to fake endpoints while the backend is in flight. The demo app's `demo-data.interceptor.ts` in `projects/test-app` is a working example that pattern-matches URLs and returns canned JSON.
