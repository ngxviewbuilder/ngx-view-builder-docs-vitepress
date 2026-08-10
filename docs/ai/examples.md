---
title: "AI: Verified example structures"
description: A library of complete, verified NGX View Builder JSON examples covering layout, every element family, the full table feature set, dynamic tables and panels, data sources, runtime variables and expressions.
---

# AI: Verified example structures

Every JSON block on this page is checked against the library source: element type strings against the element registry, property names against the builder property datasets, sub-object fields against the TypeScript interfaces. Copy the **shapes** from here; invent nothing that is not shown or listed in [the properties reference](./properties-reference).

Names are deliberately generic (`el1`, `column1`, `ds1`) so the structure is what stands out, not the naming.

## How to read these examples

1. Layout is always `pages` → `rows` → `columns` → `elementRef`. Configuration is always the flat `elements` map. See [Layout model](./layout-model) first.
2. Anything a container holds is attached to the **column** that references it, never inside the element.
3. A property that does not appear on this page or in the properties reference does not exist. An invented property is dropped silently, so the view ships subtly broken with no error.

---

## 1. Skeleton and layout grammar

One page, four bands: full width, even halves, uneven thirds, and a mobile-stacking trio.

```json
{
  "schemaVersion": 1,
  "settings": {
    "language": "en",
    "locale": "en-US",
    "width": "900px",
    "widthUnit": "px",
    "renderMode": "page",
    "elementSpacing": "12px"
  },
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }] },
        { "columns": [{ "elementRef": "el2" }, { "elementRef": "el3" }] },
        { "columns": [{ "elementRef": "el4" }, { "elementRef": "el5" }] },
        {
          "columns": [
            { "elementRef": "el6" },
            { "elementRef": "el7" },
            { "elementRef": "el8" }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Page 1", "type": "page", "hideHeader": true },

    "el1": { "name": "el1", "label": "Full width", "type": "text" },

    "el2": { "name": "el2", "label": "Half", "type": "text" },
    "el3": { "name": "el3", "label": "Half", "type": "text" },

    "el4": { "name": "el4", "label": "Narrow", "type": "text", "width": "160px" },
    "el5": { "name": "el5", "label": "Takes the rest", "type": "text" },

    "el6": { "name": "el6", "label": "Third", "type": "text", "mobileWidth": "100%" },
    "el7": { "name": "el7", "label": "Third", "type": "text", "mobileWidth": "100%" },
    "el8": { "name": "el8", "label": "Third", "type": "text", "mobileWidth": "100%" }
  },
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

What to take from it:

- `el2` / `el3` split 50/50 with **no width property at all**. Columns with no width get `flex: 1 1 0`.
- `el4` is fixed at `160px`, so `el5` absorbs the remainder. Width is on the element, never on the column.
- `mobileWidth: "100%"` is what makes a row stack on phones.

---

## 2. Containers

### 2.1 Panels as titled sections

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "panel1",
              "rows": [
                { "columns": [{ "elementRef": "el1" }, { "elementRef": "el2" }] },
                { "columns": [{ "elementRef": "el3" }] }
              ]
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "panel2",
              "rows": [{ "columns": [{ "elementRef": "el4" }, { "elementRef": "el5" }] }]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Page 1", "type": "page" },
    "panel1": {
      "name": "panel1",
      "label": "Section one",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "titleUnderline": true
    },
    "panel2": {
      "name": "panel2",
      "label": "Section two",
      "type": "panel",
      "showBorder": true,
      "panelBorderWidth": "1px",
      "panelRadius": "8px",
      "panelPadding": "16px",
      "contentGap": "12px"
    },
    "el1": { "name": "el1", "label": "Field 1", "type": "text" },
    "el2": { "name": "el2", "label": "Field 2", "type": "text" },
    "el3": { "name": "el3", "label": "Field 3", "type": "textarea", "rows": 3 },
    "el4": { "name": "el4", "label": "Field 4", "type": "text" },
    "el5": { "name": "el5", "label": "Field 5", "type": "text" }
  }
}
```

### 2.2 Tabs (`tabRows`, keyed by tab value)

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "el1",
              "tabRows": {
                "tab1": [{ "columns": [{ "elementRef": "el2" }, { "elementRef": "el3" }] }],
                "tab2": [{ "columns": [{ "elementRef": "el4" }] }]
              }
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Page 1", "type": "page" },
    "el1": {
      "name": "el1",
      "label": "Details",
      "type": "tabs",
      "tabsPosition": "top",
      "tabsVariant": "underline",
      "fullWidthTabs": false,
      "tabs": [
        { "value": "tab1", "label": "General" },
        { "value": "tab2", "label": "Address" }
      ]
    },
    "el2": { "name": "el2", "label": "First name", "type": "text" },
    "el3": { "name": "el3", "label": "Last name", "type": "text" },
    "el4": { "name": "el4", "label": "Street", "type": "text" }
  }
}
```

`tabsPro` is the same element with the same properties; its list property is `items` instead of `tabs`.

### 2.3 Accordion and splitter

Both key their `tabRows` by the `value` of each entry in their own list property (`items` for accordion, `panels` for splitter).

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "el1",
              "tabRows": {
                "item1": [{ "columns": [{ "elementRef": "el3" }] }],
                "item2": [{ "columns": [{ "elementRef": "el4" }] }]
              }
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "el2",
              "tabRows": {
                "left": [{ "columns": [{ "elementRef": "el5" }] }],
                "right": [{ "columns": [{ "elementRef": "el6" }] }]
              }
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Page 1", "type": "page" },
    "el1": {
      "name": "el1",
      "label": "Sections",
      "type": "accordion",
      "allowMultiple": false,
      "openFirst": true,
      "items": [
        { "value": "item1", "label": "Contact" },
        { "value": "item2", "label": "Billing" }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Workspace",
      "type": "splitter",
      "orientation": "horizontal",
      "allowResize": true,
      "gutterSize": "6px",
      "minPanelSize": "160px",
      "showPanelHeaders": true,
      "panels": [
        { "value": "left", "label": "Filters" },
        { "value": "right", "label": "Results" }
      ]
    },
    "el3": { "name": "el3", "label": "Email", "type": "text" },
    "el4": { "name": "el4", "label": "IBAN", "type": "text" },
    "el5": { "name": "el5", "label": "Search", "type": "text" },
    "el6": { "name": "el6", "label": "Notes", "type": "textarea" }
  }
}
```

### 2.4 `emptyBlock` as a CSS grid

`emptyBlock` is the unstyled layout box. Use it when a `panel` would add unwanted chrome, or when you need real grid/flex control.

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "el1",
              "rows": [
                {
                  "columns": [
                    { "elementRef": "el2" },
                    { "elementRef": "el3" },
                    { "elementRef": "el4" }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Page 1", "type": "page" },
    "el1": {
      "name": "el1",
      "type": "emptyBlock",
      "contentDisplay": "grid",
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))",
      "contentGap": "16px",
      "panelPadding": "16px",
      "panelBackgroundColor": "#f6f8fa",
      "panelRadius": "10px"
    },
    "el2": { "name": "el2", "label": "Open", "type": "statsCard", "valueText": "128", "variant": "info" },
    "el3": { "name": "el3", "label": "Closed", "type": "statsCard", "valueText": "47", "variant": "success" },
    "el4": { "name": "el4", "label": "Overdue", "type": "statsCard", "valueText": "9", "variant": "risk" }
  }
}
```

### 2.5 In-view `dialog` element

The `dialog` **element** is a modal that lives inside a page, opened by an action or `openIf`. It is not the same as `settings.renderMode: "dialog"`, which renders the whole view as a modal.

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }] },
        {
          "columns": [
            {
              "elementRef": "el2",
              "rows": [
                { "columns": [{ "elementRef": "el3" }] },
                { "columns": [{ "elementRef": "el4" }] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Page 1", "type": "page" },
    "el1": {
      "name": "el1",
      "label": "",
      "type": "button",
      "text": "Edit record",
      "variant": "solid",
      "tone": "primary",
      "fitContent": true,
      "events": [
        { "trigger": "click", "type": "dialog", "dialogName": "el2", "dialogOperation": "open" }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Edit record",
      "type": "dialog",
      "showTriggerButton": false,
      "showCloseButton": true,
      "closeOnBackdrop": true,
      "dialogWidth": "560px"
    },
    "el3": { "name": "el3", "label": "Title", "type": "text", "required": true },
    "el4": {
      "name": "el4",
      "label": "",
      "type": "button",
      "text": "Save",
      "variant": "solid",
      "tone": "primary",
      "fitContent": true,
      "events": [
        {
          "trigger": "click",
          "type": "dataSource",
          "dataSourceName": "ds1",
          "validateForm": true,
          "showToastAfter": true,
          "toastTitle": "Saved",
          "toastVariant": "success"
        },
        { "trigger": "click", "type": "dialog", "dialogName": "el2", "dialogOperation": "close" }
      ]
    }
  }
}
```

---

## 3. Input elements

Every property below is real. Notice what each element does **not** have: `phoneInput` has no mask, `singleCheckbox` has no `checkedValue`, `datepicker` formats use uppercase tokens.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Text",
      "type": "text",
      "placeholder": "Type here",
      "minlength": 2,
      "maxlength": 60,
      "showMaxLengthCounter": true,
      "inputMode": "text",
      "spellcheck": false,
      "autocomplete": "off",
      "required": true,
      "requiredMessage": "This field is required"
    },
    "el2": {
      "name": "el2",
      "label": "Masked text",
      "type": "text",
      "maskType": "custom",
      "maskPattern": "AA-0000",
      "placeholder": "AB-1234"
    },
    "el3": {
      "name": "el3",
      "label": "Textarea",
      "type": "textarea",
      "rows": 4,
      "maxlength": 500,
      "showMaxLengthCounter": true
    },
    "el4": {
      "name": "el4",
      "label": "Number",
      "type": "number",
      "min": 0,
      "max": 1000000,
      "step": 0.01,
      "inputMode": "decimal",
      "valueStorageType": "number",
      "visualFormatEnabled": true,
      "visualFormatLocale": "lt-LT",
      "visualFormatUseGrouping": true,
      "visualFormatMinFractionDigits": 2,
      "visualFormatMaxFractionDigits": 2
    },
    "el5": {
      "name": "el5",
      "label": "Slider",
      "type": "slider",
      "min": 0,
      "max": 100,
      "step": 5,
      "showValueLabel": true,
      "defaultValue": 20
    },
    "el6": {
      "name": "el6",
      "label": "Stepper",
      "type": "numberStepper",
      "min": 1,
      "max": 20,
      "step": 1,
      "defaultValue": 1
    },
    "el7": {
      "name": "el7",
      "label": "Phone",
      "type": "phoneInput",
      "defaultCountryCode": "LT",
      "allowedCountryCodes": ["LT", "LV", "EE"],
      "placeholder": "600 00000"
    },
    "el8": {
      "name": "el8",
      "label": "Date",
      "type": "datepicker",
      "placeholder": "Pick a date",
      "pickerMode": "date",
      "format": "YYYY-MM-DD",
      "minValue": "today",
      "validators": [{ "type": "maxDate", "value": "today", "message": "Cannot be in the future" }]
    },
    "el9": {
      "name": "el9",
      "label": "Date and time",
      "type": "datepicker",
      "pickerMode": "datetime",
      "includeSeconds": false,
      "format": "YYYY-MM-DD HH:mm"
    },
    "el10": {
      "name": "el10",
      "label": "Date range",
      "type": "dateRange",
      "format": "YYYY-MM-DD",
      "placeholder": "From - to"
    },
    "el11": { "name": "el11", "label": "Time", "type": "timePicker", "minuteStep": 15 },
    "el12": {
      "name": "el12",
      "label": "Attachments",
      "type": "fileUpload",
      "accept": ".pdf,image/*",
      "multiple": true,
      "maxFiles": 5,
      "maxFileSizeMb": 10,
      "showPreview": true,
      "dropzoneText": "Drop files here",
      "uploadDataSourceName": "ds1",
      "downloadDataSourceName": "ds2",
      "deleteDataSourceName": "ds3",
      "uploadFormFieldName": "file",
      "fileKeyField": "key",
      "fileNameField": "name",
      "fileTypeField": "contentType",
      "fileSizeField": "size"
    },
    "el13": {
      "name": "el13",
      "label": "Signature",
      "type": "signaturePad",
      "canvasHeight": "180px",
      "strokeColor": "#111827",
      "strokeWidth": 2,
      "backgroundColor": "#ffffff",
      "exportFormat": "png",
      "clearLabel": "Clear"
    },
    "el14": {
      "name": "el14",
      "label": "Rich text",
      "type": "richText",
      "toolbarTools": ["bold", "italic", "underline", "bulletList", "link"]
    }
  }
}
```

Value shapes: `text` / `textarea` / `richText` store a string, `number` / `slider` / `numberStepper` a number, `dateRange` an object `{ dateFrom, dateTo }`, `fileUpload` the upload response object (or an array of them), `timePicker` a time string.

---

## 4. Choice elements

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Select",
      "type": "select",
      "showSearch": true,
      "strictOptions": true,
      "defaultValue": "a",
      "options": [
        { "value": "a", "label": "Option A" },
        { "value": "b", "label": "Option B" },
        { "value": "c", "label": "Option C" }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Multi select",
      "type": "multiSelect",
      "showSearch": true,
      "strictOptions": true,
      "options": [
        { "value": "a", "label": "Option A" },
        { "value": "b", "label": "Option B" }
      ]
    },
    "el3": {
      "name": "el3",
      "label": "Radio",
      "type": "radio",
      "showInline": true,
      "defaultValue": "y",
      "options": [
        { "value": "y", "label": "Yes" },
        { "value": "n", "label": "No" }
      ]
    },
    "el4": {
      "name": "el4",
      "label": "Checkbox group",
      "type": "checkbox",
      "showInline": false,
      "options": [
        { "value": "a", "label": "Option A" },
        { "value": "b", "label": "Option B" }
      ]
    },
    "el5": {
      "name": "el5",
      "label": "",
      "type": "singleCheckbox",
      "checkboxLabel": "I accept the terms",
      "defaultValue": false,
      "required": true,
      "requiredMessage": "You must accept the terms"
    },
    "el6": {
      "name": "el6",
      "label": "Toggle",
      "type": "toggleSwitch",
      "trueLabel": "On",
      "falseLabel": "Off",
      "trueValue": true,
      "falseValue": false,
      "defaultValue": false
    },
    "el7": {
      "name": "el7",
      "label": "Segmented",
      "type": "selectButton",
      "orientation": "horizontal",
      "multiple": false,
      "allowEmpty": false,
      "variant": "outline",
      "size": "normal",
      "showSelectedIcon": true,
      "options": [
        { "value": "day", "label": "Day" },
        { "value": "week", "label": "Week" },
        { "value": "month", "label": "Month" }
      ]
    },
    "el8": {
      "name": "el8",
      "label": "List box",
      "type": "listBox",
      "selectionMode": "multiple",
      "maxHeight": "220px",
      "options": [
        { "value": "a", "label": "Option A" },
        { "value": "b", "label": "Option B" },
        { "value": "c", "label": "Option C" }
      ]
    },
    "el9": {
      "name": "el9",
      "label": "Autocomplete",
      "type": "autocomplete",
      "placeholder": "Start typing",
      "minSearchLength": 2,
      "debounceMs": 300,
      "maxSuggestions": 20,
      "forceSelection": true,
      "lazyLoad": true,
      "queryContextKey": "query",
      "dataSource": {
        "name": "ds1",
        "useFor": "option",
        "optionValue": "id",
        "optionLabel": "name"
      }
    }
  }
}
```

