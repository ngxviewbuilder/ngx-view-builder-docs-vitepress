---
title: Structure JSON
description: The IStructure document, covering settings, pages, elements, data sources, and localization.
---

# Structure JSON

`IStructure` is the single document that defines a view. The builder produces it; the runtime consumes it. It is plain JSON, safe to store in a database column, version, and diff.

```ts
interface IStructure {
  settings: ISettings;
  header?: IHeader;
  pages: IPage[];
  elements: Record<string, IBaseElement>;
  dataSources?: IDataSource[];
  localization?: ILocalization;
}
```

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

## `settings`: view-wide configuration

Everything from the Form settings tab: `width`/`widthUnit`, `language`, `locale`, `theme`, `elementSpacing`, page navigation (`pageNavigationMode`, positions, `showValidateButton`, `showSubmitButton`, `showValidationIssuesModal`), render mode (`renderMode: 'page' | 'dialog'` + `dialog*` keys), `customCss`, `customCssUrls`, `lazyElementRendering`, plus advanced blocks:

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
  "defaultLanguage": "lt",
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
