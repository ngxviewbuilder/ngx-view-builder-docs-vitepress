---
title: Dynamic text & templates
description: "Dynamic text with placeholders, and the reusable HTML template library in NGX View Builder: where templates are stored and how actions work."
---

# Dynamic text & templates

## Dynamic text

Two kinds of text show live values, and they use different braces.

**Text properties** (a label, a description, a placeholder, a tooltip, a button caption, a table's empty message, a tab title, a chart title) take a reference in single braces, the same way an expression does:

```text
Hello, {firstName} {lastName}!
Your order total is {orderTotal} €.
Application no. {__variables.route.id}
```

Double braces work there too, so <code v-pre>{{firstName}}</code> in a label shows the same name. Before 0.13.4 the double form left a stray brace on screen.

**HTML templates** (Custom HTML, list grid cards, option and header templates, the Templates tab) use double braces, Angular style, and add `@if`, `@for` and the rest:

```html
<strong>{{ item.name }}</strong>
@if (item.status == "Active") {<span class="ok">Active</span>}
```

Older templates written with single braces (`{pageTitle}`) still render.

::: tip Single vs. double braces
`{name}` is for **expressions** (logic properties, conditions, params) and for **text properties**.
<code v-pre>{{name}}</code> is for **HTML templates**, and is also accepted in text properties.
:::

### Where references resolve

| Field | Resolves references |
| --- | --- |
| Label, description, label tooltip, placeholder | yes |
| Button text, badge text, page and panel titles | yes |
| Table and dynamic table empty message, list grid empty message | yes |
| Tab titles (Tabs, Tabs Pro), chart title, dynamic table caption | yes |
| Time picker placeholder | yes, since 0.13.4 |
| Option labels of a Select, Radio, Checkbox group, List box | no, an option label is shown as written. Load the options from a data source when the text has to change. |
| Custom HTML, cards and other templates | yes, with <code v-pre>{{ }}</code> |

Screen reader names follow the visible text: a table caption, a chart's description and a column's cell names are read with their references filled in.

### Inside repeaters

In a dynamic panel or dynamic table a text belongs to one entry, so it can read that entry:

| Token | In a text | Means |
| --- | --- | --- |
| `{panel.fieldName}` / `{row.fieldName}` | dynamic panel / dynamic table | a field of the current entry |
| `{fieldName}` | both | the same, short form for a sibling field |
| `{index}`, `{panel.index}`, `{row.index}` | both | zero based position of the entry |
| `{el1[0].fieldName}` | anywhere | a field of a fixed entry |

A label such as `Contact #{panel.index}: {panel.name}` updates as the entry is filled in and renumbers when an entry above it is removed.

## The template library

The **Templates** tab (plugin) manages reusable HTML templates. Define a card or option layout once, use it in any List grid, Select option template, or content block by picking its **name**, with no copy-pasting HTML between views.

Pick a template in the list on the left, or add one with the **+** button. The editor has three columns: **HTML content** and **CSS** in the middle, and **Template settings** with the preview on the right.

| Field | What it is |
| --- | --- |
| **HTML content** | The markup, with <code v-pre>{{placeholders}}</code>. Required. The button in the card's corner tidies the HTML. |
| **CSS** | Styles scoped to the template, with its own format button. |
| **Name** | The identifier elements reference. Must be unique; the editor rejects duplicates. |
| **Title** | Human-friendly display title, shown in the list and in the template pickers. |
| **Preview data (JSON)** | The object the preview renders the template with, edited right under the preview. Put in a record shaped like your real data, for example `{ "name": "Harbor Foods", "status": "active" }`. It must be a valid JSON object. |

The **Preview** renders the template live as you type, against the preview data. Changes are kept as a draft until you press **Save** in **Template settings**; the editor marks unsaved changes in the meantime. Saved changes reach every element that uses the template, on the canvas, in Preview and in the exported view.

### Template fields

A template can leave its fields open with bracket slots, `row[0]`, `item['status']`, `value[2]`, so the same markup fits records with different field names. The mapping is not in this tab: select the element that uses the template (a List grid, a Select), and next to the template picker in its properties a **Template fields** list appears, one line per slot, where you say which field of the element's data fills it. A template without bracket slots has no such list.

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