Value shapes: `select` / `radio` / `selectButton` / `autocomplete` store a single value; `multiSelect` / `checkbox` store an array; `listBox` stores a single value or an array depending on `selectionMode`; `singleCheckbox` / `toggleSwitch` store a boolean.

---

## 5. Content and feedback elements

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "",
      "type": "pageTitle",
      "title": "Customer records",
      "subtitle": "Everything the support desk needs",
      "level": 2,
      "align": "left",
      "showDivider": true
    },
    "el2": {
      "name": "el2",
      "label": "",
      "type": "messageCard",
      "title": "Heads up",
      "descriptionText": "Changes are applied immediately.",
      "variant": "info",
      "showIcon": true,
      "dismissible": true,
      "initiallyVisible": true
    },
    "el3": {
      "name": "el3",
      "label": "",
      "type": "statsCard",
      "title": "Open tickets",
      "valueText": "128",
      "variant": "info",
      "icon": "inbox",
      "trendDirection": "up",
      "trendText": "+12 this week"
    },
    "el4": {
      "name": "el4",
      "label": "",
      "type": "badge",
      "text": "Beta",
      "variant": "warning",
      "pill": true,
      "size": "small"
    },
    "el5": {
      "name": "el5",
      "label": "",
      "type": "progressBar",
      "min": 0,
      "max": 100,
      "displayType": "bar",
      "variant": "success",
      "showValueLabel": true,
      "valueLabelMode": "percent"
    },
    "el6": { "name": "el6", "label": "", "type": "divider", "orientation": "horizontal", "thickness": "1px", "spacing": "16px" },
    "el7": { "name": "el7", "label": "", "type": "spacer", "axis": "vertical", "size": "24px" },
    "el8": {
      "name": "el8",
      "label": "",
      "type": "image",
      "src": "/assets/cover.png",
      "alt": "Cover",
      "fit": "cover",
      "aspectRatio": "16/9",
      "radius": "8px",
      "showPreview": true
    },
    "el9": {
      "name": "el9",
      "label": "",
      "type": "customHtml",
      "htmlTemplate": "<p class=\"note\">Reference: <b>{el1}</b></p>"
    },
    "el10": {
      "name": "el10",
      "label": "",
      "type": "richTextViewer",
      "htmlSourcePath": "el11"
    },
    "el11": {
      "name": "el11",
      "label": "",
      "type": "chart",
      "chartType": "bar",
      "chartHeight": "280px",
      "showLegend": true,
      "legendLayout": "horizontal",
      "labelKey": "label",
      "valueKey": "value",
      "chartDataPath": "stats.byMonth",
      "dataSource": { "name": "ds1", "useFor": "value" }
    }
  }
}
```

---

## 6. `table`: client-side data grid

This is the shape to reach for when the endpoint returns every row in one response. The table sorts, searches, filters, paginates and exports entirely in the browser.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1180px", "widthUnit": "px" },
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }] },
        { "columns": [{ "elementRef": "el3" }] },
        { "columns": [{ "elementRef": "el2" }] }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Customers", "type": "page", "hideHeader": true },
    "el1": { "name": "el1", "label": "", "type": "pageTitle", "title": "Customers", "level": 2 },
    "el2": {
      "name": "el2",
      "label": "All customers",
      "type": "table",

      "dataSource": {
        "name": "ds1",
        "useFor": "value",
        "refreshOnChange": true,
        "refreshPaths": ["el3"]
      },
      "tableItemsPath": "data.items",

      "lazyLoad": false,
      "pageSize": 25,
      "pageSizeOptions": "10,25,50,100",
      "paginator": true,
      "paginatorStyle": "default",
      "paginatorVariant": "full",
      "paginatorAlign": "end",
      "paginatorMaxButtons": 7,
      "showPageSizeSelector": true,

      "tableStyle": "striped",
      "stickyHeader": true,
      "rowHover": true,
      "responsiveMode": "auto",
      "flatHeaderSurface": false,
      "flatFooterSurface": false,
      "emptyMessage": "No customers found",
      "loadingLabel": "Loading...",

      "showHeaderControls": true,
      "showQuickSearch": true,
      "quickSearchPlaceholder": "Search customers",
      "quickSearchCondition": "%-%",
      "quickSearchCaseMode": "caseInsensitiveLatin",
      "searchDebounceMs": 300,
      "showDetailedSearch": true,
      "detailedSearchCaseMode": "caseInsensitiveLatin",

      "showExport": true,
      "exportFileName": "customers",
      "exportUseColumnPicker": true,

      "showColumnSettings": true,
      "columnSettingsMode": "localStorage",
      "columnSettingsStorageKey": "customersTableColumns",
      "columnSettingsDialogTitle": "Visible columns",

      "orderClause": "column2 ASC",
      "orderDirection": "asc",

      "columnsConfig": [
        {
          "key": "column1",
          "label": "ID",
          "type": "number",
          "sortable": true,
          "width": "90px",
          "align": "right",
          "numberUseGrouping": false,
          "showInTable": true,
          "showInDetails": true
        },
        {
          "key": "column2",
          "label": "Name",
          "type": "text",
          "sortable": true,
          "showInTable": true,
          "filterControlType": "text"
        },
        {
          "key": "column3",
          "label": "Email",
          "type": "text",
          "sortable": true,
          "showInTable": true,
          "mobileLabel": "Mail"
        },
        {
          "key": "column4",
          "label": "Balance",
          "type": "number",
          "sortable": true,
          "align": "right",
          "formatLocale": "lt-LT",
          "numberMinFractionDigits": 2,
          "numberMaxFractionDigits": 2,
          "numberUseGrouping": true,
          "showInTable": true,
          "filterControlType": "number"
        },
        {
          "key": "column5",
          "label": "Created",
          "type": "dateTime",
          "sortable": true,
          "dateFormatPattern": "yyyy-MM-dd HH:mm",
          "dateIncludeSeconds": false,
          "showInTable": true,
          "filterControlType": "date"
        },
        {
          "key": "column6",
          "label": "Country",
          "type": "text",
          "showInTable": true,
          "filterControlType": "select",
          "filterOptionsSourceType": "static",
          "filterOptions": [
            { "value": "LT", "label": "Lithuania" },
            { "value": "LV", "label": "Latvia" }
          ],
          "filterOptionValueKey": "value",
          "filterOptionLabelKey": "label"
        },
        {
          "key": "column7",
          "label": "Internal note",
          "type": "text",
          "showInTable": false,
          "showInDetails": true,
          "detailLabel": "Note (internal)"
        }
      ]
    },
    "el3": { "name": "el3", "label": "Segment", "type": "select", "options": [] }
  },
  "dataSources": [
    {
      "name": "ds1",
      "title": "Customers",
      "type": "rest",
      "params": { "url": "/api/customers", "method": "GET" }
    }
  ],
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

Points that decide whether this works:

- **`columnsConfig[*].key`, never `name`.** A column with only `name` does not render.
- `type` for a column is one of `text` `date` `dateTime` `number` `element`. The renderer still understands the legacy `boolean` `html` `status` `toggleSwitch` `singleCheckbox` so old views keep working, but author new columns with `element` instead.
- `tableItemsPath` is only needed when the rows are not the response root and not under `items` / `data` / `results` / `rows`.
- `refreshPaths` on the element `dataSource` makes the table reload when another field changes.
- `showInTable: false` + `showInDetails: true` keeps a field out of the grid but available in the details panel.

### 6.1 Row, header and selection actions

```json
{
  "el2": {
    "name": "el2",
    "label": "All customers",
    "type": "table",
    "dataSource": { "name": "ds1", "useFor": "value" },
    "columnsConfig": [
      { "key": "column1", "label": "ID", "type": "number", "showInTable": true },
      { "key": "column2", "label": "Name", "type": "text", "showInTable": true }
    ],

    "enableSelection": true,
    "selectionKey": "column1",
    "selectLabel": "Select",
    "selectAllLabel": "Select all",
    "selectionActionsLabel": "With selected",
    "autoSelectCondition": "row.column3 == 'active'",
    "selectionActions": [
      {
        "label": "Archive selected",
        "type": "dataSource",
        "dataSourceName": "ds2",
        "buttonTone": "neutral",
        "confirmEnabled": true,
        "confirmTitle": "Archive",
        "confirmMessage": "Archive every selected record?",
        "reloadCurrentElementAfterSuccess": true
      }
    ],

    "headerActionsPosition": "end",
    "headerActionsDisplayMode": "buttons",
    "headerActions": [
      {
        "label": "New customer",
        "icon": "add",
        "type": "navigate",
        "navigateTo": "/customers/new",
        "buttonVariant": "filled",
        "buttonTone": "primary"
      },
      {
        "label": "Reload",
        "icon": "refresh",
        "type": "reloadElements",
        "reloadElementNames": ["el2"],
        "buttonVariant": "text"
      }
    ],

    "showActionsHeaderLabel": true,
    "actionsLabel": "Actions",
    "rowActionsDisplayMode": "dropdown",
    "rowActionsDropdownButtonStyle": "borderless",
    "rowActionVisibilityPath": "column4",
    "rowActions": [
      {
        "label": "Open",
        "icon": "open_in_new",
        "type": "navigate",
        "navigateTo": "/customers/{row.column1}"
      },
      {
        "label": "Deactivate",
        "icon": "block",
        "type": "dataSource",
        "dataSourceName": "ds3",
        "condition": "row.column3 == 'active'",
        "reloadCurrentElementAfterSuccess": true,
        "showToastAfter": true,
        "toastTitle": "Customer deactivated",
        "toastVariant": "success",
        "toastPosition": "bottom-right",
        "toastAutoHide": true,
        "toastAutoHideMs": 4000
      },
      {
        "label": "Delete",
        "icon": "delete",
        "type": "dataSource",
        "dataSourceName": "ds4",
        "buttonTone": "risk",
        "confirmEnabled": true,
        "confirmTitle": "Delete customer",
        "confirmMessage": "This cannot be undone. Continue?",
        "confirmConfirmLabel": "Delete",
        "confirmCancelLabel": "Cancel",
        "reloadCurrentElementAfterSuccess": true
      }
    ],

    "rowClickActions": [
      { "type": "navigate", "navigateTo": "/customers/{row.column1}" }
    ]
  },
  "dataSources": [
    { "name": "ds1", "title": "Customers", "type": "rest", "params": { "url": "/api/customers", "method": "GET" } },
    { "name": "ds2", "title": "Archive", "type": "rest", "params": { "url": "/api/customers/archive", "method": "POST", "body": { "ids": "{selectedKeys}" } } },
    { "name": "ds3", "title": "Deactivate", "type": "rest", "params": { "url": "/api/customers/{row.column1}", "method": "PUT", "body": { "active": false } } },
    { "name": "ds4", "title": "Delete", "type": "rest", "params": { "url": "/api/customers/{row.column1}", "method": "DELETE" } }
  ]
}
```

Context available to actions:

| Action kind | Sees |
| --- | --- |
| `rowActions[*]`, `rowClickActions[*]` | `{row.*}` for the clicked row |
| `selectionActions[*]` | `{selectedRows}`, `{selectedKeys}`, `{rows}`, `{items}` |
| `headerActions[*]` | the surrounding form context, no row |
| inline edit save | `{row.*}` plus `{changedValues}` (only the columns that changed) |

`rowActions[*].condition` is evaluated per row against `row.*`. `rowActionVisibilityPath` names a row field that hides the whole action column for rows where it is falsy.

### 6.2 Element columns, status badges and templates

A column of `type: "element"` renders a real builder element in every cell. `element` holds that element's own configuration, with the same property names it would have as a page element.

```json
{
  "el2": {
    "name": "el2",
    "label": "Orders",
    "type": "table",
    "dataSource": { "name": "ds1", "useFor": "value" },
    "columnsConfig": [
      {
        "key": "column1",
        "label": "Order",
        "type": "text",
        "showInTable": true,
        "template": "<b>#{row.column1}</b><br><small>{row.column2}</small>"
      },
      {
        "key": "column3",
        "label": "State",
        "type": "status",
        "statusShowIcon": true,
        "showInTable": true,
        "statusRules": [
          { "condition": "value == 'new'", "label": "New", "tone": "info", "icon": "fiber_new", "rounded": true },
          { "condition": "value == 'paid'", "label": "Paid", "tone": "success", "icon": "check_circle", "rounded": true },
          { "condition": "value == 'late'", "label": "Late", "tone": "risk", "icon": "error", "rounded": true }
        ]
      },
      {
        "key": "column4",
        "label": "Assignee",
        "type": "element",
        "elementType": "select",
        "showInTable": true,
        "controlEnabledIf": "row.column3 != 'paid'",
        "element": {
          "placeholder": "Unassigned",
          "strictOptions": true,
          "options": [
            { "value": "u1", "label": "Anna" },
            { "value": "u2", "label": "Ben" }
          ],
          "events": [
            {
              "trigger": "change",
              "type": "dataSource",
              "dataSourceName": "ds2",
              "params": [
                { "name": "id", "value": "{row.column1}" },
                { "name": "assignee", "value": "{value}" }
              ]
            }
          ]
        }
      },
      {
        "key": "column5",
        "label": "Progress",
        "type": "element",
        "elementType": "progressBar",
        "showInTable": true,
        "element": { "min": 0, "max": 100, "showValueLabel": true, "displayType": "bar" }
      },
      {
        "key": "column6",
        "label": "Description",
        "type": "element",
        "elementType": "richTextViewer",
        "showInTable": false,
        "showInDetails": true,
        "element": {}
      },
      {
        "key": "column7",
        "label": "",
        "type": "text",
        "showInTable": true,
        "cellActionsEnabled": true,
        "cellActionsDisplayMode": "iconButtons",
        "cellActions": [
          { "label": "Copy", "icon": "content_copy", "type": "setValue", "setValueTargetPath": "el3", "setValueMode": "template", "setValueValue": "{row.column2}" }
        ]
      }
    ]
  }
}
```

Rules for these:

- **`statusRules[*].condition` reads the cell value as `value`**, not as the column key. `status == 'paid'` never matches; `value == 'paid'` does. `row.otherColumn` also works.
- `statusRules[*].tone` is one of `neutral` `success` `warning` `risk` `primary` `danger` `info`.
- Inside `template` and inside a hosted `element`, the row is reachable as `{row.*}`, a bare sibling key, `{index}` and `{value}`.
- `visibleIf`, `controlEnabledIf` and `controlActiveIf` on a column are evaluated per row.
- Action `params` are always `[{ "name": ..., "value": ... }]`. An array of pairs is dropped silently.

### 6.3 Server-side paging: `lazyLoad` and `TABLE-POST`

With `lazyLoad: true` and the data source method set to the literal string `TABLE-POST`, the table merges paging, sorting and filter state into the request body for you.

```json
{
  "elements": {
    "el2": {
      "name": "el2",
      "label": "Customers",
      "type": "table",

      "lazyLoad": true,
      "dataSource": { "name": "ds1", "useFor": "value" },
      "tableItemsPath": "data.items",
      "tableTotalPath": "data.total",

      "params": [
        { "paramName": "tenantId", "paramValue": "{__variables.tenantId}" },
        { "paramName": "segment", "paramValue": "{el3}" }
      ],

      "pageSize": 50,
      "pageSizeOptions": "25,50,100",
      "orderClause": "column2 ASC",
      "showQuickSearch": true,
      "quickSearchParamName": "quickSearch",
      "quickSearchCondition": "%-%",
      "showDetailedSearch": true,
      "showExport": true,
      "exportAllPageSize": 10000,

      "virtualScroll": true,
      "virtualScrollRowHeight": 44,
      "virtualScrollViewportHeight": "600px",
      "virtualScrollBuffer": 10,

      "columnsConfig": [
        { "key": "column1", "label": "ID", "type": "number", "sortable": true, "showInTable": true },
        { "key": "column2", "label": "Name", "type": "text", "sortable": true, "showInTable": true, "filterControlType": "text" },
        { "key": "column3", "label": "Active", "type": "element", "elementType": "badge", "showInTable": true, "filterControlType": "boolean", "filterToggleTrueValue": "true", "filterToggleFalseValue": "false", "element": {} }
      ]
    }
  },
  "dataSources": [
    {
      "name": "ds1",
      "title": "Customers (paged)",
      "type": "rest",
      "params": { "url": "/api/customers/search", "method": "TABLE-POST" }
    }
  ]
}
```

The body your endpoint receives:

```json
{
  "pagingParams": {
    "cnt": null,
    "orderClause": "column2 ASC",
    "pageSize": 50,
    "skipRows": 100,
    "totalCountUsed": false
  },
  "params": [["tenantId", "42"], ["segment", "vip"]],
  "extendedParams": [
    { "paramName": "quickSearch", "paramValue": { "condition": "%-%", "value": "acme", "upperLower": "caseInsensitiveLatin" } },
    { "paramName": "column2", "paramValue": { "condition": "%-", "value": "Ac" } },
    { "paramName": "column3", "paramValue": { "condition": "=", "value": true } }
  ]
}
```

- On the wire `params` becomes `[name, value]` tuples, but **you author it as `[{ "paramName": ..., "paramValue": ... }]`** on the element. Up to five rows.
- `condition` vocabulary: `%-%` contains, `!%-%` does not contain, `%-` starts with, `-%` ends with, `=`, `!=`, `>`, `>=`, `<`, `<=`.
- Response: rows come from `tableItemsPath`, or `items` / `data` / `results` / `rows`. Total comes from `tableTotalPath`, or `total` / `totalCount` / `totalRecords` / `count` / `cnt` / `paging.*`. Without a recognizable total the pager looks stuck.
- Export "all" re-issues the same request with `pagingParams.pageSize` set to `exportAllPageSize`, then builds the file in the browser.

### 6.4 Inline edit, expandable rows, details panel, saved filters

```json
{
  "elements": {
    "el2": {
      "name": "el2",
      "label": "Orders",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },

      "enableInlineEdit": true,
      "inlineEditStartMode": "doubleClick",
      "inlineEditSaveDataSourceName": "ds2",
      "inlineEditCancelOnReload": true,

      "expandableRows": true,
      "expandedDisplayMode": "inline",
      "showExpandChevron": true,
      "alwaysShowExpandChevron": false,
      "expandLabel": "Show items",
      "collapseLabel": "Hide items",
      "expandedEmptyMessage": "This order has no lines",
      "expandedDataSourceName": "ds3",
      "expandedDataSourceItemsPath": "data.lines",
      "expandedColumnsConfig": [
        { "key": "column10", "label": "Product", "type": "text", "showInTable": true },
        { "key": "column11", "label": "Qty", "type": "number", "align": "right", "showInTable": true },
        { "key": "column12", "label": "Price", "type": "number", "align": "right", "numberMinFractionDigits": 2, "showInTable": true }
      ],
      "expandedRowActions": [
        { "label": "Remove line", "icon": "delete", "type": "dataSource", "dataSourceName": "ds4", "buttonTone": "risk" }
      ],

      "rowClickOpensDetails": true,
      "detailsPanelTitle": "Order details",

      "enableSavedFilters": true,
      "savedFiltersMode": "dataSource",
      "savedFiltersDataSourceName": "ds5",
      "savedFiltersItemsPath": "data.items",
      "saveFilterDataSourceName": "ds6",
      "deleteFilterDataSourceName": "ds7",
      "savedFilterIdKey": "id",
      "savedFilterNameKey": "name",
      "savedFilterCodeKey": "code",
      "savedFilterDescriptionKey": "description",
      "savedFilterPayloadKey": "payload",

      "columnsConfig": [
        { "key": "column1", "label": "Order", "type": "text", "showInTable": true },
        {
          "key": "column2",
          "label": "Status",
          "type": "text",
          "showInTable": true,
          "editable": true,
          "editorType": "select",
          "editorOptions": [
            { "value": "new", "label": "New" },
            { "value": "paid", "label": "Paid" }
          ],
          "editorOptionValueKey": "value",
          "editorOptionLabelKey": "label"
        },
        {
          "key": "column3",
          "label": "Note",
          "type": "text",
          "showInTable": true,
          "editable": true,
          "editorType": "textarea",
          "editorPlaceholder": "Internal note"
        }
      ]
    }
  }
}
```

The inline-edit save data source receives `{row.*}` (the whole edited row) **and** `{changedValues}`, a flat object holding only the columns that actually changed, which is what a PATCH endpoint wants.

### 6.5 The table's live state: `__table.*`

Every `table` continuously publishes its own state into the form data, so **any other element can read it without knowing how the table is fed**. This is the mechanism behind selection-driven toolbars, counters, master/detail screens and conditional buttons.

Two roots exist. `__table.<tableName>.*` is that specific table. Bare `__table.*` is the last table the user touched, useful when there is only one.

| Path | Holds |
| --- | --- |
| `__table.<name>.rows` | rows currently visible (the active page, after filtering) |
| `__table.<name>.allRows` | every loaded row |
| `__table.<name>.rowCount` | number of visible rows |
| `__table.<name>.totalRecords` | total according to the server (lazy) or the loaded set |
| `__table.<name>.page` | current page, 1-based |
| `__table.<name>.size` | current page size |
| `__table.<name>.sortField` | sorted column key, or `""` |
| `__table.<name>.sortDirection` | `asc` or `desc` |
| `__table.<name>.quickSearch` | current quick-search term |
| `__table.<name>.detailedFilters` | active per-column filters (lazy) |
| `__table.<name>.request` | the exact request payload last sent (lazy) |
| `__table.<name>.selectedRows` | array of checkbox-selected row objects |
| `__table.<name>.selectedKeys` | array of their `selectionKey` values |
| `__table.<name>.selectedItems` | the same selection rendered through `selectionItemTemplate` |
| `__table.<name>.selectedCount` | how many are selected |
| `__table.<name>.selectedRow` | the single row the user is working on: first selected, else expanded/active, else last clicked |
| `__table.<name>.selectedRowKey` | its key, or `null` |
| `__table.<name>.selectedRowIndex` | its index, or `-1` |
| `__table.<name>.activeRow` / `.activeRowKey` | the expanded / detail row |

These are read in braces like any other path: `{__table.el2.selectedCount}`.

### 6.6 Selection-driven toolbar

A counter, a bulk button that only enables with a selection, and a panel that mirrors the row being worked on. Nothing here is wired by hand; everything reads `__table.*`.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1180px", "widthUnit": "px" },
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }, { "elementRef": "el2" }, { "elementRef": "el3" }] },
        { "columns": [{ "elementRef": "el4" }] },
        {
          "columns": [
            {
              "elementRef": "el5",
              "rows": [
                { "columns": [{ "elementRef": "el6" }, { "elementRef": "el7" }] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Orders", "type": "page", "hideHeader": true },

    "el1": {
      "name": "el1",
      "label": "",
      "type": "badge",
      "text": "Selected: {__table.el4.selectedCount}",
      "variant": "info",
      "pill": true,
      "visibleIf": "toNumber({__table.el4.selectedCount}) > 0"
    },
    "el2": {
      "name": "el2",
      "label": "",
      "type": "button",
      "text": "Approve selected",
      "variant": "solid",
      "tone": "primary",
      "fitContent": true,
      "disableIf": "toNumber({__table.el4.selectedCount}) == 0",
      "events": [
        {
          "trigger": "click",
          "type": "dataSource",
          "dataSourceName": "ds2",
          "confirmEnabled": true,
          "confirmTitle": "Approve",
          "confirmMessage": "Approve every selected order?",
          "reloadElementNames": ["el4"],
          "showToastAfter": true,
          "toastTitle": "Approved",
          "toastVariant": "success"
        }
      ]
    },
    "el3": {
      "name": "el3",
      "label": "",
      "type": "button",
      "text": "Clear search",
      "variant": "text",
      "tone": "neutral",
      "fitContent": true,
      "visibleIf": "notEmpty({__table.el4.quickSearch})",
      "events": [{ "trigger": "click", "type": "reloadElements", "reloadElementNames": ["el4"] }]
    },

    "el4": {
      "name": "el4",
      "label": "Orders",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "enableSelection": true,
      "selectionKey": "column1",
      "selectionItemTemplate": "#{row.column1} ({row.column2})",
      "showQuickSearch": true,
      "pageSize": 25,
      "columnsConfig": [
        { "key": "column1", "label": "Order", "type": "text", "showInTable": true, "sortable": true },
        { "key": "column2", "label": "Customer", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Total", "type": "number", "align": "right", "numberMinFractionDigits": 2, "showInTable": true, "sortable": true }
      ]
    },

    "el5": {
      "name": "el5",
      "label": "Current order",
      "type": "panel",
      "titleUnderline": true,
      "panelPadding": "0px",
      "showBorder": false,
      "visibleIf": "notEmpty({__table.el4.selectedRowKey})"
    },
    "el6": {
      "name": "el6",
      "label": "Order",
      "type": "text",
      "readOnly": true,
      "expression": "{__table.el4.selectedRow}.column1",
      "logicExecutionMode": "onChange"
    },
    "el7": {
      "name": "el7",
      "label": "Customer",
      "type": "text",
      "readOnly": true,
      "expression": "{__table.el4.selectedRow}.column2",
      "logicExecutionMode": "onChange"
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Orders", "type": "rest", "params": { "url": "/api/orders", "method": "GET" } },
    {
      "name": "ds2",
      "title": "Approve selected",
      "type": "rest",
      "params": {
        "url": "/api/orders/approve",
        "method": "POST",
        "body": { "ids": "{__table.el4.selectedKeys}" }
      }
    }
  ],
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

`selectionKey` names the row field used as the identity of a selection; it defaults to `id`. `selectionItemTemplate` shapes each entry of `selectedItems`, which is what you send when the endpoint wants labels rather than raw rows.

### 6.7 Master and detail: one table drives another

The detail table reloads whenever the master's selected row changes, because its data source declares that dependency in `refreshPaths`.

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }] },
        { "columns": [{ "elementRef": "el2" }] }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Orders", "type": "page" },
    "el1": {
      "name": "el1",
      "label": "Orders",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "rowHover": true,
      "columnsConfig": [
        { "key": "column1", "label": "Order", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Customer", "type": "text", "showInTable": true }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Lines of the selected order",
      "type": "table",
      "emptyMessage": "Pick an order above",
      "visibleIf": "notEmpty({__table.el1.selectedRowKey})",
      "dataSource": {
        "name": "ds2",
        "useFor": "value",
        "params": [{ "name": "orderId", "value": "{__table.el1.selectedRowKey}" }],
        "refreshOnChange": true,
        "refreshPaths": ["__table.el1.selectedRowKey"]
      },
      "columnsConfig": [
        { "key": "column10", "label": "Product", "type": "text", "showInTable": true },
        { "key": "column11", "label": "Qty", "type": "number", "align": "right", "showInTable": true }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Orders", "type": "rest", "params": { "url": "/api/orders", "method": "GET" } },
    { "name": "ds2", "title": "Order lines", "type": "rest", "params": { "url": "/api/orders/{orderId}/lines", "method": "GET" } }
  ]
}
```

