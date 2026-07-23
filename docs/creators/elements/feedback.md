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

A highlighted box with icon, title, and text, for inline notices ("Your application is being reviewed").

| Property | What it does |
| --- | --- |
| **Title / Description text** | The heading and extended content. |
| **Variant** | `info`, `success`, `warning`, `error`. |
| **Show icon / Icon** | The leading icon. |
| **Dismissible** | The user can close the card manually. |
| **Primary / Secondary button text** | Optional CTA buttons (wire them with [actions](../events-actions)). |

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
