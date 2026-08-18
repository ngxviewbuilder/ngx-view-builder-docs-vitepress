---
title: "AI: Element rules and value shapes"
description: AI-oriented summary of the primary NGX View Builder elements, their usage rules and value shapes.
---

# AI: Element rules and value shapes

This page is an AI-oriented summary of the primary NGX View Builder elements. For the full property list always consult:

- [Element catalog](../creators/elements/)
- [Canonical properties reference](./properties-reference)

## General rules for all elements

- Every user-facing element must have `name`, `label`, and `type`.
- `name` must be unique.
- If an element participates in logic, its `name` must be stable and meaningful.
- Do not use properties that are not found in the documentation or catalog.

## Input elements

### `text`

- Use for short text.
- Typical value shape: `string`.
- Common properties: `placeholder`, `defaultValue`, `required`, `expression`.

### `textarea`

- Use for longer text, comments, and descriptions.
- Value shape: `string`.
- Do not use if formatted rich content is needed.

### `number`

- Use for numbers, amounts, and quantities.
- Value shape: `number` or `string`, depending on `valueStorageType`.
- Do not wrap it in `toNumber(...)` in calculations. A `number` element already stores a number, so `{price} * {quantity}` is correct and `toNumber({price}) * toNumber({quantity})` only adds noise. The exception is `valueStorageType: "string"`, which really does store text.

### `slider`

- Use for ranges or bounded numeric values with a slider.
- Value shape: `number` or `string`.
- Do not use for precise manual financial input.

### `numberStepper`

- Use for small bounded quantities with increment/decrement buttons (passengers, rooms, items).
- Value shape: `number`.
- Use `min`/`max` to bound it. Do not use for large or precise numeric ranges; prefer `number`.

### `signaturePad`

- Use to capture a handwritten signature (mouse or touch).
- Value shape: signature image data (per `exportFormat`, e.g. `png`/`jpeg`), keyed under the element's `name`.
- Do not use as a substitute for typed text input.

### `phoneInput`

- Use for phone numbers with country code.
- Value shape is often an object with country and number parts.
- Do not use plain `text` if a standard phone UX is required.

### `autocomplete`

- Use for a large list of options with search.
- Value shape depends on the option mapping.
- Often requires a datasource or options mapping.

### `fileUpload`

