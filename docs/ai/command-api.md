---
title: Live builder command API
description: How an agent drives an open builder directly, instead of only emitting structure JSON.
---

# Live builder command API

Everything else in this section teaches you to **write** structure JSON. This page is about the other mode: when a builder is open in a browser you can reach, you can **read and edit the live view directly**, one JSON command at a time, and see the result immediately.

## Detect the mode first

The live mode arrives as an MCP server. If your client has the `nvb_*` tools, you are in it.

Every connection starts **unpaired**. Before anything else:

1. Ask the user for their builder session key. It is shown in the builder settings under AI access (MCP) and looks like `NVB-XXXX-XXXX-XXXX`. Never guess one.
2. Call `nvb_pair` with the key exactly as the user gave it. Case, spaces and missing dashes do not matter.

After that, `nvb_status` tells you where you stand:

| Result | What it means | What to do |
| --- | --- | --- |
| `paired: true`, `builderConnected: true` | A builder tab is open and yours to drive | Drive it with commands. Do not hand back raw JSON for a person to paste. |
| `paired: true`, `builderConnected: false` | The tab was closed, or is reloading | Ask the user to open or reload the builder, then retry. A reload keeps the pairing. |
| `paired: false` | Nothing is paired yet, or the user pressed New key | Ask for the key (again) and call `nvb_pair`. |
| An error saying no tab has that key | The key is wrong, or belongs to a tab that is gone | Ask the user to copy it again from the builder. A new tab has a new key. |
| No `nvb_*` tools at all | Runtime only host, or no MCP server configured | Fall back to authoring structure JSON as the rest of this section describes. |

`callsRemaining` in the same answer is how many builder calls are left in the current window. Batch your changes; do not spend calls one element at a time.

The API is open only while the builder component is mounted. It closes when the user leaves the builder, so re-check before a long sequence.

## Bootstrap sequence

Run these before writing anything. They cost a few round trips and remove almost every source of error.

```text
nvb_pair                      1. with the key the user gave you
nvb_get_instructions          2. the contract as text
nvb_describe_element_types    3. real element types and their real property keys
nvb_get_tree                  4. what already exists, the row indexes and element paths you need
```

When the user says "this field" or "the selected one", call `nvb_get_selection`: it returns the element they clicked in the designer (`{ name, path, type }`), or `null` when nothing is selected.

`nvb_get_instructions` is the fastest way in: it states what the API is, the working order, the rules, the capabilities this builder has, and the templates already in the library. `nvb_help` returns the machine readable catalog: `help.commands` with a worked example per command, `help.guidelines` with the rules on their own, and `help.capabilities` with the optional features that are present.

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

1. **An array is atomic.** If one command fails, none are applied. Group commands into batches by section rather than sending single calls: a change goes in one batch, a new view of more than about eight elements in one batch per section, all with the same `group`.
2. **Use `{ dryRun: true }` first** for anything large or destructive. It runs every check and reports `changed` without touching the view.
3. **Read `warnings`, not just `errors`.** `ok: true` with warnings means something landed that the builder does not recognise.
4. **Act on `hint`.** Errors carry a concrete correction. One retry using the hint should succeed; if it does not, stop and ask rather than looping.
5. **There is no save.** You can build and edit freely, but a person commits the view. Do not claim you saved anything, and do not try to reach a save through a trigger or an element event: automation actions have no submit or save type, and an element `submit` still needs a human click.
6. **Re-check with `nvb_status` after anything slow.** The API disarms the moment the user leaves the builder, and every command then fails with `apiClosed` while every read returns null (in the page itself, `available()` answers the same question). That is expected, not a fault.

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

Row indexes come from `getTree()` or from `addRow`. Target fields are `parent`, `page`, `tab`, `index`, `row`, `column`.

Elements inside a `dynamicPanel` or `objectPanel` only need a name that is unique within that panel, so two panels can each have a `city`. Address them by **path**, `billing.city`, which `getTree()` gives on every node. Every command that takes an element name also takes a path; a bare name that matches more than one element is an error that lists the paths to choose from. See [Layout model](./layout-model) for how the same tree looks as raw JSON.

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

