---
title: Data sources
description: Every field of the Data sources editor and the element binding panel, for REST, route, and local sources.
---

# Data sources

A data source is a named connection to data, usually an API endpoint. You define sources once per view in the **Data sources** tab below the canvas, then bind elements to them. Sources are referenced everywhere by **name**.

## The source editor

Click **New data source** in the **Data sources** tab below the canvas. Every source has:

| Field | What it does |
| --- | --- |
| **Name** | The technical name used everywhere else (`loadClients`, `saveOrder`). |
| **Title** | A friendly display title for the list. |
| **Type** | `REST`, `Route data`, `Local JSON`, or `WebSocket` when your developer has enabled it. |

### REST

| Field | What it does |
| --- | --- |
| **Url** | The endpoint, with optional `{placeholders}`: `https://api.example.com/clients/{clientId}`. Required: actions using a URL-less REST source warn in the editor. |
| **Method** | `GET`, `POST`, `PUT`, `PATCH` or `DELETE`, picked in the request bar next to the URL. When a **Table** loads from a `POST` source, a switch **Send the table's paging, sorting and filters** appears: turned on, the request still goes out as a `POST`, with the current page, sort and search state added to the body. Ask your developer to read [Table: server-side paging & filtering](../developers/data-sources#table-server-side-paging-filtering-table-post) for the exact shape. |
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

### Building JSON without typing it

Local JSON data, a REST request body and a WebSocket message all have a **Build visually** link above their editor. It opens a builder that writes the JSON for you, with the result shown on the right as you go.

The first choice is the shape: **A list of items** (`[ ]`, for options, rows, records) or **One record** (`{ }`, named fields such as a request body). An empty builder also offers four starting points: **Dropdown options** (a value and a label per choice), **Table of records**, **Simple list** and **One record**. You can rename and add fields afterwards.

A list of flat records opens as a table, which is the quickest way to type demo data or dropdown options:

| In the table | What it does |
| --- | --- |
| Column header | Click the name to rename it; the type underneath is **Text**, **Number** or **Yes / No**. |
| **Column** / **Add row** | Add a column to every row, or a new row with the same columns. |
| **Paste from Excel** | Copy cells from Excel or Google Sheets, header row included, and paste them. The first row becomes the field names; columns that hold only numbers become numbers, only `true`/`false` become yes/no. You can replace the current items or add below them. |

Anything else (one record, nested groups, lists inside records) is edited in the **Fields** view, one line per field: its name, its type and its value.

| Type | Value |
| --- | --- |
| **Text**, **Number**, **Yes / No**, **Empty (null)** | A fixed value. |
| **Form field value** | Pick a field or variable; it is saved as `{path}` and filled in when the request runs. |
| **Group of fields { }** | A nested object; **Add field to …** adds inside it. |
| **List [ ]** | A nested array. A new item copies the fields of the item above it, so a list of records only needs its fields defined once. |

Problems are shown next to the field that causes them (a missing or repeated name, a number that is not a number), and **Apply** stays blocked until they are fixed. Ctrl + Enter applies.

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
| **Lazy load** | Fetch on demand: tables load per page/sort. Autocomplete has its own *Search datasource* for this, see [Autocomplete](./elements/choices#autocomplete-autocomplete). |

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