Clicking a row is enough: `selectedRow` falls back to the last clicked row when there is no selection column.

### 6.8 A filter toolbar above the table

Real fields drive the request. `params` decides what is sent, and each field change re-issues it.

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "el1",
              "rows": [
                {
                  "columns": [
                    { "elementRef": "el2" },
                    { "elementRef": "el3" },
                    { "elementRef": "el4" }
                  ]
                }
              ]
            }
          ]
        },
        { "columns": [{ "elementRef": "el5" }] }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Reports", "type": "page" },
    "el1": {
      "name": "el1",
      "label": "Filters",
      "type": "panel",
      "showBorder": true,
      "panelRadius": "8px",
      "panelPadding": "12px",
      "contentGap": "12px"
    },
    "el2": {
      "name": "el2",
      "label": "Status",
      "type": "select",
      "strictOptions": true,
      "defaultValue": "",
      "options": [
        { "value": "", "label": "All" },
        { "value": "open", "label": "Open" },
        { "value": "closed", "label": "Closed" }
      ]
    },
    "el3": { "name": "el3", "label": "Period", "type": "dateRange", "format": "YYYY-MM-DD" },
    "el4": { "name": "el4", "label": "Owner", "type": "text" },
    "el5": {
      "name": "el5",
      "label": "Results",
      "type": "table",
      "lazyLoad": true,
      "dataSource": { "name": "ds1", "useFor": "value" },
      "tableItemsPath": "data.items",
      "tableTotalPath": "data.total",
      "params": [
        { "paramName": "status", "paramValue": "{el2}" },
        { "paramName": "from", "paramValue": "{el3.dateFrom}" },
        { "paramName": "to", "paramValue": "{el3.dateTo}" },
        { "paramName": "owner", "paramValue": "{el4}" }
      ],
      "showQuickSearch": true,
      "pageSize": 50,
      "columnsConfig": [
        { "key": "column1", "label": "Ref", "type": "text", "showInTable": true, "sortable": true },
        { "key": "column2", "label": "Opened", "type": "date", "showInTable": true, "sortable": true },
        { "key": "column3", "label": "Owner", "type": "text", "showInTable": true }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Report search", "type": "rest", "params": { "url": "/api/reports/search", "method": "TABLE-POST" } }
  ]
}
```

A `dateRange` value is an object, so its parts are `{el3.dateFrom}` and `{el3.dateTo}`.

### 6.9 Column filter options loaded from a data source

Per-column filters do not have to be hardcoded. A column can pull its own option list.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Tickets",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "showDetailedSearch": true,
      "columnsConfig": [
        { "key": "column1", "label": "Ref", "type": "text", "showInTable": true },
        {
          "key": "column2",
          "label": "Assignee",
          "type": "text",
          "showInTable": true,
          "filterControlType": "multiSelect",
          "filterOptionsSourceType": "datasource",
          "filterOptionsDataSourceName": "ds2",
          "filterOptionsDataSourceItemsPath": "data.items",
          "filterOptionValueKey": "id",
          "filterOptionLabelKey": "name",
          "filterMultiValueDelimiter": ","
        },
        {
          "key": "column3",
          "label": "Archived",
          "type": "text",
          "showInTable": true,
          "filterControlType": "toggle",
          "filterToggleTrueValue": "true",
          "filterToggleFalseValue": "false"
        },
        {
          "key": "column4",
          "label": "Priority",
          "type": "text",
          "showInTable": true,
          "filterControlType": "select",
          "filterOptionsSourceType": "static",
          "filterOptionValueKey": "value",
          "filterOptionLabelKey": "label",
          "filterOptions": [
            { "value": "low", "label": "Low" },
            { "value": "high", "label": "High" }
          ]
        }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Tickets", "type": "rest", "params": { "url": "/api/tickets", "method": "GET" } },
    { "name": "ds2", "title": "Users", "type": "rest", "params": { "url": "/api/users", "method": "GET" } }
  ]
}
```

