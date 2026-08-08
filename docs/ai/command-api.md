---
title: Live builder command API
description: How an agent drives an open builder directly, instead of only emitting structure JSON.
---

# Live builder command API

Everything else in this section teaches you to **write** structure JSON. This page is about the other mode: when a builder is open in a browser you can reach, you can **read and edit the live view directly**, one JSON command at a time, and see the result immediately.

## Detect the mode first

```js
typeof window.__NGX_VIEW_BUILDER_AI__ === 'object'
```

| Result | What it means | What to do |
| --- | --- | --- |
| Present, `available()` is `true` | A builder is open and the API is armed | Drive it with commands. Do not hand back raw JSON for a person to paste. |
| Present, `available()` is `false` | The global exists but the builder is not on screen | Ask the user to open the builder. |
| Absent | Runtime only host, or the host did not opt in | Fall back to authoring structure JSON as the rest of this section describes. |

The global is installed only while the builder component is mounted. It disappears when the user leaves the builder, so re-check before a long sequence.

## Bootstrap sequence

Run these four before writing anything. They cost one round trip and remove almost every source of error.

```js
const api = window.__NGX_VIEW_BUILDER_AI__;

api.available();                 // 1. is the door open
api.help();                      // 2. the command catalog, with a schema per command
api.describeElementTypes();      // 3. real element types and their real property keys
api.getTree();                   // 4. what already exists, and the row indexes you need
```

`help()` is authoritative and versioned. If it disagrees with this page, follow `help()`.

**Never guess a property name.** `describeElementTypes(type)` returns the exact keys the builder accepts for that type. Guessing produces a warning and a property the runtime ignores, which is worse than an error because it looks like it worked.

## The one write door

```js
const result = await api.execute(commandOrArray, options);
```

Hard rules:

1. **An array is atomic.** If one command fails, none are applied. Prefer one batch over a sequence of single calls, so a partial build cannot happen.
2. **Use `{ dryRun: true }` first** for anything large or destructive. It runs every check and reports `changed` without touching the view.
3. **Read `warnings`, not just `errors`.** `ok: true` with warnings means something landed that the builder does not recognise.
4. **Act on `hint`.** Errors carry a concrete correction. One retry using the hint should succeed; if it does not, stop and ask rather than looping.
5. **There is no save.** You can build and edit freely, but a person commits the view. Do not claim you saved anything, and do not try to reach a save through a trigger or an element event: automation actions have no submit or save type, and an element `submit` still needs a human click.
6. **Re-check `available()` after anything slow.** The API disarms the moment the user leaves the builder, and every command then fails with `apiClosed` while every read returns null. That is expected, not a fault.

### Result shape

```json
{
  "ok": true,
  "version": 1,
  "dryRun": false,
  "applied": 3,
  "changed": ["contact", "email", "phone"],
  "errors": [],
  "warnings": ["[2] addElement: 'select' has no registered property 'placeholder'."]
}
```

### Error codes

| Code | Meaning | Recovery |
| --- | --- | --- |
| `apiClosed` | The builder is not on screen | Ask the user to open it |
| `unknownType` | Element type does not exist | Use the `hint`, or call `describeElementTypes()` |
| `unknownElement` | No element with that name | Use the `hint`, or call `getTree()` |
| `notAContainer` | The parent cannot hold children | Pick a container from the hint list |
| `missingTab` | Tab style container needs a section | Pass `tab` |
| `nameTaken` | Name already used | Pick another, or use `updateElement` |
| `invalidName` | Name is not a valid identifier | Letters, digits, underscores, starting with a letter |
| `cycle` | The target sits inside the element being moved | Pick a different parent |

## Layout is the part that goes wrong

A view is rows, and each row holds one or more columns. **A new element gets its own row by default, so elements stack.** To place two fields side by side, name the existing `row`.

```js
await api.execute([
  { op: 'addElement', type: 'text', name: 'firstName', parent: 'contact', properties: { label: 'First name' } },
  { op: 'addElement', type: 'text', name: 'lastName',  parent: 'contact', row: 0, properties: { label: 'Last name' } },
]);
```

Row indexes come from `getTree()` or from `addRow`. Target fields are `parent`, `page`, `tab`, `index`, `row`, `column`. See [Layout model](./layout-model) for how the same tree looks as raw JSON.

**Do not set a percentage `width` on fields you want side by side.** Columns already share the row, and a fixed width fights it. Use `mobileWidth: '100%'` to make a pair stack on phones.

For a whole section at once, `insertJson` takes the elements and the nested layout together, which is usually one command instead of five:

```js
await api.execute({
  op: 'insertJson',
  root: 'contact',
  elements: {
    contact:   { type: 'panel', label: 'Contact' },
    firstName: { type: 'text', label: 'First name', required: true },
    lastName:  { type: 'text', label: 'Last name', required: true },
  },
  rows: [{ columns: [{ elementRef: 'firstName' }, { elementRef: 'lastName' }] }],
});
```

## What you can change

Mutations: `addElement`, `insertJson`, `updateElement`, `deleteElement`, `moveElement`, `renameElement`, `duplicateElement`, `addRow`, `deleteRow`, `addPage`, `deletePage`, `renamePage`, `updatePage`, `setSettings`, `setHeader`, `upsertDataSource`, `deleteDataSource`, `upsertVariable`, `deleteVariable`, `upsertTrigger`, `deleteTrigger`, `upsertRule`, `deleteRule`, `upsertFragment`, `deleteFragment`, `setProcess`, `setLocalization`, `replaceStructure`.

Actions: `switchTab`, `focusElement`, `setData`, `validate`, `setLanguage`, `setUiTranslations`, `setTheme`, `saveTemplate`, `deleteTemplate`, `saveSidebarGroup`, `deleteSidebarGroup`, `setTableSettings`, `setTableFilters`, `setRuntimeVariableContext`, `reloadDataSource`, `undo`, `redo`.

Mutations are applied to a draft in order and committed together. Actions run afterwards, in order. Call `help()` for the parameters of each.

## Checking your own work

```js
await api.execute([
  { op: 'switchTab', tab: 'preview' },
  { op: 'setData', data: { age: 25 } },
  { op: 'validate' },
]);
```

`setData` pushes values through the same pipeline as typing, so `visibleIf`, `requireIf` and computed expressions re-evaluate. `validate` returns the issues.

**Do not use `validate` to test whether a section is visible.** It runs on a fresh copy and does not apply container visibility to children, so a field inside a hidden panel is still reported as required. Read the preview instead.

Note that a mutation rebuilds the view, which clears working data. Set data after your last structural change, not before.

## Your changes are one undo step

Each `execute()` call is bracketed with a history checkpoint, so a whole batch collapses into a single undo for the user. `getAuditLog()` shows every call you made this session, which is worth reading back before you claim what you did.

## What gets checked

Element types, property names, layout targets, name collisions and cycles are checked. So are the properties whose value is structured: `options` entries need a `value`, `validators` need a known `type` (and `custom` also needs a `condition`), `events` need a known action `type`, and nested elements in `columns` or `template` need a known type and a name.

Everything else in an element body passes through untouched. That is why warnings matter: a misspelled property still lands and the runtime ignores it.

## Rules that still apply

Everything in [JSON authoring rules](./json-authoring-rules), [Element rules](./element-rules) and [Properties reference](./properties-reference) applies unchanged. The command API changes how the JSON gets in, not what valid JSON looks like.
