---
title: Data tables & lists
description: Table, Dynamic table, and List grid, with the complete property reference for each.
---

# Tables & lists

Three elements show record collections. Pick by task:

| Element | Data direction | Use for |
| --- | --- | --- |
| **Table** | Displays server data | Browsing, searching, and acting on records |
| **Dynamic table** | Collects user data | Editable rows the user adds/removes (part of the form result) |
| **List grid** | Displays data | Card-style record lists with a custom template |

## Table (`table`)

The full-featured data table. It reads rows from a [data source](../data-sources) and everything below is configurable from the properties sidebar.

::: tip Start simple
A working table needs only: a data source, *Items path*, and 2-3 columns. Add search, actions, and pagination once the data shows up.
:::

Row context in expressions and actions: `{row.fieldName}`, e.g. a row action with condition `{row.status} == "draft"`. Selected rows: `{__table.<tableName>.selectedRows}`.

### Primary source & request

| Property | What it does |
| --- | --- |
| **Data source name** | Primary source from the DataSources tab. Example: `loadUsers`. |
| **Items path (optional)** | Path to the array in the response, e.g. `data.items`. Empty = auto-detection. |
| **Request params** | Additional TABLE-POST params (up to 5 rows): **Param name** + **Value / `{path}`**. |
| **Lazy load** | Load per page/sort from the server instead of everything upfront. |
| **Total path (lazy)** | Path to the total record count, e.g. `meta.total` or `totalCount`. Optional: `total`, `totalCount`, `totalRecords`, `count`, `cnt` (and the same names nested under `paging.*`) are auto-detected without setting this. |
| **Order clause** | Sort expression the backend expects. |
| **Order direction** | `asc` / `desc`, used with the order clause or column sorting. |

With **Lazy load** on, set the data source's **Method** to `TABLE-POST`. This sends a real `POST` but automatically merges the current page/sort/search state into the request body for you. **For the exact request/response JSON your backend must implement, see [Table: server-side paging & filtering](../../developers/data-sources#table-server-side-paging-filtering-table-post) in the developer docs**, and hand that section to whoever builds the endpoint.

### Search

| Property | What it does |
| --- | --- |
| **Show quick search** | One short field for quick filtering. |
| **Quick search placeholder** | Say what can be searched here. |
| **Quick search param name** | Request parameter for the value, e.g. `q` or `searchTerm`. |
| **Quick search condition** | Match mode: contains `%-%`, not contains `!%-%`, starts with `%-`, ends with `-%`, equals `=`, not equals `!=`. |
| **Quick search case mode** | Case-insensitive latin, case sensitive, uppercase, or lowercase comparison. |
| **Quick search debounce (ms)** | Time between the last keystroke and the request. |
| **Show detailed search** | The expanded block with per-column filters, operators, and values. |
| **Detailed search case mode** | Case handling for detailed search. |

