---
title: "AI: Layout model (pages, rows, columns, elementRef)"
description: The exact layout tree an AI agent must produce. How pages, rows, columns and elementRef relate to the flat elements map, how containers nest, and where widths belong.
---

# AI: Layout model (pages, rows, columns, elementRef)

This is the page that stops the single most damaging class of generated-JSON errors: getting the layout tree wrong. Read it before writing any structure JSON. If anything on this page contradicts your intuition about form builders, this page wins.

## The one rule that explains everything

NGX View Builder splits a view into **two independent halves**:

| Half | What it is | What it contains |
|---|---|---|
| `pages` | The **layout tree**. Position only. | Nested `rows` and `columns`. Each column carries one `elementRef` string. |
| `elements` | A **flat dictionary** of element definitions. Configuration only. | One entry per element, keyed by its `name`. No nesting, no children, no position. |

`elementRef` is the only bridge between them. It is a **string key into `elements`**, nothing else.

```
pages[0]                              elements
└─ rows[0]                            ┌──────────────────────────────────┐
   └─ columns[0]                      │ "firstName": { type: "text", ... }│
      └─ elementRef: "firstName" ────►│                                   │
                                      │ "lastName":  { type: "text", ... }│
   └─ columns[1]                      │                                   │
      └─ elementRef: "lastName"  ────►│ "page1": { type: "page", ... }    │
                                      └──────────────────────────────────┘
```

Two consequences that agents get wrong constantly:

1. **Structure lives only in `pages`.** An element definition never contains its children.
2. **Configuration lives only in `elements`.** A column never contains element properties.

## Exact object shapes

These are the real TypeScript interfaces (`core/shared/interfaces/structure.interface.ts`). Keys not listed here are ignored by the renderer.

```typescript
interface IStructure {
  schemaVersion?: number;
  settings: ISettings;
  header?: IHeader;
  pages: IPage[];
  elements: { [name: string]: IBaseElement };
  dataSources?: IDataSource[];
  localization?: ILocalization;
}

interface IPage {
  name: string;              // must match an elements[name] entry with type "page"
  rows: IRow[];
  status?: 'default' | 'readonly';
  disabled?: boolean;
  readOnly?: boolean;
}

interface IRow {
  columns: IColumn[];        // this is the ONLY key on a row
}

interface IColumn {
  elementRef: string;                    // required, points into elements
  rows?: IRow[];                         // children of a container element
  tabRows?: Record<string, IRow[]>;      // children of tabs/accordion/splitter/progressFlow
  fragmentRef?: string;                  // platform fragments only
  fragmentBindings?: Record<string, string>;
  fragmentMode?: 'append' | 'replace';
}
```

**A row object has exactly one key: `columns`.**
**A column object has `elementRef` plus, when the element is a container, `rows` or `tabRows`. Nothing else.**

Anything you are tempted to write on a column (`width`, `mobileWidth`, `label`, `type`, `span`, `size`, `flex`, `colSpan`) does not exist there. It is silently dropped.

## How a row renders

- A `row` is a **horizontal band**. Its `columns` sit side by side, left to right.
- Vertical order comes from the order of `rows` in the array. There is no `order` property.
- **A column with no width takes an equal share of the row.** The renderer applies `flex: 1 1 0` when the element has no `width` (`core/shared/utils/responsive-width.ts`).

So a 50/50 pair is just two columns in one row, with no widths at all:

```json
{ "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] }
```

Three equal fields: three columns. One full-width field: one column. **Do not write `"width": "50%"` to get halves.** Equal split is the default, and writing widths on columns does nothing anyway.

## Where widths belong

Width is a property of the **element**, in the `elements` map:

| Property | Meaning |
|---|---|
| `width` | Desktop width, e.g. `"100%"`, `"320px"`, `"calc(50% - 8px)"` |
| `tabletWidth` | Overrides `width` on tablet |
| `mobileWidth` | Overrides `width` and `tabletWidth` on mobile |
| `fitContent` | Shrink to content instead of filling |

