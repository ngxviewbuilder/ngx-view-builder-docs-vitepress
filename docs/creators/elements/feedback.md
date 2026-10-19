---
title: Feedback & status
description: Badge, Message card, Toast, Stats card, Progress bar, and Stepper/Timeline, with full property tables.
---

# Feedback & status

## Badge (`badge`)

A small colored label: `Active`, `Draft`, `Overdue`.

| Property | What it does |
| --- | --- |
| **Text** | The label. |
| **Tone** | Semantic shade: `info`, `success`, `warning`, `risk`, `neutral`. |
| **Pill** | Fully rounded corners. |
| **Variant expression / Icon expression** | Drive the look from data, e.g. value `overdue` → risk tone. |
| **Link URL** | Make the badge clickable. |

## Message card (`messageCard`)

A box with an icon, a title and a description, for inline notices ("Your trial ends in 3 days"), hints next to a field, or a row of feature cards.

| Property | What it does |
| --- | --- |
| **Title / Description text** | The heading and the text under it. Line breaks you type in the description are kept. Both start on the same left edge. |
| **Buttons** | Small buttons under the text. Each click action with a label becomes one, and runs its actions when pressed. One or two work best: the first is drawn as the main action in the message's colour, the rest as quiet outlined buttons, unless you set a style on the action yourself (filled, outlined or text). |
| **Appearance** | `Soft banner` (a tinted box, the default), `Card (icon above)` (a white card with the icon in a tile above the title, good for feature lists and empty states) or `Accent line` (just a coloured line on the left, for a hint inside a form). |
| **Buttons position** | `Under the text`, or `Beside the text`: on the right of a wide message, falling back under the text when it gets narrow. |
| **Variant** | The colour: `info`, `primary`, `success`, `warn`, `risk` or `neutral`. With **Variant mode: Conditional** the colour follows rules instead. |
| **Show icon / Icon** | The leading icon; each variant has a sensible default. |
| **Dismissible** | Adds a close button. Closing it also runs click actions with the `dismiss` reason in `{action}`. |

Combine with `visibleIf` to show it only in the relevant state:

```text
visibleIf: {status} == "rejected"
```

## Toast (`toast`)

A temporary notification. Usually you don't place this element, because toasts are shown by [actions](../events-actions) (`showToastAfter` or a `toast` action). Place a Toast element only when you need a persistent, configured message area.

| Property | What it does |
| --- | --- |
| **Title / Description text** | The message. |
| **Variant / Position** | Type and screen corner. |
| **Auto hide** + **Auto hide timeout (ms)** | Self-dismissal, e.g. `4000`. |

## Stats card (`statsCard`)

A KPI tile: big number, label, and optional trend. Feed the value with an expression or a data source. Great in dashboard rows.

| Property | What it does |
| --- | --- |
| **Value text** | The primary displayed value. Expression example: `countInArray({orders}, "id")`. |
| **Trend direction** | `up`, `down`, or `neutral`. |
| **Trend text** | Short change explanation next to the indicator. |
| **Trend direction expression / Variant expression / Icon expression** | Drive trend, tone, and icon from data. |

## Progress bar (`progressBar`)

A completion indicator. Value 0-100 from a fixed number or expression:

```text
Expression: len({completedSteps}) / 5 * 100
```

| Property | What it does |
| --- | --- |
| **Display type** | Horizontal bar or circular indicator. |
| **Value label mode** | Show a percentage, the raw value, or `current/max`. |

## Stepper / Timeline (`progressFlow`)

Step indicator with named stages (*Submitted → Reviewed → Approved*).

Each item in the **Items** list has:

| Item field | What it does |
| --- | --- |
| **Step / Label / Description** | The stage identity and texts. |
| **Visible if** | Hide a stage conditionally. |
| **Active if / Completed if / Disabled if** | Conditions driving each state, e.g. `{el1} == 1` or `{score} > 80`. |

Element-level properties:

| Property | What it does |
| --- | --- |
| **Active index** | Default active step. |
| **Active step expression** | Calculate the active step from data, for business conditions across several fields. |
| **Active step data path** | Read the active index from external state. |
| **Steps data path** | Load the step list from data or a source response (`data.steps`). |
| **Show numbers / Show connector** | Numbering and the connecting line. |
| **Allow manual navigation** | Users can click between steps themselves. |
| **Step template / Step template ref** | Fully custom step markup, inline or from the [template library](../templates). |

The current step is readable in expressions:

```text
{approvalFlow.selectedStep}        → active step name
{approvalFlow.selectedStepIndex}   → active step index
```

Example: `visibleIf: {approvalFlow.selectedStep} == "Approved"` on a download button.