### 6.10 Header dropdown

Beside the header buttons a table can host one dropdown, either with static options or fed by a data source, whose selection runs actions.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Tickets",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "showHeaderControls": true,
      "headerActionsPosition": "end",
      "headerMenuEnabled": true,
      "headerMenuPlaceholder": "Switch queue",
      "headerMenuDataSourceName": "ds2",
      "headerMenuItemsPath": "data.items",
      "headerMenuLabelKey": "name",
      "headerMenuValueKey": "id",
      "headerMenuActions": [
        { "trigger": "change", "type": "reloadElements", "reloadElementNames": ["el1"] }
      ],
      "columnsConfig": [
        { "key": "column1", "label": "Ref", "type": "text", "showInTable": true }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Tickets", "type": "rest", "params": { "url": "/api/tickets", "method": "GET" } },
    { "name": "ds2", "title": "Queues", "type": "rest", "params": { "url": "/api/queues", "method": "GET" } }
  ]
}
```

For static options instead of a source, drop `headerMenuDataSourceName` / `headerMenuItemsPath` / `headerMenuLabelKey` / `headerMenuValueKey` and set `headerMenuOptions: [{ "value": "a", "label": "A" }]`.

### 6.11 Templates and mobile behaviour

`headerTemplate` fills the centre of the header, `rowTemplate` replaces the whole row, `expandedTemplate` renders the expanded area. Row-level templates see `{row.*}`; all of them can read `{__table.<name>.*}`.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Tickets",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },

      "headerTemplate": "<span class=\"muted\">Showing {__table.el1.rowCount} of {__table.el1.totalRecords}</span>",
      "headerCenterElementsPosition": "center",

      "responsiveMode": "stack",
      "stickyHeader": true,
      "tableStyle": "grid",

      "expandableRows": true,
      "expandedDisplayMode": "inline",
      "expandedTemplate": "<div class=\"detail\"><b>{row.column2}</b><p>{row.column3}</p></div>",

      "columnsConfig": [
        {
          "key": "column1",
          "label": "Ticket",
          "type": "text",
          "showInTable": true,
          "mobileLabel": "Ref",
          "template": "<b>#{row.column1}</b>"
        },
        { "key": "column2", "label": "Subject", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Body", "type": "text", "showInTable": false, "showInDetails": true }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Tickets", "type": "rest", "params": { "url": "/api/tickets", "method": "GET" } }
  ]
}
```

`responsiveMode: "stack"` turns each row into a stacked card on narrow screens, where `mobileLabel` becomes the visible field label.

### 6.12 Column settings stored on the server

