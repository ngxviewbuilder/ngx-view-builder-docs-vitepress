---
title: AI assistant
description: The built-in AI chat panel — describe changes in plain language and let AI edit the view.
---

# AI assistant

The builder has a built-in AI chat. Click the **AI** button in the builder header — the chat panel opens **in place of the properties sidebar** on the right. Click the button again to switch back to properties.

::: info Needs a backend
The AI assistant talks to an AI service configured by your developer ([setup guide](../developers/ai-chat)). If you see *"Host application has not provided AI assistant backend URL via API yet"*, the service isn't connected in your project.
:::

## What it can do

- **Edit the view for you.** Describe a change — *"add a client details panel with name, e-mail, and phone"*, *"make the comment field required when status is rejected"* — and the assistant edits the view. When the answer contains an updated structure, it is **applied to the canvas immediately**.
- **Answer questions about your form** — the assistant always receives your current structure, so it can explain what a field does or where a value comes from.
- **Generate from examples** — attach a screenshot of a design or a document with requirements, and ask for a matching form.

The panel always sends your **current** structure with every message, so the AI never works from a stale snapshot — anything you changed by hand is taken into account.

## Working in the chat

| Control | What it does |
| --- | --- |
| **Message box** | Type your request. **Enter** sends, **Shift+Enter** adds a new line. |
| **Model picker** | Choose which AI model answers. The list is configured by your project (by default: Gemini 2.5 Pro, Flash, and Flash Lite). Pick a stronger model for complex restructuring, a faster one for small tweaks. |
| **Attach files** | Add context to your request — see below. |
| **Status line** | Shows what the assistant is doing while it works. |
| **Code blocks** | Answers can include code/JSON fragments with a **copy** button. |

The conversation survives switching between the Builder and Preview tabs — you can test a generated form and come back to continue the chat.

## Attachments

| Attachment | How it's used |
| --- | --- |
| **Images** (`png`, `jpg`, …) | Sent as pictures — perfect for design mockups or screenshots to reproduce. |
| **Text files** (`txt`, `md`, `csv`, `json`, `xml`, `yaml`, code files…) | Content is read and passed to the AI. Very large files are truncated. |
| **Word documents** (`.docx`) | Text is extracted and passed along. Old `.doc` files aren't supported — save as `.docx` or `.txt` first. |

## Tips for good results

- **Be specific about names**: *"set `visibleIf` on `discountPanel` to `{clientType} == "vip"`"* beats *"hide the discount thing sometimes"*.
- **One change set per message** — smaller requests apply more reliably than one giant redesign.
- **Check the canvas after each apply**. The change is a normal edit: if you don't like it, use **Undo** in the header.
- Mention the element type you want (*table*, *dynamic panel*, *stepper*) — the assistant knows the whole [element catalog](./elements/).
