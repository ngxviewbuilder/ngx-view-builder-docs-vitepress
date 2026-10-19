---
title: Buttons & actions
description: "Button and Navigation menu in NGX View Builder: run actions on click, submit or validate a form, and build a sidebar menu from static or server items."
---

# Buttons & actions

<YouTubeVideo id="14FR8gc8DoQ" />

## Button (`button`)

A button does nothing by itself. Its behaviour comes from the **actions** you attach in the **Actions** category. One button can run several actions in order.

### Content properties

| Property | What it does |
| --- | --- |
| **Text** | The visible caption |
| **Badge** | A small counter/label next to the caption |
| **Loading mode** | Shows a spinner instead of the icon (usually driven by logic) |

### Design properties

| Property | What it does |
| --- | --- |
| **Variant** | `solid`, `outline`, `text` |
| **Size** | `small`, `normal`, `large` |
| **Tone** | `primary`, `neutral`, `success`, `info`, `warning`, `risk` |
| **Icon only** | Shows the icon alone in a square button. Works with every variant: a solid, an outline or a text icon button |
| **Icon** | Click the preview to pick an icon: search, your application's own icons first, then the built-in ones. You can also type a name, or paste SVG markup under **Custom SVG** for a one-off icon. A name that does not exist is flagged, because it would show a question mark |
| **Icon position** | `left`, `right`, `top`, `bottom` |
| **Icon size** | In px. Left empty, the icon follows the button size: 16, 18 or 20 px. An icon-only button grows with a larger icon |
| **Icon color** | Colors the icon alone, for example a red bin on a neutral button |
| **Color / Text color** | Manual color overrides (text color is handy on light backgrounds) |
| **Width / Mobile width / Fit content** | Sizing per breakpoint |

### Icon buttons

For a toolbar of small actions (edit, copy, delete), turn on **Icon only** and keep the caption in **Text**, for example *Delete row*. The caption is not drawn, but screen readers read it and it shows as a tooltip when the mouse rests on the button. Leaving **Text** empty works too, but then the button has no name people can hear.

### Dropdown actions

The **Dropdown actions** property turns the button into a menu: each entry is its own action with a label and icon. Use it for secondary operations (*Export*, *Duplicate*, *Delete*).

## Typical buttons

**Submit button**

- Action: trigger `click`, **Validate form** on, type `dataSource` → your save endpoint.
- After success: `showToastAfter` with a success message, or a `navigate` action to a confirmation page.

**Cancel button**

- Variant `text`, tone `neutral`.
- Action: type `navigate` to the previous page, with **Confirm on dirty** enabled so unsaved changes prompt the user.

**Delete button**

- Tone `risk`.
- Action: type `dataSource` with **Confirm enabled**, title `Delete client?`, message `This cannot be undone.`

## Conditional buttons

Buttons support logic like any element:

```text
visibleIf:  {status} == "draft"        → show only for drafts
disableIf:  !{agreeTerms}              → inactive until terms accepted
```

For the full action reference (triggers, action types, confirmations, and response handling) see [Events & actions](../events-actions).

## Navigation menu (`navMenu`)

A menu of app routes: a sidebar when vertical, a top bar when horizontal. The link for the page the user is on is marked active, and each link can carry an icon and a badge such as the number of open tasks.

| Property | What it does |
| --- | --- |
| **Menu items** | The items, in order. Each is a **Link**, a small **Heading** above a group, or a **Divider**. |
| **Data source** / **Items path** | Menu items from a server, shown next to the typed ones. See below. |
| **Server items position** | Whether the server items go after the typed items (the default) or before them. |
| **Orientation** | `Vertical (sidebar)` or `Horizontal (top bar)`. |
| **Show icons** | Draws each link's icon. |

A link has these fields:

| Field | What it does |
| --- | --- |
| **Label** | The link text. |
| **Route or url** | An app route such as `/contacts`, or a full url. App routes open through the host application's router, without reloading the page. |
| **Icon** | An icon name, for example `dashboard` or `group`. |
| **Badge** | Short text after the label, usually a count: `{openTasks}`. A badge that comes out empty or `0` is not shown. |
| **Visible if** | Shows the item only while the condition is true: `{role} == "admin"`. Works on headings too. |
| **Active only on this exact url** | Normally `/contacts` is also active on `/contacts/42`. Turn this on for a link such as `/` or an overview page that should not light up for everything under it. |

### Sub-links

A link can hold sub-links: under **Sub-links** in its card, add one per page. The link then opens and closes its group instead of navigating, and shows an arrow. Sub-links have a label, a route, a badge and a **Visible if**, but no icon, so they line up under the text of their group.

In a sidebar a group opens by itself when the page the user is on is one of its sub-links, and the group's own label is highlighted. In a top bar a group opens as a dropdown, which closes again on the next click elsewhere or after navigating. One level of sub-links is supported.

### Items from the server

When the menu depends on who is signed in, let the server send it. Bind a data source to the menu: its answer, or the list at **Items path** inside it, becomes more menu items. The typed items stay, so a fixed *Overview* link and a *Settings* link can sit around whatever the server adds.

The server sends the same fields a typed link has. It may also use `title` or `name` for the label, and `url`, `path` or `href` for the route, so an existing endpoint often fits as it is:

```json
{
  "items": [
    { "kind": "heading", "label": "Sales" },
    { "title": "Pipeline", "url": "/deals", "icon": "dashboard", "badge": "{openDeals}" },
    { "title": "Billing", "url": "/billing", "icon": "settings", "visibleIf": "{role} == 'admin'" },
    { "title": "Reports", "icon": "dashboard", "children": [
      { "title": "Monthly", "url": "/reports/monthly" },
      { "title": "Yearly", "url": "/reports/yearly" }
    ] }
  ]
}
```

Server items can carry their own `visibleIf` and badge expressions; they are worked out on the page like typed ones. Hiding a link is not access control, though: the routes behind it still have to check permissions on the server.

On the builder canvas the links do not navigate, so clicking one just selects the menu. Click actions under **Events** run instead of the navigation, with the clicked item in `{item.label}` and `{item.route}`.
