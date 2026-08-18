---
title: AI command API
description: A JSON command surface that lets an external agent read and edit a view while the builder is open.
---

# AI command API

The AI command API is a design time surface that lets an agent inspect and edit the view a user is currently designing. Everything crosses the boundary as plain JSON, so nothing Angular shaped leaks out and the whole contract survives a trip through a websocket.

An agent reaches it over MCP. The browser dials out to the MCP server and the server forwards each method call back down that socket, so the user's machine never has to accept an inbound connection.

It exposes one write door and a handful of read methods, one MCP tool each:

| Method | MCP tool | What it does |
| --- | --- | --- |
| `available()` | part of `nvb_status` | false whenever the builder is not on screen |
| `help()` | `nvb_get_instructions` | the full command catalog, with schemas |
| `getSystemInstructions()` | `nvb_get_instructions` | the contract as one prompt ready block |
| `describeElementTypes(type?)` | `nvb_describe_element_types` | element types and their properties |
| `describeTemplates(name?)` | `nvb_describe_templates` | the template library, and what can host a template |
| `getTree()` | `nvb_get_tree` | compact outline of pages and elements |
| `getStructure()` | `nvb_get_structure` | the whole view JSON |
| `getElement(name)` | `nvb_get_element` | one element body |
| `getElementProperty(name, key)` | `nvb_get_element_property` | one property value |
| `getData()` | `nvb_get_data` | current working data |
| `getAuditLog()` | `nvb_get_audit_log` | every batch applied this session |
| `execute(commands, options?)` | `nvb_execute` | the only way to change anything |

## When it exists

The bridge connects only while `<ngx-view-builder-builder>` is mounted, and only when the host opted in. A runtime only host never opens one, no matter who calls what. Leaving the builder closes it again.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNgxViewBuilderRuntime, provideNgxViewBuilderMcp } from 'ngx-view-builder';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgxViewBuilderRuntime(),
    provideNgxViewBuilderMcp({ url: 'wss://mcp.ngx-view-builder.io/bridge' }),
  ],
});
```

| Option | Description |
| --- | --- |
| `enabled` | Default `true`. Set `false` to keep the provider registered but leave the API closed. |
| `url` | Bridge endpoint of the MCP server. An `http(s)` URL is upgraded to `ws(s)`. |
| `autoConnect` | Default `true`. Set `false` to connect by hand through `NgxViewBuilderMcpBridgeService`. |
| `client` | App and page labels, shown in `nvb_status` so a user with several tabs open can tell which one an agent is attached to. |
| `sessionKey` | A key your own backend issued, string or resolver. Supply it and the pair code disappears: your backend already knows the key, so it can hand the same one to whatever AI client it wires up. |
| `auth` | Token your MCP server's authorization service understands. Forwarded untouched, never interpreted. |
| `metadata` | Anything your authorization service should see: tenant, user, plan hint. Echoed back in `nvb_status`. |

Without a `sessionKey`, the builder shows a pair code in its AI panel and an agent reaches the view only after a person has typed that code into their MCP client. With one, your backend has already decided who may connect, so no code is shown and nobody types anything. Either way the session lasts only as long as that tab stays open, and the panel says so once a client is attached.

The MCP server itself holds no user table. It asks whatever authorization service you configure and does what it is told, which is what lets you run it next to your own product and drive it from your own backend. See its README for the auth webhook contract.

## The two guarantees

**It runs only while the builder is on screen.** Three things must all hold: the host registered the provider, the builder component is mounted, and a person paired a code. Leaving the builder disarms the API and drops the socket. Disarming is what matters: closing the socket alone would leave the surface open to anything that had captured it. A disarmed API refuses every command with `apiClosed` and every read returns `null` or empty, so a captured reference is worth nothing on a runtime page.

**It cannot save.** There is no save, publish or submit command, and none of the mutation commands reach the host's save path. `saveTemplate` and `saveSidebarGroup` write reusable builder library items, not the view.

Automation an agent writes cannot commit the view either. Triggers and rules run a deliberately narrower action set than element events: `navigate`, `dataSource`, `toast`, `dialog`, `setValue`, `setElementProperty`, `transitionProcess`, `setProcessState` and `refreshRuntimeVariables`. There is no submit and no save among them, so an agent cannot author a rule that saves on load. An element `events` entry may use `submit`, but that still needs a person to click the element.

::: warning This is a design time tool
The worst a runaway agent can do is leave unsaved edits in an open tab, which a reload undoes. Keep it out of production builds, and let a person press Save.

A trigger bound to `onLoad` does run by itself when the view is rebuilt, so an agent can cause a data source call or a navigation without a click. That is a side effect, not a commit, but it is worth knowing when reviewing what an agent wrote.
:::

## Try it on the public demo

The bridge is armed on [demo.ngxviewbuilder.io/builder](https://demo.ngxviewbuilder.io/builder). Open the AI panel, copy the pair code, point your MCP client at `https://mcp.ngx-view-builder.io/mcp?code=NVB-XXXX-XXXX`, and watch it build.

Nothing there can be saved to anything of yours: the demo keeps its view in your own browser storage, and the API has no save command in the first place. Reloading the page restores the demo view.

## Start with getSystemInstructions()

`getSystemInstructions()` returns the whole contract as one block of text: what the API is, the working order, the rules worth following, which capabilities this builder has, and which templates are on hand. It is meant to go straight into a system prompt.

It exists because of a failure that has nothing to do with the schema. An agent told to "build this form through the AI API" often answers by describing the JSON it would send, or hands it over for someone to paste, because nothing in its context said the API is live and reachable right now. The instructions say that in the first line.