A bare number is treated as pixels. A percentage, `calc()`, `min()`, `max()` or `clamp()` is treated as relative and pinned exactly; a fixed size is allowed to shrink (`min(width, 100%)`).

Only set these when you need something **other** than an equal split, for example a narrow field beside a wide one:

```json
{
  "postCode": { "name": "postCode", "label": "Post code", "type": "text", "width": "160px" },
  "street":   { "name": "street",   "label": "Street",    "type": "text" }
}
```

Mobile stacking happens by giving the element `"mobileWidth": "100%"`, again on the element, never on the column.

## Nesting: the mistake that breaks everything

Container elements do **not** hold their children. The **column that references the container** holds them, in its own `rows` array.

### Wrong (children inside the element definition)

<!-- deliberately incorrect: kept as the counter-example -->

```json
{
  "pages": [
    { "name": "page1", "rows": [{ "columns": [{ "elementRef": "panelGeneral" }] }] }
  ],
  "elements": {
    "panelGeneral": {
      "name": "panelGeneral",
      "type": "panel",
      "label": "General",
      "rows": [
        { "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] }
      ]
    }
  }
}
```

The panel renders **empty**. `IBaseElement` has no `rows`, so the array is ignored, and `firstName` / `lastName` are never placed anywhere.

### Right (children inside the column)

```json
{
  "pages": [
    {
      "name": "page1",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "panelGeneral",
              "rows": [
                { "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "page1": { "name": "page1", "type": "page", "label": "Page 1" },
    "panelGeneral": { "name": "panelGeneral", "type": "panel", "label": "General" },
    "firstName": { "name": "firstName", "type": "text", "label": "First name" },
    "lastName": { "name": "lastName", "type": "text", "label": "Last name" }
  }
}
```

Nesting is recursive: a nested column may itself carry `rows`, to any depth.

Note that `parentName` exists on `IBaseElement` but is **not** how you build the tree. Never use it to declare parentage; the layout tree is the only source of structure.

## Which element types accept children

Exactly these ten types are containers (`runtime-preview.ts`, `isContainerElement`):

| Type | Children go in | Notes |
|---|---|---|
| `page` | `page.rows` | The page itself; its rows are the top level |
| `panel` | `column.rows` | The normal grouping box, with a title from `label` |
| `dynamicPanel` | `column.rows` | Repeatable group; value is an array of objects |
| `dialog` | `column.rows` | An in-view modal element |
| `emptyBlock` | `column.rows` | Unstyled layout box with flex/grid controls |
| `tabs` | `column.tabRows` | Keyed by tab value |
| `tabsPro` | `column.tabRows` | Keyed by item value |
| `accordion` | `column.tabRows` | Keyed by item value |
| `splitter` | `column.tabRows` | Keyed by panel value |
| `progressFlow` | `column.tabRows` | Keyed by step value |

**Every other type is a leaf.** `text`, `select`, `table`, `dynamicTable`, `messageCard`, `statsCard`, `richText` and the rest never receive `rows`.

`dynamicTable` is the exception that proves the rule: its cells are declared in its own `columnsConfig` property, not in the layout tree. `table` likewise uses `columnsConfig`. Neither uses `column.rows`.

### `tabRows` keys

For tab-like containers, `tabRows` is an object keyed by the **`value` of each declared tab / item / panel / step** (falling back to `id`, then `tab1`, `tab2`, ...). The keys must match the container's own list property:

| Type | List property | Key source |
|---|---|---|
| `tabs` | `tabs` | `tabs[i].value` |
| `tabsPro` | `items` | `items[i].value` |
| `accordion` | `items` | `items[i].value` |
| `splitter` | `panels` | `panels[i].value` |
| `progressFlow` | `items` | `items[i].value` |

```json
{
  "columns": [
    {
      "elementRef": "personTabs",
      "tabRows": {
        "general": [{ "columns": [{ "elementRef": "firstName" }] }],
        "contact": [{ "columns": [{ "elementRef": "email" }] }]
      }
    }
  ]
}
```

with

```json
{
  "personTabs": {
    "name": "personTabs",
    "type": "tabs",
    "label": "Person",
    "tabs": [
      { "value": "general", "label": "General" },
      { "value": "contact", "label": "Contact" }
    ]
  }
}
```

