---
title: Variables
description: Route params, host context, constants, and computed values available to every expression.
---

# Variables

Variables are named values defined once (in the **Variables** tab) and readable from every expression as `{__variables.name}`, or just `{name}` when it doesn't clash with an element name.

## Variable types

The **Type** column decides where the value comes from:

| Type | Value comes from | Example |
| --- | --- | --- |
| `route` | the URL: `route.id`, `route.params.id`, `route.queryParams.xxx`, `route.data.xxx`, `route.url` | `/clients/42/edit` → `clientId = 42` |
| `external` | context the host application provides via API | `external.apiBaseUrl`, `external.user`, `external.features.list` |
| `constant` | a fixed value you type | `maxUploadMb = 10` |
| `expression` | computed from other data | `isEditMode = notEmpty({__variables.route.id})` |
| `dataSource` | the result of a [data source](./data-sources) | `settings` loaded from the API |
| `manual` | set at runtime by a **Set value** [action](./events-actions#action-type-setvalue) or host code, never recalculated automatically | wizard state, selected row |

## Definition fields

Each row in the Variables tab has:

| Field | What it does |
| --- | --- |
| **Name** | Identifier used in expressions: `{__variables.name}`. |
| **Title** | Human label for the list. |
| **Type** | One of the types above. |
| **Value / Source** | The route path, external path, constant, expression, or data source name, depending on type. |
| **Fallback** | Used when the source resolves to nothing (e.g. no route param on `/clients/new`). |
| **Target path** | Also write the value into the form data at this path. |
| **To data JSON** | Ship the value with the submitted data. |
| **Reload data source when fields change** | For `dataSource` variables: re-run the source when watched fields change. |
| **Listen fields** | Comma-separated paths that trigger the reload. Reload runs only when one of these changes. Example: `userId, data.user.type, filters.status`. |
| **Refresh** | Manually re-resolve variables after structure or source changes. |

## When variables recalculate

An `expression` variable behaves like any other calculated value. It watches every field it references and recomputes the moment one of them changes, and anything reading the variable updates in the same pass. A chain like `variable1 = {el1} + {el2}` feeding an element with `expression: {variable1}` settles immediately, with no need to leave and re-enter the view.

Referencing a field the user has not filled in yet is fine. The variable simply resolves to nothing and falls back to **Fallback** if you set one, rather than showing a broken value.

## Writing into a variable

Besides the **Set value** action, any expression can write into a variable:

```text
{variable1} = sumArray({el1}, el5[].column3)
{variable1} += {row.column3}
```

Handy for running totals and for collecting rows out of a dynamic panel. A `manual` variable is the right type here, since nothing recalculates it behind your back. Details and the function form in [Writing values back](./functions#writing-values-back).

## Using variables

```text
visibleIf:      {__variables.route.mode} != "view"
Default value:  {__variables.route.clientId}
disableIf:      {__external.userRole} != "admin"
Data source param:  id = {__variables.route.clientId}
Navigate to:    /clients/{__variables.route.clientId}/history
```

`{__external.*}` is a shortcut to everything the host application passed as external context, with no definition needed.

## Example: edit vs. create mode

The same form serves `/clients/new` and `/clients/42/edit`:

1. Variable `clientId`: source `route`, fallback empty.
2. Variable `isEdit`: source `expression`, `notEmpty({__variables.clientId})`.
3. Load panel data with source `GET /api/clients/{id}`, param `id = {__variables.clientId}` (skipped automatically when empty, so nothing loads in create mode).
4. Page title element: dynamic text <code v-pre>{{isEdit ? "Edit client" : "New client"}}</code>.
5. Save button condition: `{__variables.isEdit}` → `PUT` action; otherwise `POST` action (two actions with opposite conditions).
