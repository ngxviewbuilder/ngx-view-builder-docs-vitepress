---
title: Common properties
description: Every property shared by most elements — identity, state, limits, validation, logic, actions, design, and data.
---

# Common properties

Most elements share the same core properties. Element-specific properties are covered on each [element page](./elements/).

::: tip Finding a property
The properties sidebar has a **search box** (*Search in property list*) — type part of a property name to filter. Every field also has a **help icon**: hover it for a short explanation with an example.
:::

## How the sidebar is organised

Properties are grouped into sections. Only sections relevant to the selected element appear:

| Section | What it holds |
| --- | --- |
| **Identity** | Name, label, and basic identifiers |
| **Content** | Visible texts, titles, placeholders, and content fields |
| **Input** | Input modes, autocomplete, and user input UX |
| **Formatting** | Masks, locale, and value formatting settings |
| **Primary source** | Data source binding and response paths |
| **Request** | Request params, lazy load, and backend request settings |
| **Search** | Quick or detailed search and their extra settings |
| **Saved filters** | Saved filters data source and payload schema |
| **Options schema** | Option lists, filtering, and selection modes |
| **Selection** | Table selection and selected item configuration |
| **Details** | Expanded rows, details panel, and nested views |
| **Pagination** | Paginator and footer control |
| **Header controls** | Header bar, export, and search controls |
| **Columns schema** | Main and expanded table columns |
| **Trigger button** | Button that opens a dialog or another action |
| **State** | Hidden, disabled, and readonly states |
| **Limits** | Min/max, lengths, counts, and other restrictions |
| **Deletion** | Delete flow and confirm settings |
| **Validation** | Required, validators, and strict options |
| **Visibility logic** | Visible-if and open conditions |
| **Interaction logic** | Disable, require, and readonly conditions |
| **Value logic** | Expression, default value, and reset conditions |
| **Execution modes** | Logic and validation execution mode settings |
| **Actions** | Events and action collections |
| **Layout** | Width, padding, orientation, gap, and overall layout |
| **Surface** | Borders, backgrounds, shadows, and page or panel surfaces |
| **Appearance** | Variants, colors, icons, and visual accents |
| **Advanced** | Rare or specialized properties |

## Identity & content

| Property | What it does |
| --- | --- |
| **Name (code)** | Unique element code in the JSON structure. The element's value is stored under this key, and logic, data paths, and other elements reference it as `{name}`. Change with care. Example: `el1` or `personFirstName`. |
| **Label** | The main caption visible to the user. Keep it clear in business terms. |
| **Field help tooltip** | Help text shown next to the label as a tooltip — for explanations that should be available on demand but not always visible. |
| **Description** | Help text below the label — for longer explanations that should always be visible at runtime. |
| **Placeholder text** | Text shown while the field is empty. Use as an example or short hint, not as the only explanation. |
| **Title** / **Subtitle** | Main heading text and secondary text for elements with their own header (cards, page titles, panels). |
| **Text** | Main text for content-style elements (button caption, badge text…). |
| **Icon** | Material Symbol or registered SVG icon code — a visual accent or a shorter action representation. |
| **Type** | Switches the element to a closely related type without recreating it (e.g. `text` → `number`), preserving shared properties. |

## State

| Property | What it does |
| --- | --- |
| **Hidden** | Element is completely hidden from the user (its value and logic still exist). |
| **Initially visible** | Whether the element is shown immediately when the form opens, before logic or user actions apply. |
| **Disabled** | Field is inactive; the user cannot change it. |
| **Read only** | Value is displayed but cannot be edited. |
| **Inherit parent state** | Element follows the read-only/disabled state of its parent container or page. Turn off to unlock one child inside a locked container. |
| **Ignore parent state** | Legacy compatibility field — use *Inherit parent state* instead. |
| **Status** | Legacy compatibility field — for new elements use the *Read only* checkbox. |