## Pages are not sections

A `page` is a **step or screen**, not a visual section. Multiple entries in `pages` produce a multi-step view, navigated by the built-in pager or stepper (`settings.pageNavigationMode`).

To draw titled sections stacked on one screen, use **one page containing several `panel` elements**. Do not create one page per section.

Every page needs its twin in `elements`:

```json
{
  "pages": [{ "name": "personPage", "rows": [] }],
  "elements": {
    "personPage": { "name": "personPage", "label": "Person", "type": "page", "hideHeader": true }
  }
}
```

Page element properties: `name`, `label`, `description`, `type`, `visibleIf`, `disableIf`, `readonlyIf`, `hideHeader`, `removeBackgraund` (spelled exactly like that), `pageBackgroundColor`, `pagePadding`, `mobilePadding`. Nothing else.

## Building a layout from a screenshot or description

Follow this order every time. Do not start writing JSON at step 1.

1. **Read the visual top to bottom.** List every field, in order, with its label.
2. **Find the section headings.** Each heading becomes one `panel` element whose `label` is that heading.
3. **Slice each section into horizontal bands.** Fields on the same visual line belong to the same `row`. A field on its own line is its own `row` with one column.
4. **Count the columns per band.** Two fields side by side is two columns. Three is three. Equal split is free; only reach for widths when the visual is clearly uneven.
5. **Write `elements` first.** Every panel, every field, the page. Flat, keyed by `name`, each with `name`, `label`, `type`.
6. **Write `pages` second.** Panels at the top level; each panel's column carries the section's `rows`.
7. **Verify** with the checklist below.

Counting rows and columns before touching JSON is what keeps the output faithful to the picture.

## Verification checklist

Run all of these mentally before returning JSON.

1. Every `elementRef` string resolves to a key in `elements`.
2. Every key in `elements` appears exactly once as some `elementRef` (or is a `page`).
3. Every entry of `pages` has a matching `elements[name]` with `type: "page"`.
4. No object in `elements` has a `rows`, `columns` or `children` key (except `table` / `dynamicTable` and their `columnsConfig`).
5. No column object has any key other than `elementRef`, `rows`, `tabRows`, `fragmentRef`, `fragmentBindings`, `fragmentMode`.
6. No row object has any key other than `columns`.
7. `rows` on a column appears only when the referenced element is one of the ten container types.
8. `tabRows` keys match the container's declared tab/item/panel/step values.
9. Widths, if present at all, are on elements, not columns.
10. `name` values are unique across the whole structure.

## Full worked example

A dialog with four titled sections, mixed one-, two- and three-field rows, conditional document fields, and a footer button pair. Every property used below exists in [the properties reference](./properties-reference).

