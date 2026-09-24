---
title: Form settings
description: Every field of the Settings tab, from status and language to width, header, navigation, buttons, dialog mode, and AI access.
---

# Form settings

The **Settings** tab holds everything that applies to the whole view rather than one element. It has four groups: **General**, **Form header**, **Navigation and actions**, and **Rendering and dialog**. A fifth one, **AI access (MCP)**, shows up when your developers connected the builder to an MCP server.

## General

| Setting | What it does |
| --- | --- |
| **Status** | `Default` (editable) or `Read only`. A read-only view displays values but blocks editing everywhere. Individual elements can opt out with *Inherit parent state*. |
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
| **Logo URL or base64** | Image source: a URL or an inline base64 data URI. |
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
| **Render mode** | `Page` (normal, in the document flow) or `Dialog`, where the whole view opens as a modal. |
| **Dialog header title** / **Dialog header description** | Modal header texts. |
| **Dialog width** + **Dialog width unit** | Modal width (e.g. `720` + `px`, or `90` + `%`). |
| **Dialog max width** / **Dialog max height** | Upper bounds (e.g. `90vh`). |
| **Dialog padding** | Inner padding of the modal content. |
| **Dialog font size** | Base font size inside the modal. |
| **Show close button** | Adds an X to the modal header. |
| **Close button actions** | Actions to run when the close button is pressed (same editor as [Events & actions](./events-actions)), e.g. confirm unsaved changes, notify the host. |
| **Dialog footer actions** | Buttons rendered in the modal footer, each a full action definition. |
| **Dialog footer alignment** | `Left`, `Center`, or `Right`. |

Dialog mode is useful when a developer embeds the view as a popup (e.g. "New client" from a table toolbar). The host is notified through `onDialogClosed` when it closes.

## AI access (MCP)

This group lets an AI assistant such as Claude work in the builder with you: add fields, set up logic, fix a layout, while you watch the canvas change. It is only there if your developers set it up (see [MCP bridge](../developers/ai-command-api#connecting-the-builder)).

| Field | What it is |
| --- | --- |
| **Status** | Whether the builder reached the MCP server, and which AI clients are connected right now. |
| **Server URL** | The address you add to your AI client once. |
| **Session key** | A key like `NVB-K990-RPNH-N2T7` that belongs to this browser tab. **Copy** puts it on the clipboard. |
| **New key** | Disconnects every AI client and gives the tab a fresh key. |

### Connecting Claude

1. Copy the **Server URL** and add it to Claude as a connector. In Claude this is *Settings → Connectors → Add custom connector*. You only do this once; the same URL serves every builder tab.
2. Ask Claude to do something in the builder, for example *"add a contact section with name, email and phone"*.
3. Claude asks for your session key. Copy it from this group and paste it into the chat.
4. A message appears in the builder saying the AI client is connected, and the status shows its name. From here on Claude works directly on the view you have open.

Typing mistakes in the key are forgiven: lower case, spaces or missing dashes all work.

### Good to know

- **Claude cannot save.** It edits the view in your tab. Nothing is stored until you press Save yourself, and every batch of its changes is a single undo step, so Ctrl+Z takes back a whole change at once.
- **Reloading the page keeps the connection.** The key stays the same for as long as the tab is open, so you do not have to pair again after a refresh.
- **A new tab gets a new key.** If you open the builder in another tab and want Claude to work there, give it that tab's key.
- **To cut access, press New key.** Every connected client loses access immediately. Closing the tab does the same.
- Treat the key like a password for as long as the tab is open: whoever has it can edit that view.
