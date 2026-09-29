---
title: Choice inputs
description: Select, Multi-select, Autocomplete, Checkbox, Radio, Select button, Toggles, and List box, with full property tables.
---

# Choice inputs

All choice elements share the same two ways of getting their options:

1. **Static options**, in the **Options** section: add label/value pairs by hand.
2. **Data source**, in the **Primary source** section: load options from an API and map which response fields become the value and label. See [Data sources](../data-sources).

The stored value is the option **value**, not the label. The one exception is an Autocomplete with a search data source, which can store the whole record the user picked (see below).

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

It works in two ways. With a short list, give it static options or a normal data source and it filters them as the user types. With a list too big to load upfront, point it at a **search data source** and it asks the server instead.

| Property | What it does |
| --- | --- |
| **Max suggestions** | How many suggestions the dropdown shows at most. |
| **Force selection** | Only values picked from the list are allowed. Text that matches nothing is cleared when the field loses focus. |

### Searching on the server

These live in the **Search source** section of the properties sidebar.

| Property | What it does |
| --- | --- |
| **Search datasource** | The data source called while the user types. Pick it from the list of sources in the DataSources tab. |
| **Items path** | Where the array sits in the response, e.g. `data.items`. Leave it empty if the response is the array itself, or wraps it in a common key such as `items`, `data`, `results`, `rows` or `content`. |
| **Label key** | Which field of each record the user sees, e.g. `name`. Nested fields work too: `address.city`. Left empty, the element tries `label`, `name`, `title` and `text` in that order. |
| **Value key** | Which field gets stored, e.g. `id`. Leave it empty to store the **whole record** the user picked. |
| **Server result limit** | How many records the server returns at most, e.g. `100`. See below. |
| **Min search length** | How many characters the user has to type before the first request. |
| **Debounce (ms)** | How long the element waits after the last keystroke before it calls the server. The default is 1000 ms, so typing a whole word costs one request, not one per letter. |
| **Query context key** | An extra name for the typed text, if your source expects something other than `query`. |

In the data source, use `{query}` wherever the typed text should go:

```text
GET /api/cities?q={query}&limit={limit}
```

`{limit}` is the *Server result limit* (or *Max suggestions* when the limit is empty).

The records can look like anything. There is no need to reshape them into `label`/`value` pairs on the server: say which field is which with *Label key* and *Value key*, and the element does the rest.

**How the result limit saves requests.** Say the limit is 100. The user types `vil` and the server answers with 80 records. Fewer than 100 means the server had nothing more to give, so those 80 are every city that contains `vil`. When the user carries on typing `viln`, the element narrows the 80 it already has instead of asking again. If the answer had come back with 100 records, there could be more on the server, so the next letter sends a new request. Deleting letters back past the original `vil` always asks the server again. Leave the limit empty to call the server on every change (after the debounce).

**Storing the whole record.** With *Value key* empty, the form value is the full object, for example:

```json
"city": { "id": 21, "name": "Riga", "country": { "code": "LV", "name": "Latvia" } }
```

Expressions can then reach inside it, e.g. `{city.country.code}`. A reloaded form shows the right label straight away, because the label is part of the stored object. With a *Value key* set, only the key is stored (`"city": 21`), which is smaller but shows the bare id if the form is reopened later and the record is not in the latest search results. Turn on **Force selection** when storing whole records, so free typing never replaces the object with a plain string.

::: tip The older Lazy load switch
Before the search data source existed, *Lazy load* reused the element's main data source for searching. It still works for existing forms and is hidden once a search data source is chosen. For new forms use the search data source.
:::

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
