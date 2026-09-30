---
title: "AI: Good practices for building views"
description: How an AI agent builds NGX View Builder views that look finished and behave right. Captions and labels per element, buttons and contrast, layout, names, fields, logic, tables and a final checklist.
---

# AI: Good practices for building views

The other AI pages say what is **valid**. This page says what is **good**: the choices a careful designer makes so the view looks finished the first time the person sees it, and does not need a second round of fixes. Every rule here comes from a view that looked wrong or behaved wrong until it was followed.

Read it before the first change. Over MCP, `nvb_execute` does not accept a batch until this page and the other required pages were read on the connection.

## How to work

1. **Look before you build.** Call `getTree()` (MCP: `nvb_get_tree`) first. Extend what is there; never rebuild a view the user only asked to change.
2. **One request, one batch.** Send everything a request needs in one `execute()` call. It is atomic, so a failure leaves nothing half built, and the person can undo it in one step.
3. **Dry run large batches** with `dryRun: true`, fix what it reports, then send it for real.
4. **Check the result.** After a batch, read the returned tree (or `getTree()`) and confirm the elements are where you meant them: in the right container, in the right order, side by side where you wanted a row.
5. **Do not save.** Saving is the person's decision. Build, check, then stop and describe what you did.

## When to ask, and when to decide

When you work in a live builder, the person is right there. A short question costs them a few seconds; a view built on a wrong guess costs them a round of fixes. So when you are genuinely unsure about something that changes what they get, ask before you build it.

**Ask when** the choice changes how the view looks or behaves and the request does not settle it:

- **Which control for a choice**: a `radio` list with every option visible, a compact `select`, a `selectButton` row, or `autocomplete` for a long list; one answer or several (`checkbox`, `multiSelect`).
- **Which kind of table**: rows people edit (`dynamicTable`), data shown from a server with paging and search (`table`), or a repeating block of fields (`dynamicPanel`).
- **One page or steps**: a single form with sections, or a multi-step flow.
- **What is required**, and what happens on submit (a toast, a data source call, navigation).
- **Where the data comes from**: fixed options, or a data source, and which one.
- **Anything you would have to invent**: option lists, labels in another language, business rules, limits.

**Decide yourself, and say what you chose,** when a good practice already answers it or the change is easy to undo: labels in plain words, side-by-side short fields, button tones, required messages, names, layout details. Asking about every detail is as unhelpful as guessing the important ones.

**How to ask:**

- One short message, before the batch that depends on it, with every open question together, not one at a time.
- Offer concrete options and your recommendation: *"For Client type I would use a radio list, since there are only two options and both stay visible. Or should it be a dropdown?"*
- Build everything that does not depend on the answer while you wait, if the person agrees, and leave the open parts out rather than filling them with a guess.
- Once the person has answered, follow the answer, including in later requests of the same conversation.

## Captions and labels

Every element sits in a wrapper that draws a **label row** above it whenever `label` is not empty. For input fields that row is the field's caption. For elements that show their own text (a button, a card, a picture) it is a second, redundant caption in bold, and it is the most common reason an AI-built view looks unfinished.

**Rule: a visible word belongs to exactly one property, and it is the one the element is built to show.**

| Element | Visible text goes in | `label` |
| --- | --- | --- |
| `text`, `number`, `textarea`, `select`, `radio`, `datepicker` and every other input | `label`, in plain words: "Company code" | the field caption |
| `button` | `text` | `""` |
| `badge` | `text` | `""` |
| `statsCard` | `title` (the metric name) and `valueText` | `""` |
| `messageCard` | `title` and `descriptionText` | `""` |
| `pageTitle` | `title` and `subtitle` | `""` |
| `image` | `alt` (always) and optionally `caption` | `""` |
| `chart` | its `title` | `""` |
| `divider`, `spacer`, `emptyBlock`, `customHtml`, `richTextViewer`, `video`, `iframe`, `progressBar`, `avatar`, `icon`, `breadcrumbs` | their own content | `""` |
| `singleCheckbox` | the statement next to the box in `checkboxLabel`: "I agree to the terms" | `""`, or a question when the box answers it |
| `toggleSwitch` | `label` for what it switches, `trueLabel` / `falseLabel` for the states | the caption |
| `panel`, `dynamicPanel` | `label` is the panel heading | `""` when the panel only groups fields |
| `page` | `label` is the page title | `""` hides the title |

Since 0.10.6, `addElement` without a label already leaves these display elements without one, turns a button's `label` into its `text`, and gives a named field a readable label (`companyCode` becomes "Company code"). Older builders do not, so set the properties yourself either way.

```json
{ "op": "addElement", "type": "statsCard", "name": "revenue", "properties": { "label": "", "title": "Revenue this month", "valueText": "€48,200" } }
```

Other caption rules:

- **Write labels for people**, in sentence case and the language of the view: "Delivery date", not `deliveryDate`, "DELIVERY DATE" or "Delivery Date".
- **Never show a technical name.** A label equal to the element's `name` (`el3`, `customerEmail`) means the label was forgotten.
- `placeholder` is an example of the answer ("name@company.com"), not a second label. `description` is for help that does not fit the label. Do not repeat the label in either.

## Buttons