Per-column filter settings live on each column; see [Columns](#columns) below.

### Columns

**Columns** holds the column schema. Each column has:

| Column field | What it does |
| --- | --- |
| **Key** | Data key in the row object; nested paths allowed (`user.name`, `status`). |
| **Label** / **Mobile label** | Header text; the mobile variant falls back to Label when empty. |
| **Align** | Column text alignment. |
| **Sortable** | Whether sorting is allowed by this column. |
| **Show in table / Show in details** | Where the column appears (main table and/or the details view). |
| **Detail label** | Optional different name in the details view. |
| **Show header label** | Hide header text for action/checkbox/technical columns. |
| **Header group** | Group header above the column. Adjacent columns with the same name merge. |
| **Template** | Custom cell HTML, e.g. <code v-pre><strong>{{value}}</strong> {{row.status}}</code>. |
| **Template ref** | Reference to a [Templates-tab](../templates) template (takes priority over inline HTML). |
| **Filter control type** | Detailed-search control for this column: `auto`, `select`, `toggle`… |
| **Filter options / JSON / data source (+ items path, label key, value key)** | Where the filter's choices come from: manual list, JSON, or a data source. |
| **Filter toggle true/false value** | What a detailed-search toggle sends when on/off (`yes`/`no`, `T`/`N`). |
| **Filter multi-value delimiter** | Joins multiple filter values into one request param (`,` or `;`). |
| **Status rules** | Condition + tone (+ label, icon, rounded) rules that render the cell as a status badge. Conditions support `{row.*}`, `{value}`. Example: `[{ "condition": "{row.submitted} == \"Y\"", "label": "Submitted", "tone": "success", "icon": "check_circle", "rounded": true }]`. |
| **Show status icon** | Status badges show an icon (tone default when the rule has none). |
| **Checked if / Enabled if** | For interactive toggle/checkbox columns: what controls the checked state (`{row.disabled} == true`) and whether clicking is allowed (`{row.canEdit} == true`). |
| **Cell actions (+ enabled, display mode, placeholder)** | Actions on the cell: dropdown/buttons for regular columns; fired on click for toggle/checkbox columns. Context: `row`, `parentRow`, `column`, `checked`. |
| **Use totals (+ fraction digits, locale, grouping, mask, template)** | Show this column's sum in the footer row, with formatting controls and a `{total}` text template. |
| **Editable / Editor type / Editor options (+ label key, value key, placeholder)** | Inline-edit settings for this column: which control edits it (text, number, select, date) and where its choices come from. |

### Actions

| Property | What it does |
| --- | --- |
| **Row actions** | Actions for each row, as a dropdown or buttons. Quick presets: View, Edit, Copy, Delete. |
| **Row actions display** | `dropdown`, `iconButtons`, or `buttons` (icon + text). |
| **Row actions menu button style** | Default or borderless three-dot button. |
| **Row action visibility path** | Row field that decides whether actions show for that record. |
| **Row click actions** | Actions fired by clicking the whole row (navigate, open details, select). |
| **Row expand actions** | Actions for the expanded-row scenario. |
| **Selection actions** + **label** | Bulk actions applied to selected rows (export, delete, status change). |
| **Actions label** / **Show actions header label** | The actions column header text, and whether to show it. |

Every action uses the standard [action editor](../events-actions), so a row button can navigate to `/clients/{row.id}` or call an endpoint with `id = row.id`.

### Selection

| Property | What it does |
| --- | --- |
| **Enable multi select** | Checkbox selection. Selected records: `{__table.<name>.selectedRows}` (and `.selectedItems` with a template). |
| **Selection key path** | Unique field identifying rows, e.g. `id` or `classifier.id`. |
| **Auto select if** | Auto-select rows after refresh. Example: `{row.status} == "Y"`. |
| **Selected item template** | How each selected row becomes an entry in `selectedItems`: empty = whole row; `row.oraId` = an ID array; JSON like `{"oraId":"{row.oraId}"}` = custom objects. |

### Expanded rows & details

| Property | What it does |
| --- | --- |
| **Expandable rows** | Master switch. Without it neither inline nested tables nor the side panel work. |
| **Expanded display mode** | `inline` (below the row) or `sidePanel` (side details panel). |
| **Show expand chevron in first column** | Chevron appears only on rows that can actually expand. |
| **Open details on row click** | Row click opens details, with no separate button needed. |
| **Expanded rows path** | Path in the row object to the nested array (`orgList`, `details.items`). |
| **Expanded datasource** (+ **items path**) | Alternative: call a data source on expand instead of reading a nested array. Example: `organizationsByUser`. |
| **Expanded columns** | Nested-table columns (same schema as Columns). |
| **Expanded row actions** | Actions on nested records; context adds `parentRow` / `tableRow`. Example: `[{ "label": "Open", "type": "navigate", "navigateTo": "/org/{parentRow.id}/{row.id}" }]`. |
| **Expanded content template (HTML)** | Free-form details markup: <code v-pre>{{value}}</code>, <code v-pre>{{row.xxx}}</code>, <code v-pre>{{item.xxx}}</code>. |
| **Expanded empty message** | Text when a row has no nested records. |
| **Details panel title** | Title of the side details panel. |

### Pagination

| Property | What it does |
| --- | --- |
| **Paginator** | Shows pagination controls. |
| **Page size** | Records per page. |
| **Page size options** + **Show page size selector** | Let users pick from e.g. `10,25,50,100`. List only values the backend supports. |
| **Paginator variant** | `full`, `pager`, `numbers`, `simple`. |
| **Paginator align** | Start / center / end. |
| **Paginator max buttons** | How many page buttons show at once. |
| **Show record count** | Total results summary near the paginator. |
| **Flat footer surface** | Footer without extra border/shadow accents. |

### Header controls

| Property | What it does |
| --- | --- |
| **Show header controls** | Master switch for the header bar (search, export, menu…). |
| **Show export buttons** | CSV / Excel / PDF export, generated entirely in the browser from the rows the table already has (or re-fetches with a larger page size for "export all"). There is no separate server-side export endpoint to build. |
| **Export column picker dialog** | Choose which columns to export. Handy for wide tables. |
| **Export file name** | Default download name. |
| **Export all page size** | Batch size when exporting all pages of a lazy table. |
| **Column settings** (*Show column settings*) | End users change visible columns, order, and widths. |
| **Column settings mode** | Where preferences live: local UI, localStorage, or host/server. |
| **Column settings storage key** | localStorage key when persisting between sessions. |
| **Column settings datasource / path / save datasource / dialog title** | Server-backed column settings: load source + response path, save source, and dialog title. |
| **Header template (HTML)** / **Header template ref** | Custom content in the header center, as inline HTML or a Templates-tab reference. |
| **Header added elements position** | Where drag-and-dropped header elements align: left / center / right. |
| **Header dropdown** (+ placeholder, items path, datasource, datasource items path, static options, label key, value key) | An extra dropdown in the header. Its options come from a path, data source, or manual list. |
| **Header dropdown actions** | Actions fired by menu items (navigate, data source…). |
| **Flat header surface** | Header without extra surface accents. |

### Inline edit

| Property | What it does |
| --- | --- |
| **Enable inline edit** | Edit cells in place, without a dialog. |
| **Inline edit start mode** | Single click, double click, or an action button. |
| **Inline edit save datasource** | Where changed rows are sent. |
| **Cancel inline edit on reload** | Drop unsaved edits when the table reloads. |

### Appearance & performance

| Property | What it does |
| --- | --- |
| **Table style** | `default`, `grid`, `striped`. |
| **Row hover** | Hover state for rows. |
| **Sticky header** | Header (with search/filters/export) sticks while scrolling. |
| **Responsive mode** | `auto` or stack on mobile. |
| **Empty state text** | Text when the table has no data. |
| **Virtual scroll** (+ buffer, row height, viewport height) | Renders only visible rows for huge datasets. Set an accurate row height; the buffer trades smoothness for DOM size. |

### Texts

| Property | What it does |
| --- | --- |
| **Prev / Next label** | Pagination button texts. |
| **Loading label** | Text during load. |
| **Select all / Select / Select row label** | Selection checkbox labels (also used for accessibility). |
| **Expand / Collapse label** | Expand-button texts. |

## Dynamic table (`dynamicTable`)

An **input** element: spreadsheet-like rows the user fills in. The value is an array of objects, exactly like a [Dynamic panel](./containers#dynamic-panel-dynamicpanel) but in table form.

| Property | What it does |
| --- | --- |
| **Columns** | Each column is itself an element (text, number, select, multi-select, radio, checkbox, datepicker, textarea…) with its own validation. |
| **Add row button text** / **Remove row button text** | Button captions. |
| **Disallow adding rows** / **Disallow deleting rows** | Lock the row count. |
| **Max rows** | Upper limit. The add button disables when it is reached. |
| **Confirm row deletion** | Ask before removing, with **Delete confirm title / message / confirm & cancel button texts**. |
| **Hide row if** | Expression that hides matching rows: `{row.status} != "A"`. |
| **Status rules** | Condition + tone rules that color the whole cell background. |
| **Total template** | Footer text with `{total}`, e.g. `Total: {total}`. |

Row context inside cells: `row.otherColumn`, `row.index`. Aggregates outside: `sumInArray({orderLines}, "amount")`.

Example: order lines:

- Columns: `product` (select with data source), `quantity` (number), `price` (number, read-only, filled by expression from the product), `total` (number, *Expression*: `toNumber(row.quantity) * toNumber(row.price)`).
- Below the table, a read-only Number named `orderTotal` with *Expression*: `sumInArray({orderLines}, "total")`.

## List grid (`listGrid`)

Renders each record of a data source as a card using an HTML template: product cards, employee directory, dashboards.

| Property | What it does |
| --- | --- |
| **Data source / Items path** | Where records come from. |
| **Card template** | HTML with <code v-pre>{{item.xxx}}</code> placeholders and `@if(...)` blocks, inline or from the [template library](../templates) via **Card template ref** (ref wins). |
| **Layout** | List or grid display. |
| **Grid column count** / **Grid minimum column width** / **Min card width** / **Gap** | Grid geometry. |
| **Quick search** (*Run search / Clear search / placeholder*) | Built-in search bar over the records. |
| **Sort control** (*Show sort control* + **Sort field**) | A sort button; requires the field to sort by (`name`, `createdAt`, `user.lastName`). |
| **Infinity scroll** | Loads the next page as the user nears the bottom, an alternative to a paginator for card lists. |
| **Total path** | Total record count in the response for lazy loading (`total`, `data.totalCount`, `paging.total`). |
| **Empty message** | Text when there are no records. |

Template example:

```html
<div class="card">
  <strong>{{ item.name }}</strong>
  <span>{{ item.city }}</span>
  @if (item.status == "Active") {<span class="ok">{{ item.status }}</span>}
</div>
```
