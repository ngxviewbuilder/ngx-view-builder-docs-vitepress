---
title: "AI: Canonical properties reference"
description: The authoritative property reference for AI JSON generation. Only properties listed here are supported.
---

# AI: Canonical properties reference

This is the authoritative property reference for AI JSON generation. Only properties listed here are supported. Do not invent or guess properties not found in this document.

---

## Base properties (all elements)

Every element must have these three fields:

```json
{
  "name": "fieldName",
  "label": "Field Label",
  "type": "text"
}
```

Additional base properties available on all element types:

| Property | Type | Description |
|---|---|---|
| `description` | `string` | Subtitle or help text shown below the label |
| `hidden` | `boolean` | Statically hides the element |
| `width` | `string` | Width (e.g. `"100%"`, `"300px"`) |
| `tabletWidth` | `string` | Width on tablet |
| `mobileWidth` | `string` | Width on mobile |
| `dependsOn` | `string[]` | Limit expression recalculation to these field names |
| `logicExecutionMode` | `"onBlur" \| "onChange" \| "onInput"` | When logic/expression is re-evaluated |
| `validationExecutionMode` | `"onBlur" \| "onChange" \| "onInput"` | When validators are re-evaluated |
| `status` | `"default" \| "readonly"` | Interaction status override |
| `labelTooltip` | `string` | Tooltip shown on label hover |
| `fitContent` | `boolean` | Width fits content |

---

## Logic fields (element level only, never inside validators)

These fields accept JEXL expressions using `{fieldName}` placeholder syntax.

| Field | Return type | Behavior |
|---|---|---|
| `visibleIf` | `boolean` | Element visible when `true` (native field) |
| `hideIf` | `boolean` | Element hidden when `true`. Auto-converted to `visibleIf: !(expr)` |
| `disableIf` | `boolean` | Element disabled when `true` |
| `requireIf` | `boolean` | Element required when `true` |
| `readonlyIf` | `boolean` | Element readonly when `true` (also `readOnlyIf`) |
| `resetIf` | `boolean` | Element value cleared when `true` |
| `expression` | `any` | Result is set as element value; also for `setElementProperty` calls |

**All logic fields must contain valid JEXL expressions only.**

---

## Static state fields

| Field | Type | Description |
|---|---|---|
| `required` | `boolean` | Always required |
| `disabled` | `boolean` | Always disabled |
| `readOnly` | `boolean` | Always read-only |

---

## Validators

`validators` is an array of `IValidator` objects. Exact interface:

```typescript
interface IValidator {
  type?: string;         // validator type (required)
  message?: string;      // error message shown to user
  value?: string | number; // threshold (minLength, maxLength, min, max, minDate, maxDate)
  condition?: string;    // JEXL, the FAILING check; error shown while this evaluates to true
  applyIf?: string;      // JEXL, validator runs only when this is truthy
}
```

**Forbidden inside validators: `expression`, `visibleIf`, `requireIf`, `disableIf`, `readonlyIf`, `resetIf`.**

```json
{
  "validators": [
    { "type": "minLength", "value": 3, "message": "At least 3 characters" },
    { "type": "maxLength", "value": 100, "message": "Too long", "applyIf": "notEmpty({name})" },
    { "type": "min", "value": 0, "message": "Cannot be negative" },
    { "type": "max", "value": 999, "message": "Too large" },
    { "type": "minDate", "value": "today", "message": "Cannot be in the past" },
    { "type": "maxDate", "value": "today", "message": "Cannot be in the future" }
  ]
}
```

---

## Events / Actions

`events` is an array of `IElementActionConfig` objects. Key fields:

| Field | Type | Values / Notes |
|---|---|---|
| `trigger` | `string` | `click` `submit` `input` `change` `blur` `focus` `beforeLoad` `onLoad` `afterLoad` `always`. Prefer a named trigger; `always` skips trigger filtering entirely and is only for host elements whose events are not gestures (a router outlet's `activate`/`deactivate`), so on a normal element it fires on load and on every gesture. |
| `type` | `string` | `navigate` `dataSource` `setValue` `setOptions` `reloadElements` `toast` `dialog` `validate` `submit` |
| `label` | `string` | Button label (when rendered as action button) |
| `icon` | `string` | Icon name |
| `condition` | `string` | JEXL, action runs only when truthy |
| `validateForm` | `boolean` | Validate before executing |
| `confirmEnabled` | `boolean` | Show confirmation dialog before action |
| `confirmTitle` | `string` | Confirm dialog title |
| `confirmMessage` | `string` | Confirm dialog body |

**By action type:**

`navigate`: `navigateTo` (URL/route), `openInNewTab` (boolean)

`dataSource`: `dataSourceName`, `responseMode` (`none` `download` `setValue`), `responseDataPath`, `responseTargetElement`, `reloadCurrentElementAfterSuccess`, `reloadOnReturnElementNames`

`toast`: `toastTitle`, `toastMessage`, `toastVariant` (`error` `warning` `info` `success`), `toastPosition` (`top-left` `top-center` `top-right` `bottom-left` `bottom-center` `bottom-right`), `toastAutoHide`, `toastAutoHideMs`

`dialog`: `dialogName`, `dialogOperation` (`open` `close` `toggle`)

`setValue`: `setValueTargetPath`, `setValueMode` (`contextPath` `template` `json`), `setValueValue`

`setOptions`: `setOptionsTargetElement`, `setOptionsMode` (`contextPath` `template` `json`), `setOptionsValue`

`reloadElements`: `reloadElementNames` (comma-separated)

`validate`: no extra fields. Validates the whole form and shows field errors, same as the built-in Validate toolbar button

`submit`: no extra fields. Validates the form, then fires `onComplete` with `{ isValid, data, issues }`, same as the built-in Submit toolbar button

Button appearance for action: `buttonVariant` (`filled` `outlined` `text`), `buttonTone` (`primary` `risk` `neutral`), `hideText`, `useCustomButtonStyle`

---

## Per-type additional properties

### `text`

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | |
| `minlength` | `number` | |
| `maxlength` | `number` | |
| `showMaxLengthCounter` | `boolean` | Show counter when maxlength is set |
| `pattern` | `string` | Regex pattern |
| `maskType` | `string` | Exactly: `none` `phoneIntl` `date` `time` `dateTime` `digits` `custom`. No other mask names exist |
| `maskPattern` | `string` | Custom mask (when maskType is `custom`) |
| `inputMode` | `string` | `text` `search` `email` `tel` `url` `numeric` `decimal` |
| `spellcheck` | `boolean` | |
| `autocomplete` | `string` | Browser autocomplete hint |
| `requiredMessage` | `string` | Custom required error message |

### `textarea`

Same as `text` plus:
| Property | Type | Notes |
|---|---|---|
| `rows` | `number` | Visible row count |

### `number`

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | |
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |
| `step` | `number` | Increment step |
| `inputMode` | `string` | `numeric` `decimal` |
| `valueStorageType` | `string` | `number` (default) or `string` |
| `visualFormatEnabled` | `boolean` | Enable visual number formatting |
| `visualFormatLocale` | `string` | Locale for formatting (e.g. `"lt-LT"`) |
| `visualFormatUseGrouping` | `boolean` | Thousands separator |
| `visualFormatMinFractionDigits` | `number` | |
| `visualFormatMaxFractionDigits` | `number` | |
| `requiredMessage` | `string` | |

### `datepicker`

**Exact type string: `"datepicker"` (all lowercase)**

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | |
| `pickerMode` | `string` | `date` (default) or `datetime` |
| `includeSeconds` | `boolean` | For datetime mode |
| `format` | `string` | Output format. Exactly one of `""` (locale) `YYYY-MM-DD` `DD/MM/YYYY` `MM/DD/YYYY` `DD.MM.YYYY` `YYYY/MM/DD` `custom`. Lowercase Angular-style patterns such as `yyyy-MM-dd` are **not** valid |
| `customFormat` | `string` | The pattern used when `format` is `custom` |
| `minValue` | `string` | Min selectable date (JEXL or static) |
| `maxValue` | `string` | Max selectable date (JEXL or static) |
| `requiredMessage` | `string` | |

### `dateRange`

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | |
| `format` | `string` | |
| `minValue` | `string` | |
| `maxValue` | `string` | |
| `requiredMessage` | `string` | |

Value shape: `{ "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD" }`

### `select` / `multiSelect` / `radio` / `checkbox` / `autocomplete`

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | Real on `autocomplete`, `listBox`, `selectButton`. On `select` / `multiSelect` it sets **only the search box hint** inside the open dropdown, and only when `showSearch` is on; the closed-state "Select..." text comes from the UI translation `select.placeholder` / `multiSelect.placeholder`, not from this property |
| `options` | `IOption[]` | Static options: `[{ "value": "x", "label": "X" }]` |
| `dataSource` | `IElementDataSource` | Dynamic options from datasource |
| `showSearch` | `boolean` | Search box in dropdown (select) |
| `strictOptions` | `boolean` | Value must be from options list |
| `filterIfEqual` | `string` | Filter options when datasource field equals value |
| `filterIfNotEqual` | `string` | Filter options when datasource field not equals value |
| `optionTemplate` | `string` | Inline HTML template for each option |
| `optionTemplateName` | `string` | Template name reference |
| `showInline` | `boolean` | Lay the choices out in a row (`radio`, `checkbox`) |
| `requiredMessage` | `string` | |

Value shapes:
- `select` / `radio` / `autocomplete`: single value
- `multiSelect` / `checkbox`: array

### `singleCheckbox` / `toggleSwitch` / `toggleButton`

Value shape: `boolean`

| Property | Type | Notes |
|---|---|---|
| `checkboxLabel` | `string` | Text rendered **next to the box** (`singleCheckbox`). `label` is the field label above it; for a bare checkbox row set `label` to `""` and put the wording here |
| `checkedValue` | `any` | Value when checked (`toggleButton` only) |
| `uncheckedValue` | `any` | Value when unchecked (`toggleButton` only) |

`singleCheckbox` has no `checkedValue` / `uncheckedValue`. It always stores `true` / `false`.

### `phoneInput`

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | |
| `defaultCountryCode` | `string` | ISO code of the preselected country: `LT` `LV` `EE` `PL` `DE` `SE` `NO` `DK` `FI` `GB` `IE` `US` |
| `allowedCountryCodes` | `string[]` | Restrict the country dropdown to these ISO codes |
| `maxlength` | `number` | |
| `autocomplete` | `string` | |
| `requiredMessage` | `string` | |

`phoneInput` has its own country dropdown. It has **no** `maskType`, `maskPattern` or `inputMode`, and the dial code is not set via `defaultValue`.

### `button`

| Property | Type | Notes |
|---|---|---|
| `text` | `string` | Button text |
| `icon` | `string` | Icon name |
| `iconPosition` | `string` | `left` `right` `top` `bottom` |
| `iconOnly` | `boolean` | Show icon only |
| `variant` | `string` | `solid` `outline` `text` |
| `tone` | `string` | `primary` `neutral` `success` `info` `warning` `risk` |
| `size` | `string` | `small` `normal` `large` |
| `loading` | `boolean` | Show loading spinner |
| `badge` | `string` | Badge text |
| `events` | `IElementActionConfig[]` | Primary click actions |
| `menuActions` | `IElementActionConfig[]` | Dropdown menu actions |

### `fileUpload`

| Property | Type | Notes |
|---|---|---|
| `accept` | `string` | Accepted MIME types or extensions, e.g. `.pdf,image/*` |
| `multiple` | `boolean` | Allow multiple files |
| `maxFiles` | `number` | Max number of attached files (default `5`) |
| `maxFileSizeMb` | `number` | Max file size **in megabytes**, not bytes |
| `uploadDataSourceName` / `downloadDataSourceName` / `deleteDataSourceName` | `string` | Names of REST data sources; empty `uploadDataSourceName` means files never leave the browser (local metadata only) |
| `uploadFormFieldName` | `string` | `multipart/form-data` field name for the file (default `file`). Upload always sends single-field `FormData`, never JSON/base64 |
| `fileKeyField` / `fileNameField` / `fileTypeField` / `fileSizeField` | `string` | Field names read from the server's response object (defaults `key`, `name`, `contentType`, `size`; the older `fil_key`/`fil_name`/`fil_content_type`/`fil_size` names are still recognized as fallback aliases) |

Value shape: the upload response object stored verbatim (or an array of them when `multiple`), keyed under the element's `name`, never file bytes/base64. Full request/response wire contract: [File upload requests](../developers/data-sources#file-upload-requests).

### `page`

The complete list. A `page` element accepts nothing else.

| Property | Type | Notes |
|---|---|---|
| `name` | `string` | Must match the `pages[*].name` entry |
| `label` | `string` | Page / step title |
| `description` | `string` | Subtitle |
| `type` | `"page"` | Required |
| `hideHeader` | `boolean` | Hide the page title block |
| `removeBackgraund` | `boolean` | Drop the page background. Spelled exactly like this, the typo is part of the schema |
| `pageBackgroundColor` | `string` | |
| `pagePadding` | `string` | |
| `mobilePadding` | `string` | |
| `visibleIf` / `disableIf` / `readonlyIf` | `string` | JEXL |

A page's children are **not** listed here. They live in `pages[*].rows`; see [Layout model](./layout-model).

### `panel`

| Property | Type | Notes |
|---|---|---|
| `headerTemplate` | `string` | Inline HTML for panel header |
| `headerTemplateName` | `string` | Template name reference |
| `maxHeight` | `string` | Max panel height |
| `panelPadding` | `string` | Internal padding |
| `mobilePadding` | `string` | Mobile padding |
| `panelRadius` | `string` | Border radius |
| `panelShadow` | `string` | Box shadow CSS |
| `showBorder` | `boolean` | Show panel border |
| `panelBorderWidth` | `string` | Border width (when showBorder) |
| `panelBorderColor` | `string` | Border color (when showBorder) |
| `panelBackgroundColor` | `string` | Background color |
| `titleUnderline` | `boolean` | Show underline below title |
| `contentJustify` | `string` | Flexbox justify: `flex-start` `center` `flex-end` `space-between` `space-around` `space-evenly` |
| `contentAlign` | `string` | Flexbox align: `flex-start` `center` `flex-end` `stretch` |
| `contentGap` | `string` | Gap between child elements |
| `titleUnderlineColor` | `string` | Underline color (when `titleUnderline`) |
| `titleUnderlineWidth` | `string` | Underline thickness (when `titleUnderline`) |
| `resetChildrenOnHide` | `boolean` | Clear descendant field values when the panel becomes hidden |

**A panel never lists its children.** There is no `rows`, `columns`, `children`, `elements` or `items` property on `panel`. Child fields are attached in the layout tree, on the column that references the panel. See [Layout model](./layout-model#nesting-the-mistake-that-breaks-everything).

### `dynamicPanel`

Same as `panel` plus repeatable container behavior (`addRowButtonText`, `removeRowButtonText`, `emptyMessage`, `disallowAddRows`, `disallowDeleteRows`, `maxRows`, `confirmRowDeletion`, `hideHeader`). Value shape: array of objects. Children are attached the same way as for `panel`, via `column.rows`.

### `dynamicTable`

| Property | Type | Notes |
|---|---|---|
| `emptyMessage` | `string` | Message when no rows |
| `addRowButtonText` | `string` | Add row button label |
| `itemsPath` | `string` | Data path for pre-populating rows |
| `disallowAddRows` | `boolean` | |
| `disallowDeleteRows` | `boolean` | |
| `maxRows` | `number` | |
| `confirmRowDeletion` | `boolean` | |
| `confirmDeleteTitle` | `string` | |
| `confirmDeleteMessage` | `string` | |
| `confirmDeleteConfirmLabel` | `string` | |
| `confirmDeleteCancelLabel` | `string` | |
| `hideRowIf` | `string` | JEXL, hides individual rows |
| `columns` | `IDynamicTableColumn[]` | Column definitions |
| `dataSource` | `IElementDataSource` | Pre-populate from datasource |

Column-level totals:

| Property | Type | Notes |
|---|---|---|
| `columns[*].useTotals` | `boolean` | Sum in the footer row, also published to data |
| `columns[*].totalToData` | `boolean` | Publish the sum without a footer row |

A published sum lands in the data as `<table>.<column>-total`, for example `el4.column1-total`, and is read in expressions as `{el4.column1-total}`. Inside a dynamic panel the key carries the entry index: `el1[0].el5.column3-total`.

Value shape: array of objects.

### `table`

`columnsConfig` entries use `key` (NOT `name`). Minimum column:

```json
{
  "key": "firstName",
  "label": "First Name",
  "showInTable": true
}
```

Column type values the builder offers: `text`, `date`, `dateTime`, `number`, and `element`. The renderer still understands `boolean` `html` `status` `toggleSwitch` `singleCheckbox` so older structures keep working, but do not author new columns with them; use `element` with the matching `elementType` instead.

`date`, `dateTime`, and `number` format the raw value in place, no template or cell element needed:

```json
{
  "key": "created",
  "label": "Created",
  "type": "dateTime",
  "dateIncludeSeconds": true,
  "showInTable": true
}
```

| Property | Type | Notes |
|---|---|---|
| `formatLocale` | `string` | `lt-LT`, `en-US`. Empty follows the view locale |
| `dateFormatPattern` | `string` | `yyyy-MM-dd HH:mm:ss`. Tokens `yyyy yy MM dd HH hh mm ss SSS a`. Wins over the locale format |
| `dateIncludeSeconds` | `boolean` | `dateTime` only |
| `numberMinFractionDigits` | `number` | Decimal places, minimum |
| `numberMaxFractionDigits` | `number` | Decimal places, maximum |
| `numberUseGrouping` | `boolean` | Thousands separator, defaults to `true` |

A column of `type: "element"` renders a real element in every row:

```json
{
  "key": "status",
  "label": "Status",
  "type": "element",
  "showInTable": true,
  "elementType": "select",
  "element": {
    "options": [{ "label": "New", "value": "new" }, { "label": "Done", "value": "done" }],
    "events": [
      { "trigger": "change", "type": "dataSource", "dataSourceName": "saveStatus",
        "params": [
          { "name": "id", "value": "{row.id}" },
          { "name": "status", "value": "{value}" }
        ] }
    ]
  }
}
```

`elementType` is the element type id (`select`, `button`, `badge`, `datepicker`, `progressBar`, `customHtml`, `richTextViewer`, and so on). Use `richTextViewer` when the row field already holds HTML and only needs rendering. `element` is that element's own configuration, the same keys it would have as a page element. Inside it, `{row.*}`, a bare sibling field name, `{index}`, and `{value}` all resolve against the row the cell belongs to.

| Property | Type | Notes |
|---|---|---|
| `columnsConfig` | `ITableColumnConfig[]` | Column definitions, use `key` not `name` |
| `columnsConfig[*].elementType` | `string` | Element type rendered in the cells, when `type` is `element` |
| `columnsConfig[*].element` | `object` | Configuration of that hosted element (options, dataSource, events, validators) |
| `dataSource` | `IElementDataSource` | The table's source, for both client-side and server-side tables. With `lazyLoad: false` it must return **all** rows in one response; with `lazyLoad: true` it must accept the `TABLE-POST` paging/filter contract below |
| `tableDataSourceName` | `string` | Legacy server-side binding, still read for older structures. New structures put the source in `dataSource` |
| `lazyLoad` | `boolean` | `true` = server-side paging/sort/search per request; `false` = load everything once |
| `tableItemsPath` / `tableTotalPath` | `string` | Response paths for rows / total count, both optional. Common shapes (`items`/`data`/`results`/`rows`, `total`/`totalCount`/`totalRecords`/`count`/`cnt`) are auto-detected |
| `pageSize` | `number` | Default page size |
| `rowActions` | `ITableRowActionConfig[]` | Row action buttons. These go through the generic action/data-source pipeline, not this contract |

**Do not use `ITableDataSourceConfig`.** It exists in the type definitions but is dead code, never wired to anything; the real per-table binding is the flat `tableDataSourceName`/`tableItemsPath`/`tableTotalPath` trio above.

When `lazyLoad: true` and the data source's `method` is the literal string `TABLE-POST` (sent over the wire as a real `POST`), NGX View Builder auto-merges the current page/sort/search state into the request body:

```json
{
  "pagingParams": { "cnt": null, "orderClause": "lastName DESC", "pageSize": 25, "skipRows": 50, "totalCountUsed": false },
  "params": [ ["tenantId", "42"] ],
  "extendedParams": [
    { "paramName": "quickSearch", "paramValue": { "condition": "%-%", "value": "acme" } },
    { "paramName": "status", "paramValue": { "condition": "=", "value": "active" } }
  ]
}
```

`condition` values: `%-%` contains, `!%-%` not contains, `%-` starts with, `-%` ends with, `=`/`!=` equals/not equals, `>`/`>=`/`<`/`<=` for numbers and dates. Full contract, response shape, row-action/inline-edit context, and export behavior: [Table: server-side paging & filtering](../developers/data-sources#table-server-side-paging-filtering-table-post).

### `tabs` / `tabsPro`

Contains named tab sections. Child rows assigned via `column.tabRows`.

### `accordion`

Collapsible sections with `label` per panel.

### `dialog`

Modal element. Configure via `settings.dialog*` fields:

| Setting | Notes |
|---|---|
| `settings.renderMode` | `"dialog"` |
| `settings.dialogTitle` | Dialog title |
| `settings.dialogDescription` | Subtitle |
| `settings.dialogWidth` | Width |
| `settings.dialogShowCloseButton` | boolean |
| `settings.dialogPadding` | CSS padding |
| `settings.dialogMaxWidth` | Max width |
| `settings.dialogMaxHeight` | Max height |

### `richText` / `richTextViewer`

Value shape: `string` (HTML).

### `messageCard`

| Property | Type | Notes |
|---|---|---|
| `tone` | `string` | `primary` `success` `warning` `risk` `neutral` `info` |
| `icon` | `string` | Icon name |
| `text` | `string` | Card message text |

### `statsCard`

| Property | Type | Notes |
|---|---|---|
| `value` | `string` | Main numeric/text value |
| `trend` | `string` | Trend direction |
| `trendValue` | `string` | Trend amount |

### `badge`

| Property | Type | Notes |
|---|---|---|
| `text` | `string` | Badge content |
| `tone` | `string` | `primary` `success` `warning` `risk` `neutral` `info` |

### `image`

| Property | Type | Notes |
|---|---|---|
| `src` | `string` | Image URL or JEXL expression |
| `alt` | `string` | Alt text |
| `objectFit` | `string` | CSS object-fit |

### `icon`

| Property | Type | Notes |
|---|---|---|
| `icon` | `string` | Icon name |
| `size` | `string` | Icon size |
| `tone` | `string` | Color tone |

### `divider`

No additional properties beyond base.

### `spacer`

| Property | Type | Notes |
|---|---|---|
| `height` | `string` | Spacer height |

### `pageTitle`

| Property | Type | Notes |
|---|---|---|
| `title` | `string` | Heading text |
| `subtitle` | `string` | Subheading text |

### `breadcrumbs`

| Property | Type | Notes |
|---|---|---|
| `items` | `array` | Breadcrumb items |

### `iframe`

| Property | Type | Notes |
|---|---|---|
| `src` | `string` | Source URL |
| `height` | `string` | Frame height |
| `scrolling` | `boolean` | |

### `slider`

| Property | Type | Notes |
|---|---|---|
| `min` | `number` | |
| `max` | `number` | |
| `step` | `number` | |
| `valueStorageType` | `string` | `number` or `string` |

### `numberStepper`

| Property | Type | Notes |
|---|---|---|
| `step` | `number` | Increment/decrement step |
| `min` | `number` | Min value |
| `max` | `number` | Max value |

Value shape: `number`.

### `timePicker`

| Property | Type | Notes |
|---|---|---|
| `placeholder` | `string` | |
| `minuteStep` | `number` | Minute increment shown in the picker |

Value shape: time string.

### `signaturePad`

| Property | Type | Notes |
|---|---|---|
| `canvasHeight` | `number` | Canvas height in px |
| `clearLabel` | `string` | Clear button label |
| `strokeColor` / `strokeWidth` / `backgroundColor` | `string` / `number` / `string` | Drawing style |
| `exportFormat` | `string` | `png` or `jpeg` |

Value shape: signature image data (per `exportFormat`), keyed under the element's `name`.

### `listBox`

| Property | Type | Notes |
|---|---|---|
| `selectionMode` | `string` | `single` or `multiple` |
| `dataSource` | `IElementDataSource` | Options from a datasource |
| `options` | `array` | Static options |
| `maxHeight` | `number` | List height in px |

Value shape: single value (`selectionMode: "single"`) or array (`selectionMode: "multiple"`).

### `selectButton`

| Property | Type | Notes |
|---|---|---|
| `multiple` | `boolean` | Allow selecting more than one option |
| `allowEmpty` | `boolean` | Allow deselecting to no value |
| `variant` | `string` | `buttons` or `segmented` |
| `orientation` | `string` | `horizontal` or `vertical` |
| `size` | `string` | `small` `normal` `large` |
| `tone` | `string` | `primary` `neutral` `success` `info` `warning` `risk` |

Value shape: single value, or array when `multiple` is `true`.

### `progressBar`

| Property | Type | Notes |
|---|---|---|
| `min` / `max` | `number` | Value bounds |
| `expression` | `string` | Computes the current value |
| `dataSource` / `progressDataPath` / `progressValuePath` / `progressMaxPath` | - | Drive the value from a datasource |
| `displayType` | `string` | `linear` or `circular` |
| `valueLabelMode` | `string` | `percent` `value` `fraction` |

Value shape: `number` (0 to `max`, default 100).

---

## `ISettings` fields

Only include settings actually needed by the form.

| Field | Type | Notes |
|---|---|---|
| `language` | `string` | Required. E.g. `"en"`, `"lt"` |
| `locale` | `string` | E.g. `"en-US"`, `"lt-LT"` |
| `width` | `string` | Form width |
| `widthUnit` | `"px" \| "%"` | |
| `renderMode` | `"page" \| "dialog"` | |
| `theme` | `"light" \| "dark"` | |
| `pageNavigationMode` | `"default" \| "stepper"` | |
| `allowStepWithoutValidation` | `boolean` | |
| `pageNavigationPosition` | `"top" \| "bottom" \| "both" \| "none"` | |
| `stepperPosition` | `"top" \| "bottom" \| "both" \| "none"` | |
| `actionButtonsPosition` | `"top" \| "bottom" \| "both" \| "none"` | |
| `showSubmitButton` | `boolean` | |
| `showValidateButton` | `boolean` | |
| `showValidationIssuesModal` | `boolean` | |
| `elementSpacing` | `string` | Gap between rows |
| `customCss` | `string` | Raw CSS injected |
| `lazyElementRendering` | `boolean` | Lazy-render off-screen elements |

---

## `IDataSource` fields (top-level dataSources array)

`{ name, title, type, params }`. `type` is one of `rest` `local` `route` `websocket`, and `params` is a plain object whose keys depend on that type.

```json
{
  "dataSources": [
    { "name": "ds1", "title": "List", "type": "rest",
      "params": { "url": "/api/items", "method": "GET" } },

    { "name": "ds2", "title": "Save", "type": "rest",
      "params": { "url": "/api/items/{id}", "method": "PUT", "body": { "name": "{el1}" } } },

    { "name": "ds3", "title": "Paged table", "type": "rest",
      "params": { "url": "/api/items/search", "method": "TABLE-POST" } },

    { "name": "ds4", "title": "Static list", "type": "local",
      "params": { "localMode": "json", "dataJson": "[{\"id\":1,\"name\":\"A\"}]" } },

    { "name": "ds5", "title": "From form data", "type": "local",
      "params": { "localMode": "dataPath", "dataPath": "el9.items" } },

    { "name": "ds6", "title": "Route data", "type": "route",
      "params": { "routeDataKey": "record", "routeDataPath": "data" } },

    { "name": "ds7", "title": "Live feed", "type": "websocket",
      "params": { "url": "wss://host/feed", "protocols": "", "message": "{}",
                  "messagePath": "payload", "messageMode": "pushValuesInArray" } }
  ]
}
```

| `type` | `params` keys |
|---|---|
| `rest` | `url` (required), `method` (`GET` `POST` `PUT` `PATCH` `DELETE`, or `TABLE-POST` for a lazy `table`), `body` (alias `payload`) |
| `local` | `localMode` (`json` or `dataPath`), then `dataJson` (a JSON **string**) and `dataFunction`, or `dataPath` |
| `route` | `routeDataKey`, `routeDataPath` |
| `websocket` | `url`, `protocols`, `message`, `messagePath`, `messageMode` (`replaceCurrent` or `pushValuesInArray`) |

URL and body templates use **single** braces: `{el1}`, `{row.id}`, `{__variables.tenantId}`.

---

## `IElementDataSource` (element-level dataSource field)

```json
{
  "dataSource": {
    "name": "loadCities",
    "useFor": "option",
    "optionValue": "id",
    "optionLabel": "name",
    "refreshPaths": ["countryField"],
    "params": [{ "name": "country", "value": "{countryField}" }]
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | References a top-level dataSource name |
| `useFor` | `"option" \| "value"` | Whether datasource feeds options or element value |
| `optionValue` | `string` | Property path for option value |
| `optionLabel` | `string` | Property path for option label |
| `filterOptionsBy` | `string` | JEXL expression using `item.*` to filter options |
| `params` | `IDataSourceParamMapping[]` | `[{ "name": "key", "value": "{field}" }]` |
| `refreshOnChange` | `boolean` | Re-fetch when any dependency changes |
| `refreshPaths` | `string[]` | Re-fetch only when these fields change |

---

## Canonical type string list

```
text | textarea | number | slider | phoneInput | fileUpload | button | numberStepper | signaturePad
select | multiSelect | radio | checkbox | singleCheckbox | toggleSwitch | toggleButton | autocomplete | selectButton | listBox
datepicker | dateRange | timePicker
panel | dynamicPanel | tabs | tabsPro | accordion | dialog | splitter | progressFlow | emptyBlock
dynamicTable | table | listGrid | chart
richText | richTextViewer | customHtml | htmlSnippet | image | video | iframe | avatar | icon | routerOutlet
divider | spacer | breadcrumbs | pageTitle | badge | messageCard | statsCard | toast | progressBar
page
```

Type strings are exact and case-sensitive. Never alter capitalization.
