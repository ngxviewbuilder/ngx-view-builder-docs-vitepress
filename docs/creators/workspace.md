---
title: The builder workspace
description: The main areas of the NGX View Builder screen and what each one does.
---

# The builder workspace

The builder screen has five working areas:

| Area | Location | Purpose |
| --- | --- | --- |
| Elements sidebar | Left | Add elements, or find them in the Layers tab |
| Canvas | Center | The page you are building |
| Footer | Below the canvas | Pages, data sources and variables |
| Properties sidebar | Right | Configure the selected element |
| Header | Top | Switch between builder modes, settings, undo and save |

![Builder workspace](/first-look/builder.png)

## Elements sidebar

The sidebar has two tabs. **Add** is the element library, grouped so you can scan it quickly:

- **Single line inputs**: text, number, date, phone, and other typed fields.
- **Choice inputs**: dropdowns, checkboxes, radios, toggles.
- **Actions**: buttons and action-style controls.
- **Containers**: panels, tabs, accordions, dialogs, splitters.
- **Content**: text, images, video, icons, badges, cards.
- **Tables**: data tables, dynamic tables, list grids.

Use the search box at the top to filter by name. **Double click** a tile (or select it and press Enter) to add the element right after the selected one, inside the selected container, or at the end of the page. You can also drag a tile to exactly where you want it. A single click does nothing, so a stray click never adds anything.

You can also save your own configured elements (or whole groups of elements) back into the sidebar as reusable library items.

**Layers** lists every element of the view as a tree, including the ones inside panels, tabs and other containers. Search it by label or name; clicking a row selects the element on the canvas, and hovering a row highlights it there.

## Canvas

The canvas shows the current page. Elements are placed in **rows**; each row holds one or more **columns**, and each column holds one element. Drag elements to reorder them, drop them next to each other to share a row, or drop them inside containers. While you drag, a thin line with the element's name shows where it will land, and the container it goes into gets a dashed outline. The gap between two fields is a drop target too.

Selecting an element opens its settings on the right and marks it with a small tag that shows its type and name, for example *Text input · email*. Next to the tag sit two quick actions:

| Action | Shortcut | What it does |
| --- | --- | --- |
| Duplicate | Ctrl+D | Copies the element right after it. The copy keeps the label and gets the next free name (`email` becomes `email2`). |
| Delete | Del | Removes the element. Undo brings it back. |

An element inside a panel or another container also gets a **Select parent** button there. Right click an element for the full menu. A selected **page** has the same tag, and its Duplicate copies the page with all of its elements.

A view with no pages yet starts with a short start screen: begin from a blank page or from one of the quick start elements.

New elements are named after their type (`text1`, `dynamicTable2`). As long as you have not changed the name yourself, it follows the label: type *First name* as the label and the name becomes `firstName`.

When an AI client works on the view through [AI access](../ai/), its new elements come onto the canvas one by one, and a small status chip at the bottom of the canvas says what it is doing: reading the view, checking changes, or building with a count.

## Footer

The footer below the canvas has three tabs:

- **Pages**: every page of the view as a card with its number, name, element count and code. Click a card to open the page, drag it to reorder (a line shows where it will land), and use Duplicate or Delete when you hover it. **New page** adds one. See [Pages](./pages).
- **Data sources**: where the view loads data from. See [Data sources](./data-sources).
- **Variables**: values the view keeps while it runs. See [Variables](./variables).

## Properties sidebar

Every property of the selected element lives here, organised into categories:

| Category | What it holds |
| --- | --- |
| General | Name, label, placeholder, description, tooltips |
| Data | Data source bindings and request parameters |
| Options | Choice lists for select-style elements |
| Columns | Column schema for tables |
| Restrictions | Required, disabled, read-only, hidden, length limits |
| Validators | Required message and extra validation rules |
| Logic | `visibleIf`, `disableIf`, `requireIf`, expressions, default value |
| Actions | Events that run actions (navigate, load data, toast…) |
| Design | Width, responsive widths, colors, spacing |

Only the categories relevant to the selected element are shown. On/off properties are switches, and padding and margin use one compact control: a horizontal and a vertical value, or each side on its own when you turn on **Each side**. See [Common properties](./properties) for the full reference.

With nothing selected, the sidebar shows how to add, find and edit elements.

## Header

| Tab | Purpose |
| --- | --- |
| Builder | The visual editor (default) |
| Preview | Run the view exactly as end users will see it |
| JSON Editor | Edit the raw view definition |
| Templates | Manage reusable HTML templates *(plugin)* |

The buttons on the right are undo and redo, **Form settings** (the gear: width, navigation, buttons, custom CSS, AI access), **Translations**, and **Save**.

Developers can add more tabs through plugins. If you see extra tabs, they come from plugins installed in your application.

## Undo and history

The builder tracks your edits. Use undo and redo in the header to step through recent changes before saving; Ctrl+S saves. A change an AI client made in one go, even when it arrived in several parts, undoes in one step.
