---
title: Pages & navigation
description: Multi-page views, steppers, and page-level states.
---

# Pages & navigation

A view can have one page or many. Pages appear as cards in the **Pages** tab under the canvas, each with its number, name, element count and code: click a card to switch, use **New page** to add one, drag a card to reorder (a line shows where it will land), and hover it for Duplicate and Delete. Duplicate copies the page with all of its elements.

## When to use multiple pages

- Long forms that would otherwise scroll forever.
- Step-by-step flows ("wizard") where each step must validate before the next.
- Screens with clearly separate stages: *Details → Documents → Review*.

## Navigation modes

Set in **Form settings → Navigation and actions → Moving between pages**:

| Mode | Behaviour |
| --- | --- |
| `Previous / Next buttons` | Previous and Next buttons between pages, in any order. |
| `Steps` | A numbered stepper shows all pages; people move step by step. |

With steps, a page must pass validation before the person can continue. **Next checks the page being left only**: a required field or a rule on a later step does not hold anyone on the first one, and its errors show up when they get there. **Submit** still checks the whole form, and **Validate** checks it too without submitting. Turn on **Allow step without validation** in Form settings to let people move freely.

On a phone, a stepper with more than three steps shows only the numbered markers, with *Step 2 of 5* and the current step's name below them, so the steps and the buttons under them stay on the screen. Screen readers still hear the name of every step.

## Positions

Form settings let you place navigation chrome where it suits the layout, each `Top`, `Bottom`, `Both`, or `Hidden`:

- **Page buttons**: the Previous and Next buttons.
- **Steps**: the numbered stepper.
- **Validate and Submit buttons**.

## Page states

Select a page to set page-wide states:

- **Read only**: all elements on the page display values but reject edits.
- **Disabled**: all elements on the page are inactive.

Individual elements can opt out with **Ignore parent state**, or explicitly follow the parent with **Inherit parent state**.

## Submit and validate buttons

Form settings control the built-in buttons:

- **Show validate button**: runs validation without submitting.
- **Show submit button**: validates and completes the form.
- **Show validation issues modal**: lists all validation errors in a dialog after a failed submit.

If you build your own submit button (a Button element with actions), you can hide the built-in ones.
