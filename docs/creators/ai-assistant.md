---
title: AI assistant
description: The built-in AI chat panel. Describe changes in plain language and let AI edit the view.
---

# AI assistant

The builder has a built-in AI chat. Click the **AI** button in the builder header and the chat panel opens **in place of the properties sidebar** on the right. Click the button again to switch back to properties.

::: info Needs a backend
The AI assistant talks to an AI service configured by your developer ([setup guide](../developers/ai-chat)). If you see *"Host application has not provided AI assistant backend URL via API yet"*, the service isn't connected in your project.
:::

## What it can do

- **Edit the view for you.** Describe a change (*"add a client details panel with name, e-mail, and phone"*, *"make the comment field required when status is rejected"*) and the assistant edits the view. When the answer contains an updated structure, it is **applied to the canvas immediately**.
- **Answer questions about your form.** The assistant always receives your current structure, so it can explain what a field does or where a value comes from.
- **Generate from examples.** Attach a screenshot of a design or a document with requirements, and ask for a matching form.

The panel always sends your **current** structure with every message, so the AI never works from a stale snapshot. Anything you changed by hand is taken into account.

## Working in the chat

| Control | What it does |
| --- | --- |
| **Message box** | Type your request. **Enter** sends, **Shift+Enter** adds a new line. |
| **Model picker** | Choose which AI model answers. The list is configured by your project (by default: Gemini 2.5 Pro, Flash, and Flash Lite). Pick a stronger model for complex restructuring, a faster one for small tweaks. |
| **Attach files** | Add context to your request, see below. |
| **Status line** | Shows what the assistant is doing while it works. |
| **Code blocks** | Answers can include code/JSON fragments with a **copy** button. |

The conversation survives switching between the Builder and Preview tabs, so you can test a generated form and come back to continue the chat.

## Attachments

| Attachment | How it's used |
| --- | --- |
| **Images** (`png`, `jpg`, …) | Sent as pictures. Ideal for design mockups or screenshots to reproduce. |
| **Files** (`docx`, `txt`, `md`, `csv`, `json`, `xml`, code files…) | Attached and sent to your AI service just as they are. What gets read from each file (Word text, spreadsheets, and so on) depends on how your team set that service up. Oversized files are skipped. |

## Tips for good results

- **Be specific about names**: *"set `visibleIf` on `discountPanel` to `{clientType} == "vip"`"* beats *"hide the discount thing sometimes"*.
- **One change set per message.** Smaller requests apply more reliably than one giant redesign.
- **Check the canvas after each apply**. The change is a normal edit: if you don't like it, use **Undo** in the header.
- Mention the element type you want (*table*, *dynamic panel*, *stepper*). The assistant knows the whole [element catalog](./elements/).
