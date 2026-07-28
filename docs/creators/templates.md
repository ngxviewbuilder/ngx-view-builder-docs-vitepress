---
title: Dynamic text & templates
description: Placeholders in text, and the reusable HTML template library.
---

# Dynamic text & templates

## Dynamic text

Text-bearing properties (rich text, custom HTML, message cards, dialog titles, toast messages, set-value templates…) accept **double-brace placeholders** that render live values:

```text
Hello, {{firstName}} {{lastName}}!
Your order total is {{orderTotal}} €.
Application no. {{__variables.route.id}}
```

Placeholders re-render when the referenced values change. Inside repeaters, item context is available: <code v-pre>{{ item.name }}</code>, <code v-pre>{{ index }}</code>.

Simple logic is supported in template blocks:

```html
@if (item.status == "Active") {<span class="ok">Active</span>}
```

::: tip Single vs. double braces
`{name}` (single) is for **expressions**: logic properties, conditions, params.
<code v-pre>{{name}}</code> (double) is for **text templates**: content that renders on screen.
:::

## The template library

The **Templates** tab (plugin) manages reusable HTML templates. Define a card or option layout once, use it in any List grid, Select option template, or content block by picking its **name**, with no copy-pasting HTML between views.

A template has:

| Field                      | What it is                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                   | The identifier elements reference. Must be unique; the editor rejects duplicates.                                                             |
| **Title**                  | Human-friendly display title.                                                                                                                 |
| **Description**            | What the template is for.                                                                                                                     |
| **Tags (comma separated)** | For finding it later.                                                                                                                         |
| **HTML content**           | The markup, with <code v-pre>{{placeholders}}</code>. Required. A small **format** icon button (top-right corner of the box) tidies the HTML. |
| **CSS**                    | Styles scoped to the template, with its own **format** icon button.                                                                           |
| **Template fields**        | Declares the data fields the template expects (e.g. `jarStatus` or `status.code`) so pickers can map data onto slots.                         |

The preview panel next to the editor renders the template live against a fixed built-in sample object, so you can see card/option layouts update as you type there's nothing to configure for it.

### Storage settings

Where saved templates live (browser localStorage vs. a server-backed data source) isn't a field in this tab it's a setting your developer configures on the view. See [Templates plugin reference](../developers/plugin-templates#where-templates-are-read-from-at-runtime) for the exact settings and how host persistence to your own database works.

### Example: client card

Template `clientCard`:

```html
<div class="client-card">
  <strong>{{ item.name }}</strong>
  <span>{{ item.email }}</span>
  <span class="badge">{{ item.status }}</span>
</div>
```

```css
.client-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.client-card .badge {
  color: #0a7;
  font-size: 12px;
}
```

Then on a List grid: _Card template_ → `clientCard`. Every view using the template updates when the template is edited.

## Where templates are stored

Depending on the **Storage mode** above, templates live in browser localStorage or on a server through a data source. The host application can also supply and persist templates through its own API including saving them into your own database. Your developer configures this (see the [Templates plugin reference](../developers/plugin-templates) for the full syntax and integration details); as a creator you just save templates in the Templates tab.

## Template actions

Templates can contain clickable areas that trigger data sources (the template action map). If your project uses them, buttons inside template HTML can call server functions; ask your developer which action names are wired up.
