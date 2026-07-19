---
title: Pages & navigation
description: Multi-page views, steppers, and page-level states.
---

# Pages & navigation

A view can have one page or many. Pages appear in the footer strip under the canvas — click to switch, use **+** to add, drag to reorder.

## When to use multiple pages

- Long forms that would otherwise scroll forever.
- Step-by-step flows ("wizard") where each step must validate before the next.
- Screens with clearly separate stages: *Details → Documents → Review*.

## Navigation modes

Set in **Form settings → Page navigation mode**:

| Mode | Behaviour |
| --- | --- |
| `default` | Previous / Next buttons between pages |
| `stepper` | A visual stepper shows all pages; users move step by step |

By default a page must pass validation before the user can continue. Turn on **Allow step without validation** in Form settings to let users move freely.

## Positions

Form settings let you place navigation chrome where it suits the layout:

- **Page navigation position** — `top`, `bottom`, `both`, or `none`.
- **Stepper position** — where the step indicator renders.
- **Action buttons position** — where Validate/Submit buttons render.

## Page states

Select a page to set page-wide states:

- **Read only** — all elements on the page display values but reject edits.
- **Disabled** — all elements on the page are inactive.

Individual elements can opt out with **Ignore parent state**, or explicitly follow the parent with **Inherit parent state**.

## Submit and validate buttons

Form settings control the built-in buttons:

- **Show validate button** — runs validation without submitting.
- **Show submit button** — validates and completes the form.
- **Show validation issues modal** — lists all validation errors in a dialog after a failed submit.

If you build your own submit button (a Button element with actions), you can hide the built-in ones.
