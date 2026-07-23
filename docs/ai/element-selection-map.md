---
title: "AI: Element selection map"
description: How an AI agent maps user intent to the right NGX View Builder element type.
---

# AI: Element selection map

This page helps the agent decide which NGX View Builder element to use based on the user's intent.

## Quick reference

- "dynamic table", "editable rows", "add row", "delete row" -> `dynamicTable`
- "server-side table", "paging", "sorting", "filtering", "export", "row actions" -> `table`
- "repeating block", "repeatable section" -> `dynamicPanel`
- "single choice from a list" -> `select` or `radio`
- "search in a large list" -> `autocomplete`
- "multiple choices" -> `multiSelect` or `checkbox`
- "yes/no toggle" -> `singleCheckbox`, `toggleSwitch`, or `toggleButton`
- "handwritten signature" -> `signaturePad`
- "time of day" -> `timePicker`
- "quantity with +/- buttons" -> `numberStepper`

## Text and input elements

| User intent | Choose | When not to choose |
| --- | --- | --- |
| A single short text value | `text` | Do not use for long descriptions |
| Longer comment or notes | `textarea` | Do not use if rich content is needed |
| Formatted content | `richText` | Do not use for plain single-line text |
| Number | `number` | Do not use if it is only a text code |
| Sliding numeric value | `slider` | Do not use for precise financial amounts |
| Phone number | `phoneInput` | Do not use plain `text` if country-code UX is required |
| Large searchable list | `autocomplete` | Do not use for small static lists |
| File upload | `fileUpload` | Do not use for plain link text |
| Triggering an action | `button` | Do not use for data input |
| Code or JSON fragment | `code` | Do not use for plain text |
| Small bounded quantity with +/- buttons | `numberStepper` | Do not use for large or precise ranges; prefer `number` |
| Handwritten signature capture | `signaturePad` | Do not use for typed text |

## Choice elements

| User intent | Choose | When not to choose |
| --- | --- | --- |
| Single choice from several options | `select` | If all options must always be visible, prefer `radio` |
| Single choice with all options visible | `radio` | Do not use if there are very many options |
| Multiple choices from a list | `multiSelect` | Do not use for a yes/no scenario |
| Multiple choices as a checkbox group | `checkbox` | Do not use for a single boolean field |
| Single boolean checkbox | `singleCheckbox` | Do not use if a button-style switch is desired |
| Boolean toggle switch | `toggleSwitch` | Do not use if checkbox semantics are required |
| Boolean button-style toggle | `toggleButton` | Do not use if a standard checkbox is needed |
| Date selection | `datepicker` | Do not use for a date range |
| Date range | `dateRange` | Do not use for a single date |
| Time of day | `timePicker` | Combine with `datepicker` if both are needed |
| Simple dropdown menu | `dropdown` | Do not use as a substitute for table row actions |
| Always-visible scrollable selection list | `listBox` | Do not use if a compact closed control is preferred; use `select` |
| Connected button row for 2-4 short options | `selectButton` | Do not use for long option lists; prefer `radio` or `select` |

## Tables and repeating data

| User intent | Choose | Note |
| --- | --- | --- |
| User must add, delete, and edit rows inline | `dynamicTable` | This is not `table` |
| Repeat an entire block with multiple fields | `dynamicPanel` | Better than `dynamicTable` if it is not a table |
| Server-side table with paging, sorting, filtering, row actions | `table` | This is the main data grid |
| Simple list or card grid display | `listGrid` | Not for an editable table |
| Chart | `chart` | Not for a table or repeating input |

## Containers and UI structure

| User intent | Choose | Note |
| --- | --- | --- |
| Simple block with inner fields | `panel` | Most common container |
| Content divided into tabs | `tabs` or `tabsPro` | Do not use if multiple pages are sufficient |
| Collapsible sections | `accordion` | Good for longer forms |
| Step flow or progress | `progressFlow` | Not for a plain panel layout |
| Modal-style content | `dialog` | Not as the primary page-level form container |
| Two-zone layout with a divider | `splitter` | Only when two separate regions are needed |
| Empty placeholder block for a drop zone | `emptyBlock` | Internal layout helper |
| Visual separator | `divider` | Do not use for data storage |
| Spacing | `spacer` | Do not use as a structural container |

## Display and media elements

| User intent | Choose | Note |
| --- | --- | --- |
| Static HTML template | `customHtml` or `htmlSnippet` | Only when template HTML is truly needed |
| Rich text viewer | `richTextViewer` | Not for editing |
| Image | `image` | Not for file upload |
| Video | `video` | Media viewing only |
| External page or content | `iframe` | Only if the host allows it |
| Avatar | `avatar` | Not for general images |
| Icon | `icon` | Small UI symbol |
| Navigation path | `breadcrumbs` | Navigation context |
| Page heading | `pageTitle` | Hero or page top |
| Badge | `badge` | Short status or label |
| Informational card | `messageCard` | Message, warning, info |
| Statistics card | `statsCard` | KPI or summary |
| Toast notification | `toast` | Temporary notifications |
| Completion percentage | `progressBar` | Not for step/page navigation; use `progressFlow` |

## Internal or system types

The agent should not normally generate these directly as user form elements:

- `row`
- `column`
- `visibility`
- `choices`
- `validators`
- `dataSourceArguments`

They belong to the internal model, property editing, or builder infrastructure.

## Keyword map

| Prompt phrase | Choose |
| --- | --- |
| `dynamic table`, `editable rows`, `add row`, `delete row` | `dynamicTable` |
| `repeating block`, `repeatable section`, `repeatable group` | `dynamicPanel` |
| `data table`, `server-side table`, `paging`, `sorting`, `filtering` | `table` |
| `search in list`, `searchable select`, `autocomplete` | `autocomplete` |
| `multiple checkboxes`, `select multiple` | `checkbox` or `multiSelect` |
| `yes/no`, `toggle`, `switch` | `singleCheckbox`, `toggleSwitch`, or `toggleButton` |

## If you are unsure between two options

- `dynamicTable` vs `table`: does the user edit rows inline, or work with a datasource data grid?
- `dynamicPanel` vs `dynamicTable`: does the data look more like a form/block or like a row-based table?
- `select` vs `autocomplete`: are there few options, or many that require search?
- `singleCheckbox` vs `toggleSwitch`: does checkbox semantics matter, or is a switch style preferred?
