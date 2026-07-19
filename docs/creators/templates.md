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
`{name}` (single) is for **expressions** — logic properties, conditions, params.
<code v-pre>{{name}}</code> (double) is for **text templates** — content that renders on screen.
:::

## The template library

The **Templates** tab (plugin) manages reusable HTML templates. Define a card or option layout once, use it in any List grid, Select option template, or content block by picking its **name** — no copy-pasting HTML between views.

A template has:

| Field | What it is |
| --- | --- |
| **Name** | The identifier elements reference. Must be unique — the editor rejects duplicates. |
| **Title** | Human-friendly display title. |
| **Description** | What the template is for. |
| **Tags (comma separated)** | For finding it later. |
| **HTML content** | The markup, with <code v-pre>{{placeholders}}</code>. Required. A **Format template** button tidies the HTML. |
| **CSS** | Styles scoped to the template, with its own **Format CSS** button. |
| **Template fields** | Declares the data fields the template expects (e.g. `jarStatus` or `status.code`) so pickers can map data onto slots. |
| **Preview JSON object** | Sample data used to preview the template inside the editor — edit and format it via *Edit preview JSON*. Must be a JSON object (or array for list-style templates). |

### Storage settings

At the top of the tab, **Storage mode** decides where saved templates live:

| Field | What it does |
| --- | --- |
| **Storage mode** | `Local storage` (browser) or `Data source` (server). |
| **Local storage key** | The browser key when local mode is used. |
| **Data source name** | The source that loads/saves templates in data-source mode. |
| **Templates path (optional)** | Where the template array lives in the source response. |
| **Load from data source** | Re-fetches templates from the source. |

### Example — client card

Template `clientCard`:

```html
<div class="client-card">
  <strong>{{ item.name }}</strong>
  <span>{{ item.email }}</span>
  <span class="badge">{{ item.status }}</span>
</div>
```

```css
.client-card { display: flex; flex-direction: column; gap: 4px;
  padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
.client-card .badge { color: #0a7; font-size: 12px; }
```

Then on a List grid: *Card template* → `clientCard`. Every view using the template updates when the template is edited.

## Where templates are stored

Depending on the **Storage mode** above, templates live in browser localStorage or on a server through a data source. The host application can also supply and persist templates through its own API. Your developer configures this; as a creator you just save templates in the Templates tab.

## Template actions

Templates can contain clickable areas that trigger data sources (the template action map). If your project uses them, buttons inside template HTML can call server functions — ask your developer which action names are wired up.
