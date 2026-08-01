---
title: Events & actions
description: Every field of the action editor (triggers, action types, confirmation, response handling, toasts) with JSON examples.
---

# Events & actions

The **Actions** category attaches behaviour to elements. An event = **trigger** (when) + **action** (what) + options. One element can have several actions; they run in order. The same action editor is used for element events, table row actions, header actions, and selection actions.

In the view JSON every action is one object in the element's `events` array (or `rowActions`, `selectionActions`, … on tables):

```json
{
  "events": [
    {
      "trigger": "click",
      "type": "dataSource",
      "label": "Save",
      "dataSourceName": "saveOrder",
      "validateForm": true,
      "reloadElementNames": "ordersTable",
      "showToastAfter": true,
      "toastTitle": "Saved",
      "toastVariant": "success"
    }
  ]
}
```

## Triggers

**Trigger** is _when to run the action_ (JSON key: `trigger`).

| Trigger                               | Fires when                                                              |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `click`                               | element is clicked (buttons, icons, cards, rows)                        |
| `change`                              | value changes                                                           |
| `input`                               | every keystroke (add **Debounce (ms)** to avoid flooding)               |
| `blur` / `focus`                      | field loses / gains focus                                               |
| `submit`                              | the form is submitted                                                   |
| `beforeLoad` / `onLoad` / `afterLoad` | element lifecycle when the view loads                                   |
| `always`                              | whatever the element fires the action is not filtered by trigger at all |

Use `always` (**Always (any trigger)** in the editor) for elements whose events are not user gestures. A custom element registered by the host app might emit `activate`, `deactivate`, `attach`, or `detach`; none of those map to a name in the list above, and a router outlet has no click or change to hook into. With `always`, the action simply runs whenever that element fires something.

The trade-off is that _any_ really means any. On an ordinary input, an `always` action runs on load **and** on every change, input, blur, and focus. Keep it for elements that fire one kind of event, and use a named trigger everywhere else.

## Fields shared by every action

| Field                                 | JSON key               | What it does                                                                                                                            |
| ------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Action**                            | `type`                 | What the action will do: `navigate`, `dataSource`, `setValue`, `setOptions`, `reloadElements`, `toast`, `dialog`, `validate`, `submit`. |
| **Label**                             | `label`                | Short action label shown in the action list and on generated buttons. Example: _Update table_.                                          |
| **Action code**                       | `actionCode`           | Optional technical code for the action. Useful when the host app or templates refer to actions by name (`action('Open dialog')`).       |
| **Icon**                              | `icon`                 | Material Symbols icon code shown on the generated button. Example: `refresh`, `save`, `visibility`.                                     |
| **Hide text, show icon only**         | `hideText`             | Renders the action as an icon-only button.                                                                                              |
| **Use custom button style**           | `useCustomButtonStyle` | Unlocks the two style fields below instead of the default styling.                                                                      |
| **Button style**                      | `buttonVariant`        | `filled`, `outlined`, or `text`.                                                                                                        |
| **Button tone**                       | `buttonTone`           | `primary`, `risk` (destructive), or `neutral`.                                                                                          |
| **Visible if**                        | `condition`            | Expression. The action runs (and its button is shown) only while true. Example: `{el1} == "ok"` or `{row.status} != "draft"`.           |
| **Debounce (ms)**                     | `debounceMs`           | Delay between the trigger and execution. Essential for `input`/`change` triggers. Example: `300`.                                       |
| **Validate whole form before action** | `validateForm`         | Runs validation first; the action is aborted when the form is invalid.                                                                  |

### Confirmation fields

| Field                                  | JSON key              | What it does                                                                  |
| -------------------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| **Ask confirmation before action**     | `confirmEnabled`      | Shows an _"Are you sure?"_ dialog before running.                             |
| **Confirm only when form has changes** | `confirmOnDirty`      | Ask only if the form has unsaved changes. Handy for _Cancel_/_Leave_ buttons. |
| **Confirmation title (optional)**      | `confirmTitle`        | Dialog title. Example: _Confirm deletion?_                                    |
| **Confirmation message (optional)**    | `confirmMessage`      | Dialog body text. Example: _This action will change table data._              |
| **Confirm button label**               | `confirmConfirmLabel` | Example: _Yes, continue_.                                                     |
| **Cancel button label**                | `confirmCancelLabel`  | Example: _No, go back_.                                                       |