`columnSettingsMode: "localStorage"` needs only `columnSettingsStorageKey`. Per-user layouts kept server-side use the data-source mode instead.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Tickets",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "showColumnSettings": true,
      "columnSettingsDialogTitle": "Columns",
      "columnSettingsMode": "dataSource",
      "columnSettingsDataSourceName": "ds2",
      "columnSettingsDataSourcePath": "data.layout",
      "saveColumnSettingsDataSourceName": "ds3",
      "resetColumnSettingsDataSourceName": "ds4",
      "columnsConfig": [
        { "key": "column1", "label": "Ref", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Subject", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Owner", "type": "text", "showInTable": false }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Tickets", "type": "rest", "params": { "url": "/api/tickets", "method": "GET" } },
    { "name": "ds2", "title": "Load layout", "type": "rest", "params": { "url": "/api/me/table-layout", "method": "GET" } },
    { "name": "ds3", "title": "Save layout", "type": "rest", "params": { "url": "/api/me/table-layout", "method": "PUT" } },
    { "name": "ds4", "title": "Reset layout", "type": "rest", "params": { "url": "/api/me/table-layout", "method": "DELETE" } }
  ]
}
```

### 6.13 Full CRUD loop: table, dialog editor, reload

The pattern most admin screens need, end to end.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1180px", "widthUnit": "px" },
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }] },
        { "columns": [{ "elementRef": "el2" }] },
        {
          "columns": [
            {
              "elementRef": "el3",
              "rows": [
                { "columns": [{ "elementRef": "el4" }, { "elementRef": "el5" }] },
                { "columns": [{ "elementRef": "el6" }] },
                {
                  "columns": [
                    {
                      "elementRef": "el7",
                      "rows": [
                        { "columns": [{ "elementRef": "el8" }, { "elementRef": "el9" }] }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Customers", "type": "page", "hideHeader": true },

    "el1": {
      "name": "el1",
      "label": "",
      "type": "button",
      "text": "New customer",
      "icon": "add",
      "variant": "solid",
      "tone": "primary",
      "fitContent": true,
      "events": [
        { "trigger": "click", "type": "setValue", "setValueTargetPath": "el4", "setValueMode": "template", "setValueValue": "" },
        { "trigger": "click", "type": "setValue", "setValueTargetPath": "el5", "setValueMode": "template", "setValueValue": "" },
        { "trigger": "click", "type": "setValue", "setValueTargetPath": "el6", "setValueMode": "template", "setValueValue": "" },
        { "trigger": "click", "type": "dialog", "dialogName": "el3", "dialogOperation": "open" }
      ]
    },

    "el2": {
      "name": "el2",
      "label": "Customers",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "selectionKey": "column1",
      "pageSize": 25,
      "showQuickSearch": true,
      "rowActionsDisplayMode": "iconButtons",
      "columnsConfig": [
        { "key": "column1", "label": "ID", "type": "number", "showInTable": true, "width": "80px" },
        { "key": "column2", "label": "Name", "type": "text", "showInTable": true, "sortable": true },
        { "key": "column3", "label": "Email", "type": "text", "showInTable": true }
      ],
      "rowActions": [
        {
          "label": "Edit",
          "icon": "edit",
          "type": "setValue",
          "setValueTargetPath": "el4",
          "setValueMode": "template",
          "setValueValue": "{row.column1}"
        },
        {
          "label": "Edit",
          "icon": "edit",
          "hideText": true,
          "type": "setValue",
          "setValueTargetPath": "el5",
          "setValueMode": "template",
          "setValueValue": "{row.column2}"
        },
        {
          "label": "Edit",
          "icon": "edit",
          "hideText": true,
          "type": "setValue",
          "setValueTargetPath": "el6",
          "setValueMode": "template",
          "setValueValue": "{row.column3}"
        },
        {
          "label": "Edit",
          "icon": "edit",
          "hideText": true,
          "type": "dialog",
          "dialogName": "el3",
          "dialogOperation": "open"
        },
        {
          "label": "Delete",
          "icon": "delete",
          "type": "dataSource",
          "dataSourceName": "ds3",
          "buttonTone": "risk",
          "confirmEnabled": true,
          "confirmTitle": "Delete customer",
          "confirmMessage": "This cannot be undone.",
          "reloadCurrentElementAfterSuccess": true
        }
      ]
    },

    "el3": {
      "name": "el3",
      "label": "Customer",
      "type": "dialog",
      "showTriggerButton": false,
      "showCloseButton": true,
      "dialogWidth": "520px"
    },
    "el4": { "name": "el4", "label": "ID", "type": "text", "readOnly": true },
    "el5": { "name": "el5", "label": "Name", "type": "text", "required": true },
    "el6": { "name": "el6", "label": "Email", "type": "text", "inputMode": "email", "required": true },

    "el7": {
      "name": "el7",
      "label": "",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "contentJustify": "flex-end",
      "contentGap": "8px"
    },
    "el8": {
      "name": "el8",
      "label": "",
      "type": "button",
      "text": "Cancel",
      "variant": "outline",
      "tone": "neutral",
      "fitContent": true,
      "events": [{ "trigger": "click", "type": "dialog", "dialogName": "el3", "dialogOperation": "close" }]
    },
    "el9": {
      "name": "el9",
      "label": "",
      "type": "button",
      "text": "Save",
      "variant": "solid",
      "tone": "primary",
      "fitContent": true,
      "events": [
        {
          "trigger": "click",
          "type": "dataSource",
          "dataSourceName": "ds2",
          "validateForm": true,
          "reloadElementNames": ["el2"],
          "showToastAfter": true,
          "toastTitle": "Saved",
          "toastVariant": "success"
        },
        { "trigger": "click", "type": "dialog", "dialogName": "el3", "dialogOperation": "close" }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Customers", "type": "rest", "params": { "url": "/api/customers", "method": "GET" } },
    {
      "name": "ds2",
      "title": "Save customer",
      "type": "rest",
      "params": {
        "url": "/api/customers/{el4}",
        "method": "PUT",
        "body": { "name": "{el5}", "email": "{el6}" }
      }
    },
    { "name": "ds3", "title": "Delete customer", "type": "rest", "params": { "url": "/api/customers/{row.column1}", "method": "DELETE" } }
  ],
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

One action carries one `type`, so filling three fields and opening the dialog is four actions on the same row-action button. They run in order, and only the first needs a visible label; give the rest `hideText: true` so the toolbar stays clean.

### 6.14 Dashboard: one table feeding KPI cards and a chart

The table is the single source of data; the cards and the chart read its published state. No second request is issued: a `local` source in `dataPath` mode simply points at `__table.el3.allRows`.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1180px", "widthUnit": "px" },
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            { "elementRef": "el1" },
            { "elementRef": "el2" }
          ]
        },
        { "columns": [{ "elementRef": "el5" }] },
        { "columns": [{ "elementRef": "el4" }] },
        { "columns": [{ "elementRef": "el3" }] }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Sales", "type": "page", "hideHeader": true },

    "el1": {
      "name": "el1",
      "label": "",
      "type": "statsCard",
      "title": "Orders",
      "valueText": "{__table.el3.totalRecords}",
      "variant": "info",
      "icon": "receipt_long"
    },
    "el2": {
      "name": "el2",
      "label": "",
      "type": "statsCard",
      "title": "Revenue",
      "valueText": "{el5}",
      "variant": "success",
      "icon": "payments"
    },

    "el4": {
      "name": "el4",
      "label": "Revenue by month",
      "type": "chart",
      "chartType": "bar",
      "chartHeight": "260px",
      "showLegend": false,
      "labelKey": "column2",
      "valueKey": "column3",
      "dataSource": {
        "name": "ds2",
        "useFor": "value",
        "refreshOnChange": true,
        "refreshPaths": ["__table.el3.allRows"]
      }
    },

    "el3": {
      "name": "el3",
      "label": "Orders",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "pageSize": 25,
      "showQuickSearch": true,
      "columnsConfig": [
        { "key": "column1", "label": "Order", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Month", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Total", "type": "number", "align": "right", "numberMinFractionDigits": 2, "showInTable": true }
      ]
    },

    "el5": {
      "name": "el5",
      "label": "Revenue",
      "type": "number",
      "hidden": true,
      "readOnly": true,
      "expression": "sumArray({__table.el3.allRows}, column3)",
      "logicExecutionMode": "onChange"
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Orders", "type": "rest", "params": { "url": "/api/orders", "method": "GET" } },
    {
      "name": "ds2",
      "title": "Orders already loaded by the table",
      "type": "local",
      "params": { "localMode": "dataPath", "dataPath": "__table.el3.allRows" }
    }
  ],
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

`statsCard.title`, `valueText` and `trendText`, and `badge.text`, all interpolate `{...}` tokens, so a card can display live table state directly. A hidden `number` element is the usual place to park an aggregate that several other elements want to reuse.

**`hidden: true` still needs a place in the layout tree.** `hidden` only suppresses the rendering; an element that is absent from `pages` is never instantiated at all, so its `expression` never runs and everything reading it stays empty. Give the helper element its own row and hide it there.

### 6.15 Aggregates under a table

`allRows` is the whole loaded set, `rows` is only what the current page shows after filtering. Pick deliberately: a "total" that changes when the user pages is almost always a bug.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Invoices",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "columnsConfig": [
        { "key": "column1", "label": "Invoice", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Status", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Amount", "type": "number", "align": "right", "showInTable": true }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Rows loaded",
      "type": "number",
      "readOnly": true,
      "expression": "len({__table.el1.allRows})",
      "logicExecutionMode": "onChange"
    },
    "el3": {
      "name": "el3",
      "label": "Total amount",
      "type": "number",
      "readOnly": true,
      "expression": "sumArray({__table.el1.allRows}, column3)",
      "logicExecutionMode": "onChange"
    },
    "el4": {
      "name": "el4",
      "label": "Average amount",
      "type": "number",
      "readOnly": true,
      "expression": "avgArray({__table.el1.allRows}, column3)",
      "logicExecutionMode": "onChange"
    },
    "el5": {
      "name": "el5",
      "label": "Unpaid",
      "type": "number",
      "readOnly": true,
      "expression": "countInArray({__table.el1.allRows}, column2 == \"unpaid\")",
      "logicExecutionMode": "onChange"
    },
    "el6": {
      "name": "el6",
      "label": "Unpaid total",
      "type": "number",
      "readOnly": true,
      "expression": "sumArray(filterArray({__table.el1.allRows}, column2 == \"unpaid\"), column3)",
      "logicExecutionMode": "onChange"
    },
    "el7": {
      "name": "el7",
      "label": "Largest invoice",
      "type": "text",
      "readOnly": true,
      "expression": "getFirst(filterArray({__table.el1.allRows}, column3 > 1000), column1)",
      "logicExecutionMode": "onChange"
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Invoices", "type": "rest", "params": { "url": "/api/invoices", "method": "GET" } }
  ]
}
```

Inside a collection function the row fields are written **bare and unquoted** (`column2 == "unpaid"`); everything outside the collection keeps its braces.

### 6.16 Details side panel instead of an inline expand

The same expand machinery renders in a drawer when `expandedDisplayMode` is `sidePanel`. `rowClickOpensDetails` means the whole row opens it, so no chevron column is needed.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Applications",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },

      "expandableRows": true,
      "expandedDisplayMode": "sidePanel",
      "detailsPanelTitle": "Application details",
      "rowClickOpensDetails": true,
      "showExpandChevron": false,
      "rowHover": true,

      "rowExpandActions": [
        {
          "type": "dataSource",
          "dataSourceName": "ds2",
          "params": [{ "name": "id", "value": "{row.column1}" }]
        }
      ],

      "columnsConfig": [
        { "key": "column1", "label": "Ref", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Applicant", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Submitted", "type": "date", "showInTable": true },
        { "key": "column4", "label": "Motivation", "type": "text", "showInTable": false, "showInDetails": true, "detailLabel": "Why they applied" },
        { "key": "column5", "label": "Reviewer notes", "type": "text", "showInTable": false, "showInDetails": true }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Applications", "type": "rest", "params": { "url": "/api/applications", "method": "GET" } },
    { "name": "ds2", "title": "Mark as viewed", "type": "rest", "params": { "url": "/api/applications/{id}/viewed", "method": "POST" } }
  ]
}
```

`rowExpandActions` fire when a row is expanded, which is where "mark as read" or "load the heavy part now" belongs. Columns with `showInTable: false` and `showInDetails: true` are exactly what fills the panel.

### 6.17 Row action that downloads a file

`responseMode: "download"` turns the response into a file instead of data.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Invoices",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "rowActionsDisplayMode": "iconButtons",
      "columnsConfig": [
        { "key": "column1", "label": "Invoice", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Issued", "type": "date", "showInTable": true }
      ],
      "rowActions": [
        {
          "label": "Download PDF",
          "icon": "download",
          "type": "dataSource",
          "dataSourceName": "ds2",
          "responseMode": "download",
          "responseFileName": "invoice-{row.column1}.pdf"
        },
        {
          "label": "Email a copy",
          "icon": "mail",
          "type": "dataSource",
          "dataSourceName": "ds3",
          "condition": "notEmpty({row.column3})",
          "showToastAfter": true,
          "toastTitle": "Sent",
          "toastVariant": "success"
        }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Invoices", "type": "rest", "params": { "url": "/api/invoices", "method": "GET" } },
    { "name": "ds2", "title": "Invoice PDF", "type": "rest", "params": { "url": "/api/invoices/{row.column1}/pdf", "method": "GET" } },
    { "name": "ds3", "title": "Email invoice", "type": "rest", "params": { "url": "/api/invoices/{row.column1}/email", "method": "POST" } }
  ]
}
```

CSV/Excel/PDF export of the grid itself is different: it is `showExport` and happens entirely in the browser, with no endpoint to implement.

### 6.18 Export configuration

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Customers",
      "type": "table",
      "lazyLoad": true,
      "dataSource": { "name": "ds1", "useFor": "value" },
      "tableItemsPath": "data.items",
      "tableTotalPath": "data.total",
      "pageSize": 50,

      "showExport": true,
      "exportFileName": "customers-2026",
      "exportUseColumnPicker": true,
      "exportAllPageSize": 20000,

      "columnsConfig": [
        { "key": "column1", "label": "ID", "type": "number", "showInTable": true },
        { "key": "column2", "label": "Name", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Created", "type": "dateTime", "dateFormatPattern": "yyyy-MM-dd", "showInTable": true },
        { "key": "column4", "label": "Internal score", "type": "number", "showInTable": false, "showInDetails": true }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Customers", "type": "rest", "params": { "url": "/api/customers/search", "method": "TABLE-POST" } }
  ]
}
```

With `exportUseColumnPicker` the user chooses which columns land in the file. "Export all" re-issues the same table request with `pagingParams.pageSize` set to `exportAllPageSize`, so that number is a real memory decision, not decoration.

### 6.19 A live table over a websocket

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Live events",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "pageSize": 50,
      "stickyHeader": true,
      "virtualScroll": true,
      "virtualScrollRowHeight": 40,
      "virtualScrollViewportHeight": "520px",
      "orderClause": "column1 DESC",
      "columnsConfig": [
        { "key": "column1", "label": "Time", "type": "dateTime", "dateIncludeSeconds": true, "showInTable": true, "sortable": true },
        {
          "key": "column2",
          "label": "Level",
          "type": "status",
          "showInTable": true,
          "statusShowIcon": true,
          "statusRules": [
            { "condition": "value == 'error'", "label": "Error", "tone": "risk", "icon": "error", "rounded": true },
            { "condition": "value == 'warn'", "label": "Warning", "tone": "warning", "icon": "warning", "rounded": true },
            { "condition": "value == 'info'", "label": "Info", "tone": "info", "rounded": true }
          ]
        },
        { "key": "column3", "label": "Message", "type": "text", "showInTable": true }
      ]
    }
  },
  "dataSources": [
    {
      "name": "ds1",
      "title": "Event stream",
      "type": "websocket",
      "params": {
        "url": "wss://example.test/events",
        "protocols": "",
        "message": "{\"subscribe\":\"events\"}",
        "messagePath": "payload",
        "messageMode": "pushValuesInArray"
      }
    }
  ]
}
```