Call `nvb_get_instructions` first in a session. It returns both the prompt ready text and the machine readable `help()` object in one round trip.

`help()` is the machine readable version of the same thing: the command catalog with parameters and a worked example per command, the tab codes, behaviour notes, and three fields worth reading on their own.

| Field | What it carries |
| --- | --- |
| `notes` | How to call the API: batching, dry runs, idempotent names. |
| `guidelines` | How to decide what to build. Kept apart from `notes` so a host can put these in a prompt without the call mechanics. |
| `capabilities` | What the registered feature packs contribute, such as `templates`. |
| `featurePacks` | The packs themselves, by id and title. |

`describeElementTypes()` is the other one to call before writing anything. It returns every registered type, whether it can hold children, and the real property keys for each. Without it a model guesses property names and every command comes back with an error.

```json
// nvb_get_instructions -> result.help
{ "commands": [ /* 47 entries */ ], "capabilities": ["templates"] }

// nvb_describe_element_types { "type": "select" }
{ "properties": ["options", "showSearch", "required", "..."] }
```

## Build from element types first

The guidelines exist because an agent with a blank canvas reaches for markup far too early. Markup is the expensive answer: a `customHtml` element or a hand written template carries no options, no validation and no events, so everything built that way has to be rebuilt by hand later.

The case that comes up most is a status column. A table column that shows a badge, a status, a toggle or a checkbox is a hosted element, not markup:

```js
await api.execute({
  op: 'updateElement',
  name: 'ordersTable',
  properties: {
    columnsConfig: [
      { key: 'status', label: 'Status', type: 'element', elementType: 'badge' },
    ],
  },
});
```

The command layer reports both of these as warnings rather than errors, since an agent that was explicitly asked for custom markup is right to carry on. Read the warnings anyway:

- adding a `customHtml` element
- a column that sets `templateName` while its `type` is not `element`

## execute()

`execute()` takes one command or an array. An array is atomic: commands are folded into a draft copy of the structure, and if any of them fails, none of them are applied.

Over MCP this is `nvb_execute`, with the array under `commands` and the options as flat arguments (`dry_run`, `return_tree`, `return_structure`). The snippets on this page show the command shapes, which are the same either way.

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

## Templates

When the [templates plugin](./plugin-templates) is registered, the view carries a template library and several element types can render a template instead of their own markup. The API surfaces the library so an agent can reuse what is already there rather than inventing a second version of the same card.

```js
api.describeTemplates();
// {
//   available: true,
//   capability: 'templates',
//   hosts: [
//     { type: 'listGrid',   property: 'cardTemplateName', fieldMap: 'cardTemplateFieldMap' },
//     { type: 'customHtml', property: 'htmlTemplateName', fieldMap: 'htmlTemplateFieldMap' },
//   ],
//   templates: [
//     { name: 'person card', slots: ['0', '1'], hasCss: true, contentPreview: '<div class="person">...' },
//   ],
// }
```

`available` is the gate. It is false when the plugin is not registered, and then the reference properties stay hidden in the builder, so writing one would bind a template nothing renders. Both template commands refuse with `capabilityMissing` in that case rather than writing a property that goes nowhere.

`hosts` is read from the property catalog rather than hard coded, so an element type a host registers with its own template property shows up there too.

Two commands go with it:

| Command | What it does |
| --- | --- |
| `upsertTemplate` | Creates or replaces a template by name. It lands in the draft, so a `useTemplate` later in the same batch can already reference it. |
| `useTemplate` | Points an element at a template and maps its slots. |

`useTemplate` resolves the reference property itself. A `listGrid` keeps it in `cardTemplateName` and a `customHtml` in `htmlTemplateName`, and expecting a caller to know that mapping is how bindings end up on the wrong key.

```js
await api.execute([
  {
    op: 'upsertTemplate',
    name: 'person card',
    content: '<div class="person"><b>{{row[0]}}</b><span>{{row[1]}}</span></div>',
    css: '.person { display: grid; gap: 4px; }',
  },
  { op: 'addElement', type: 'listGrid', name: 'peopleGrid', properties: { label: 'People' } },
  {
    op: 'useTemplate',
    name: 'peopleGrid',
    template: 'person card',
    fieldMap: { '0': 'fullName', '1': 'email' },
  },
]);
```

The order matters and the batch is atomic, so either the template and its binding both land or neither does.

A few details worth knowing:

- Slots are positional. Markup addresses its fields as `row[0]`, `item[1]` and so on, and the field map binds each slot to a data path. Do not bake values into the markup.
- Ask for a template by name before creating one. If `describeTemplates('person card')` returns it, reuse it.
- `column` binds one table column instead of the element itself, matched by `key`, and it comes with the warning above about hosted elements being the better answer.
- Passing an empty `template` clears the binding and its field map.
- Templates live in the view JSON, so saving the view persists them. Committing a batch also fires the template saved event, which is what a host mirroring the library into its own storage listens for.

## Mutation commands

| Command | What it does |
| --- | --- |
| `addElement` | Creates an element and places it. Pass `name` to make the command idempotent. |
| `upsertTemplate` | Creates or replaces a library template. Needs the `templates` capability. |
| `useTemplate` | Binds a library template to an element or a table column. Needs the `templates` capability. |
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
    languages: ['en', 'de'],
    texts: {
      de: {
        'header.label': 'Neue Person hinzufügen',
        'elements.firstName.label': 'Vorname',
        'elements.gender.options[0].label': 'Männlich',
      },
    },
  },
  {
    op: 'setUiTranslations',
    dictionaries: { de: { 'select.placeholder': 'Auswählen' } },
  },
  { op: 'setLanguage', language: 'de' },
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
