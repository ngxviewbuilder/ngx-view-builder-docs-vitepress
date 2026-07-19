---
title: Data sources
description: Every field of the DataSources editor and the element binding panel — REST, route, and local sources.
---

# Data sources

A data source is a named connection to data — usually an API endpoint. You define sources once per view in the bottom **DataSources** tab, then bind elements to them. Sources are referenced everywhere by **name**.

## The source editor

Click **Add Source** in the bottom DataSources tab. Every source has:

| Field | What it does |
| --- | --- |
| **Name** | The technical name used everywhere else (`loadClients`, `saveOrder`). |
| **Title** | A friendly display title for the list. |
| **Type** | `REST`, `Route data`, or `Local JSON`. |

### REST

| Field | What it does |
| --- | --- |
| **Url** | The endpoint, with optional `{placeholders}`: `https://api.example.com/clients/{clientId}`. Required — actions using a URL-less REST source warn in the editor. |
| **Method** | `GET`, `POST`, `PUT`, `DELETE`… |
| **Request body (optional)** | JSON template with `{…}` placeholders. Example: `{"rows":"{__table.el1.selectedRows}"}` — use `{id}` style tokens for the URL and `{__table.el1.selectedRows}` style paths in the body. |
| **Data path** | Where the useful data lives in the response (e.g. `data.items`). |

`{placeholders}` are filled from the request params you map on the element or action. If a required placeholder has no value yet, the request is skipped — a city list bound to `{countryId}` simply stays empty until a country is picked.

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

#### Object creator

For non-trivial JSON, the **Object creator** dialog builds a valid object visually instead of hand-typing:

| Field | What it does |
| --- | --- |
| **Root type** | Whether the root is an object or array. |
| **Add root field / Add field / Add nested field** | Grow the structure; objects and arrays can contain nested fields. |
| **Field name** | The JSON key. |
| **Type** | `Object`, `Array`, `Property` — or a plain value (`Text`, `Number`, `Boolean`, `Null`). |
| **Value / other field name** | The literal value, or a reference to another field. |
| **Binding path** | Use `{path}` to bind to live form data, or a static value. |
| **JSON preview** → **Insert into JSON** | Review the generated JSON, then insert it into the source. |

## Binding a source to an element

Choice elements, tables, list grids, and charts have a **Data source** binding in the **Primary source** section of the properties sidebar:

| Field | What it does |
| --- | --- |
| **Data source** | Which source feeds this element. Dependent fields are supported via the param map and refresh paths. |
| **Use as** | `Option` — the source loads selectable options (select, radio, checkbox); `Value` — the source loads the field's value. |
| **Option value key / Option label key** | Which response fields become the stored value and the visible label. |
| **Items path** | Where the array lives in the response (e.g. `data.items`). |
| **Filter options by** | Legacy conditional filter — leave empty if unused. Prefer the *Filter if equal / not equal* option properties. |
| **Param mapping** | One row per `{placeholder}`: **Param** (the placeholder name) → **Value / `{path}`** (a form path, variable, or plain value). **Auto from params** pre-fills rows from the URL/body placeholders. Only used for REST URL/body placeholders. |
| **Reload source when mapped question value changes** (*React to change*) | Auto-reload when a mapped param's value changes. |
| **Listen fields** | Comma-separated extra paths to watch (e.g. `el1` or `panel.userId`). If empty, the system auto-detects from URL placeholders and the param mapping. |
| **Lazy load** | Fetch on demand — tables load per page/sort, autocomplete loads as the user types. |

## Example — country → city dropdowns

1. Define sources: `loadCountries` (`GET /api/countries`) and `loadCities` (`GET /api/cities?country={countryId}`).
2. Element `country` (Select): data source `loadCountries`, use as `Option`, value key `code`, label key `name`.
3. Element `city` (Select): data source `loadCities`, param `countryId = {country}`, **React to change** on.

Picking a country now reloads the city list automatically; before any pick, the city list stays empty because `{countryId}` is missing.

## Filling values (not options)

With **Use as: Value**, the response is written into the element. A whole panel of read-only fields can be populated by one `GET /api/clients/{id}` source whose params come from `{__variables.route.id}`.

## Saving data

Saving goes through [actions](./events-actions): a button's `dataSource` action calls a `POST`/`PUT` source, passing fields via **Placeholder mapping** or the whole form as the body template. Combine with *Validate whole form before action*, *Elements to reload*, and *Show toast after successful action*.

## Reloading from expressions

`runDataSource("loadUsers")` inside any expression re-runs a source — occasionally useful in advanced logic. Prefer element bindings with **React to change** for normal flows.
