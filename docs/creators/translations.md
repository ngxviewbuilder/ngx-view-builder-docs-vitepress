---
title: Translations
description: "Multi-language forms in NGX View Builder: translate labels, options and messages in the Translations tab, including values that come from data."
---

# Translations

A view can serve several languages from one definition. Content texts (labels, descriptions, placeholders, messages, options) are translated in the **Translations** tab.

## How it works

1. **Form settings → Language** sets the default language.
2. The **Translations** tab lists all languages of the view. Add a language with **+**.
3. Pick a language at the top. The table lists every translatable text: the field it belongs to, the source text, and its translation in that language. Fill in the empty cells.
4. At runtime, the host application (or the language switcher) selects which language renders.

Every source text is shown in full, so you can select it and copy it. Long texts and HTML templates get a bigger box that grows with the text instead of a single line. The copy button next to a source text puts it on the clipboard, and when the translation is still empty it also fills the cell with it. For an HTML template that means you keep the markup and only change the words.

On a large view, the bar above the table helps you find things. The search box matches field names, source texts and translations, and ignores accents, so `zinute` finds *Žinutė*. **All**, **Missing** and **Translated** narrow the list, each with its count; **Missing** is the quickest way to finish a language. A row you are translating stays in the list until you change the filter, so it does not vanish after the first letter.

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
- Tabs, accordion sections, stepper and timeline steps, splitter panel titles
- Column headers of tables and dynamic tables, and the table's own texts (empty message, paging, selection)
- Chart titles and point labels, message card titles and text, HTML templates
- Fields inside an object panel or a dynamic panel
- Validation and required messages
- Page names, dialog titles, button texts

Texts an element starts with also count. A new tabs element shows *Tab 1* and *Tab 2* until you rename them, and those two are in the table like any other text, ready to translate.

Untranslated texts fall back to the default language, so the view never shows blanks.

## When the view changes

Translations stay attached to what they translate, so you can keep working on a view after you started translating it.

- **Deleting an element** removes its translations in every language. They no longer linger in the table.
- **Renaming an element** moves its translations to the new name.
- **Reordering a list** (table columns, options, tabs, steps) keeps each translation on its own item. Removing an item removes its translations.

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

- Translating early is fine: deletes, renames and reordering keep the texts in step. Still, settle the wording of the source language first, since a changed source text does not tell you which translations need a second look.
- Keep messages short; translated German/Lithuanian text is often longer than the English draft and can break tight layouts.
- Test each language in [Preview](./preview) with the language switcher.
