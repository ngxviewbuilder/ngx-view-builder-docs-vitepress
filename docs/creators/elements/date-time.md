---
title: Date & time inputs
description: Datepicker, Date range, and Time picker, with full property tables.
---

# Date & time inputs

## Date picker (`datepicker`)

A calendar picker that stores a single date, a date-time, or a time.

| Property | What it does |
| --- | --- |
| **Picker mode** | `date` only, `date + time`, or `time` only. |
| **Output format** | Storage format, e.g. `YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss`, `HH:mm`. Empty = the mode's default. |
| **Min value (optional) / Max value (optional)** | Limit the selectable range with fixed dates or expressions. |
| **Include seconds** | Allows seconds in time/datetime modes. |

Common patterns:

```text
Default value:  today()
Min value:      today()                 → only future dates
```

To validate "delivery within 30 days", add a custom validator (the condition describes the **error**):

```text
Condition: dateDiffDays(today(), {deliveryDate}) > 30
Message:   "Delivery must be within 30 days"
```

## Date range (`dateRange`)

Two connected calendars that store a from/to pair. Use for booking periods, report filters, vacations.

The value is an object with a start and end date; expressions can reference the parts through the element name.

## Time picker (`timePicker`)

Selects a time of day. Combine a Datepicker and a Time picker when you need both, or use a Text element with the `dateTime` input mask for one-field entry.

## Working with dates in expressions

The expression language has ready-made date functions ([full list](../functions)):

| Function | Example |
| --- | --- |
| `today()` / `now()` | `Default value: today()` |
| `addDays(date, n)` | `addDays(today(), 14)` |
| `dateDiffDays(from, to)` | `dateDiffDays({startDate}, {endDate}) > 0` |
| `isWeekend(date)` | `visibleIf: isWeekend({deliveryDate})` |
| `weekDay(date)` | Display the weekday name |

Example: validate that the end date follows the start date. On `endDate` add a custom validator whose condition flags the **error**:

```text
dateDiffDays({startDate}, {endDate}) < 1
```

with the message `End date must be after start date`.