`messageMode: "pushValuesInArray"` appends each message to the accumulated array, which is what a log-style table wants; `replaceCurrent` swaps the whole set instead. The buffer is capped at 500 entries, so a view left open overnight cannot grow without end. `virtualScroll` keeps a long list cheap to render.

### 6.20 Tables nested in containers

A table is a leaf element, so it sits in a column like any other. Inside `tabs` that column lives in `tabRows`; inside a `dynamicPanel` each entry renders its own copy of the table.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1100px", "widthUnit": "px" },
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "el1",
              "tabRows": {
                "active": [{ "columns": [{ "elementRef": "el2" }] }],
                "archived": [{ "columns": [{ "elementRef": "el3" }] }]
              }
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "el4",
              "rows": [
                { "columns": [{ "elementRef": "el5" }] },
                { "columns": [{ "elementRef": "el6" }] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Projects", "type": "page", "hideHeader": true },

    "el1": {
      "name": "el1",
      "label": "Projects",
      "type": "tabs",
      "tabsPosition": "top",
      "tabs": [
        { "value": "active", "label": "Active" },
        { "value": "archived", "label": "Archived" }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Active projects",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "columnsConfig": [
        { "key": "column1", "label": "Project", "type": "text", "showInTable": true },
        { "key": "column2", "label": "Owner", "type": "text", "showInTable": true }
      ]
    },
    "el3": {
      "name": "el3",
      "label": "Archived projects",
      "type": "table",
      "dataSource": { "name": "ds2", "useFor": "value" },
      "columnsConfig": [
        { "key": "column1", "label": "Project", "type": "text", "showInTable": true },
        { "key": "column3", "label": "Archived", "type": "date", "showInTable": true }
      ]
    },

    "el4": {
      "name": "el4",
      "label": "Teams",
      "type": "dynamicPanel",
      "addRowButtonText": "Add team",
      "panelPadding": "16px",
      "panelBorderWidth": "1px",
      "panelRadius": "8px"
    },
    "el5": { "name": "el5", "label": "Team name", "type": "text", "required": true },
    "el6": {
      "name": "el6",
      "label": "Members",
      "type": "dynamicTable",
      "addRowButtonText": "Add member",
      "columns": [
        { "name": "column1", "label": "Name", "type": "text" },
        { "name": "column2", "label": "Role", "type": "select", "options": [
          { "value": "dev", "label": "Developer" },
          { "value": "qa", "label": "QA" }
        ] }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Active", "type": "rest", "params": { "url": "/api/projects?state=active", "method": "GET" } },
    { "name": "ds2", "title": "Archived", "type": "rest", "params": { "url": "/api/projects?state=archived", "method": "GET" } }
  ],
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

Note which repeating element goes where: a **grid of editable cells** inside a repeating block is `dynamicTable`; a **read-only view of server data** would be `table`. A `table` inside a `dynamicPanel` publishes its state under one shared `__table.<name>` key, so prefer `dynamicTable` when each entry needs its own independent state.

### 6.21 A localized table

Column labels, action labels and messages all go through `localization.texts` when a `translate()` call or a translated key is used. The simplest route is to author the labels in the default language and let the host supply the rest.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1100px", "widthUnit": "px" },
  "pages": [{ "name": "page1", "rows": [{ "columns": [{ "elementRef": "el1" }] }] }],
  "elements": {
    "page1": { "name": "page1", "label": "Orders", "type": "page", "hideHeader": true },
    "el1": {
      "name": "el1",
      "label": "Orders",
      "type": "table",
      "dataSource": { "name": "ds1", "useFor": "value" },
      "emptyMessage": "No records found",
      "loadingLabel": "Kraunama...",
      "quickSearchPlaceholder": "Search",
      "actionsLabel": "Veiksmai",
      "showQuickSearch": true,
      "columnsConfig": [
        { "key": "column1", "label": "Numeris", "type": "text", "showInTable": true },
        {
          "key": "column2",
          "label": "Suma",
          "type": "number",
          "align": "right",
          "formatLocale": "lt-LT",
          "numberMinFractionDigits": 2,
          "numberUseGrouping": true,
          "showInTable": true
        },
        {
          "key": "column3",
          "label": "Status",
          "type": "element",
          "elementType": "customHtml",
          "showInTable": true,
          "element": { "htmlTemplate": "<span>{translate({row.column3})}</span>" }
        }
      ]
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Orders", "type": "rest", "params": { "url": "/api/orders", "method": "GET" } }
  ],
  "localization": {
    "defaultLanguage": "en",
    "languages": ["en", "de"],
    "texts": {
      "de": { "new": "Neu", "paid": "Bezahlt", "late": "Überfällig" },
      "en": { "new": "New", "paid": "Paid", "late": "Late" }
    }
  }
}
```

`translate(value)` looks the raw value up in `localization.texts[<current language>]`, which is how a raw server code such as `paid` becomes a readable label without a lookup table in the view.

### 6.22 Choosing the right table

| The screen needs | Use |
| --- | --- |
| Users type into every row, add and delete rows | `dynamicTable` |
| A read-only or lightly interactive grid over server data | `table` |
| Server owns paging, sorting and filtering | `table` with `lazyLoad: true` and `TABLE-POST` |
| Cards instead of rows | `listGrid` |
| A repeating block of fields rather than a grid of cells | `dynamicPanel` |

`table` never uses `column.rows`; its cells are `columnsConfig`, keyed by `key`. `dynamicTable` never uses `columnsConfig`; its cells are `columns`, keyed by `name`.

### 6.23 `table` property map

Grouped so nothing has to be guessed.

| Group | Properties |
| --- | --- |
| Data | `dataSource` `tableItemsPath` `tableTotalPath` `lazyLoad` `params` `orderClause` `orderDirection` |
| Columns | `columnsConfig` `showColumnSettings` `columnSettingsMode` `columnSettingsStorageKey` `columnSettingsDialogTitle` `columnSettingsDataSourceName` `columnSettingsDataSourcePath` `saveColumnSettingsDataSourceName` `resetColumnSettingsDataSourceName` |
| Paging | `pageSize` `pageSizeOptions` `paginator` `paginatorStyle` `paginatorVariant` `paginatorAlign` `paginatorMaxButtons` `showPageSizeSelector` `prevLabel` `nextLabel` |
| Search & filters | `showQuickSearch` `quickSearchPlaceholder` `quickSearchParamName` `quickSearchCondition` `quickSearchCaseMode` `searchDebounceMs` `showDetailedSearch` `detailedSearchCaseMode` `enableSavedFilters` `savedFiltersMode` `savedFiltersDataSourceName` `savedFiltersItemsPath` `saveFilterDataSourceName` `deleteFilterDataSourceName` `savedFilterIdKey` `savedFilterNameKey` `savedFilterCodeKey` `savedFilterDescriptionKey` `savedFilterPayloadKey` |
| Actions | `rowActions` `rowActionsDisplayMode` `rowActionsDropdownButtonStyle` `rowActionVisibilityPath` `rowClickActions` `rowExpandActions` `headerActions` `headerActionsPosition` `headerActionsDisplayMode` `headerMenuEnabled` `headerMenuActions` `headerMenuOptions` `headerMenuPlaceholder` `headerMenuDataSourceName` `headerMenuDataSourceItemsPath` `headerMenuItemsPath` `headerMenuLabelKey` `headerMenuValueKey` `actionsLabel` `showActionsHeaderLabel` |
| Selection | `enableSelection` `selectionKey` `selectionActions` `selectionActionsLabel` `selectionItemTemplate` `selectLabel` `selectAllLabel` `selectRowLabel` `autoSelectCondition` |
| Inline edit | `enableInlineEdit` `inlineEditStartMode` `inlineEditSaveDataSourceName` `inlineEditCancelOnReload` |
| Expand & details | `expandableRows` `expandedDisplayMode` `expandedColumnsConfig` `expandedDataSourceName` `expandedDataSourceItemsPath` `expandedItemsPath` `expandedTemplate` `expandedEmptyMessage` `expandedRowActions` `showExpandChevron` `alwaysShowExpandChevron` `expandLabel` `collapseLabel` `rowClickOpensDetails` `detailsPanelTitle` |
| Export | `showExport` `exportFileName` `exportUseColumnPicker` `exportAllPageSize` |
| Appearance | `tableStyle` `stickyHeader` `rowHover` `responsiveMode` `flatHeaderSurface` `flatFooterSurface` `showHeaderControls` `headerCenterElementsPosition` `headerTemplate` `rowTemplate` `rowTemplateName` `emptyMessage` `loadingLabel` `width` `tabletWidth` `mobileWidth` `hidden` `visibleIf` |
| Virtual scroll | `virtualScroll` `virtualScrollRowHeight` `virtualScrollViewportHeight` `virtualScrollBuffer` |

Column (`columnsConfig[*]`) properties:

| Group | Properties |
| --- | --- |
| Identity | `key` (required) `label` `showHeaderLabel` `mobileLabel` `type` `showInTable` `showInDetails` `detailLabel` `sortable` `width` `align` `visibleIf` |
| Formatting | `formatLocale` `dateFormatPattern` `dateIncludeSeconds` `numberMinFractionDigits` `numberMaxFractionDigits` `numberUseGrouping` |
| Element cells | `elementType` `element` `controlActiveIf` `controlEnabledIf` |
| Status cells | `statusRules` `statusShowIcon` |
| Templates | `template` `templateName` `templateFieldMap` |
| Filters | `filterControlType` `filterOptionsSourceType` `filterOptions` `filterOptionsJson` `filterOptionsPath` `filterOptionsDataSourceName` `filterOptionsDataSourceItemsPath` `filterOptionLabelKey` `filterOptionValueKey` `filterMultiValueDelimiter` `filterToggleTrueValue` `filterToggleFalseValue` |
| Inline edit | `editable` `editorType` `editorPlaceholder` `editorOptions` `editorOptionLabelKey` `editorOptionValueKey` |
| Cell actions | `cellActionsEnabled` `cellActions` `cellActionsDisplayMode` `cellActionsPlaceholder` |

Enumerations, exact values:

| Property | Values |
| --- | --- |
| `columnsConfig[*].type` | `text` `date` `dateTime` `number` `element` (legacy, still rendered: `boolean` `html` `status` `toggleSwitch` `singleCheckbox`) |
| `columnsConfig[*].align` | `left` `center` `right` |
| `columnsConfig[*].filterControlType` | `auto` `text` `number` `date` `dateTime` `boolean` `select` `multiSelect` `toggle` |
| `columnsConfig[*].editorType` | `auto` `text` `number` `date` `textarea` `checkbox` `toggle` `select` |
| `columnsConfig[*].filterOptionsSourceType` | `static` `datasource` |
| `statusRules[*].tone` | `neutral` `success` `warning` `risk` `primary` `danger` `info` |
| `tableStyle` | `default` `grid` `striped` |
| `responsiveMode` | `auto` `stack` |
| `rowActionsDisplayMode` | `dropdown` `iconButtons` `buttons` |
| `rowActionsDropdownButtonStyle` | `borderless` `default` |
| `headerActionsDisplayMode` | `buttons` `dropdown` |
| `headerActionsPosition` | `start` `center` `end` |
| `headerCenterElementsPosition` | `left` `center` `right` |
| `paginatorStyle` | `default` `compact` `segmented` |
| `paginatorVariant` | `full` `pager` `numbers` `simple` |
| `paginatorAlign` | `start` `center` `end` |
| `quickSearchCondition` | `%-%` `!%-%` `%-` `-%` `=` `!=` |
| `quickSearchCaseMode`, `detailedSearchCaseMode` | `caseInsensitiveLatin` `caseSensitive` `uppercase` `lowercase` |
| `columnSettingsMode` | `none` `localStorage` `dataSource` `host` |
| `savedFiltersMode` | `localStorage` `dataSource` `host` |
| `expandedDisplayMode` | `sidePanel` `inline` |
| `inlineEditStartMode` | `action` `doubleClick` |
| `orderDirection` | `asc` `desc` |

---

## 7. `dynamicTable`: editable repeating rows

`dynamicTable` is the editable grid: users add and delete rows and type into cells. Its cells are declared in its own `columns` array, where **each entry is a full element definition**.

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        { "columns": [{ "elementRef": "el1" }] },
        { "columns": [{ "elementRef": "el2" }] }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Invoice", "type": "page" },
    "el1": {
      "name": "el1",
      "label": "Invoice lines",
      "type": "dynamicTable",
      "addRowButtonText": "Add line",
      "emptyMessage": "No lines yet",
      "maxRows": 50,
      "disallowAddRows": false,
      "disallowDeleteRows": false,
      "confirmRowDeletion": true,
      "confirmDeleteTitle": "Remove line",
      "confirmDeleteMessage": "Remove this invoice line?",
      "confirmDeleteConfirmLabel": "Remove",
      "confirmDeleteCancelLabel": "Keep",
      "hideRowIf": "{row.column5} == true",
      "columns": [
        {
          "name": "column1",
          "label": "Product",
          "type": "select",
          "strictOptions": true,
          "options": [
            { "value": "p1", "label": "Widget" },
            { "value": "p2", "label": "Gadget" }
          ]
        },
        {
          "name": "column2",
          "label": "Qty",
          "type": "number",
          "min": 1,
          "step": 1,
          "defaultValue": 1,
          "valueStorageType": "number"
        },
        {
          "name": "column3",
          "label": "Unit price",
          "type": "number",
          "step": 0.01,
          "valueStorageType": "number",
          "visualFormatEnabled": true,
          "visualFormatMinFractionDigits": 2,
          "visualFormatMaxFractionDigits": 2
        },
        {
          "name": "column4",
          "label": "Line total",
          "type": "number",
          "readOnly": true,
          "valueStorageType": "number",
          "expression": "toNumber({row.column2}) * toNumber({row.column3})",
          "logicExecutionMode": "onChange",
          "useTotals": true,
          "totalUseGrouping": true,
          "totalFractionDigits": 2,
          "totalLocale": "lt-LT"
        },
        {
          "name": "column5",
          "label": "Cancelled",
          "type": "singleCheckbox",
          "checkboxLabel": "Cancelled",
          "defaultValue": false
        }
      ]
    },
    "el2": {
      "name": "el2",
      "label": "Invoice total",
      "type": "number",
      "readOnly": true,
      "expression": "toNumber({el1.column4-total})",
      "logicExecutionMode": "onChange"
    }
  }
}
```

The rules that make this work:

- **Inside a row, other cells of the same row are `{row.columnX}`.** A bare `{column3}` reads a top-level form field with that name, not the cell.
- `useTotals: true` publishes a footer sum. That sum is readable elsewhere as `{el1.column4-total}`: the table name, a dot, the column name, `-total`. `totalToData: true` publishes the sum without drawing the footer row.
- `hideRowIf` is evaluated per row, also against `{row.*}`.
- Column entries are element definitions, so any leaf element type and its own properties are valid there (`select` with `options`, `datepicker` with `format`, `text` with `maskType`, and so on).

Value shape: an array of objects, one per row, keyed by column `name`.

---

## 8. `dynamicPanel`: repeating groups, with nesting

`dynamicPanel` repeats a whole layout block. Its children live in the layout tree exactly like a `panel`'s, in `column.rows`. Each rendered entry gets its own copy.

```json
{
  "schemaVersion": 1,
  "settings": { "language": "en", "locale": "en-US", "width": "1000px", "widthUnit": "px" },
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "el1",
              "rows": [
                { "columns": [{ "elementRef": "el2" }, { "elementRef": "el3" }] },
                { "columns": [{ "elementRef": "el4" }] },
                { "columns": [{ "elementRef": "el5" }] }
              ]
            }
          ]
        },
        { "columns": [{ "elementRef": "el6" }] },
        { "columns": [{ "elementRef": "el7" }] }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Projects", "type": "page" },

    "el1": {
      "name": "el1",
      "label": "Projects",
      "type": "dynamicPanel",
      "addRowButtonText": "Add project",
      "removeRowButtonText": "Remove project",
      "emptyMessage": "No projects yet",
      "maxRows": 10,
      "confirmRowDeletion": true,
      "confirmDeleteTitle": "Remove project",
      "confirmDeleteMessage": "Remove this project and all of its tasks?",
      "panelPadding": "16px",
      "panelRadius": "8px",
      "panelBorderWidth": "1px",
      "contentGap": "12px",
      "resetChildrenOnHide": true
    },

    "el2": { "name": "el2", "label": "Project name", "type": "text", "required": true },
    "el3": {
      "name": "el3",
      "label": "Status",
      "type": "select",
      "strictOptions": true,
      "options": [
        { "value": "open", "label": "Open" },
        { "value": "done", "label": "Done" }
      ]
    },

    "el4": {
      "name": "el4",
      "label": "Tasks",
      "type": "dynamicTable",
      "addRowButtonText": "Add task",
      "columns": [
        { "name": "column1", "label": "Task", "type": "text" },
        {
          "name": "column2",
          "label": "Hours",
          "type": "number",
          "step": 0.5,
          "valueStorageType": "number",
          "useTotals": true,
          "totalFractionDigits": 1
        },
        {
          "name": "column3",
          "label": "Rate",
          "type": "number",
          "step": 0.01,
          "valueStorageType": "number"
        },
        {
          "name": "column4",
          "label": "Cost",
          "type": "number",
          "readOnly": true,
          "valueStorageType": "number",
          "expression": "toNumber({row.column2}) * toNumber({row.column3})",
          "logicExecutionMode": "onChange",
          "useTotals": true,
          "totalFractionDigits": 2
        }
      ]
    },

    "el5": {
      "name": "el5",
      "label": "Project cost",
      "type": "number",
      "readOnly": true,
      "expression": "toNumber({panel.el4.column4-total})",
      "logicExecutionMode": "onChange"
    },

    "el6": {
      "name": "el6",
      "label": "Total cost of all projects",
      "type": "number",
      "readOnly": true,
      "expression": "sumArray({el1}, el5)",
      "logicExecutionMode": "onChange"
    },

    "el7": {
      "name": "el7",
      "label": "Open projects",
      "type": "number",
      "readOnly": true,
      "expression": "countInArray({el1}, el3 == \"open\")",
      "logicExecutionMode": "onChange"
    }
  },
  "localization": { "defaultLanguage": "en", "languages": ["en"] }
}
```

Context rules for nested structures, in one place:

| Where you are | How you reach a value |
| --- | --- |
| Top level of the form | `{el1}` |
| Inside a `dynamicTable` row | `{row.column2}` for a sibling cell |
| Inside a `dynamicPanel` entry | `{panel.el3}` for a sibling field of the same entry |
| A `dynamicTable` column total | `{el1.column4-total}` at top level |
| A total inside a panel entry | `{panel.el4.column4-total}` |
| A specific panel entry from outside | `{el1[0].el4.column4-total}` |
| Across all entries of a panel | `sumArray({el1}, el5)`, `countInArray({el1}, el3 == "open")` |
| A runtime variable | `{__variables.tenantId}` |
| A table's own live state | `{__table.el2.selectedRows}`, `{__table.el2.totalRecords}` (see 6.5) |
| Host-supplied external context | `{__external.userName}` |

Inside collection functions the entry fields are written **bare and unquoted** (`el3 == "open"`), while anything outside the collection still uses braces (`role == {__variables.requiredRole}`).

Prefer one aggregate over repeated accumulation. `setValue({var1}, sumArray({el1}, el5[].column3))` is safe on every recalculation; `sumValue` adds again on every run and belongs in an action, never in an `expression`.

---

## 9. Data sources and runtime variables

### 9.1 Every source type

`dataSources[*]` is `{ name, title, type, params }`, where `params` differs per `type`. `type` is `rest`, `local`, `route` or `websocket`.

```json
{
  "dataSources": [
    {
      "name": "ds1",
      "title": "Customers (GET)",
      "type": "rest",
      "params": { "url": "/api/customers", "method": "GET" }
    },
    {
      "name": "ds2",
      "title": "Save customer (POST)",
      "type": "rest",
      "params": {
        "url": "/api/customers/{id}",
        "method": "POST",
        "body": { "name": "{el1}", "segment": "{el2}", "tenantId": "{__variables.tenantId}" }
      }
    },
    {
      "name": "ds3",
      "title": "Server-side table",
      "type": "rest",
      "params": { "url": "/api/customers/search", "method": "TABLE-POST" }
    },
    {
      "name": "ds4",
      "title": "Static options",
      "type": "local",
      "params": {
        "localMode": "json",
        "dataJson": "[{\"id\":\"LT\",\"name\":\"Lithuania\"},{\"id\":\"LV\",\"name\":\"Latvia\"}]"
      }
    },
    {
      "name": "ds5",
      "title": "Options already in the form data",
      "type": "local",
      "params": { "localMode": "dataPath", "dataPath": "el9.items" }
    },
    {
      "name": "ds6",
      "title": "Resolved route data",
      "type": "route",
      "params": { "routeDataKey": "customer", "routeDataPath": "data" }
    },
    {
      "name": "ds7",
      "title": "Live feed",
      "type": "websocket",
      "params": {
        "url": "wss://example.test/feed",
        "protocols": "",
        "message": "{\"subscribe\":\"orders\"}",
        "messagePath": "payload",
        "messageMode": "pushValuesInArray"
      }
    }
  ]
}
```

REST URL and body templates use **single** braces: `{el1}`, `{row.id}`, `{__variables.tenantId}`. Method is one of `GET` `POST` `PUT` `PATCH` `DELETE`, plus the special `TABLE-POST` for lazy tables.

### 9.2 Element-level `dataSource` and cascading selects

The element-level `dataSource` object is `IElementDataSource`: `name`, `useFor`, `optionValue`, `optionLabel`, `filterOptionsBy`, `params`, `refreshOnChange`, `refreshPaths`. Nothing else.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "Country",
      "type": "select",
      "showSearch": true,
      "strictOptions": true,
      "dataSource": {
        "name": "ds1",
        "useFor": "option",
        "optionValue": "id",
        "optionLabel": "name"
      }
    },
    "el2": {
      "name": "el2",
      "label": "City",
      "type": "select",
      "strictOptions": true,
      "disableIf": "isEmpty({el1})",
      "resetIf": "isEmpty({el1})",
      "logicExecutionMode": "onChange",
      "dataSource": {
        "name": "ds2",
        "useFor": "option",
        "optionValue": "id",
        "optionLabel": "name",
        "params": [{ "name": "country", "value": "{el1}" }],
        "refreshOnChange": true,
        "refreshPaths": ["el1"]
      }
    },
    "el3": {
      "name": "el3",
      "label": "Warehouse",
      "type": "select",
      "strictOptions": true,
      "dataSource": {
        "name": "ds3",
        "useFor": "option",
        "optionValue": "id",
        "optionLabel": "title",
        "filterOptionsBy": "item.cityId == {el2} && item.active == true",
        "refreshPaths": ["el2"]
      }
    },
    "el4": {
      "name": "el4",
      "label": "Loaded name",
      "type": "text",
      "expression": "{__variables.recordData}.name",
      "logicExecutionMode": "onChange"
    }
  },
  "dataSources": [
    { "name": "ds1", "title": "Countries", "type": "rest", "params": { "url": "/api/countries", "method": "GET" } },
    { "name": "ds2", "title": "Cities", "type": "rest", "params": { "url": "/api/countries/{country}/cities", "method": "GET" } },
    { "name": "ds3", "title": "Warehouses", "type": "rest", "params": { "url": "/api/warehouses", "method": "GET" } },
    { "name": "ds4", "title": "Record", "type": "rest", "params": { "url": "/api/records/{__variables.recordId}", "method": "GET" } }
  ]
}
```

- `useFor: "option"` feeds the option list; `useFor: "value"` feeds the element's value.
- `params[*].value` resolves form fields, `{row.*}` and `{__variables.*}`; the resolved values also fill `{placeholder}` tokens in the source URL.
- `filterOptionsBy` filters the fetched list client-side. The candidate option is `item.*`; form fields stay in braces.

### 9.3 Runtime variables

```json
{
  "settings": {
    "language": "en",
    "variables": [
      { "name": "recordId", "title": "Record id", "sourceType": "route", "source": "id" },
      { "name": "tenantId", "title": "Tenant", "sourceType": "external", "source": "tenantId", "fallbackValue": "" },
      { "name": "apiBase", "title": "API base", "sourceType": "constant", "constantValue": "/api/v2" },
      {
        "name": "isEdit",
        "title": "Edit mode",
        "sourceType": "expression",
        "expression": "notEmpty({__variables.recordId})",
        "refreshPaths": []
      },
      {
        "name": "settingsData",
        "title": "Settings",
        "sourceType": "dataSource",
        "source": "ds1",
        "fallbackValue": {},
        "includeInDataJson": false
      },
      {
        "name": "draftName",
        "title": "Draft name",
        "sourceType": "manual",
        "targetPath": "el1",
        "includeInDataJson": true
      }
    ]
  }
}
```

`sourceType` is exactly one of `route` `external` `constant` `expression` `dataSource` `manual`. Read a variable anywhere as `{__variables.name}`, never as `{name}`. A `dataSource` variable needs an explicit `source`.

---

## 10. Expression cookbook

Every logic field is a **direct property of the element**. There is no `logic` wrapper. All of them take JEXL.

```json
{
  "elements": {
    "el1": { "name": "el1", "label": "Price", "type": "number", "valueStorageType": "number" },
    "el2": { "name": "el2", "label": "Quantity", "type": "number", "valueStorageType": "number" },

    "el3": {
      "name": "el3",
      "label": "Total",
      "type": "number",
      "readOnly": true,
      "expression": "toNumber({el1}) * toNumber({el2})",
      "logicExecutionMode": "onChange",
      "dependsOn": ["el1", "el2"]
    },

    "el4": {
      "name": "el4",
      "label": "Customer type",
      "type": "radio",
      "showInline": true,
      "defaultValue": "person",
      "options": [
        { "value": "person", "label": "Person" },
        { "value": "company", "label": "Company" }
      ]
    },
    "el5": {
      "name": "el5",
      "label": "Company code",
      "type": "text",
      "visibleIf": "{el4} == 'company'",
      "requireIf": "{el4} == 'company'",
      "resetIf": "{el4} != 'company'",
      "logicExecutionMode": "onChange"
    },

    "el6": {
      "name": "el6",
      "label": "Discount %",
      "type": "number",
      "disableIf": "toNumber({el3}) < 100",
      "readonlyIf": "{__variables.isEdit} != true",
      "logicExecutionMode": "onChange",
      "validators": [
        { "type": "min", "value": 0, "message": "Cannot be negative" },
        { "type": "max", "value": 50, "message": "50% is the maximum", "applyIf": "{el4} == 'person'" },
        {
          "type": "custom",
          "condition": "toNumber({el6}) > 0 && isEmpty({el7})",
          "message": "Give a reason for the discount"
        }
      ]
    },
    "el7": { "name": "el7", "label": "Discount reason", "type": "textarea", "rows": 2 },

    "el8": {
      "name": "el8",
      "label": "Starts",
      "type": "datepicker",
      "format": "YYYY-MM-DD"
    },
    "el9": {
      "name": "el9",
      "label": "Ends",
      "type": "datepicker",
      "format": "YYYY-MM-DD",
      "minValue": "{el8}",
      "validators": [
        {
          "type": "custom",
          "condition": "notEmpty({el8}) && notEmpty({el9}) && dateDiffDays({el8}, {el9}) < 1",
          "message": "End date must be after the start date"
        }
      ]
    },

    "el10": {
      "name": "el10",
      "label": "Summary",
      "type": "text",
      "readOnly": true,
      "expression": "getLabel({el4}) + ': ' + toNumber({el3}) + ' EUR'",
      "logicExecutionMode": "onChange"
    },

    "el11": {
      "name": "el11",
      "label": "Tags",
      "type": "multiSelect",
      "options": [
        { "value": "a", "label": "A" },
        { "value": "b", "label": "B" }
      ]
    },
    "el12": {
      "name": "el12",
      "label": "Has tag A",
      "type": "singleCheckbox",
      "checkboxLabel": "Tagged A",
      "readOnly": true,
      "expression": "contains({el11}, 'a')",
      "logicExecutionMode": "onChange"
    }
  }
}
```

Operators JEXL supports: `&& || ! == != > >= < <= + - * / // % ^ in`, the ternary `a ? b : c`, and the Elvis `a ?: b`. It does **not** support `??`, `?.`, arrow functions or any other JavaScript-only syntax.

