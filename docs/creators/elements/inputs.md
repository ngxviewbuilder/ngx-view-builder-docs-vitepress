---
title: Text & number inputs
description: Text, Textarea, Number, Number stepper, Phone input, and Slider.
---

# Text & number inputs

## Text (`text`)

Single-line free text. The default field for names, codes, and short answers.

Specific properties:

| Property | What it does |
| --- | --- |
| **Input mode** | Hints the mobile keyboard: `text`, `email`, `tel`, `url`, `numeric`, `decimal`, `search` |
| **Input mask** | Forces a format while typing: international phone, date, time, date-time, digits, or custom |
| **Custom mask pattern** | Your own pattern when mask = `custom` |
| **Autocomplete** | Browser autofill hint (`email`, `name`, `postal-code`…) |
| **Min / Max length** | Character limits |
| **Show max length counter** | Live character counter under the field |
| **Spellcheck** | Browser spellcheck on/off |

Example — a Lithuanian company code field:

- *Name*: `companyCode`, *Input mode*: `numeric`, *Max length*: `9`
- *Validators*: `pattern` = `^[0-9]{9}$`, message `Company code is 9 digits`

## Textarea (`textarea`)

Multi-line text for comments and descriptions. Supports min/max length and the length counter.

## Number (`number`)

Numeric input that stores a number (or a formatted string when configured).

| Property | What it does |
| --- | --- |
| **Use visual number format** | Locale-aware display formatting (e.g. US: `12,345.67`) — the stored value stays a clean number |
| **Format locale** | Locale override; empty = *Form settings → Locale* |
| **Min / Max fraction digits** | Digits shown after the decimal point |
| **Thousand separators** | Group digits by locale |
| **Store value as** | `number` (default) or `string` |
| **Number input alignment** | Text alignment inside the input (`left` default, or `right`) |
| **Number placeholder text** | Placeholder for the empty state |
| **Min / Max value** | Numeric bounds |

Use Number whenever the value is used in calculations — `{price} * {quantity}` works without conversion.

## Number stepper (`numberStepper`)

A number with +/− buttons. Best for small quantities (passengers, rooms, items).

## Phone input (`phoneInput`)

Phone number with country-code selection and formatting.

| Property | What it does |
| --- | --- |
| **Default country code** | Pre-selected country — useful when most users share one market (e.g. `US`, `LT`) |
| **Allowed country codes** | Restrict the selector to specific markets |
| **Enable country search** | Search box inside the country dropdown |
| **Return country ISO code** | Store the ISO code together with the number |

## Slider (`slider`)

Drag to pick a number within a range. Good for ratings and percentage-style answers where precision is not critical.

| Property | What it does |
| --- | --- |
| **Min / Max value** | The range limits |
| **Step** | Increment (e.g. `1`, `0.5`) |
| **Show value label** | Displays the current value next to the control |

## Choosing between them

| Situation | Element |
| --- | --- |
| Any free text | Text |
| Value used in math | Number |
| Quantity 0–20 | Number stepper |
| Approximate value in a known range | Slider |
| Phone number | Phone input (not Text) |