- Use for file uploads.
- Value shape: the upload endpoint's response object, stored verbatim (or an array when `multiple`), never file bytes/base64. Depends on `fileKeyField`/`fileNameField`/`fileTypeField`/`fileSizeField`.
- Do not treat it as a plain text URL field.
- Consulting mode: for the exact upload/download/delete request and response contract, see [Properties reference](./properties-reference#fileupload) and [File upload requests](../developers/data-sources#file-upload-requests).

### `button`

- Use to trigger an action.
- Not intended for form value storage.
- Common properties: `variant`, `events`, `actions`, `disabled`.

### `richText` / `richTextViewer`

- `richText` edits formatted HTML; `richTextViewer` only renders it.
- Value shape is an HTML `string`.
- There is no `code` element type. For a code or JSON fragment use `textarea`, or `customHtml` / `htmlSnippet` for read-only markup.

## Choice elements

### `select`

- Single choice from a list.
- Value shape: single value.
- Works with static or datasource options.

### `multiSelect`

- Multiple choices from a list.
- Value shape: array.
- Suitable when there are many options and a compact UI is needed.

### `radio`

- Single choice when all options must be visible at once.
- Value shape: single value.

### `checkbox`

- Multiple choices as a checkbox group.
- Value shape: array.
- Do not use for a single boolean field.

### `singleCheckbox`

- Single boolean checkbox.
- Value shape: `boolean`.

### `toggleSwitch`

- Single boolean switch.
- Value shape: `boolean`.
- Good for active/inactive scenarios.

### `toggleButton`

- Boolean or small-choice button-style control.
- Value shape is typically `boolean`.

### `datepicker`

- **Exact type string: `"datepicker"`** (all lowercase, never `datePicker`, `DatePicker`, or `date-picker`).
- Single date.
- Value shape is typically a date string or documented date format.
- Do not use for a date range.

Canonical example:

```json
{
  "name": "birthDate",
  "type": "datepicker",
  "label": "Date of Birth",
  "placeholder": "Select date",
  "required": true,
  "validators": [
    {
      "type": "maxDate",
      "value": "today",
      "message": "Cannot be in the future"
    }
  ]
}
```

### `dateRange`

- Date range.
- Value shape:

```json
{
  "dateFrom": "2026-03-01",
  "dateTo": "2026-03-09"
}
```

- Do not use for a single date.

### `timePicker`

- Selects a time of day.
- Value shape is typically a time string.
- Combine with `datepicker` when both a date and a time are needed, or use a `text` element with a date-time input mask for single-field entry.

### `dropdown` does not exist

- There is no `dropdown` element type. `select` is the closed dropdown control.
- For an action menu use `button` with `menuActions`, or `table.rowActions` with `rowActionsDisplayMode: "dropdown"`.

### `listBox`

- Always-visible scrollable selection list, single or multiple via `selectionMode`.
- Value shape: single value (`selectionMode: "single"`) or array (`selectionMode: "multiple"`).
- Use when choosing is the primary task on screen; otherwise prefer `select`.

### `selectButton`

- A row of connected buttons, a visual alternative to `radio` for 2-4 short options.
- Value shape: single value, or array when `multiple` is `true`.
- Do not use for long option lists; prefer `radio` or `select`.

## Table and repeating data elements

### `dynamicTable`

- Use for editable rows.
- The user must be able to add, delete, and edit rows.
- Value shape is typically: array of objects.
- This is not a server-side data grid.

### `table`

- Use for displaying data from a datasource.
- Supports `sorting`, `filtering`, `paging`, `rowActions`, and `export`.
- Requires `columnsConfig` and often datasource properties.
- Use `key`, not `name`, for `columnsConfig[*]` columns.
- A column either prints text (`type: "text"`) or hosts a real element (`type: "element"` plus `elementType` and `element`). Use the element form whenever the cell needs a control, a badge, a button, or an event.
- Server-side paging/search (`lazyLoad: true` + a `TABLE-POST` datasource method) has its own request/response contract, so do not invent one. Consulting mode: see [Properties reference](./properties-reference#table) and [Table: server-side paging & filtering](../developers/data-sources#table-server-side-paging-filtering-table-post).
- If `key` is empty or absent, the column will not be rendered at runtime.
- This is not an editable `dynamicTable`.

### `listGrid`

- Use for displaying a list or card grid.
- Do not use if full table functionality is needed.

### `chart`

- Use for graphical visualization.
- Do not use as a data input element.

## Container and layout elements

### `page`

- Every `pages[*]` entry must have a corresponding `elements[pageName]` entry with `type: "page"`.
- `page` itself is the top-level form page.

### `panel`

- The most common container for grouping fields.
- Suitable for sections with an inner layout.

### `dynamicPanel`

- Use for repeating sets of blocks.
- Value shape is typically: array of objects.
- Suitable for addresses, family members, and education records.

### `tabs` and `tabsPro`

- Use to divide content into tabs.
- Suitable when multiple clearly separated areas are needed on a single page.

### `accordion`

- Use for collapsible sections.
- Suitable for longer forms.

### `progressFlow`

- Use to display steps or progress.
- Not for primary data input.

### `dialog`

- Use for modal content.
- Not every form needs `dialog*` settings.

### `splitter`

- Use for a two-zone layout with a divider.

### `emptyBlock`

- Internal helper placeholder for layout scenarios.

### `row` and `column`

- These are internal layout concepts.
- The agent typically does not generate them as top-level elements in the `elements` map.

## Display and media elements

### `richText`

- Formatted content or a longer rich editor scenario.
- Value shape: `string`.

### `richTextViewer`

- For rich text viewing.
- Not for editing.

### `customHtml`

- Use only when template HTML is genuinely needed, based on documented NGX View Builder capability.
- Do not use as an excuse to generate custom Angular.

### `htmlSnippet`

- Use for short HTML fragments.

### `image`

- For displaying images.

### `video`

- For displaying video.

### `iframe`

- For embedding external content.
- Suitable only if the host allows it.

### `avatar`

- For small user or object representations.

### `icon`

- For a UI icon.

### `divider`

- For visual separation.

### `spacer`

- For spacing.

### `breadcrumbs`

- For navigation path.

### `pageTitle`

- For page or section headings.

### `badge`

- For a short label or status.

### `messageCard`

- For an informational, success, or warning card.

### `statsCard`

- For KPI or summary blocks.

### `toast`

- For temporary notifications.
- Often tied to actions, not permanent layout.

### `progressBar`

- Completion indicator; value 0-100 (or a custom `max`) from `expression`, `defaultValue`, or a bound datasource.
- Value shape: `number`.
- Not for step/page navigation; use `progressFlow` for that.

## Validators

Validators belong in the `validators` array on any element. The exact interface is:

```typescript
interface IValidator {
  type: string;       // validator type (required)
  value?: string | number;   // threshold (minLength, maxLength, min, max, minDate, maxDate, etc.)
  message?: string;   // error text shown to user
  condition?: string; // expression, the FAILING check; the error is shown while it evaluates to true
  applyIf?: string;   // expression, validator only runs while this evaluates to true
}
```

**Field names that do NOT exist on `IValidator`: `expression`, `visibleIf`, `disableIf`, `requireIf`, `readonlyIf`, `resetIf`.**
Those are element-level logic fields. Never place them inside a validator object.

When writing a custom `condition`, express the failing state, for example:

```json
{
  "type": "custom",
  "condition": "dateDiffDays({startDate}, {endDate}) < 1",
  "message": "End date must be after start date"
}
```

Correct usage:

```json
{
  "name": "firstName",
  "type": "text",
  "label": "First Name",
  "requireIf": "{step} == 'personal'",
  "validators": [
    {
      "type": "minLength",
      "value": 2,
      "message": "At least 2 characters required"
    },
    {
      "type": "maxLength",
      "value": 64,
      "message": "Must not exceed 64 characters",
      "applyIf": "{firstName} != ''"
    }
  ]
}
```

Wrong, do not do this:

```json
{
  "validators": [
    {
      "type": "minLength",
      "expression": "{firstName}.length >= 2",
      "visibleIf": "{skip} == true"
    }
  ]
}
```

## Internal and system types

Do not normally generate these as user form elements unless working with builder infrastructure:

- `visibility`
- `choices`
- `validators`
- `dataSourceArguments`

## Per-element AI checklist

Before generating an element, the agent must answer:

1. What is the purpose of this element.
2. What must the value shape be.
3. Is a datasource needed.
4. Are logic properties needed.
5. Does the user want input, display, repetition, or a data grid.