```json
{
  "trigger": "click",
  "type": "dataSource",
  "label": "Delete",
  "buttonTone": "risk",
  "dataSourceName": "deleteClient",
  "confirmEnabled": true,
  "confirmTitle": "Delete client?",
  "confirmMessage": "This cannot be undone.",
  "reloadElementNames": "clientsTable"
}
```

## Action type: `navigate`

Opens a URL or app route. Tokens in `{…}` are resolved from form data, row context, and variables.

| Field                                   | JSON key                       | What it does                                                                                                                                                                                         |
| --------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navigate to**                         | `navigateTo`                   | Route or URL. Example: `/orders/{row.id}` or `https://example.com?id={item.id}`.                                                                                                                     |
| **Open in new tab**                     | `openInNewTab`                 | Opens the target in a new browser tab, so the user keeps the current form context.                                                                                                                   |
| **Run data source before navigation**   | `beforeNavigateDataSourceName` | An additional data source that runs **before** leaving, e.g. save a draft, resolve an ID, log the click. Example: `loadOrderDraft`.                                                                  |
| **Response data path (optional)**       | `responseDataPath`             | Which part of the before-navigate response to keep. Example: `data`, `result.item`, `payload`.                                                                                                       |
| **Use response path before navigation** | `responseTargetPath`           | Variable or data path where the before-navigate response is stored _before_ navigating, so the target page (or the return trip) can use it. Example: `__variables.customerDraft` or `customerDraft`. |
| **Reload elements on return**           | `reloadOnReturnElementNames`   | Elements refreshed when the user comes back from the navigation or dialog. Example: `filesTable`.                                                                                                    |

```json
{
  "trigger": "click",
  "type": "navigate",
  "label": "Open order",
  "navigateTo": "/orders/{row.id}",
  "beforeNavigateDataSourceName": "saveOrderDraft",
  "responseDataPath": "data",
  "responseTargetPath": "__variables.orderDraft",
  "reloadOnReturnElements": "ordersTable"
}
```

## Action type: `dataSource`

Calls a [data source](./data-sources). This is the workhorse for saving and loading.

