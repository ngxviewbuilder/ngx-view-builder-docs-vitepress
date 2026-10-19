---
title: Buttons & actions
description: "The Button element in NGX View Builder: run actions on click, submit or validate the form, ask for confirmation, and hide or disable a button by rule."
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
