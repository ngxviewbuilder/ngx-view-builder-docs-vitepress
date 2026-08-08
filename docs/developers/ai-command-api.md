---
title: AI command API
description: A JSON command surface that lets an external agent read and edit a view while the builder is open.
---

# AI command API

The AI command API is a design time surface that lets an agent inspect and edit the view a user is currently designing. Everything crosses the boundary as plain JSON, so the same contract works from a browser console, a Playwright script, a websocket bridge, or an MCP server, without anything Angular shaped leaking out.

It exposes one write door and a handful of read methods:

```js
window.__NGX_VIEW_BUILDER_AI__
  .version                                  // contract version, currently 1
  .available()                              // false whenever the builder is not on screen
  .help()                                   // the full command catalog, with schemas
  .describeElementTypes(type?)              // element types and their properties
  .getTree()                                // compact outline of pages and elements
  .getStructure()                           // the whole view JSON
  .getElement(name)                         // one element body
  .getElementProperty(name, propertyKey)    // one property value
  .getData()                                // current working data
  .execute(commands, options?)              // the only way to change anything
```

## When it exists

The global is installed only while `<ngx-view-builder-builder>` is mounted, and only when the host opted in. A runtime only host never grows one, no matter who calls what. Leaving the builder removes it again.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNgxViewBuilderRuntime, provideNgxViewBuilderAiApi } from 'ngx-view-builder';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgxViewBuilderRuntime(),
    provideNgxViewBuilderAiApi({ allowedOrigins: ['http://localhost:4200'] }),
  ],
});
```

| Option | Description |
| --- | --- |
| `enabled` | Default `true`. Set `false` to keep the provider registered but leave the API closed. |
| `globalKey` | Defaults to `__NGX_VIEW_BUILDER_AI__`. |
| `allowedOrigins` | When set, the global is installed only if `location.origin` is in the list, so an accidental production build refuses to arm itself. |

## The two guarantees

**It runs only while the builder is on screen.** Three things must all hold: the host registered the provider, the builder component is mounted, and the origin passes the allowlist if one is configured. Leaving the builder disarms the API and deletes the global. Disarming is what matters: deleting the global only stops future lookups, while anything that captured a reference earlier keeps a working object. A disarmed API refuses every command with `apiClosed` and every read returns `null` or empty, so a captured reference is worth nothing on a runtime page.

**It cannot save.** There is no save, publish or submit command, and none of the mutation commands reach the host's save path. `saveTemplate` and `saveSidebarGroup` write reusable builder library items, not the view.

Automation an agent writes cannot commit the view either. Triggers and rules run a deliberately narrower action set than element events: `navigate`, `dataSource`, `toast`, `dialog`, `setValue`, `setElementProperty`, `transitionProcess`, `setProcessState` and `refreshRuntimeVariables`. There is no submit and no save among them, so an agent cannot author a rule that saves on load. An element `events` entry may use `submit`, but that still needs a person to click the element.

::: warning This is a design time tool
The worst a runaway agent can do is leave unsaved edits in an open tab, which a reload undoes. Keep it out of production builds, and let a person press Save.

A trigger bound to `onLoad` does run by itself when the view is rebuilt, so an agent can cause a data source call or a navigation without a click. That is a side effect, not a commit, but it is worth knowing when reviewing what an agent wrote.
:::

## Start with help()

`help()` returns the command catalog with parameters and a worked example per command, plus the tab codes and a list of behaviour notes. An agent that calls it first does not need any of this page in its prompt.

`describeElementTypes()` is the other one worth calling before writing anything. It returns every registered type, whether it can hold children, and the real property keys for each. Without it a model guesses property names and every command comes back with an error.

```js
const api = window.__NGX_VIEW_BUILDER_AI__;
api.help().commands.length;                       // 45
api.describeElementTypes('select')[0].properties; // options, showSearch, required, ...
```

## execute()

`execute()` takes one command or an array. An array is atomic: commands are folded into a draft copy of the structure, and if any of them fails, none of them are applied.

```js
const result = await api.execute([
  { op: 'addElement', type: 'panel', name: 'contact', properties: { label: 'Contact' } },
  { op: 'addElement', type: 'text', name: 'email', parent: 'contact', properties: { label: 'Email', required: true } },
]);
```

| Option | Description |
| --- | --- |
| `dryRun` | Runs every check and reports what would change, then throws the draft away. |
| `returnStructure` | Includes the resulting view JSON in the result. |
| `returnTree` | Includes the resulting outline in the result. |

Commands come in two kinds. **Mutations** change the view and are applied to the draft in order. **Actions** do something to the running builder instead, and they run after the draft is committed, in the order they appear. `help()` labels each command with its `kind`.

### The result

Errors are data, never exceptions, because a thrown error does not survive a trip through a bridge.

```json
{
  "ok": false,
  "version": 1,
  "dryRun": false,
  "applied": 0,
  "changed": [],
  "errors": [
    {
      "index": 1,
      "op": "addElement",
      "code": "unknownType",
      "message": "Unknown element type 'txt'.",
      "hint": "Did you mean 'text'? Call describeElementTypes() for the full list."
    }
  ],
  "warnings": []
}
```

The `hint` field matters more than it looks. It is what lets an agent correct itself in one retry instead of looping.

Unknown property keys are reported as warnings rather than errors, because an element body is an open record and custom fields are legitimate. A misspelled property still lands, so read the warnings.

## Layout: rows and columns

This is the part worth understanding, because it decides whether fields stack or sit side by side.

A view is a list of rows, and each row holds one or more columns. By default a new element gets a row of its own, so elements stack. Naming an existing `row` in the target puts the element into that row instead, next to whatever is already there.

```js
await api.execute([
  { op: 'addElement', type: 'text', name: 'firstName', parent: 'contact', properties: { label: 'First name' } },
  // same row, so the two sit side by side
  { op: 'addElement', type: 'text', name: 'lastName', parent: 'contact', row: 0, properties: { label: 'Last name' } },
  // explicit position inside that row
  { op: 'addElement', type: 'text', name: 'title', parent: 'contact', row: 0, column: 0 },
]);
```

Every placement command shares the same target fields:

| Field | Description |
| --- | --- |
| `parent` | Name of a container element. Leave it out to place at page level. |
| `page` | Page name. Defaults to the first page. |
| `tab` | Required when the parent is a tab style container such as `tabs` or `accordion`. |
| `index` | Position of the new row. |
| `row` | Put the element into this existing row instead of creating one. |
| `column` | Position inside `row`. Appends when left out. |

Containers that hold children directly are `panel`, `dialog`, `splitter`, `dynamicPanel`, `emptyBlock`, `messageCard`, `statsCard` and `listGrid`. Containers that hold children per section, and therefore need a `tab`, are `tabs`, `tabsPro`, `accordion` and `progressFlow`. Targeting anything else returns a `notAContainer` error with the list.

Do not set a percentage `width` on fields you want side by side. Columns in a row already share the space, and a fixed width fights that. Use `mobileWidth: '100%'` when you want a pair to stack on narrow screens.

## Mutation commands

| Command | What it does |
| --- | --- |
| `addElement` | Creates an element and places it. Pass `name` to make the command idempotent. |
| `insertJson` | Inserts a whole subtree: elements keyed by name, which one is the root, and the layout under it. Renames colliding names unless `rename: false`. |
| `updateElement` | Patches an element body. `merge: false` replaces it instead. |
| `deleteElement` | Removes an element, its layout slot, and everything nested under it. |
| `moveElement` | Moves an element with its children to another parent, row or position. |
| `renameElement` | Renames an element and rewrites every reference to it, including expressions. |
| `duplicateElement` | Copies an element with its subtree. |
| `addRow`, `deleteRow` | Adds an empty row, or removes one. A non empty row needs `force: true`. |
| `addPage`, `deletePage`, `renamePage`, `updatePage` | Page level operations. A page carries an element entry of the same name, and these keep the two in step. |
| `setSettings`, `setHeader` | Patches view settings and the view header. |
| `upsertDataSource`, `deleteDataSource` | Data sources by name. |
| `upsertVariable`, `deleteVariable` | Runtime variables in `settings.variables`. |
| `upsertTrigger`, `deleteTrigger` | Triggers in `settings.triggers`. |
| `upsertRule`, `deleteRule` | Rules in `settings.rules`. |
| `upsertFragment`, `deleteFragment` | Fragments in `settings.fragments`. |
| `setProcess` | The process definition, or `null` to remove it. |
| `setLocalization` | Content translations for the view. |
| `replaceStructure` | Replaces the whole view JSON. |

## Action commands

| Command | What it does |
| --- | --- |
| `switchTab` | Moves the builder to another tab, preview included. |
| `focusElement` | Selects an element so its properties open in the sidebar. |
| `setData` | Sets working data. Values that belong to real elements go through the value pipeline, so expressions and conditions re-evaluate. |
| `validate` | Validates the current view against data and returns the issues. |
| `setLanguage` | Switches the active language and re-applies content translations. |
| `setUiTranslations` | Overrides built in control text such as select placeholders, per language. |
| `setTheme` | Theme mode, CSS variables, custom CSS, stylesheet urls, custom theme. |
| `saveTemplate`, `deleteTemplate` | Templates in the Templates tab. |
| `saveSidebarGroup`, `deleteSidebarGroup` | Reusable groups in the builder sidebar library. |
| `setTableSettings`, `setTableFilters` | Table column settings and filters. |
| `setRuntimeVariableContext` | External values that runtime variables can map from. |
| `reloadDataSource` | Re-runs a data source. |
| `undo`, `redo` | Steps the builder history. Warns when there is nothing to step to. |

## Two languages in one view

The structure itself holds the default language. Every other language lives in `localization.texts`, keyed by structure path.

```js
await api.execute([
  {
    op: 'setLocalization',
    defaultLanguage: 'en',
    languages: ['en', 'lt'],
    texts: {
      lt: {
        'header.label': 'Pridėti naują asmenį',
        'elements.firstName.label': 'Vardas',
        'elements.gender.options[0].label': 'Vyras',
      },
    },
  },
  {
    op: 'setUiTranslations',
    dictionaries: { lt: { 'select.placeholder': 'Pasirinkti' } },
  },
  { op: 'setLanguage', language: 'lt' },
]);
```

`setLocalization` covers the text you authored. `setUiTranslations` covers the control text the library ships, such as select placeholders and table labels.

::: warning Supply a full UI dictionary
The library ships an English UI dictionary only. Some call sites pass the translation key as their own fallback, which means a language with a partial dictionary can render raw keys instead of falling back to English. Provide the keys you need for any language you switch to.
:::

## Undo and audit

Each `execute()` call is bracketed with a history checkpoint, so a batch of twenty commands collapses into a single undo step no matter how many elements it touched. A person can revert an agent's whole change with one Ctrl+Z, and the `undo` and `redo` commands step the same history.

`getAuditLog()` returns every `execute()` call this session with its ops, outcome, applied count and the names it changed. The log is capped at 200 entries.

## What is checked, and what is not

The command layer checks the structure it can see: element types against the registry, property names against the property catalog, layout targets, name collisions, and cycles. It also checks the inside of the properties whose value is itself structured:

| Property | Checked |
| --- | --- |
| `options` | Must be an array, and every entry needs a `value`. |
| `validators` | Every entry needs a known `type`, and `custom` also needs a `condition`. |
| `events` | Every entry needs a known action `type`. |
| `columns`, `template` | Nested elements are checked for a known type, a name, and valid property names. |

Everything else in an element body passes through untouched, because the body is an open record and custom fields are legitimate. Unknown keys are reported as warnings, so read them.

## Known limits

`validate` runs on a freshly built copy of the structure and does not apply container visibility to children. A field inside a hidden panel is still reported as required, so do not use validation results to test whether a section is visible. Read the preview instead.

The exporter drops empty objects and arrays, so a command that writes `{ steps: [] }` leaves nothing behind. Write real content.

A structural change rebuilds the view and clears working data, so set data after your last mutation, not before.
