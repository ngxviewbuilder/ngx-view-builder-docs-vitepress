---
title: Choice inputs
description: Select, Multi-select, Autocomplete, Checkbox, Radio, Select button, Toggles, and List box, with full property tables.
---

# Choice inputs

All choice elements share the same two ways of getting their options:

1. **Static options**, in the **Options** section: add label/value pairs by hand.
2. **Data source**, in the **Primary source** section: load options from an API and map which response fields become the value and label. See [Data sources](../data-sources).

The stored value is always the option **value** (not the label).

## Options: shared fields

Each manual option row has:

| Field | What it does |
| --- | --- |
| **Label** | Text the user sees. |
| **Value** | What is stored in the data. |
| **Condition** (*visibleIf*) | Show this option only when an expression is true, e.g. `{el1} == 1`. |
| **Icon** / **Badge** | Extra visuals where the element supports them (Select button). |

Shared option-related properties:

| Property | What it does |
| --- | --- |
| **Use as number** | Converts the option value to a number when storing. |
| **Filter if equal / Filter if not equal** | Show an option only if its value equals / does not equal the given value or `{field}`. Gives you quick dependent lists without a server call. |
| **Strict options** | Validates that the current value(s) still exist among the available options. |
| **Option template** / **Option template ref** | Custom HTML per option row (<code v-pre>{{label}}</code>, <code v-pre>{{value}}</code>, <code v-pre>{{selected}}</code>), inline or from the [template library](../templates); the ref wins. |

## Select (`select` / dropdown)

The standard dropdown. Best default for 5+ options.

| Property | What it does |
| --- | --- |
| **Show search** | Adds a search box inside the dropdown. |
| **Placeholder text** | Shown while nothing is selected. |
| **Option value key / Option label key** | Which response fields become value and label (data-source options). |

## Multi-choice menu (`multiSelect`)

Like Select, but stores an **array** of values. Use `contains({tags}, "vip")` in expressions to check membership. Has the same search/placeholder/template properties as Select, plus clear-selections controls.

## Autocomplete (`autocomplete`)

Type-ahead search. Best for long lists (clients, cities, products).

| Property | What it does |
| --- | --- |
| **Lazy load** | Fetch options as the user types instead of upfront. |
| **Min search length** | Characters required before a lazy search fires. |
| **Debounce (ms)** | Time between the last keystroke and the request. |
| **Max suggestions** | How many suggestions to show. |
| **Force selection** | Only values picked from the list are allowed; free-typed text is cleared. |

## Radio (`radio`)

All options visible, one selectable. Best for 2-5 options that users should compare side by side.

| Property | What it does |
| --- | --- |
| **Show inline** | Options in a single row instead of stacked. |

## Checkbox group (`checkbox`)

All options visible, many selectable. Stores an array. Also supports **Show inline**.

## Single checkbox (`singleCheckbox`)

One yes/no checkbox storing `true`/`false`. Use for confirmations: *"I agree to the terms"* + `required`/`requireIf`.

| Property | What it does |
| --- | --- |
| **Checkbox label** | The text next to the box. Make the option readable without extra context. |

## Toggle switch (`toggleSwitch`)

A styled on/off switch. Same data as Single checkbox, different look. Better suited to settings-style screens.

| Property | What it does |
| --- | --- |
| **Toggle mode** | `checkbox` returns `true`/`false`; `toggle` allows custom on/off values. |
| **True value / False value** | Custom stored values in toggle mode: text, number, or JSON. |
| **On label / Off label** | Texts for the two states. |

## Select button (`selectButton`)

A row of connected buttons, a visual alternative to Radio for 2-4 short options (e.g. `Person | Company`).

| Property | What it does |
| --- | --- |
| **Options** | Rows with `label`, `value`, `icon`, `badge`, and `visibleIf`. |
| **Multiple** | Allow several active buttons; the value becomes an array. |
| **Allow empty** | In single mode, clicking the active button again deselects it. |
| **Show selected icon** | Check mark on active buttons. |

## List box (`listBox`)

A permanently open scrollable list with selection. Useful when choosing is the main task of the screen.

## Choosing between them

| Situation | Element |
| --- | --- |
| 2-4 options, single choice | Radio or Select button |
| 5+ options, single choice | Select |
| Long list, single choice | Autocomplete |
| Few options, multiple choice | Checkbox group |
| Many options, multiple choice | Multi-choice menu |
| Yes/no | Single checkbox or Toggle switch |