Static `Disabled`/`Hidden` are fixed choices. For state that depends on other fields, use the **logic** conditions below.

## Limits

| Property | What it does |
| --- | --- |
| **Min / Max length** | Character limits on text inputs. *Min length* means the field counts as filled/valid only from that many characters. |
| **Min / Max value** | Numeric or date/time boundaries (numbers, sliders, date pickers). |
| **Pattern** | Extra RegExp check on text values — for strict formats such as codes, registration numbers, identifiers. |
| **Max rows** | Row limit for dynamic tables/panels — the add button disables at the limit. |
| **Max files / Max file size (MB)** | Upload limits on file elements. |

## Validation

| Property | What it does |
| --- | --- |
| **Required** | Value must be filled before submit. Pair with a clear message. |
| **Required field message** | Error text shown when a required field is empty. Localise it on multilingual forms. |
| **Validators** | A list of extra rules: built-in (min/max, length, pattern, email) or a custom condition with its own error message. Each validator has **Type**, **Value**, **Error message**, **Condition** (error when true), and **Apply if** (optional guard). See [Validation](./validation). |
| **Strict options** | On choice elements: validates that the current value(s) still exist among the available options. |

## Logic

All conditions are expressions entered via **Edit code** — see [Expressions basics](./expressions).

| Property | Expects | What it does |
| --- | --- | --- |
| **Visible if** | true/false expression | Shows the element only while true. Example: `{el1} == "yes"` |
| **Disable if** | true/false expression | Disables while true. Example: `{el1} != "yes"` |
| **Require if** | true/false expression | Makes required while true. Example: `{el2} == 1` |
| **Read only if** | true/false expression | Locks editing while true. Example: `{status} == "locked"` |
| **Reset if** | true/false expression | Resets the value to *Default value* when the condition **becomes** true (fires on the transition). |
| **Expression** | any value | Calculates the element's value from other fields. Example: `{price} * {quantity}` |
| **Default value** | static value | Initial value on load and the value restored by *Reset if*. |

Details: [Conditional logic](./conditional-logic) and [Calculated values](./calculated-values).

## Actions

| Property | What it does |
| --- | --- |
| **Events** | The action list: click → navigate, click → dataSource, change → setValue, click → toast… Every field of the action editor is documented in [Events & actions](./events-actions). |

## Input & formatting (typed inputs)

| Property | What it does |
| --- | --- |
| **Autocomplete** | HTML `autocomplete` attribute — lets the browser fill standard data. Example: `given-name`, `email`, `street-address`. |
| **Input mode** | HTML `inputmode` hint — mobile browsers show a matching keyboard. Options: `text`, `email`, `numeric`, `decimal`, `search`, `tel`, `url`, browser default. |
| **Spellcheck** | Keep or disable the browser spell-checker on text fields. |
| **Input mask** | Mask template. Built-ins: date, date time, time, digits, phone, international phone, personal code — or `custom`. |
| **Mask pattern** | The custom mask: `#` digit, `A` letter, `*` letter or digit. Example: `####-##-##` or `+1 ##########`. |

## Design

| Property | What it does |
| --- | --- |
| **Width** | Field width in desktop/base mode — `%`, `px`, or other CSS units. Example: `100%` or `320px`. |
| **Tablet width** | Width for tablet. Empty = falls back to the base width. |
| **Mobile width** | Width for mobile. Empty = falls back to tablet width, then base width. |
| **Fit content** | Shrink to content width instead of filling the row. |
| **Background color, padding, radius, shadow, border** | Available on visual/surface elements like panels, buttons, badges — see the element pages and [Layout](./layout). |

## Data

Select-style elements and data views have a **Data source** binding (section *Primary source*): which source to load, which response fields become option value/label, request parameters, and refresh rules. Dependent fields are supported through the parameter map and *Listen fields* (refresh paths). Every field of that editor is documented in [Data sources](./data-sources).