```json
{
  "schemaVersion": 1,
  "settings": {
    "language": "en",
    "locale": "lt-LT",
    "width": "640px",
    "widthUnit": "px",
    "renderMode": "dialog",
    "dialogTitle": "Add a new person",
    "dialogWidth": "640px",
    "dialogShowCloseButton": true,
    "showSubmitButton": false
  },
  "pages": [
    {
      "name": "personPage",
      "rows": [
        {
          "columns": [
            {
              "elementRef": "panelGeneral",
              "rows": [
                { "columns": [{ "elementRef": "firstName" }, { "elementRef": "lastName" }] },
                { "columns": [{ "elementRef": "personalCode" }, { "elementRef": "birthDate" }] },
                { "columns": [{ "elementRef": "citizenship" }, { "elementRef": "gender" }] },
                { "columns": [{ "elementRef": "isStudent" }] }
              ]
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "panelContact",
              "rows": [
                { "columns": [{ "elementRef": "email" }] },
                { "columns": [{ "elementRef": "phone" }] },
                { "columns": [{ "elementRef": "declaredAddress" }] },
                { "columns": [{ "elementRef": "country" }] },
                { "columns": [{ "elementRef": "locality" }, { "elementRef": "street" }] },
                {
                  "columns": [
                    { "elementRef": "houseNumber" },
                    { "elementRef": "flatNumber" },
                    { "elementRef": "postCode" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "panelBank",
              "rows": [
                { "columns": [{ "elementRef": "bankAccount" }] },
                { "columns": [{ "elementRef": "bankName" }] },
                { "columns": [{ "elementRef": "bankSwift" }] },
                { "columns": [{ "elementRef": "bankAddress" }] }
              ]
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "panelDocument",
              "rows": [
                { "columns": [{ "elementRef": "hasDocument" }] },
                { "columns": [{ "elementRef": "documentType" }] },
                {
                  "columns": [
                    { "elementRef": "documentNumber" },
                    { "elementRef": "documentValidUntil" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "columns": [
            {
              "elementRef": "panelActions",
              "rows": [
                { "columns": [{ "elementRef": "cancelButton" }, { "elementRef": "saveButton" }] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "elements": {
    "personPage": {
      "name": "personPage",
      "label": "Add a new person",
      "type": "page",
      "hideHeader": true
    },

    "panelGeneral": {
      "name": "panelGeneral",
      "label": "Bendri asmens duomenys",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "titleUnderline": true
    },
    "firstName": {
      "name": "firstName",
      "label": "Vardas",
      "type": "text",
      "required": true,
      "requiredMessage": "Enter the first name"
    },
    "lastName": {
      "name": "lastName",
      "label": "Last name",
      "type": "text",
      "required": true,
      "requiredMessage": "Enter the last name"
    },
    "personalCode": {
      "name": "personalCode",
      "label": "Asmens kodas",
      "type": "text",
      "maskType": "digits",
      "maxlength": 11,
      "required": true,
      "requiredMessage": "Enter the personal code"
    },
    "birthDate": {
      "name": "birthDate",
      "label": "Gimimo data",
      "type": "datepicker",
      "placeholder": "Pasirinkti",
      "pickerMode": "date",
      "format": "YYYY-MM-DD",
      "required": true
    },
    "citizenship": {
      "name": "citizenship",
      "label": "Citizenship",
      "type": "select",
      "showSearch": true,
      "strictOptions": true,
      "required": true,
      "options": [
        { "value": "LT", "label": "Lietuva" },
        { "value": "LV", "label": "Latvija" },
        { "value": "EE", "label": "Estija" }
      ]
    },
    "gender": {
      "name": "gender",
      "label": "Lytis",
      "type": "select",
      "strictOptions": true,
      "required": true,
      "options": [
        { "value": "M", "label": "Vyras" },
        { "value": "F", "label": "Moteris" }
      ]
    },
    "isStudent": {
      "name": "isStudent",
      "label": "",
      "type": "singleCheckbox",
      "checkboxLabel": "Person qualifies as a student",
      "defaultValue": false
    },

    "panelContact": {
      "name": "panelContact",
      "label": "Kontaktiniai duomenys",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "titleUnderline": true
    },
    "email": {
      "name": "email",
      "label": "Email",
      "type": "text",
      "inputMode": "email",
      "required": true,
      "validators": [
        { "type": "email", "message": "Invalid email format" }
      ]
    },
    "phone": {
      "name": "phone",
      "label": "Tel. Nr.",
      "type": "phoneInput",
      "defaultCountryCode": "LT"
    },
    "declaredAddress": {
      "name": "declaredAddress",
      "label": "Deklaruotos gyvenamosios vietos adresas",
      "type": "text",
      "readOnly": true,
      "expression": "{street} + ' ' + {houseNumber} + ', ' + {locality}",
      "logicExecutionMode": "onChange"
    },
    "country": {
      "name": "country",
      "label": "Country",
      "type": "select",
      "showSearch": true,
      "strictOptions": true,
      "options": [
        { "value": "LT", "label": "Lietuva" },
        { "value": "LV", "label": "Latvija" },
        { "value": "EE", "label": "Estija" }
      ]
    },
    "locality": { "name": "locality", "label": "Locality", "type": "text" },
    "street": { "name": "street", "label": "Street", "type": "text" },
    "houseNumber": {
      "name": "houseNumber",
      "label": "Namo numeris",
      "type": "text",
      "mobileWidth": "100%"
    },
    "flatNumber": {
      "name": "flatNumber",
      "label": "Buto numeris",
      "type": "text",
      "mobileWidth": "100%"
    },
    "postCode": {
      "name": "postCode",
      "label": "Post code",
      "type": "text",
      "mobileWidth": "100%"
    },

    "panelBank": {
      "name": "panelBank",
      "label": "Bank account details",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "titleUnderline": true
    },
    "bankAccount": { "name": "bankAccount", "label": "Bank account number", "type": "text" },
    "bankName": { "name": "bankName", "label": "Banko pavadinimas", "type": "text" },
    "bankSwift": {
      "name": "bankSwift",
      "label": "Banko SWIFT (BIC) kodas",
      "type": "text",
      "minlength": 8,
      "maxlength": 11
    },
    "bankAddress": { "name": "bankAddress", "label": "Banko adresas", "type": "text" },

    "panelDocument": {
      "name": "panelDocument",
      "label": "Asmens dokumento duomenys",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "titleUnderline": true
    },
    "hasDocument": {
      "name": "hasDocument",
      "label": "Dokumentas",
      "type": "radio",
      "showInline": true,
      "defaultValue": "Y",
      "required": true,
      "options": [
        { "value": "Y", "label": "Taip" },
        { "value": "N", "label": "Ne" }
      ]
    },
    "documentType": {
      "name": "documentType",
      "label": "Dokumento tipas",
      "type": "select",
      "strictOptions": true,
      "visibleIf": "{hasDocument} == 'Y'",
      "requireIf": "{hasDocument} == 'Y'",
      "logicExecutionMode": "onChange",
      "options": [
        { "value": "PASSPORT", "label": "Pasas" },
        { "value": "ID_CARD", "label": "ID card" }
      ]
    },
    "documentNumber": {
      "name": "documentNumber",
      "label": "Dokumento numeris",
      "type": "text",
      "visibleIf": "{hasDocument} == 'Y'",
      "requireIf": "{hasDocument} == 'Y'",
      "logicExecutionMode": "onChange"
    },
    "documentValidUntil": {
      "name": "documentValidUntil",
      "label": "Dok. galioja iki",
      "type": "datepicker",
      "placeholder": "Pasirinkti",
      "pickerMode": "date",
      "format": "YYYY-MM-DD",
      "visibleIf": "{hasDocument} == 'Y'",
      "logicExecutionMode": "onChange"
    },

    "panelActions": {
      "name": "panelActions",
      "label": "",
      "type": "panel",
      "showBorder": false,
      "panelPadding": "0px",
      "contentJustify": "flex-end",
      "contentGap": "8px"
    },
    "cancelButton": {
      "name": "cancelButton",
      "label": "",
      "type": "button",
      "text": "Cancel",
      "variant": "outline",
      "tone": "neutral",
      "fitContent": true
    },
    "saveButton": {
      "name": "saveButton",
      "label": "",
      "type": "button",
      "text": "Save",
      "variant": "solid",
      "tone": "primary",
      "fitContent": true,
      "events": [{ "trigger": "click", "type": "submit", "validateForm": true }]
    }
  },
  "localization": {
    "defaultLanguage": "en",
    "languages": ["en"]
  }
}
```

Read that example structurally, not as a template to copy verbatim. The shape is what matters: four panels at the top level of `pages`, each panel's column carrying the section's rows, and every field defined once, flat, in `elements`.

## Quick reference card

```
pages[]           → { name, rows[] }
  rows[]          → { columns[] }                       (only key: columns)
    columns[]     → { elementRef, rows?, tabRows? }     (no widths, no props)
      rows[]      → recursion, containers only

elements{}        → flat map, key === element.name
  every element   → { name, label, type, ...properties }
  containers      → hold NO children
  widths          → width / tabletWidth / mobileWidth / fitContent, here only
```

Related: [JSON authoring rules](./json-authoring-rules), [Common mistakes](./common-mistakes), [Canonical properties reference](./properties-reference).
