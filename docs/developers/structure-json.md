---
title: Structure JSON
description: The IStructure document, covering settings, pages, elements, data sources, and localization.
---

# Structure JSON

`IStructure` is the single document that defines a view. The builder produces it; the runtime consumes it. It is plain JSON, safe to store in a database column, version, and diff.

```ts
interface IStructure {
  schemaVersion?: number;
  settings: ISettings;
  header?: IHeader;
  pages: IPage[];
  elements: Record<string, IBaseElement>;
  dataSources?: IDataSource[];
  localization?: ILocalization;
}
```

`schemaVersion` records the format the view was saved in, and the runtime upgrades anything older before rendering it. A document without the field is read as version 1. See [Schema versioning](./schema-versioning) for migrations and for what happens when the JSON is newer than the runtime.

## `pages`: layout

Layout is a tree of rows and columns; columns point at elements by name:

```json
"pages": [
  {
    "name": "page1",
    "rows": [
      { "columns": [ { "elementRef": "firstName" }, { "elementRef": "lastName" } ] },
      { "columns": [ { "elementRef": "detailsPanel",
                       "rows": [ { "columns": [ { "elementRef": "email" } ] } ] } ] }
    ]
  }
]
```

- Two `columns` in one row = side-by-side elements.
- Container columns nest their own `rows` (tabs use `tabRows` keyed by tab).
- Pages can carry `status`, `disabled`, `readOnly`.

## `elements`: configuration

A flat map keyed by element name. Every entry has at least `name`, `label`, `type`; everything else depends on the type:

```json
"elements": {
  "page1":     { "name": "page1", "label": "Page 1", "type": "page" },
  "firstName": {
    "name": "firstName", "label": "First name", "type": "text",
    "required": true, "width": "50%", "mobileWidth": "100%",
    "visibleIf": "{clientType} == \"person\""
  }
}
```

Common keys across types: `width`/`tabletWidth`/`mobileWidth`, `hidden`, `disabled`, `readOnly`, `required`, logic strings (`visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`, `expression`, `defaultValue`), `validators`, `events`, `logicExecutionMode`, `validationExecutionMode`, `inheritParentState`. Element `type` values match `ElementTypesEnum` (`text`, `select`, `dynamicPanel`, `table`, …).

### Where a value lands in the data

An element's value is stored under its name, so `firstName` above ends up as `data.firstName`. Two containers change that, and both keep their children's definitions in their own `template` instead of the root `elements` map. A `dynamicPanel` stores an array, one object per entry. An `objectPanel` stores one object: every element laid out under it, at any depth, is saved at `<objectPanel>.<name>`. Because the children belong to the panel, their names only need to be unique inside it.

```json
"pages": [{ "name": "page1", "rows": [{ "columns": [{
  "elementRef": "address",
  "rows": [{ "columns": [{ "elementRef": "city" }, { "elementRef": "street" }] }]
}] }] }],
"elements": {
  "address": {
    "name": "address", "type": "objectPanel", "label": "Address",
    "template": {
      "city": { "name": "city", "type": "text", "label": "City" },
      "street": { "name": "street", "type": "text", "label": "Street" }
    }
  }
}
```

```json
// layout: address (objectPanel) > city, street
{ "address": { "city": "Vilnius", "street": "Gedimino pr. 1" } }
```

The same paths are used when you pass data in, when you read it back from `valueChanged` (`dataPath` is `address.city`), and in expressions (`{address.city}`).

An `objectPanel` inside another `objectPanel` or a `dynamicPanel` keeps its own `template`, one level down, and its data nests the same way: `{ "order": { "address": { "city": "..." } } }`. Views saved with 0.10.0 could have those inner children defined in the outer panel's `template` instead. The runtime notices that when it loads a structure and moves them into the inner panel, so the data comes out nested again. It works on its own copy and leaves the object you passed in untouched, so save the view once from the builder if you want the stored JSON fixed too.

## `settings`: view-wide configuration

Everything from the Form settings tab: `width`/`widthUnit`, `language`, `locale`, `theme`, `elementSpacing`, page navigation (`pageNavigationMode`, positions, `showValidateButton`, `showSubmitButton`, `showValidationIssuesModal`), render mode (`renderMode: 'page' | 'dialog' | 'canvas'` + `dialog*` keys; `canvas` is a full width page without chrome for web pages), `customCss`, `customCssUrls`, `lazyElementRendering`, plus advanced blocks:

| Key | Holds |
| --- | --- |
| `variables` | [Runtime variable definitions](./runtime-variables) |
| `templates` + `templateStorage*` | Template library and its storage mode |
| `triggers` / `rules` / `process` / `fragments` | Platform automation definitions (used by plugins) |

## `dataSources`

```json
"dataSources": [
  { "name": "loadCountries", "title": "Countries", "type": "rest",
    "params": { "url": "https://api.example.com/countries", "method": "GET" } }
]
```

`type` ∈ `rest | route | local`; `params` are type-specific (see [Data sources](../creators/data-sources)).

## `localization`

```json
"localization": {
  "defaultLanguage": "en",
  "languages": ["lt", "en"],
  "texts": { "en": { "elements.firstName.label": "First name" } }
}
```

## Working with structures in code

```ts
const model = new BuilderModel();
model.setJson(jsonString);            // load (normalises + fills defaults)
const structure = model.getJson();    // IStructure

// live, through the API service:
api.getStructure();
api.updateStructure((s) => { s.settings.theme = 'dark'; });
api.setStructure(newStructure);
```

## Versioning advice

- Treat the JSON as an artifact: store immutable versions, publish explicitly.
- Element **names are contracts**. Renaming one changes the submitted data shape and breaks expressions referencing it.
- Validate JSON against a staging runtime before publishing to production.
