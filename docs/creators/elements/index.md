---
title: Elements overview
description: The full element catalogue, grouped by purpose.
---

# Elements overview

Elements are the building blocks of every view. This page is the index — each group has its own page with per-element details.

## Which element do I need?

| I need… | Use | Group |
| --- | --- | --- |
| A short text answer | Text | [Text & number inputs](./inputs) |
| A long text answer | Textarea | [Text & number inputs](./inputs) |
| A number | Number, Number stepper, Slider | [Text & number inputs](./inputs) |
| A phone number | Phone input | [Text & number inputs](./inputs) |
| A date | Datepicker | [Date & time](./date-time) |
| A period (from–to) | Date range | [Date & time](./date-time) |
| A time | Time picker | [Date & time](./date-time) |
| One choice from a list | Select, Radio, Select button | [Choice inputs](./choices) |
| Many choices from a list | Multi-select, Checkbox group, List box | [Choice inputs](./choices) |
| Yes/no | Single checkbox, Toggle switch | [Choice inputs](./choices) |
| Search-as-you-type choice | Autocomplete | [Choice inputs](./choices) |
| A clickable action | Button | [Buttons & actions](./buttons) |
| Group fields visually | Panel, Tabs, Accordion | [Containers](./containers) |
| Repeatable entries (0–n) | Dynamic panel, Dynamic table | [Containers](./containers) / [Tables](./tables) |
| A modal window | Dialog | [Containers](./containers) |
| Read-only data rows | Table | [Tables & lists](./tables) |
| Card-style records | List grid | [Tables & lists](./tables) |
| Formatted text / HTML | Rich text, Custom HTML | [Content & media](./content) |
| Pictures / video / embeds | Image, Video, Iframe | [Content & media](./content) |
| A chart | Chart | [Content & media](./content) |
| Status labels & KPIs | Badge, Stats card, Message card | [Feedback & status](./feedback) |
| Progress indication | Progress bar, Progress flow | [Feedback & status](./feedback) |
| File attachments | File upload | [Special inputs](./special) |
| A handwritten signature | Signature pad | [Special inputs](./special) |

## Value-producing vs. presentational

**Value-producing elements** (inputs, choices, editable tables) write into the form data under their `name`. **Presentational elements** (text, image, divider, badge…) only display; they add nothing to the submitted data.

## Every element shares

Regardless of type, elements share the [common properties](../properties): name, label, responsive widths, restrictions, logic conditions, validators (for inputs), and events. The group pages only describe what is *specific* to each element.