| Field                                         | JSON key                           | What it does                                                                                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data source**                               | `dataSourceName`                   | Which source to call. Example: `saveOrder` or `loadPersons`. If a REST source has no URL, the editor warns you; set it in the DataSources tab.                                                                               |
| **Placeholder mapping (URL/body)**            | `params`                           | Maps each `{placeholder}` in the source URL/body to a context path or plain value. Example: body `{selectedRows}` → `__table.el1.selectedRows`, URL `{id}` → `row.id`. Shown only when the source actually has placeholders. |
| **Response action**                           | `responseMode`                     | What to do with the response: `none` (do nothing), `download` (save response as a file), `setValue` (write response into an element).                                                                                        |
| **Response data path (optional)**             | `responseDataPath`                 | Which part of the response to use. Example: `data`, `result.item`, `payload.items`.                                                                                                                                          |
| **Target element**                            | `responseTargetElement`            | Element that receives the response when `responseMode` = `setValue`.                                                                                                                                                         |
| **Target data path (optional)**               | `responseTargetPath`               | Alternative to a target element: write the response to any data path or variable.                                                                                                                                            |
| **Download file name (optional)**             | `responseFileName`                 | File name for `responseMode` = `download`. Tokens allowed: `report-{__variables.route.id}.pdf`.                                                                                                                              |
| **Reload current element data after success** | `reloadCurrentElementAfterSuccess` | The element that fired the action reloads its own data source afterwards.                                                                                                                                                    |
| **Reload data sources after success**         | `reloadDataSourceNames`            | Comma-separated source names re-fetched after success. Example: `loadPersons, loadSummary`.                                                                                                                                  |
| **Elements to reload**                        | `reloadElementNames`               | Comma-separated element names; each reloads its own data source. Example: `ordersTable, summaryCards`.                                                                                                                       |
| **Show toast after successful action**        | `showToastAfter`                   | Enables the [toast fields](#action-type-toast) below the action.                                                                                                                                                             |

```json
{
  "trigger": "click",
  "type": "dataSource",
  "label": "Export",
  "dataSourceName": "exportPdf",
  "params": [{ "param": "year", "path": "reportYear" }],
  "responseMode": "download",
  "responseFileName": "report-{reportYear}.pdf"
}
```

## Action type: `setValue`

Writes a value into any field or variable.

| Field                            | JSON key             | What it does                                                                                                                                               |
| -------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Target variable or data path** | `setValueTargetPath` | Where to write. Use a variable name or `__variables.name` for variables, or any data path. Example: `__variables.selectedRow`, `selectedRow`, `client.id`. |
| **Value source**                 | `setValueMode`       | How the value is produced: `contextPath` (copy from another path), `template` (text with tokens), `json` (object/array literal).                           |
| **Value**                        | `setValueValue`      | The value itself, interpreted per mode, see below.                                                                                                         |

| Mode                | Value example                                  |
| ------------------- | ---------------------------------------------- |
| Context path        | `value`, `item`, `row.id`, `el3.selectedTab`   |
| Text template       | `Selected tab: el3.selectedTab`                |
| JSON object / array | `{ "id": "row.id", "tab": "el3.selectedTab" }` |

Values written to variables can then feed dialogs, expressions, and data source actions.

```json
{
  "trigger": "click",
  "type": "setValue",
  "label": "Remember row",
  "setValueTargetPath": "__variables.selectedRow",
  "setValueMode": "contextPath",
  "setValueValue": "row"
}
```

## Action type: `setOptions`

Replaces the option list of a choice element, so you can build dependent dropdowns without a server round-trip.

| Field              | JSON key                  | What it does                                                                     |
| ------------------ | ------------------------- | -------------------------------------------------------------------------------- |
| **Target element** | `setOptionsTargetElement` | The select/radio/checkbox element whose options are replaced.                    |
| **Options source** | `setOptionsMode`          | Same three modes as `setValue`: `contextPath`, `template`, `json`.               |
| **Options**        | `setOptionsValue`         | Provide an array, or a response object containing `items`, `data`, or `results`. |

| Mode         | Value example                                    |
| ------------ | ------------------------------------------------ |
| Context path | `items`, `response.items`, `__variables.options` |
| JSON         | `[{"label":"A","value":"a"}]`                    |
| Template     | `[{"label":"{row.name}","value":"{row.id}"}]`    |

```json
{
  "trigger": "change",
  "type": "setOptions",
  "setOptionsTargetElement": "citySelect",
  "setOptionsMode": "contextPath",
  "setOptionsValue": "__variables.citiesByCountry"
}
```

## Action type: `reloadElements`

Re-runs the data sources of the named elements. Use after anything that changes server data.

| Field                                    | JSON key             | What it does                                                                                                                                                                                                         |
| ---------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Elements to reload (comma separated)** | `reloadElementNames` | Each listed element reloads its own data source. Example: `ordersTable, summaryCards`. The editor lists all reloadable elements; if none exist yet, first assign a data source to a table, list, or another element. |

```json
{
  "trigger": "click",
  "type": "reloadElements",
  "reloadElementNames": "ordersTable, summaryCards"
}
```

## Action type: `toast`

Shows a notification. The same fields appear on any `dataSource` action when **Show toast after successful action** is on.

| Field                      | JSON key          | What it does                                                                                            |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Toast title**            | `toastTitle`      | Short title. Example: _Data updated_.                                                                   |
| **Toast message**          | `toastMessage`    | Additional explanation. Example: _Table data reloaded_.                                                 |
| **Toast variant**          | `toastVariant`    | Visual type: `success`, `info`, `warning`, `error`.                                                     |
| **Toast position**         | `toastPosition`   | Where on screen: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`. |
| **Show icon**              | `toastShowIcon`   | Whether the toast shows an icon at all.                                                                 |
| **Icon name**              | `toastIcon`       | Material Symbols icon. Example: `check_circle`, `info`.                                                 |
| **Auto hide**              | `toastAutoHide`   | Hide the toast automatically.                                                                           |
| **Auto hide timeout (ms)** | `toastAutoHideMs` | How long to show it. Example: `7000` = 7 seconds.                                                       |

```json
{
  "trigger": "click",
  "type": "toast",
  "toastTitle": "Saved",
  "toastMessage": "Your changes are stored.",
  "toastVariant": "success",
  "toastPosition": "top-right",
  "toastAutoHide": true,
  "toastAutoHideMs": 4000
}
```

## Action type: `dialog`

Opens, closes, or toggles a named [Dialog element](./elements/containers#dialog-dialog).

| Field                | JSON key          | What it does                                                                                                                                   |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dialog name**      | `dialogName`      | The `name` of the Dialog element. The editor lists existing dialogs; if it says _No dialogs yet_, drop a Dialog element onto the canvas first. |
| **Dialog operation** | `dialogOperation` | `open`, `close`, or `toggle`.                                                                                                                  |

```json
{
  "trigger": "click",
  "type": "dialog",
  "dialogName": "clientDialog",
  "dialogOperation": "open"
}
```

## Action type: `validate`

Validates the whole form and shows field errors, the same check the built-in **Validate** toolbar button runs, available as an action on any button. No extra fields. Fires the host app's `onValidating`/`onValidated` events.

```json
{ "trigger": "click", "type": "validate", "label": "Check for errors" }
```

## Action type: `submit`

Validates the form, then fires the host app's `onComplete` event with `{ isValid, data, issues }`, the same behaviour as the built-in **Submit** toolbar button, available as an action on any button (a custom-styled submit button inside a panel, for example). No extra fields.

```json
{ "trigger": "click", "type": "submit", "label": "Submit application" }
```

## Row-action context (tables)

Actions attached to table rows (`rowActions`, `rowClickActions`, `expandedRowActions`, `selectionActions`) get extra context tokens:

| Token                           | Meaning                                        |
| ------------------------------- | ---------------------------------------------- |
| `{row.*}`                       | The clicked row object                         |
| `{parentRow.*}`                 | The parent row (in expanded/nested tables)     |
| `{value}`                       | The cell value (in cell actions)               |
| `{checked}`                     | Toggle/checkbox state (in interactive columns) |
| `{__table.<name>.selectedRows}` | Selected rows of a table                       |

Tables also offer **quick action** presets (_View_, _Edit_, _Copy_, _Delete_) that pre-fill a row action for you.

The same tokens reach the events of an element hosted in a table cell or in a dynamic-table row, plus two more: `{index}` for the row position, and a bare `{fieldName}` as a short form for a sibling field of the same row. A Select in a table column can therefore fire `Row {row.name} is now {value}` on change and name the correct row. See [Cell elements](./elements/tables#cell-elements).

## Recipes

**Save + refresh + notify** (button, `click`):

```json
{
  "trigger": "click",
  "type": "dataSource",
  "label": "Save",
  "dataSourceName": "saveClient",
  "validateForm": true,
  "reloadElementNames": "clientsTable",
  "showToastAfter": true,
  "toastTitle": "Saved",
  "toastVariant": "success"
}
```

**Dependent dropdowns** (country select, `change`): call `loadCities` with param `countryId = {country}` and `responseMode: "setValue"` into the city element, or bind the city element's own data source with **React to change** on `{country}`.

**Delete with confirmation** (table row action):

```json
{
  "label": "Delete",
  "type": "dataSource",
  "dataSourceName": "deleteClient",
  "params": [{ "param": "id", "path": "row.id" }],
  "confirmEnabled": true,
  "confirmTitle": "Delete client?",
  "confirmMessage": "This cannot be undone.",
  "reloadElementNames": "clientsTable",
  "buttonTone": "risk"
}
```

**Navigate with a saved draft** (button, `click`): `navigate` to `/orders/new` with **Run data source before navigation** = `saveOrderDraft` and **Use response path before navigation** = `__variables.orderDraft`. The draft is stored before the user leaves, and `reloadOnReturnElements` refreshes the list when they come back.
