---
title: Live builder command API
description: How an agent drives an open builder directly, instead of only emitting structure JSON.
---

# Live builder command API

Everything else in this section teaches you to **write** structure JSON. This page is about the other mode: when a builder is open in a browser you can reach, you can **read and edit the live view directly**, one JSON command at a time, and see the result immediately.

## Detect the mode first

The live mode arrives as an MCP server. If your client has the `nvb_*` tools, call `nvb_status`.

| Result | What it means | What to do |
| --- | --- | --- |
| `paired` and `builder_attached` are `true` | A builder is open and the API is armed | Drive it with commands. Do not hand back raw JSON for a person to paste. |
| `builder_attached` is `false` | The tab is connected but the builder is not on screen | Ask the user to open the builder. |
| `browser_connected` is `false` | The paired tab was closed or lost its socket | Ask the user to reopen the builder and re-pair. |
| An error mentioning a pair code | Nothing is paired yet | Ask the user for the code shown in the builder's AI panel. |
| No `nvb_*` tools at all | Runtime only host, or no MCP server configured | Fall back to authoring structure JSON as the rest of this section describes. |

The bridge is open only while the builder component is mounted. It closes when the user leaves the builder, so re-check before a long sequence.

## Bootstrap sequence

Run these before writing anything. They cost one round trip and remove almost every source of error.

```text
nvb_status                    1. is the door open
nvb_get_instructions          2. the contract as text, plus the command catalog
nvb_describe_element_types    3. real element types and their real property keys
nvb_get_tree                  4. what already exists, and the row indexes you need
```

`nvb_get_instructions` is the fastest way in: it states what the API is, the working order, the rules, the capabilities this builder has, and the templates already in the library. It returns `help()` in the same call, so `help.guidelines` carries the rules on their own and `help.capabilities` tells you which optional features are present.

`help()` is authoritative and versioned. If it disagrees with this page, follow `help()`.

**Never guess a property name.** `describeElementTypes(type)` returns the exact keys the builder accepts for that type. Guessing produces a warning and a property the runtime ignores, which is worse than an error because it looks like it worked.

## The one write door

```js
const result = await api.execute(commandOrArray, options);
```

Over MCP that is `nvb_execute`, with the array under `commands` and the options as flat
arguments (`dry_run`, `return_tree`, `return_structure`). The snippets below show the command
shapes, which are the same either way.

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
| `capabilityMissing` | The command needs a feature pack this builder does not have | Build without it, per the hint |
| `unknownTemplate` | No template with that name | Call `describeTemplates()`, or create it with `upsertTemplate` |

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

Mutations: `addElement`, `insertJson`, `upsertTemplate`, `useTemplate`, `updateElement`, `deleteElement`, `moveElement`, `renameElement`, `duplicateElement`, `addRow`, `deleteRow`, `addPage`, `deletePage`, `renamePage`, `updatePage`, `setSettings`, `setHeader`, `upsertDataSource`, `deleteDataSource`, `upsertVariable`, `deleteVariable`, `upsertTrigger`, `deleteTrigger`, `upsertRule`, `deleteRule`, `upsertFragment`, `deleteFragment`, `setProcess`, `setLocalization`, `replaceStructure`.

Actions: `switchTab`, `focusElement`, `setData`, `validate`, `setLanguage`, `setUiTranslations`, `setTheme`, `saveTemplate`, `deleteTemplate`, `saveSidebarGroup`, `deleteSidebarGroup`, `setTableSettings`, `setTableFilters`, `setRuntimeVariableContext`, `reloadDataSource`, `undo`, `redo`.

Mutations are applied to a draft in order and committed together. Actions run afterwards, in order. Call `help()` for the parameters of each.

## Reuse before you invent

Two habits save most of the rework.

**Pick the element type that already does the job.** Call `describeElementTypes()` and choose from it. `customHtml` and hand written template markup carry no options, no validation and no events, so anything assembled that way has to be rebuilt later. The case that comes up most is a table column showing a status or a badge: that is a hosted element, `type: 'element'` with `elementType: 'badge'`, not markup.

**Look in the template library before creating a template.** When `help().capabilities` includes `templates`, the view has one:

```js
api.describeTemplates();   // { available, hosts, templates: [{ name, slots, hasCss, ... }] }
```

If the user names a card and that name is already in the library, reuse it. Create a missing one with `upsertTemplate` and bind it with `useTemplate`, which resolves the right reference property for the element type on its own:

```js
await api.execute([
  { op: 'upsertTemplate', name: 'person card', content: '<div><b>{{row[0]}}</b> {{row[1]}}</div>' },
  { op: 'useTemplate', name: 'peopleGrid', template: 'person card', fieldMap: { '0': 'fullName', '1': 'email' } },
]);
```

Both need the `templates` capability and fail with `capabilityMissing` without it, because the reference properties are hidden then and the binding would render nothing.

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
