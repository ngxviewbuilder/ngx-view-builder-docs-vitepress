---
title: The builder workspace
description: The main areas of the NGX View Builder screen and what each one does.
---

# The builder workspace

The builder screen has four working areas:

| Area | Location | Purpose |
| --- | --- | --- |
| Elements sidebar | Left | Drag elements onto the canvas |
| Canvas | Center | The page you are building |
| Properties sidebar | Right | Configure the selected element |
| Header tabs | Top | Switch between builder modes |

![Builder workspace](/first-look/builder.png)

## Elements sidebar

Elements are grouped so you can scan them quickly:

- **Single line inputs**: text, number, date, phone, and other typed fields.
- **Choice inputs**: dropdowns, checkboxes, radios, toggles.
- **Actions**: buttons and action-style controls.
- **Containers**: panels, tabs, accordions, dialogs, splitters.
- **Content**: text, images, video, icons, badges, cards.
- **Tables**: data tables, dynamic tables, list grids.

Use the search box at the top of the sidebar to filter by name. Drag any element into a row on the canvas or into a container.

You can also save your own configured elements (or whole groups of elements) back into the sidebar as reusable library items.

## Canvas

The canvas shows the current page. Elements are placed in **rows**; each row holds one or more **columns**, and each column holds one element. Drag elements to reorder them, drop them next to each other to share a row, or drop them inside containers.

Selecting an element highlights it and opens its settings on the right. The footer below the canvas lists all pages of the view: click to switch, add, or reorder pages.

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
| Design | Width, responsive widths, colors, padding |

Only the categories relevant to the selected element are shown. See [Common properties](./properties) for the full reference.

## Header tabs

| Tab | Purpose |
| --- | --- |
| Builder | The visual editor (default) |
| Preview | Run the view exactly as end users will see it |
| JSON | Edit the raw view definition |
| Templates | Manage reusable HTML templates *(plugin)* |
| Form settings | View-wide settings: width, navigation, buttons, custom CSS |
| Translations | Translate labels and texts into other languages |
| Variables | Define runtime variables (route params, constants, computed values) |

Developers can add more tabs through plugins. If you see extra tabs, they come from plugins installed in your application.

## Undo and history

The builder tracks your edits. Use undo/redo in the header to step through recent changes before saving.