## Plugins: logic map and field documentation

Installed plugins add their own reads and commands, outside `execute()`. Call `listPlugins()` (MCP `nvb_list_plugins`) to see which are there.

- `logicMap`: `readPlugin('logicMap', { element })` (MCP `nvb_read_plugin`) returns a field's rules in plain words with everything it depends on and changes; without a query, the whole view. Read it before explaining or changing how a form behaves. `executePlugin('logicMap', 'show', { element })` (MCP `nvb_plugin_execute`) opens the map on that field for the person.
- `documentation`: what each field is for, kept outside the view JSON. Write it with `executePlugin('documentation', 'setDescription', { element, text })`, never into element properties such as `labelTooltip` or `hint`. `setRows`, `setSummary` and `setTitle` finish the page.

A plugin that needs a license answers with the reason when the builder has no valid key; tell the person, do not work around it.

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

`setData` replaces the test data. Every field the `data` object does not name is emptied, just as if a person cleared it, so totals and summaries count only the answers you sent. To change a few fields and keep the rest, add `merge: true`:

```js
{ op: 'setData', data: { age: 30 }, merge: true }
```

**Do not use `validate` to test whether a section is visible.** It runs on a fresh copy and does not apply container visibility to children, so a field inside a hidden panel is still reported as required. Read the preview instead.

Note that a mutation rebuilds the view, which clears working data. Set data after your last structural change, not before.

### Look at it and test it

Over MCP three more tools close the loop. Use them after every build or larger change, and do not tell the person a view is done before `nvb_validate` reports no errors:

- `nvb_validate`: everything that loads but is wrong, with hints. Missing or unplaced elements, expressions that do not compile or read unknown fields (with a "did you mean"), unlabelled inputs, nameless buttons, unknown validators, missing data sources, credentials in data source URLs. Fix every error.
- `nvb_screenshot` with `device` `desktop`, `tablet` or `mobile`: a picture of the Preview. Look for fields that do not line up, rows that wrap, labels cut off. Check mobile, not only desktop.
- `nvb_preview_interact`: steps such as `{ "set": { "qty": 11 } }`, `{ "click": "addButton" }`, `{ "page": "details" }`, `{ "validate": true }`, then the state of every field. Prove each `visibleIf`, `requireIf` and calculation with made-up values. Buttons that submit, navigate, call a data source or send a message are refused; ask the person to press those.

## Requests from the person

The person can ask you things from inside the builder: by an expression they press Ask AI and write what the rule should do. When they ask you to listen to the builder, call `nvb_wait_for_request` in a loop (it returns `request: null` after up to 55 seconds; call it again). Each request says what to do and lists the fields the expression may read as `{name}`. Answer with `nvb_reply`: for an expression request, `expression` and a one or two sentence `explanation` in the language the person wrote in; for an explanation request, `explanation` only. If the builder answers `accepted: false`, fix what it says and reply again. Do not change the view itself unless a request asks you to.

## Your changes are one undo step

Each `execute()` call is bracketed with a history checkpoint, so a whole batch collapses into a single undo for the user. Batches that share a `group` option (MCP: `group` on `nvb_execute`) fold into one undo step as long as the person edits nothing in between, so a view built section by section still undoes whole. `getAuditLog()` shows every call you made this session, which is worth reading back before you claim what you did.

While you build, the canvas shows the person what you are doing (reading, checking, building with a count) and plays the elements a batch adds in one by one, top to bottom.

## What gets checked

Element types, property names, layout targets, name collisions and cycles are checked. So are the properties whose value is structured: `options` entries need a `value`, `validators` need a known `type` (and `custom` also needs a `condition`), `events` need a known action `type`, and nested elements in `columns` or `template` need a known type and a name.

Everything else in an element body passes through untouched. That is why warnings matter: a misspelled property still lands and the runtime ignores it.

## Rules that still apply

Everything in [JSON authoring rules](./json-authoring-rules), [Element rules](./element-rules) and [Properties reference](./properties-reference) applies unchanged. The command API changes how the JSON gets in, not what valid JSON looks like.