Built-in functions: `isEmpty` `notEmpty` `toNumber` `inRange` `len` `contains` `containsAny` `containsAll` `inArray` `collectValuesFrom` `sumInArray` `avgInArray` `minInArray` `maxInArray` `countInArray` `firstInArray` `lastInArray` `joinInArray` `filterArray` `mapArray` `findInArray` `existsInArray` `sumArray` `avgArray` `getFirst` `getLast` `flattenArray` `today` `now` `date` `day` `month` `year` `weekDay` `weekDayIndex` `isWeekend` `addDays` `dateDiffDays` `startOfWeek` `endOfWeek` `getVal` `getValue` `getLabel` `getElementProperty` `getProp` `translate` `currentLanguage` `setValue` `sumValue` `pushValue` `setVar` `sumVar` `pushVar` `setElementProperty` `runDataSource` `dbg`.

Validator objects accept exactly `type`, `value`, `message`, `condition`, `applyIf`. `condition` is the **failing** check: the error shows while it is `true`.

---

## 11. Actions and events

`events` is an array of `IElementActionConfig`. Same shape for `button.events`, `table.rowActions`, `table.headerActions`, `table.selectionActions`, cell actions and dialog footer actions.

```json
{
  "elements": {
    "el1": {
      "name": "el1",
      "label": "",
      "type": "button",
      "text": "Save",
      "variant": "solid",
      "tone": "primary",
      "icon": "save",
      "iconPosition": "left",
      "size": "normal",
      "fitContent": true,
      "events": [
        {
          "trigger": "click",
          "type": "dataSource",
          "dataSourceName": "ds1",
          "validateForm": true,
          "confirmEnabled": true,
          "confirmTitle": "Save changes",
          "confirmMessage": "Write these changes to the server?",
          "confirmConfirmLabel": "Save",
          "confirmCancelLabel": "Cancel",
          "params": [
            { "name": "id", "value": "{__variables.recordId}" },
            { "name": "name", "value": "{el3}" }
          ],
          "responseMode": "setValue",
          "responseDataPath": "data.id",
          "responseTargetPath": "el4",
          "reloadOnReturnElementNames": ["el5"],
          "showToastAfter": true,
          "toastTitle": "Saved",
          "toastMessage": "The record was stored",
          "toastVariant": "success",
          "toastPosition": "bottom-right",
          "toastAutoHide": true,
          "toastAutoHideMs": 3000
        }
      ],
      "menuActions": [
        { "label": "Save and close", "type": "submit", "validateForm": true },
        { "label": "Discard", "type": "navigate", "navigateTo": "/records" }
      ]
    },

    "el2": {
      "name": "el2",
      "label": "",
      "type": "button",
      "text": "Download report",
      "variant": "outline",
      "tone": "neutral",
      "fitContent": true,
      "events": [
        {
          "trigger": "click",
          "type": "dataSource",
          "dataSourceName": "ds2",
          "responseMode": "download",
          "responseFileName": "report.pdf"
        }
      ]
    },

    "el3": { "name": "el3", "label": "Name", "type": "text" },
    "el4": { "name": "el4", "label": "Saved id", "type": "text", "readOnly": true },
    "el5": { "name": "el5", "label": "History", "type": "table", "columnsConfig": [] },

    "el6": {
      "name": "el6",
      "label": "Segment",
      "type": "select",
      "options": [
        { "value": "a", "label": "A" },
        { "value": "b", "label": "B" }
      ],
      "events": [
        {
          "trigger": "change",
          "type": "setOptions",
          "setOptionsTargetElement": "el7",
          "setOptionsMode": "contextPath",
          "setOptionsValue": "lookup.subSegments"
        },
        {
          "trigger": "change",
          "type": "reloadElements",
          "reloadElementNames": ["el5"],
          "condition": "notEmpty({el6})"
        }
      ]
    },
    "el7": { "name": "el7", "label": "Sub-segment", "type": "select", "options": [] }
  }
}
```

