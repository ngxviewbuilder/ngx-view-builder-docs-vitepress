---
title: Buttons & actions
description: The Button element and how it triggers actions.
---

# Buttons & actions

## Button (`button`)

A button does nothing by itself — its behaviour comes from the **actions** you attach in the **Actions** category. One button can run several actions in order.

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
| **Icon** | Material Symbol or registered SVG icon code |
| **Icon position** | `left`, `right`, `top`, `bottom` |
| **Icon only** | Show only the icon, no text |
| **Color / Text color** | Manual color overrides (text color is handy on light backgrounds) |
| **Width / Mobile width / Fit content** | Sizing per breakpoint |

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
- Action: type `dataSource` with **Confirm enabled** — title `Delete client?`, message `This cannot be undone.`

## Conditional buttons

Buttons support logic like any element:

```text
visibleIf:  {status} == "draft"        → show only for drafts
disableIf:  !{agreeTerms}              → inactive until terms accepted
```

For the full action reference — triggers, action types, confirmations, and response handling — see [Events & actions](../events-actions).