- The caption is `text`; `label` is `""`. A caption left in `label` is drawn twice: once as a field caption above the button, once on the button.
- **One primary action per area**: `variant: "solid"`, `tone: "primary"`. Secondary actions next to it are `variant: "outline"` with `tone: "neutral"`. A destructive action is `tone: "risk"`.
- **A dark fill needs light text.** A solid button with a dark tone (`primary`, `success`, `info`, `risk`) or a dark custom `color` gets `textColor: "var(--nvb-color-neutral-000)"`. Before 0.10.6 some host stylesheets left the caption dark on dark; setting it explicitly is correct on every version. A light fill (`warning`, or a light custom `color`) gets dark text, `"var(--nvb-color-neutral-900)"`.
- **Button bars go in an `emptyBlock`**, not in a panel row: `contentDisplay: "grid"`, `gridTemplateColumns: "max-content max-content"`, a `contentJustify` and a `contentGap`. Flex does not line them up, because every row inside the block is full width.
- A button does something. Give it `events` (a `submit`, a `validate`, a data source call, a toast), or leave it out.

```json
{
  "type": "button",
  "name": "register",
  "label": "",
  "text": "Register",
  "variant": "solid",
  "tone": "primary",
  "textColor": "var(--nvb-color-neutral-000)",
  "events": [{ "trigger": "click", "type": "submit", "validateForm": true }]
}
```

## Color and contrast

- Use the theme's tokens, `var(--nvb-color-primary-600)`, `var(--nvb-color-neutral-100)`, `var(--nvb-color-risk-500)` and so on, rather than hex values. The view then follows the host's theme and dark mode.
- Text on a filled surface always contrasts with it: light text on a dark fill, dark text on a light fill. Check every place you set a background (`color` on a button, `panelBackgroundColor` on a block).
- Use tones for meaning, not decoration: `success` for done, `warning` for attention, `risk` for errors and destructive actions, `info` for neutral notes.

## Layout

- Follow the [layout model](./layout-model): children of a container live in the column that references it, never inside the element definition.
- **Put related short fields side by side**: first and last name, city and postcode, start and end date. Two or three fields per row on desktop; long text fields get a row of their own.
- **Leave widths off for even splits.** Columns without a width share the row. For an uneven pair give one element a `%` width and leave the other without one; two `%` widths that add up to 100% wrap, because `%` ignores the gap.
- **Give every side-by-side field `mobileWidth: "100%"`** so the row stacks on a phone.
- **Align with `emptyBlock`** (grid, flex, gap, padding, background). Do not fake alignment with `customHtml`, spacer stacks or extra panels.
- **Pages are steps, not sections.** A single form with sections is one page with panels or headings. Several pages only when the person should move through steps.
- A dashboard or display page is not a form: set `showValidateButton: false` and `showSubmitButton: false` in `settings` so the Validate and Submit toolbar does not appear.

## Names

- `name` is the data key the application receives. Make it meaningful camelCase: `companyCode`, `deliveryDate`, `invoiceLines`. Never leave `el1`, `el2`.
- Names are stable. Renaming a field changes the data the host receives and breaks every expression that uses it; use `renameElement`, which updates the references, and only when asked.
- Inside an `objectPanel` or `dynamicPanel`, child names only need to be unique inside that panel; address them by their path (`billing.city`).

## Fields

- **Required means it**: set `required: true` together with a `requiredMessage` in plain words ("Enter your e-mail address"). A conditional requirement is `requireIf`, not a validator.
- Check formats with validators (`email`, `pattern`, `minLength`, `min`, `max`) and give each a message that tells the person what to fix.
- **Pick the choice control by the number of options**: two to four short options, `radio` or `selectButton` (all visible, one click); more, `select`; a long or server-backed list, `autocomplete`; several answers, `checkbox` or `multiSelect`; a yes/no, `singleCheckbox` or `toggleSwitch`.
- Option `value`s are stable codes (`company`, `person`); option `label`s are what people read.
- Pre-fill with `defaultValue`, not `value`.
- Use the specific element for the data: `datepicker` for dates, `number` for amounts, `phoneInput` for phone numbers, `fileUpload` for files. A `text` field loses validation and formatting the specific one gives for free.

## Logic

- Conditions reference fields by `name` in braces: `{clientType} == "company"`.
- Logic that must react while the person is typing or choosing needs `logicExecutionMode: "onChange"` on the element that carries it; the default waits for blur.
- A field hidden by `visibleIf` usually should not keep its value: set `resetOnHide`, or a `resetIf` with the same condition.
- An `expression` computes a value from *other* fields. It never reads its own field.
- Show or hide a whole group by putting `visibleIf` on its panel, not on every field inside it.

## Tables and repeating data

- `dynamicTable` for rows the person edits, `table` for data shown from a data source, `dynamicPanel` for a repeating block of several fields per entry.
- A status, badge, toggle or button in a `table` column is a hosted element (`type: "element"` with `elementType`), not HTML in a template.
- Limit rows with `maxRows`, or conditionally with `disallowAddRowsIf`; protect some rows from deletion with `disallowDeleteRowsIf` (`{row.status} == "approved"`), rather than locking the whole table.
- A `dynamicPanel` defines its children in its `template` map and lays them out in `column.rows`.

## Text and content

- One language per view, the view's language, including placeholders, messages and button captions.
- Examples and sample data use neutral, international names and places (Sam Carter, Harbor Foods, Amsterdam).
- Short, specific wording: "Save order", not "Submit"; "Enter your e-mail address", not "Invalid input".

## Final checklist

Before you report back, check that:

1. No label shows a technical name, and no display element (button, badge, card, image, divider, chart) has a label row.
2. Every button has its caption in `text`, `label: ""`, an action in `events`, and readable text on its fill.
3. Related short fields share rows, and side-by-side fields stack on mobile.
4. Every name is meaningful camelCase; no `el1` is left.
5. Required fields have a `requiredMessage`; validators have messages.
6. Live logic has `logicExecutionMode: "onChange"`, and hidden fields do not keep stale values.
7. Colors are theme tokens, and text contrasts with every fill.
8. Every choice you were unsure about was asked, not guessed, and the choices you made yourself are named in your summary.
9. Nothing was saved, and the person was told what changed.
