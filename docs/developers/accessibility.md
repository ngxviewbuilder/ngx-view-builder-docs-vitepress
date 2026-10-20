---
title: Accessibility and languages
description: "How the builder and the views it renders handle accessibility (WCAG 2.2 AA checks, keyboard, screen readers, contrast) and languages (UI dictionaries, content translations, locale)."
---

# Accessibility and languages

A view built with NGX View Builder ends up in front of your users, so the runtime has to work for people who use a keyboard, a screen reader, zoom or high contrast, and for people who read another language than yours. The builder is held to the same bar, because the people designing views need it too.

## What we check

Since 0.16.3 every release is checked with [axe-core](https://github.com/dequelabs/axe-core) against the WCAG 2.2 A and AA rules, in the light and the dark theme:

- **The builder:** the canvas with and without a selected element, Preview, the JSON editor, Layers, Templates, Logic map, Documentation, the API tab and the Form settings dialog.
- **The runtime:** a demo form and every screen of the six example views on [ngxviewbuilder.io](https://ngxviewbuilder.io/#examples): accounting, travel booking, a CRM, a clinic intake, a logistics board and an HR app. Between them they use tables, dynamic tables, dynamic panels, charts, stats cards, badges, the navigation menu and every kind of input.

All of them pass with no violations. Automated checks find a large share of accessibility problems, but not all of them: they cannot tell whether a label makes sense or whether a flow is easy to follow with a screen reader. We have not run a full manual audit with assistive technology yet, so treat this as a strong baseline rather than a formal conformance statement.

## What the runtime does for you

- **Labels and descriptions.** Every input is tied to its label, and the description and error message are announced with it (`aria-describedby`, `aria-invalid`, `aria-errormessage`). A select, date picker or date range button is named by its label together with the value it shows, so "Start date, 12/03/2027" is read out instead of just the label.
- **Fields without a visible label**, such as the cells of a dynamic table, name themselves after their label text, so a screen reader still knows which column it is in.
- **Keyboard.** Every control is a native button, link or input, or carries the matching role, and shows a focus ring. Menus, selects and date pickers open and close from the keyboard.
- **Contrast.** Text and status colours come from the theme tokens and meet 4.5:1 in both the light and the dark theme, including badges, table statuses and stats card trends.
- **Target size.** Small icon buttons, such as clearing a select, are at least 24 by 24 pixels, as WCAG 2.2 asks.
- **Motion.** Animations are short, and a reduced motion setting in the operating system turns them off.

## What stays with you

The runtime cannot know what your content means, so a few things are up to whoever builds the view:

- **Write labels that say what to enter.** A field labelled "Field 1" passes every automated check and still helps nobody.
- **Keep your own colours readable.** Design tokens and custom CSS can lower contrast below 4.5:1. If you build a dark theme with your own palette, read the scale the other way round, as the built-in dark theme does: low steps are the dark tints behind things, high steps the light colours that text uses on a dark surface. See [Theming](./theming).
- **Custom HTML is your HTML.** Give images an `alt` text, use headings in order and keep a class name unique inside the element.
- **Set the page language** on your own page (`<html lang="...">`), so screen readers pronounce the content right.

To check a view of your own, run the [axe DevTools](https://www.deque.com/axe/devtools/) browser extension on it, or add axe-core to your end-to-end tests next to the stable test ids described in [E2E testing](./e2e-testing).

## Languages

There are two kinds of text in a view, and both can be translated:

| Text | Examples | How to translate |
| --- | --- | --- |
| **Interface text** | the builder's tabs and panels, the runtime's buttons, screen reader announcements, validation messages | UI dictionaries, see [UI translations](./ui-translations) |
| **Content** | the labels, options and messages a creator writes into a view | the [Translations tab](../creators/translations) in the builder |

The library ships a complete English dictionary as `EN_UI_DICTIONARY`. Every interface text of the builder and the runtime, screen reader texts included, is in it, so a translation that starts from a copy of it covers everything. The commercial plugins export their own English dictionaries the same way.

Numbers, dates and currency follow the view's locale, separately from its language: a view can speak English and still show `1.234,50 €` and `31.12.2026`. See [Locale vs. language](../creators/translations#locale-vs-language).

Right-to-left scripts are supported in the rich text editor. Full right-to-left layouts for whole views are not supported yet.
