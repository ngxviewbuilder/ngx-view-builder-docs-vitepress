---
title: Data sources
description: Every field of the DataSources editor and the element binding panel, for REST, route, and local sources.
---

# Data sources

A data source is a named connection to data, usually an API endpoint. You define sources once per view in the bottom **DataSources** tab, then bind elements to them. Sources are referenced everywhere by **name**.

## The source editor

Click **Add Source** in the bottom DataSources tab. Every source has:

| Field | What it does |
| --- | --- |
| **Name** | The technical name used everywhere else (`loadClients`, `saveOrder`). |
| **Title** | A friendly display title for the list. |
| **Type** | `REST`, `Route data`, `Local JSON`, or `WebSocket` when your developer has enabled it. |

### REST

| Field | What it does |
| --- | --- |
| **Url** | The endpoint, with optional `{placeholders}`: `https://api.example.com/clients/{clientId}`. Required: actions using a URL-less REST source warn in the editor. |
| **Method** | `GET`, `POST`, `PUT`, `DELETE`… or `TABLE-POST`, a special method for a **Table**'s data source that sends a real `POST` but automatically adds the current page, sort, and search state to the request body. Ask your developer to read [Table: server-side paging & filtering](../developers/data-sources#table-server-side-paging-filtering-table-post) for the exact shape. |
| **Request body (optional)** | JSON template with `{…}` placeholders. Example: `{"rows":"{__table.el1.selectedRows}"}`. Use `{id}` style tokens for the URL and `{__table.el1.selectedRows}` style paths in the body. |
| **Data path** | Where the useful data lives in the response (e.g. `data.items`). |

`{placeholders}` are filled from the request params you map on the element or action. If a required placeholder has no value yet, the request is skipped: a city list bound to `{countryId}` stays empty until a country is picked.

### Route data

| Field | What it does |
| --- | --- |
| **Route data key** | Key in the Angular route's resolver/data object. |
| **Data path (optional)** | Path inside that object. |

### Local JSON

| Field | What it does |
| --- | --- |
| **Local mode** | `JSON` (inline data) or `Another question value` (points at existing form data). |
| **JSON data** | The inline JSON when mode is `JSON`. |
| **Local function** | Optionally call a JS function for the data. Example: `window.myFunction` or `this.myFunction`. |

### WebSocket

A REST source answers once, when something asks it. A WebSocket source stays connected and keeps handing you whatever the server sends, so the view moves on its own: a dashboard counter, a queue, an order that someone else just changed.

The connection opens the first time something on the page uses the source, and closes when the last thing using it goes away. Every message after that lands in the bound elements without anyone pressing anything.

| Field | What it does |
| --- | --- |
| **Url** | The endpoint, starting with `ws://` or `wss://`. Use `wss://` anywhere that is not your own machine. |
| **Protocols (optional)** | Comma separated subprotocol names, if your server asks for them. |
| **Message (optional)** | Sent once, right after the connection opens. This is where a subscribe or handshake payload goes. It is not sent again later. |
| **Message path (optional)** | Where the useful part of each message lives, for example `rows`. Leave it empty to take the whole message. |
| **Message mode** | `Replace current` keeps only the latest message, which is what a live value or a refreshing table wants. `Push values in array` collects messages into a growing list, for a feed or a log. The list keeps the most recent 500 entries. |

Binding works exactly like any other source. Point a table at it with **Use as: Value**, or feed a [variable](./variables) from it and read the variable in expressions.

::: tip Two sources, one connection
Several sources pointing at the same url share a single connection, so a page with a table on `rows` and a counter on the whole payload still opens one socket. Give each source its own **Message path** rather than duplicating the endpoint.
:::

#### Showing whether the data is live

Stale numbers that look live are worse than an honest gap, so the runtime publishes the state of every socket under `__socket.<source name>`:

| Path | What it holds |
| --- | --- |
| `{__socket.liveFeed.connected}` | `true` while the connection is up, `false` while it is not. |
| `{__socket.liveFeed.lastMessageAt}` | Timestamp of the last message received. |
| `{__socket.liveFeed.reconnects}` | How many times the connection came back by itself. |
| `{__socket.liveFeed.url}` | The endpoint actually connected to. |

A read-only text element with `visibleIf: {__socket.liveFeed.connected} == false` and a label like "Connection lost, values are from a moment ago" is usually all a form needs.

Reconnecting is automatic. A dropped connection is retried with a growing delay, and once the server is back the view carries on without a page refresh.

#### Sending something back

The **Message** field only fires at connection time. To push something later, put a **Send socket message** action on a button: pick the WebSocket source and write the payload. See [Actions](./events-actions#send-socket-message).

#### Object creator

For non-trivial JSON, the **Object creator** dialog builds a valid object visually instead of hand-typing:

| Field | What it does |
| --- | --- |
| **Root type** | Whether the root is an object or array. |
| **Add root field / Add field / Add nested field** | Grow the structure; objects and arrays can contain nested fields. |
| **Field name** | The JSON key. |
| **Type** | `Object`, `Array`, `Property`, or a plain value (`Text`, `Number`, `Boolean`, `Null`). |
| **Value / other field name** | The literal value, or a reference to another field. |
| **Binding path** | Use `{path}` to bind to live form data, or a static value. |
| **JSON preview** → **Insert into JSON** | Review the generated JSON, then insert it into the source. |

## Binding a source to an element

Choice elements, tables, list grids, and charts have a **Data source** binding in the **Primary source** section of the properties sidebar:

| Field | What it does |
| --- | --- |
| **Data source** | Which source feeds this element. Dependent fields are supported via the param map and refresh paths. |
| **Use as** | `Option` loads selectable options (select, radio, checkbox); `Value` loads the field's own value. |
| **Option value key / Option label key** | Which response fields become the stored value and the visible label. |
| **Items path** | Where the array lives in the response (e.g. `data.items`). |
| **Filter options by** | Legacy conditional filter, leave empty if unused. Prefer the *Filter if equal / not equal* option properties. |
| **Param mapping** | One row per `{placeholder}`: **Param** (the placeholder name) → **Value / `{path}`** (a form path, variable, or plain value). **Auto from params** pre-fills rows from the URL/body placeholders. Only used for REST URL/body placeholders. |
| **Reload source when mapped question value changes** (*React to change*) | Auto-reload when a mapped param's value changes. |
| **Listen fields** | Comma-separated extra paths to watch (e.g. `el1` or `panel.userId`). If empty, the system auto-detects from URL placeholders and the param mapping. |
| **Lazy load** | Fetch on demand: tables load per page/sort, autocomplete loads as the user types. |

## Example: country → city dropdowns

1. Define sources: `loadCountries` (`GET /api/countries`) and `loadCities` (`GET /api/cities?country={countryId}`).
2. Element `country` (Select): data source `loadCountries`, use as `Option`, value key `code`, label key `name`.
3. Element `city` (Select): data source `loadCities`, param `countryId = {country}`, **React to change** on.

Picking a country now reloads the city list automatically; before any pick, the city list stays empty because `{countryId}` is missing.

## Filling values (not options)

With **Use as: Value**, the response is written into the element. A whole panel of read-only fields can be populated by one `GET /api/clients/{id}` source whose params come from `{__variables.route.id}`.

## Saving data

Saving goes through [actions](./events-actions): a button's `dataSource` action calls a `POST`/`PUT` source, passing fields via **Placeholder mapping** or the whole form as the body template. Combine with *Validate whole form before action*, *Elements to reload*, and *Show toast after successful action*.

## Reloading from expressions

`runDataSource("loadUsers")` inside any expression re-runs a source, which is occasionally useful in advanced logic. Prefer element bindings with **React to change** for normal flows.
