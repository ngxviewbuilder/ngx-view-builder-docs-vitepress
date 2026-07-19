---
title: Form settings
description: Every field of the Settings tab — status, language, width, header, navigation, buttons, and dialog mode.
---

# Form settings

The **Settings** tab holds everything that applies to the whole view rather than one element. It has four groups: **General**, **Form header**, **Navigation and actions**, and **Rendering and dialog**.

## General

| Setting | What it does |
| --- | --- |
| **Status** | `Default` (editable) or `Read only` — a read-only view displays values but blocks editing everywhere. Individual elements can opt out with *Inherit parent state*. |
| **Current language** | The content language shown right now in the builder and preview. |
| **Default language** | The language the view starts in at runtime. |
| **Supported languages (comma separated)** | Languages the view offers, e.g. `en, lt, de`. Texts for them are managed in the [Translations](./translations) tab. |
| **Locale** | Number/date formatting locale (e.g. `lt-LT`, `en-US`). Used by number formatting, date pickers, and table totals. |
| **Form width** + **Form width unit** | Maximum content width of the rendered view (`px` or `%`). |
| **Element spacing** | Vertical gap between element rows. |

## Form header

The optional header block rendered above the first page.

| Setting | What it does |
| --- | --- |
| **Show logo** | Toggles the logo. |
| **Logo URL or base64** | Image source — a URL or an inline base64 data URI. |
| **Upload logo file as base64** (*Add file*) | Pick a local file; it is embedded into the view JSON as base64. A **logo preview** is shown below. |
| **Logo alignment** | `Left`, `Center`, or `Right`. |
| **Show title** + **Title text** | The header heading. |
| **Show description** + **Description text** | Additional text under the title. |

## Navigation and actions

| Setting | What it does |
| --- | --- |
| **Page navigation mode** | `Default` (Prev/Next buttons) or `Stepper` (numbered steps). |
| **Page navigation position** | Where the Prev/Next controls render: `Top`, `Bottom`, `Both`, or `None`. |
| **Stepper position** | Where the stepper renders when stepper mode is on. |
| **Action buttons position** | Where Validate/Submit render: `Top`, `Bottom`, `Both`, or `None`. |
| **Allow step without validation** | Users may move between steps/pages even when the current page is invalid. |
| **Show submit button** | The built-in Submit button (fires completion with data + validation result). |
| **Show validate button** | The built-in Validate button (checks without submitting). |
| **Show table of contents** | Renders a contents panel for long views. |
| **Show validation issues modal** | After a failed submit, shows a dialog listing every validation issue with links to the fields. |

See [Pages & navigation](./pages).

## Rendering and dialog

| Setting | What it does |
| --- | --- |
| **Render mode** | `Page` (normal, in the document flow) or `Dialog` — the whole view opens as a modal. |
| **Dialog header title** / **Dialog header description** | Modal header texts. |
| **Dialog width** + **Dialog width unit** | Modal width (e.g. `720` + `px`, or `90` + `%`). |
| **Dialog max width** / **Dialog max height** | Upper bounds (e.g. `90vh`). |
| **Dialog padding** | Inner padding of the modal content. |
| **Dialog font size** | Base font size inside the modal. |
| **Show close button** | Adds an X to the modal header. |
| **Close button actions** | Actions to run when the close button is pressed (same editor as [Events & actions](./events-actions)) — e.g. confirm unsaved changes, notify the host. |
| **Dialog footer actions** | Buttons rendered in the modal footer, each a full action definition. |
| **Dialog footer alignment** | `Left`, `Center`, or `Right`. |

Dialog mode is useful when a developer embeds the view as a popup (e.g. "New client" from a table toolbar). The host is notified through `onDialogClosed` when it closes.
