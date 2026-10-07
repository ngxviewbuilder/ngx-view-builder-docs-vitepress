---
title: AI command API
description: A JSON command surface that lets an external agent read and edit a view while the builder is open.
---

# AI command API

The AI command API is a design time surface that lets an agent inspect and edit the view a user is currently designing. Everything crosses the boundary as plain JSON, so nothing Angular shaped leaks out and the whole contract survives a trip through a websocket.

NGX View Builder has **no AI chat and no AI model inside it**. The AI is your own client (Claude, ChatGPT, Cursor, Codex or an agent you run), which connects from outside over MCP and drives the builder while you watch the canvas.

An agent reaches it over MCP. The browser dials out to the MCP server and the server forwards each method call back down that socket, so the user's machine never has to accept an inbound connection.

It exposes one write door and a handful of read methods, one MCP tool each:

| Method | MCP tool | What it does |
| --- | --- | --- |
| `available()` | | false whenever the builder is not on screen |
| `help()` | `nvb_help` | the full command catalog, with schemas |
| `getSystemInstructions()` | `nvb_get_instructions` | the contract as one prompt ready block |
| `describeElementTypes(type?)` | `nvb_describe_element_types` | element types and their properties |
| `describeTemplates(name?)` | `nvb_describe_templates` | the template library, and what can host a template |
| `getTree()` | `nvb_get_tree` | compact outline of pages and elements, each with its `path` |
| `getSelection()` | `nvb_get_selection` | the element the person has selected, or `null` |
| `getStructure()` | `nvb_get_structure` | the whole view JSON |
| `getElement(name)` | `nvb_get_element` | one element body (a name or a path) |
| `getElementProperty(name, key)` | `nvb_get_element_property` | one property value |
| `getData()` | `nvb_get_data` | current working data |
| `getAuditLog()` | `nvb_get_audit_log` | every batch applied this session |
| `execute(commands, options?)` | `nvb_execute` | the only way to change anything |

Four more tools belong to the MCP server itself and never reach the builder: `nvb_pair`, `nvb_status` and `nvb_unpair`, which are about who may talk to which tab (the next section), and `nvb_read_docs`.

