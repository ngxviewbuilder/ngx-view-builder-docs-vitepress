---
title: Translations
description: Multi-language views with the Translations tab.
---

# Translations

A view can serve several languages from one definition. Content texts (labels, descriptions, placeholders, messages, options) are translated in the **Translations** tab.

## How it works

1. **Form settings → Language** sets the default language.
2. The **Translations** tab lists all languages of the view. Add a language with **+**.
3. The tab shows every translatable text in a table: one row per text, one column per language. Fill in the empty cells.
4. At runtime, the host application (or the language switcher) selects which language renders.

The texts live in the view definition under `localization`:

```json
"localization": {
  "defaultLanguage": "lt",
  "languages": ["lt", "en"],
  "texts": {
    "en": { "elements.firstName.label": "First name" }
  }
}
```

## What gets translated

- Element labels, descriptions, placeholders, tooltips
- Option labels of choice elements
- Validation and required messages
- Page names, dialog titles, button texts

Untranslated texts fall back to the default language, so the view never shows blanks.

## Translating values that come from data

The Translations tab only sees texts written into the view. A status arriving from an API (`BUG`, `QUESTION`, `FEATURE`) is data, so it is never listed there, yet it still has to read properly in every language.

Put the raw value in the dictionary as its own key and wrap the token in `translate()`:

```json
"texts": {
  "en": { "BUG": "Bug", "QUESTION": "Question", "FEATURE": "Feature" },
  "lt": { "BUG": "Klaida", "QUESTION": "Klausimas", "FEATURE": "Funkcija" }
}
```

```text
translate({row.status})
```

Two things worth knowing. A `values.` prefix is checked as well, so `values.BUG` keeps these keys apart from element paths if you prefer that. And when the key is missing, the original value is shown unchanged, which means adding a new status to the backend never leaves an empty cell.

It works anywhere an expression does, most usefully in a table's Badge or text cell. Pass a second argument for a different fallback, `translate({row.status}, "Unknown")`, and read the active language with `currentLanguage()`.

For a Select or Radio you usually want [`getLabel()`](./functions#labels-of-choice-elements) instead, since the option list already holds the translated label.

## Locale vs. language

**Language** picks the text set. **Locale** (Form settings) controls number and date formatting: `lt-LT` renders `1 234,56`, `en-US` renders `1,234.56`. Set both for a fully localised view.

## Tips

- Finish the structure first, translate last. Renaming elements after translating creates orphaned texts.
- Keep messages short; translated German/Lithuanian text is often longer than the English draft and can break tight layouts.
- Test each language in [Preview](./preview) with the language switcher.