Action fields by `type`:

| `type` | Required / typical fields |
| --- | --- |
| `navigate` | `navigateTo`, `openInNewTab`, `beforeNavigateDataSourceName` |
| `dataSource` | `dataSourceName`, `params`, `responseMode` (`none` `download` `setValue`), `responseDataPath`, `responseTargetElement`, `responseTargetPath`, `responseFileName`, `reloadCurrentElementAfterSuccess`, `reloadOnReturnElementNames`, `reloadDataSourceNames` |
| `setValue` | `setValueTargetPath`, `setValueMode` (`contextPath` `template` `json` `expression`), `setValueValue` |
| `setOptions` | `setOptionsTargetElement`, `setOptionsMode`, `setOptionsValue` |
| `reloadElements` | `reloadElementNames` |
| `toast` | `toastTitle`, `toastMessage`, `toastVariant`, `toastPosition`, `toastAutoHide`, `toastAutoHideMs`, `toastShowIcon`, `toastIcon` |
| `dialog` | `dialogName`, `dialogOperation` (`open` `close` `toggle`) |
| `sendMessage` | `dataSourceName` (a `websocket` source), `messagePayload` |
| `validate` | none; validates the whole form |
| `submit` | none; validates, then fires `onComplete` with `{ isValid, data, issues }` |

Common to all: `trigger` (`click` `submit` `input` `change` `blur` `focus` `beforeLoad` `onLoad` `afterLoad` `always`), `label`, `icon`, `hideText`, `condition`, `validateForm`, `debounceMs`, `confirmEnabled`, `confirmOnDirty`, `confirmTitle`, `confirmMessage`, `confirmConfirmLabel`, `confirmCancelLabel`, `buttonVariant` (`filled` `outlined` `text`), `buttonTone` (`primary` `risk` `neutral`), `useCustomButtonStyle`, `showToastAfter` and the `toast*` fields.

Note the two different button vocabularies: a `button` **element** uses `variant` (`solid` `outline` `text`) and `tone` (`primary` `neutral` `success` `info` `warning` `risk`); an **action** rendered as a button uses `buttonVariant` (`filled` `outlined` `text`) and `buttonTone` (`primary` `risk` `neutral`).

---

## 12. Multi-page stepper

Several entries in `pages` become steps. Each still needs its twin in `elements`.

```json
{
  "schemaVersion": 1,
  "settings": {
    "language": "en",
    "locale": "en-US",
    "width": "760px",
    "widthUnit": "px",
    "pageNavigationMode": "stepper",
    "stepperPosition": "top",
    "pageNavigationPosition": "bottom",
    "allowStepWithoutValidation": false,
    "actionButtonsPosition": "bottom",
    "showSubmitButton": true,
    "showValidateButton": false,
    "showValidationIssuesModal": true
  },
  "pages": [
    { "name": "page1", "rows": [{ "columns": [{ "elementRef": "el1" }, { "elementRef": "el2" }] }] },
    { "name": "page2", "rows": [{ "columns": [{ "elementRef": "el3" }] }] },
    { "name": "page3", "rows": [{ "columns": [{ "elementRef": "el4" }] }] }
  ],
  "elements": {
    "page1": { "name": "page1", "label": "Applicant", "type": "page" },
    "page2": { "name": "page2", "label": "Address", "type": "page" },
    "page3": {
      "name": "page3",
      "label": "Review",
      "type": "page",
      "visibleIf": "notEmpty({el1}) && notEmpty({el2})"
    },
    "el1": { "name": "el1", "label": "First name", "type": "text", "required": true },
    "el2": { "name": "el2", "label": "Last name", "type": "text", "required": true },
    "el3": { "name": "el3", "label": "Street", "type": "text", "required": true },
    "el4": {
      "name": "el4",
      "label": "",
      "type": "customHtml",
      "htmlTemplate": "<p>Submitting as <b>{el1} {el2}</b>, {el3}</p>"
    }
  },
  "localization": {
    "defaultLanguage": "en",
    "languages": ["en", "de"],
    "texts": {
      "en": { "submitButtonText": "Submit" },
      "de": { "submitButtonText": "Absenden" }
    }
  }
}
```

---

## 13. Pre-return checklist for any of these

1. Every `elementRef` resolves; every `elements` key equals its `name`.
2. Every `pages[*].name` has an `elements` twin with `type: "page"`.
3. No element definition holds children (`rows`, `columns`, `children`, `items`); the exception is `dynamicTable.columns` and `table.columnsConfig`, which are cell definitions, not layout.
4. No column object holds anything besides `elementRef`, `rows`, `tabRows`.
5. `table` columns use `key`. `dynamicTable` columns use `name`.
6. `statusRules[*].condition` uses `value`; `rowActions[*].condition` uses `row.*`.
7. Action and element-datasource `params` are `[{ "name", "value" }]`; table request params are `[{ "paramName", "paramValue" }]`.
8. Runtime variables are read as `{__variables.x}`.
9. Logic fields sit directly on the element; validators use `condition` / `applyIf`.
10. Every type string matches the canonical list exactly, casing included.