`nvb_read_docs` hands the AI reference to the model page by page, so it works for clients that cannot open a URL. The server fetches it from [llms-authoring.txt](https://ngxviewbuilder.io/llms-authoring.txt), and the whole site from [llms-full.txt](https://ngxviewbuilder.io/llms-full.txt) when asked. Before the first change the model has to read the core pages: the command API, the generation contract, the layout model, the authoring rules, the element rules, the properties reference, the common mistakes and the [good practices](../ai/good-practices). Until it has, `nvb_execute` answers with the list of pages still to read. That is about 33 000 tokens once per connection, and it is what keeps a model from inventing property names that are silently ignored.

## Connecting the builder

The bridge connects only while `<ngx-view-builder-designer>` is mounted, and only for a license key that is genuine and not expired: AI access comes with an active designer license. A runtime only host never opens one, no matter who calls what. Leaving the builder closes it again.

There are two ways to open it. With nothing but `licenseKey` in the settings, the person presses **Connect** under Settings → AI access (MCP) and the builder dials our hosted server, `wss://mcp.ngxviewbuilder.io/bridge`. The hosted server asks the license console about the key before it pairs anything, and again every hour. A host that runs its own server gives the builder its address instead, and the builder connects on its own:

```ts
readonly builderSettings: INgxViewBuilderBuilderSettings = {
  licenseKey: 'NVB-...',
  mcp: {
    url: 'wss://mcp.example.com/bridge',
    client: { app: 'Back office', page: 'Order form' },
  },
};
```

| Option | Description |
| --- | --- |
| `url` | Bridge endpoint of the MCP server. An `http(s)` URL is upgraded to `ws(s)`. Leave `mcp` out and the builder waits for the **Connect** button. |
| `client` | App and page labels. The AI client sees them after pairing, which helps a person with several builder tabs open tell which one is being driven. |
| `sessionKey` | A key your own backend issued. See [Keys from your backend](#keys-from-your-backend). |

`NgxViewBuilderMcpBridgeService` exposes the connection as signals, in case you want your own indicator somewhere in the host app: `status`, `sessionKey`, `clientUrl`, `pairedClients`, `isPaired`, `aiBusy`, `licenseProblem` and `lastError`. The builder's own header already shows an **AI connected** badge while a client is paired. `regenerateKey()` does what the **New key** button does.

## Pairing

The MCP server does not let an AI client near a builder until a person says so. The handshake is short:

1. When the builder connects, it generates a session key such as `NVB-K990-RPNH-N2T7` and shows it in its settings under AI access (MCP), next to the server URL.
2. The person adds the server URL, `https://<your server>/mcp`, to their AI client once. The URL carries no key, so the same connector serves every builder tab.
3. The AI client connects. Until it is paired, every tool answers with an error telling the model to ask the user for the session key, and the server's MCP instructions say the same, so the model asks before it tries anything else.
4. The person pastes the key into the chat and the model calls `nvb_pair` with it. The builder shows a notice with the client's name, and from then on every tool call on that connection goes to that tab.

A key is valid for 24 hours. When it runs out the builder generates a new one, and the server refuses the old one.

A pairing belongs to the MCP session and points at the key, not at the socket. When the person reloads the builder, the tab comes back with the same key (it is kept in `sessionStorage`), the server tells it who is still paired, and the AI carries on without asking again. A new tab gets a new key.

**New key** in the builder sends a revoke to the server, which drops every pairing to the old key on the spot, and the tab reconnects with a fresh one.

Keys are drawn at random by the browser's cryptographic generator: twelve characters from a 32 letter alphabet, about 10¹⁸ possible keys. There is no date or counter in them on purpose, since anything predictable in a key would make it easier to guess. Two tabs drawing the same key is not something you will meet, and the server covers it anyway: a key that is in use in one browser cannot be taken over from another. The newcomer is refused and its builder simply picks a new key. A reload or a duplicated tab comes from the same browser and keeps its key as before.

The key is forgiving to type: case, spaces and missing dashes are ignored, and `O`, `I` and `L` are read as `0`, `1` and `1`. It is 60 random bits, and a connection that tries ten wrong keys is refused for fifteen minutes, so guessing is not a realistic way in.

`nvb_status` answers whether the connection is paired, whether the paired tab is open right now, and how many calls are left in the current window. `nvb_unpair` lets go of the tab.

### Keys from your backend

If your backend already knows who should drive which view, it can hand out the key itself. Pass it as `mcp.sessionKey` and wire the AI client with an `x-nvb-session-key: <the key>` header on `https://<your server>/mcp`. Such a connection starts out paired and nobody types anything. The server does not read the key from the URL, because a query string ends up in proxy logs and browser history. Make the key random, at least 128 bits, 16 to 128 characters of letters, digits and `. _ ~ -`. The builder hides **New key** in this case, because the backend gave that same key to the AI client and rotating it on one side only would break the pairing.

### The bridge keeps itself up

If the socket drops, the builder reconnects on its own, backing off from one second to thirty. The key does not change, so neither does the pairing: once the server is back, the AI continues where it stopped. The status in the settings reads *MCP server unreachable, retrying…* in the meantime.

## The two guarantees

**It runs only while the builder is on screen.** Three things must all hold: the host configured `mcp`, the builder component is mounted, and a person paired a key. Leaving the builder disarms the API and drops the socket. Disarming is what matters: closing the socket alone would leave the surface open to anything that had captured it. A disarmed API refuses every command with `apiClosed` and every read returns `null` or empty, so a captured reference is worth nothing on a runtime page.

**It cannot save.** There is no save, publish or submit command, and none of the mutation commands reach the host's save path. `saveTemplate` and `saveSidebarGroup` write reusable builder library items, not the view.

Automation an agent writes cannot commit the view either. Triggers and rules run a deliberately narrower action set than element events: `navigate`, `dataSource`, `toast`, `dialog`, `setValue`, `setElementProperty`, `transitionProcess`, `setProcessState` and `refreshRuntimeVariables`. There is no submit and no save among them, so an agent cannot author a rule that saves on load. An element `events` entry may use `submit`, but that still needs a person to click the element.

::: warning This is a design time tool
The worst a runaway agent can do is leave unsaved edits in an open tab, which a reload undoes. Keep it out of production builds, and let a person press Save.

A trigger bound to `onLoad` does run by itself when the view is rebuilt, so an agent can cause a data source call or a navigation without a click. That is a side effect, not a commit, but it is worth knowing when reviewing what an agent wrote.
:::

## What the MCP server keeps

Nothing of your views or data. The server is a relay between the AI client and the builder tab: a tool call comes in from the AI client, goes down the socket to the builder, and the builder's answer goes back the same way. It does not read what passes through, it has no database, and it writes nothing to disk. Once a call is answered, the server has forgotten it.

What it does hold, in memory only, is what it needs to route calls and enforce limits:

- the open builder tabs and their pairing keys, and which AI connection is paired with which tab;
- how many calls each tab made in the current hour;
- how many browsers use each license right now (by license number), for the seat limit;
- the license service's answer about a key, for ten minutes, so it is not asked on every connection.

A restart clears all of it. The server's log records only connection events: a tab opened or closed, a license refused or full, with the license number and a shortened key such as `NVB-…TWN5`. Structures, data, commands and answers never appear in it.

Your conversation with the AI stays between you and your AI provider. The server only sees the tool calls the AI makes, while they are in transit. If even that should not leave your network, run the server yourself, as described below, and point the builder at it.

## Running the MCP server

The server is the `ngx-view-builder-mcp` package. It is a router and nothing more: it holds the builder sockets, pairs AI connections to them, and forwards each call. What a command means is decided in the builder, so a new element type or command in the library needs no new server release.

```bash
npx ngx-view-builder-mcp
```

It listens on port 3200 by default, with the MCP endpoint at `/mcp` and the builder socket at `/bridge`.

| Variable | Default | What it does |
| --- | --- | --- |
| `NVB_MCP_PORT` | `3200` | Port. |
| `NVB_MCP_ALLOWED_ORIGINS` | empty | Comma separated origins allowed to open `/bridge`. Empty means any, which is fine on your own machine and nowhere else. |
| `NVB_MCP_MAX_CALLS_PER_SESSION` | `600` | Builder tool calls per tab per window. The builder shows a notice when a client runs out. |
| `NVB_MCP_SESSION_LIMIT_WINDOW_MS` | `3600000` | Length of that window. |
| `NVB_MCP_CHARACTER_LIMIT` | `60000` | Longest tool answer before it is cut, with a note telling the model to ask for a narrower slice. |
| `NVB_MCP_CLIENT_IDLE_TIMEOUT_MS` | `43200000` | An MCP session nobody used for this long is closed, pairing included. |
| `NVB_MCP_KEY_TTL_MS` | `86400000` | How long a pairing key is valid. |
| `NVB_LICENSE_CHECK_URL` | empty | Where to ask whether a license key is active. Empty turns the license check off, so a self hosted server pairs any builder. |
| `NVB_LICENSE_CHECK_TOKEN` | empty | Shared secret sent with that request as `x-internal-token`. |
| `NVB_LICENSE_CACHE_TTL_MS` | `600000` | How long one answer about a key is reused before asking again. |
| `NVB_MCP_RECHECK_INTERVAL_MS` | `3600000` | How often the licenses of connected tabs are checked again. A tab whose license stopped qualifying is disconnected. |
| `NVB_MCP_LICENSE_EXEMPT_ORIGINS` | empty | Comma separated origins that pair without a license, such as a public demo. |
| `NVB_MCP_DOCS_URL` | `https://ngxviewbuilder.io/llms-authoring.txt` | The AI reference `nvb_read_docs` serves. |
| `NVB_MCP_REQUIRE_DOCS` | `on` | `off` lets `nvb_execute` work before the docs were read, for a server with no internet access. |
| `NVB_MCP_SEAT_IDLE_MS` | `1800000` | When a license has every seat taken, a seat nobody used for this long goes to the browser that is waiting. |
| `NVB_MCP_DEMO_MAX_TABS` | `30` | Tabs from exempt origins that may be connected at once, all of them together. |
| `NVB_MCP_DEMO_MAX_CALLS_PER_SESSION` | `150` | Calls per window for a tab from an exempt origin. |
| `NVB_MCP_DEMO_KEY_TTL_MS` | `7200000` | How long a pairing key from an exempt origin is valid. |
| `NVB_MCP_DEMO_MAX_TABS_PER_IP` | `5` | Tabs from exempt origins one address may hold, so one network cannot take the whole demo pool. |
| `NVB_MCP_MAX_CONNECTIONS` | `5000` | Open MCP sessions in total. When it is reached, a new session pushes out the unpaired one idle the longest, never a working pairing. |
| `NVB_MCP_UNPAIRED_IDLE_TIMEOUT_MS` | `900000` | An MCP session that never paired is closed after this long without a request. |
| `NVB_MCP_MAX_SOCKETS` | `10000` | Builder tabs connected in total. |
| `NVB_MCP_MAX_SOCKETS_PER_IP` | `500` | Builder tabs connected from one address. An office behind one address fits easily. |
| `NVB_MCP_HELLO_TIMEOUT_MS` | `15000` | A tab that does not introduce itself by then is closed. |
| `NVB_MCP_TRUST_PROXY` | `loopback, linklocal, uniquelocal` | Which proxies may name the client address in `X-Forwarded-For` (Express `trust proxy`). The default takes it only from a proxy on the same machine or a private network. |
| `NVB_MCP_ALLOWED_HOSTS` | empty | `Host` values `/mcp` answers to, comma separated. Set it to turn on DNS rebinding protection. |
| `NVB_MCP_MAX_CONNECTIONS_PER_IP` | `0` (off) | Open MCP sessions per address. Leave it off when AI clients are hosted (claude.ai, ChatGPT): they reach the server from their provider's addresses, shared by everyone. |
| `NVB_MCP_NEW_SESSIONS_PER_IP_PER_MINUTE` | `0` (off) | New MCP sessions per address per minute. Same caveat. |
| `NVB_MCP_MAX_FAILED_PAIRS_PER_IP` | `0` (off) | Wrong pairing keys per address per 15 minutes. Same caveat. |

The license and seat settings only matter when `NVB_LICENSE_CHECK_URL` is set. Seats are counted per license and per browser, never per address, so twenty people behind one office address with their own licenses each get their own seat.

### Seats

A license lets as many browsers use AI access at the same time as it has seats. Several tabs in one browser count once, because the builder tells the server which browser it runs in. When every seat is taken, the next browser is turned away with a short message in the AI access group and tries again every minute, so it gets in as soon as a colleague disconnects. A seat also frees up when a laptop goes to sleep or loses its network, within about a minute. If everyone is connected but someone has not used the AI for half an hour, their seat goes to the person waiting; pressing **Connect** brings them back with their pairing intact. Nobody is disconnected for being idle while a seat is still free.

Pairings live in memory. Restarting the server means pairing again, which the builder handles by itself and the AI client handles by asking for the key.

## Try it on the public demo

AI access works on [demo.ngxviewbuilder.io/builder](https://demo.ngxviewbuilder.io/builder) without a license of your own. Press **Connect** under Settings → AI access (MCP), add `https://mcp.ngxviewbuilder.io/mcp` to your AI client, ask it to build something in the builder, and give it the session key when it asks.

The demo shares its AI access between everyone trying it, so it is kept small: up to 30 people at a time, 150 calls per hour each, and a key that lasts two hours. If it is busy, the builder says so and tries again every minute.

Nothing there can be saved to anything of yours: the demo keeps its view in your own browser storage, and the API has no save command in the first place. Reloading the page restores the demo view.

## Start with getSystemInstructions()

`getSystemInstructions()` returns the whole contract as one block of text: what the API is, the working order, the rules worth following, which capabilities this builder has, and which templates are on hand. It is meant to go straight into a system prompt.

It exists because of a failure that has nothing to do with the schema. An agent told to "build this form through the AI API" often answers by describing the JSON it would send, or hands it over for someone to paste, because nothing in its context said the API is live and reachable right now. The instructions say that in the first line.

Call `nvb_get_instructions` first in a session, right after pairing. `nvb_pair` says so in its answer.

`help()` is the machine readable version of the same thing: the command catalog with parameters and a worked example per command, the tab codes, behaviour notes, and three fields worth reading on their own.

| Field | What it carries |
| --- | --- |
| `notes` | How to call the API: batching, dry runs, idempotent names. |
| `guidelines` | How to decide what to build. Kept apart from `notes` so a host can put these in a prompt without the call mechanics. |
| `capabilities` | What the registered feature packs contribute, such as `templates`. |
| `featurePacks` | The packs themselves, by id and title. |

`describeElementTypes()` is the other one to call before writing anything. It returns every registered type, whether it can hold children, and the real property keys for each. Without it a model guesses property names and every command comes back with an error.

```json
// nvb_help
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

Containers that hold children directly are `panel`, `objectPanel`, `dialog`, `splitter`, `dynamicPanel`, `emptyBlock`, `messageCard`, `statsCard` and `listGrid`. Containers that hold children per section, and therefore need a `tab`, are `tabs`, `tabsPro`, `accordion` and `progressFlow`. Targeting anything else returns a `notAContainer` error with the list.

`objectPanel` is laid out like `panel` but also changes where its children's values live: everything placed under it, at any depth, stores its value at `<objectPanel>.<element>`. An `addElement` or `insertJson` whose `parent` is an `objectPanel` or `dynamicPanel` defines the new elements in that panel's `template`, so a name only has to be free inside the panel: a `billing` and a `shipping` panel can each get a `city`. The data paths you read back from `getData()` and write in expressions are `billing.city` and `shipping.city`.

Because two panels can hold the same name, commands also accept a **path** wherever they take an element name: `billing.city` is the `city` inside `billing`, and nesting goes deeper the same way (`order.address.city`). `getTree()` gives every node its `path`, so read it there rather than building one by hand. `getElement`, `updateElement`, `deleteElement`, `moveElement`, `renameElement` and `duplicateElement` all take one. A plain name still works when it is unique. Moving an element into or out of a panel moves its definition with it and fails with a clear error if the target already has an element of that name.

`getSelection()` answers with the element the person clicked in the designer (`{ name, path, type }`), so an agent can act on "this field" without asking which one is meant.

```js
await api.execute([
  { op: 'addElement', type: 'objectPanel', name: 'address', properties: { label: 'Address' } },
  { op: 'addElement', type: 'text', name: 'city', parent: 'address', properties: { label: 'City' } },
  { op: 'addElement', type: 'text', name: 'street', parent: 'address', row: 0 },
]);
// getData() -> { address: { city: ..., street: ... } }
```

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
