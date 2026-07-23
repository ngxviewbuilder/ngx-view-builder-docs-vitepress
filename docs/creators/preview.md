---
title: Preview & testing
description: Test the view like an end user before handing it off.
---

# Preview & testing

The **Preview** tab runs the view with the real runtime engine, the same code end users get. Nothing is simulated: logic, validation, data sources, and actions all execute for real.

## Viewports

Switch between **desktop / tablet / mobile** widths to verify responsive settings (Width / Tablet width / Mobile width). Fix layout issues before publishing, not after.

## What to test

Work through this list on every view:

- **Empty submit**: required messages appear, the issues modal (if enabled) lists them all.
- **Conditional paths**: flip every field referenced by a `visibleIf`/`requireIf` and watch dependent sections appear, become required, and reset.
- **Wrong input**: invalid email, out-of-range numbers, bad patterns; every validator shows its own message.
- **Long values**: a 200-character name, a long option label; layout should not break.
- **Data sources**: dropdowns fill, dependent lists reload, tables page and search.
- **Actions**: buttons navigate, save, confirm, and toast as configured.
- **Languages**: switch each configured language; check for missing translations and overflowing texts.
- **All viewports**: especially multi-column rows on mobile.

## Inspecting the data

Preview shows the live form data as you type (the same object the application will receive). Verify that:

- every value lands under the expected key (element `name`),
- hidden-and-reset fields don't leave stale values behind,
- calculated fields produce the right numbers.

## Debugging expressions

If a rule doesn't fire, wrap the suspect part in `dbg()` and watch the browser console:

```text
visibleIf: dbg({clientType}, "clientType") == "company"
```

Common causes: a typo in the element name inside `{braces}`, comparing a number with a quoted string (`{amount} == "100"`), or referencing a field inside a repeater without `row.`/`panel.` context.
