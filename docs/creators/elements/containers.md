---
title: Containers
description: Panel, Tabs, Accordion, Dynamic panel, Dialog, Splitter, Spacer, and Divider — with full property tables.
---

# Containers

Containers hold other elements. Most produce no data themselves — the exceptions are **Dynamic panel** (an array of entries) and **Tabs** (whose active tab can be read in expressions).

## Panel (`panel`)

A titled box that groups related fields.

| Property | What it does |
| --- | --- |
| **Label / Description** | Panel heading and sub-text. **Hide header** removes the heading row. |
| **Background color** | Panel surface color (e.g. `#ffffff`). **Remove background** disables it entirely. |
| **Border style / color / width** | `solid`, `dashed`, `dotted`, `double`; color like `#d9dce3`; thickness like `1px`. **Borderless** removes the border. |
| **Radius** | Corner radius (e.g. `12px`). |
| **Shadow** | CSS shadow (e.g. `0 8px 24px rgba(0,0,0,.12)`). |
| **Padding / Mobile padding** | Inner spacing per breakpoint (e.g. `12px` or `1rem`). |
| **Min height / Max height / Height / Fit content** | Sizing; content past *Max height* scrolls (see *Overflow*). |
| **Overflow** | `visible`, `auto`, `hidden`, `scroll`, `clip`. |
| **Opacity / Backdrop filter** | Transparency and glass-style effects. |
| **Background image (+ position, size, repeat, overlay color, blend mode)** | Full image-background support for hero panels and cards. |
| **Content display** | How children lay out: `flex` or `grid`. |
| **Flex direction / Content gap / Content justify / Content align / Content wrap / Align content / Row & column gap** | Flex composition of the children. |
| **Grid columns / Grid rows / Grid auto rows** | Grid composition, e.g. `repeat(2, minmax(0, 1fr))`, `minmax(120px, auto)`. |

A panel's `visibleIf` hides the whole group at once — usually cleaner than hiding fields one by one. Disabling or making a panel read-only cascades to children (children can opt out by turning off **Inherit parent state**).

## Tabs (`tabs`) and Tabs Pro (`tabsPro`)

Horizontal tabs, each with its own rows of elements. Tabs Pro adds richer header styling.

| Property | What it does |
| --- | --- |
| **Tabs** | The tab list — `value` is the tab ID, `label` the name, `visibleIf` hides a tab conditionally. |
| **Tabs data path** | Load the tab list dynamically from data or a source response. |
| **Active tab data path** | Data path that stores/controls the active tab from outside. |
| **Tabs position** | Headers on `top` or at the sides (left/right). |
| **Tabs variant** | Visual style: underline, pills… |
| **Full width tabs** | Tab buttons fill the row in equal blocks. |
| **Open first** | First tab opens automatically. |
| **Lazy content** | Tab content renders only when the user opens it. |
| **Tab template / Tab template ref** | Fully custom tab header markup — inline or from the [template library](../templates). |

The active tab is available to expressions:

```text
{myTabs.selectedTab}          → active tab name
{myTabs.selectedTabIndex}     → active tab index
```

Example: show a hint only on the second tab — `visibleIf: {myTabs.selectedTabIndex} == 1`.

## Accordion (`accordion`)

Vertically stacked collapsible sections. Good for optional/advanced settings that most users skip.

| Property | What it does |
| --- | --- |
| **Items** | The section list. |
| **Open first** | First section opens automatically. |
| **Allow multiple** | Several sections may stay open at once. |
| **Item template / Item template ref** | Custom section-header markup. |

## Dynamic panel (`dynamicPanel`)

A repeatable group. You design the fields once; users add, remove, and reorder entries. The value is an **array of objects**:

```json
"addresses": [
  { "city": "Vilnius", "street": "Gedimino pr. 1" },
  { "city": "Kaunas",  "street": "Laisvės al. 10" }
]
```

| Property | What it does |
| --- | --- |
| **Add row button text / Remove row button text** | Button captions. |
| **Disallow adding / deleting rows** | Lock the entry count. |
| **Max rows** | Upper limit — the add button disables at the limit. |
| **Confirm row deletion** (+ title, message, button texts) | Ask before removing an entry. |
| **Empty state text** | Shown when the panel has no entries. |

Inside a dynamic panel, expressions get extra context:

| Token | Meaning |
| --- | --- |
| `panel.fieldName` | A field in the *same* entry |
| `panel.index` | This entry's position (0-based) |
| `parentIndex` | Index of the surrounding repeater when nested |

Example — inside each address entry: `visibleIf: panel.country == "LT"`.

Aggregate over all entries from outside the panel: `sumInArray({orderLines}, "amount")`.

## Dialog (`dialog`)

A modal window designed in the builder like a normal container. It stays hidden until opened by an action or condition:

1. Add a Dialog element, give it a *Name* (e.g. `confirmDialog`) and content.
2. On any button add an action: type `dialog`, dialog name `confirmDialog`, operation `open` (also `close`, `toggle`).

| Property | What it does |
| --- | --- |
| **Dialog mode** | `modal`, `draggable`, or `fullscreen`. |
| **Dialog width / height / max width / max height** | Sizing (e.g. `720px`, `90%`, `90vh`). |
| **Title heading level** | `h1`–`h3` for the dialog title. |
| **Show close button** | X in the header. |
| **Close on backdrop** | Clicking outside closes the dialog. |
| **Initially open** | Open by default when the view loads. |
| **Open if** | Expression that opens the dialog while true. |
| **Open data path** | A boolean data path that controls opening — set it from actions or the host app. |
| **Show trigger button** | A built-in button that opens the dialog. |
| **Trigger text / icon / icon position / icon only / variant / color / text color / width / mobile width / alignment** | Full styling of that trigger button. |

Use dialogs for confirmations, quick sub-forms, and detail previews.

## Splitter (`splitter`)

Two or more resizable side-by-side areas. Useful for list-detail layouts.

| Property | What it does |
| --- | --- |
| **Orientation** | `horizontal` or `vertical`. |
| **Panels** | The panel list — each `value` is the panel key and content identifier. |
| **Show panel headers** | A header for each panel. |
| **Allow resize** | Users drag the handle to resize. |
| **Gutter size** | Gap/handle size in pixels. |
| **Min panel size** | Minimum panel size as a percentage. |
| **Stateful** + **State key** | Persist panel sizes in localStorage under an optional custom key. |

## Spacer (`spacer`) and Divider (`divider`)

Pure layout elements.

| Property | What it does |
| --- | --- |
| **Axis** | Which direction the element occupies (vertical/horizontal). |
| **Height** (Spacer) | The gap size. |
| **Thickness** (Divider) | Line thickness. |
