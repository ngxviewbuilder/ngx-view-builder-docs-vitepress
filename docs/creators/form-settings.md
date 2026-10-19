---
title: Form settings
description: Every field of the Settings tab, from status and language to width, header, navigation, buttons, dialog mode, and AI access.
---

# Form settings

The **Settings** tab holds everything that applies to the whole view rather than one element. It has seven groups: **Layout**, **Language and formats**, **Behaviour**, **Form header**, **Navigation and actions**, **Rendering and dialog**, and **AI access (MCP)**. The list on the left jumps to each one.

## Layout

| Setting | What it does |
| --- | --- |
| **Form width** + **Form width unit** | Maximum content width of the rendered view (`px` or `%`). |
| **Element spacing** | The gap between fields, in px. |
| **Content padding** | The space inside the form frame, in px. |
| **No content padding** | The form touches the edges of the page it sits in. |
| **Breakpoints** (*Tablet*, *Mobile*) | Below these widths the view switches to the tablet and the mobile layout, so fields use their *Tablet width* and *Mobile width*. |

## Language and formats

| Setting | What it does |
| --- | --- |
| **Languages** | The languages the view can be shown in. Pick one from **Add a language…** and press **Add language**; remove one with the × next to it. The language marked *source* cannot be removed. Texts for the others are translated in the [Translations](./translations) tab. |
| **Source language** | The language you type the texts in here, in the builder. |
| **Shown in** | The language the canvas and Preview show right now, so you can check a translation without leaving the builder. |
| **Number and date format** | The locale for numbers, dates and currency: the decimal separator, the date order and so on. Number fields, date pickers and table totals follow it. |

## Behaviour

| Setting | What it does |
| --- | --- |
| **Editing** | `Editable`: people fill in the form, and single fields can still be locked. `Read only`: every field shows its value but cannot be changed. Individual elements can opt out with *Inherit parent state*. |

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
| **Moving between pages** | `Steps`: numbered steps, and a step is checked before the next one opens. `Previous / Next buttons`: pages in any order. |
| **Page buttons** | Where the Previous and Next buttons render: `Top`, `Bottom`, `Both`, or `Hidden`. |
| **Steps** | Where the numbered steps render: `Top`, `Bottom`, `Both`, or `Hidden`. |
| **Validate and Submit buttons** | Where Validate and Submit render: `Top`, `Bottom`, `Both`, or `Hidden`. |
| **Allow step without validation** | People may move to the next step even when the current one has errors. |
| **Show validate button** | The built-in Validate button: checks the whole form without submitting. |
| **Show submit button** | The built-in Submit button (fires completion with data + validation result). |
| **Show validation issues modal** | After a failed check, a dialog lists every validation issue with links to the fields. |
| **Show table of contents** | Renders a contents panel for long views. |

See [Pages & navigation](./pages).

## Rendering and dialog

| Setting | What it does |
| --- | --- |
| **Shown as** | `Page`: a framed form inside the host page. `Dialog`: a window over the host page, with its own header and buttons. `Canvas (full width, no frame)`: for web pages (see [Web pages with Canvas](./layout#web-pages-with-canvas)). |
| **Dialog header title** / **Dialog header description** | Modal header texts. They can show field values: `Order {orderNo}` reads *Order A-1042* and updates when the field changes. |
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

This group lets an AI client such as Claude work in the builder with you: add fields, set up logic, fix a layout, while you watch the canvas change. There is no chat inside the builder; you talk to the AI in your own AI app, and it drives the builder over MCP. AI access is included with an active designer license, at no extra cost.

If nothing is connected yet, the group has one button, **Connect**. It links this tab to our hosted MCP server. The button only shows when the builder has a genuine license key that has not expired; otherwise the group tells you what is missing (no key, a key that is not valid, or a license that ran out). Your developers can also point the builder at an MCP server of their own (see [MCP bridge](../developers/ai-command-api#connecting-the-builder)), in which case it connects without the button.

Once connected, the group shows:

| Field | What it is |
| --- | --- |
| **Status** | Whether the builder reached the MCP server, and which AI clients are connected right now. |
| **Server URL** | The address you add to your AI client once. |
| **Session key** | A key like `NVB-K990-RPNH-N2T7` that belongs to this browser tab. **Copy** puts it on the clipboard. It only appears once the server has accepted your license. |
| **New key** | Disconnects every AI client and gives the tab a fresh key. |
| **Disconnect** | Closes the connection. Press **Connect** to open it again. |

### Connecting Claude

1. Press **Connect**, then copy the **Server URL** and add it to Claude as a connector. In Claude this is *Settings → Connectors → Add custom connector*. You only do this once; the same URL serves every builder tab.
2. Ask Claude to do something in the builder, for example *"add a contact section with name, email and phone"*.
3. Claude asks for your session key. Copy it from this group and paste it into the chat.
4. A message appears in the builder saying the AI client is connected, and the header shows an **AI connected** badge with the client's name. While Claude is making changes the badge reads **AI is editing…** and its dot pulses. Clicking the badge brings you back to this group.

From here on Claude works directly on the view you have open. It can also see which element you have selected, so *"make this field required"* works.

Typing mistakes in the key are forgiven: lower case, spaces or missing dashes all work.

### Good to know

- **Claude cannot save.** It edits the view in your tab. Nothing is stored until you press Save yourself, and every batch of its changes is a single undo step, so Ctrl+Z takes back a whole change at once.
- **Reloading the page keeps the connection.** The key stays the same for as long as the tab is open, so you do not have to pair again after a refresh.
- **A key lasts 24 hours.** After that the tab gets a new one on its own and Claude asks for it again.
- **Seats are shared by your team.** A license lets as many browsers use AI access at once as it has seats, and all your tabs in one browser count once. If every seat is taken, this group tells you so and connects by itself as soon as a colleague disconnects.
- **The license is checked while you work.** If it is revoked or runs out, the connection closes and this group says why.
- **A new tab gets a new key.** If you open the builder in another tab and want Claude to work there, give it that tab's key.
- **To cut access, press New key.** Every connected client loses access immediately. Closing the tab does the same.
- Treat the key like a password for as long as the tab is open: whoever has it can edit that view.
- **Nothing you build is stored on our side.** The MCP server only passes Claude's requests to your builder tab and the answers back. It keeps no copy of your views or data and does not log them. [More about what the server keeps](../developers/ai-command-api#what-the-mcp-server-keeps).
