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

## Locale vs. language

**Language** picks the text set. **Locale** (Form settings) controls number and date formatting: `lt-LT` renders `1 234,56`, `en-US` renders `1,234.56`. Set both for a fully localised view.

## Tips

- Finish the structure first, translate last. Renaming elements after translating creates orphaned texts.
- Keep messages short; translated German/Lithuanian text is often longer than the English draft and can break tight layouts.
- Test each language in [Preview](./preview) with the language switcher.
