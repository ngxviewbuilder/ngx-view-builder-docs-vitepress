---
title: Field documentation
description: Describe what each field is for and copy a ready field reference into Confluence.
---

# Field documentation

Analysts usually keep a separate document that explains each field of a form: what it means, who fills it in, where the value goes. The Documentation plugin lets you write that next to the field itself and turns it into a field reference table you can paste into Confluence.

It needs a license key in the builder settings (see [Licensing](../developers/licensing#licensed-plugins)).

## Where the text is kept

The descriptions are **not** written into the view JSON. They live in their own document, keyed by the view code and the element names, and your developer decides where it is saved (usually your server, so the whole team shares it). The view stays exactly what the runtime renders. If the save status says **Kept in this browser**, nothing is shared yet; ask your developer to connect a storage.

## Describing a field

Select an element on the canvas and open **Documentation** in the Properties panel. Write what the field means, who fills it in and where the value goes. Bold, italic, lists and links are kept; colours and fonts are left out because they would not survive a paste into Confluence. The text saves a moment after you stop typing.

Leave the text empty to take the element out of the documentation.

## The Documentation tab

The tab shows only the elements you described, each as a small table:

- the element's label, its name and where it sits ("Column of Order lines · Date picker") across the top,
- the description over both columns,
- the rows you picked, as name and value.

The counter at the top says how many elements are documented and how many are not yet. **Document an element** picks one of the rest, so you can work through them without leaving the tab.

### Adding rows

The plus button under a description adds a row to that element. There are two kinds:

- **From the logic**: Required, Logic, Validation, Data source and Events, written from the view itself, for example "When Country of registration is not US and Annual revenue (EUR) > 85000". They stay current: change the rule in the builder and the row follows.
- **Properties**: any of the element's own settings, such as the placeholder, the options or the default value, each shown with its current value.

The rows are picked per element and saved with the documentation. The cross next to a row removes it. A row whose source is gone from the view says **Not set in the view**.

### The page around it

Give the document a title and a summary of the whole form at the top. **A heading for each page** groups the elements by page.

If an element was renamed or removed, its description moves to **Descriptions without an element** at the bottom. It is not copied or downloaded; rename the element back to reuse the text, or remove it.

## Copying it out

- **Copy for Confluence** puts the whole reference on the clipboard as formatted tables. Paste it into a Confluence page (Notion, Google Docs and Word take it the same way).
- **Copy Markdown** gives the same as Markdown for Jira, GitLab or GitHub.
- The download buttons save it as an HTML page, or as the documentation file itself (JSON).

The documentation follows the builder's language, so a team that works in Lithuanian gets the headings and the rule sentences in Lithuanian too.
