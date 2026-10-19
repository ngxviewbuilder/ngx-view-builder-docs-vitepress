---
title: OpenAPI plugin
description: "Install the OpenAPI plugin: an API tab that browses your REST API like Swagger and an endpoint search that fills in data sources from your OpenAPI description."
---

# OpenAPI plugin

`@ngxviewbuilder/plugin-openapi` reads the OpenAPI description of your REST API and puts it where creators need it. It adds two things to the builder:

- an **API** tab that lists every endpoint, grouped by tag, with its parameters, request body, response and an example answer, much like Swagger UI;
- an **API** row in the data source editor, where a creator searches for an endpoint and the REST source takes its address, method and request body from your description.

Creators no longer have to ask which URL returns the customer list or what a POST expects. How they use it is on the [API](../creators/api) page.

## Install

```bash
npm install @ngxviewbuilder/plugin-openapi
```

```ts
import { provideNgxViewBuilderOpenApi } from '@ngxviewbuilder/plugin-openapi';

providers: [
  provideNgxViewBuilderOpenApi({
    specs: [{ id: 'crm', url: '/api/openapi.json' }],
  }),
],
```

Each entry in `specs` is one API description:

| Option | What it does |
| --- | --- |
| `id` | Stable id of the description. It is stored in every data source made from it, so keep it the same across releases. |
| `url` | Where the OpenAPI document is loaded from. |
| `document` | The document itself, instead of `url`, if you already have it in memory. |
| `title` | Shown in the API tab. Defaults to `info.title` of the document. |
| `baseUrl` | What goes in front of every path in a data source URL, for example `/api` or `https://api.example.com/v2`. Defaults to the first entry of `servers`. |

Several descriptions are fine, one per service for example. The API tab then gets a filter to show one of them, and the search in the data source editor names the API next to each endpoint.

The document is loaded once, when the builder first needs it, through your application's `HttpClient`. Your interceptors run for that request, so a description behind authentication works the same way your other API calls do. Without `HttpClient` the plugin falls back to `fetch`.

A relative `servers` URL is resolved against the document's address. When that ends up on the builder's own origin, the origin is dropped again, so a data source stores `/api/customers` rather than `https://localhost:4200/api/customers` and keeps working wherever the view is deployed.

### What it reads

OpenAPI 3.0, 3.1 and 3.2, and AsyncAPI 3, in JSON. `$ref` inside the document is followed, `allOf` is merged into one schema, `oneOf` and `anyOf` are shown as alternatives, and 3.1 types such as `["string", "null"]` are read as a nullable string. A schema that refers to itself is shown once and not expanded further.

Not supported yet: YAML documents, Swagger 2.0 (convert it to OpenAPI 3 first) and `$ref` to other files. The API tab says so when a description cannot be read, with the reason.

## What a data source gets

When a creator picks an endpoint, the source is filled in like this:

| Field | Comes from |
| --- | --- |
| **Url** | `baseUrl` plus the path. Path parameters stay as placeholders, `/customers/{id}`, and required query parameters are added the same way, `?status={status}`. |
| **Method** | The operation's method. |
| **Request body** | For `POST`, `PUT` and `PATCH`: every field the request schema accepts, with read-only fields left out. A field whose path matches a field of the view is bound to it as `{name}` (`{address.city}` inside an object panel). The others get an empty value of their type, ready to be filled in or removed in the body builder. |
| **Name** and **Title** | The `operationId` and the `summary`, but only when the source still has the name and title the editor gave it. A name someone typed is kept. |

The source also remembers where it came from:

```json
"params": {
  "url": "/api/customers/{id}",
  "method": "GET",
  "openApi": { "specId": "crm", "operationId": "getCustomer", "method": "GET", "path": "/customers/{id}" }
}
```

The runtime ignores `openApi`: these are plain REST sources, and a view keeps working without the plugin installed. The builder uses the link to show the endpoint next to the source, and to warn when the description no longer has that operation.

The plugin does not change how a response is read. It does tell the creator where the rows are when a list comes wrapped, `{ "items": [...], "total": 120 }` for example, so they can set the element's **Items path**, and which fields suit an option's value and label.

## Live endpoints: event streams and WebSockets <Badge type="warning" text="Experimental" /> {#live-endpoints-event-streams-and-websockets}

Built on the [live sources](./data-sources#event-stream-sources-server-sent-events), which are experimental: the parts below may change in a minor release.


An operation whose response is `text/event-stream` is listed as an **SSE** endpoint. With OpenAPI 3.2 `itemSchema`, the plugin reads the event names from `event` (`const` or `enum`) and the message from `data` (its `contentSchema`):

```json
"responses": { "200": { "content": { "text/event-stream": { "itemSchema": {
  "type": "object",
  "properties": {
    "event": { "const": "order.updated" },
    "data": { "type": "string", "contentMediaType": "application/json", "contentSchema": { "$ref": "#/components/schemas/OrderUpdate" } }
  }
} } } } }
```

OpenAPI cannot describe WebSocket messages, so a WebSocket API comes as an **AsyncAPI 3** document in the same `specs` list. Each channel on a `ws` or `wss` server becomes a **WS** endpoint: the messages your application sends are what the source receives, and a message it receives becomes the source's connect message, built from the schema like a request body.

```ts
provideNgxViewBuilderOpenApi({
  specs: [
    { id: 'crm', url: '/api/openapi.json' },
    { id: 'crm-live', url: '/api/asyncapi.json' },
  ],
});
```

A server on the builder's own host is stored as a path (`/api/ws/orders`), which the runtime turns into `wss://` on a secure page. Picking a live endpoint switches the data source to the matching type. Live endpoints appear only where the builder enables those types (`enableEventStream`, `enableWebsocket`), and Try it never opens them.

## Try it

The API tab can send a request for a `GET` endpoint, with fields for its path and query parameters, and shows the status, the time it took and the answer. It goes through your `HttpClient` as well. Other methods are only described, never sent from the tab, so browsing the API cannot change data on your server.

## License

The tab and the data source row work with a genuine, unexpired license key in the builder settings, the same rule as the other [licensed plugins](./licensing#licensed-plugins). Without one they show what is missing and where the key goes. Data sources made with the plugin keep working at runtime with or without a key, because the runtime does not need the plugin at all.

## Translations

Every text follows the builder's language. The English texts are in `NGX_VIEW_BUILDER_OPENAPI_UI_EN`; give the same keys in another language to translate them. See [Translating the plugins](./ui-translations#translating-the-plugins).

## AI clients

The plugin registers itself for AI clients as `openApi` ([AI plugins](./ai-command-api#plugins)), so a model wires a data source to an endpoint that exists instead of guessing a URL:

- **read** without a query lists the endpoints with method, path, summary and tags. `{ "search": "customer" }` narrows the list.
- **read** with `{ "operationId": "createCustomer" }` returns that endpoint in full: parameters, request and response fields, an example answer, where the rows are, and a ready `dataSource` object built the same way the data source editor builds one.

The model adds that data source to the view through `execute()`, as it does any other change, so the creator can undo it in one step. The plugin itself never changes the view.

## Your own tooling

The parser is exported, if you want the same view of an API in a script or a test:

```ts
import { buildOpenApiCatalog } from '@ngxviewbuilder/plugin-openapi';

const catalog = buildOpenApiCatalog(document, { id: 'crm' }, '/api/openapi.json');
catalog.operations.forEach((operation) => console.log(operation.method, operation.path, operation.operationId));
```
