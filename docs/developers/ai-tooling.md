---
title: AI tooling
description: Work on views with an AI coding assistant (nvb validate, the view JSON Schema, nvb init, an Agent Skill) and let your own assistant fill a view (toToolSchema, applyToolInput, WebMCP).
---

# AI tooling

Two things live on this page. The first half is for you and your coding assistant: checking view JSON in the editor and in CI, and setting a project up so Claude Code, Codex, Cursor or Copilot know how views work. The second half is for the assistant inside your own app: handing it a view as a tool so it can fill the form for the person using it.

All of it ships in `@ngxviewbuilder/runtime`, which is free.

## The nvb command

The runtime package brings a small command line. It runs in Node, with no Angular and no browser:

```bash
npx nvb validate src/views
npx nvb schema --out view.schema.json
npx nvb init
```

### Check views in CI

`nvb validate` takes files or folders. In a folder it reads every `*.view.json`, and every other `.json` that has `pages` and `elements`. It runs the same checks the builder runs for an AI over MCP (`nvb_validate`):

- columns that place an element that does not exist, elements nobody placed, an element placed twice;
- element keys that do not match their `name`, types this version does not know;
- expressions that do not compile, build objects with braces, or read a field or variable the view does not have, with a "did you mean";
- inputs without a label, buttons without text or `ariaLabel`, two inputs with the same label, images without alternative text;
- validators that are not registered, patterns that do not compile, custom validators without a condition;
- data sources that are missing, unused, or carry a credential in their URL.

```text
src/views/order.view.json
  error   Page "order" places "ghost", but no element has that name.  [ghost]
          Add the element to `elements`, or remove the column.
  error   "note" visibleIf does not compile: Unexpected end of expression  [note visibleIf]
  warning "discount" requireIf reads {totl}, but no field or variable in this view has that name.  [discount requireIf]
          Did you mean {total}?

1 file, 2 errors, 1 warning
```

The exit code is 1 when a file has errors, so it can gate a pull request:

```yaml
- run: npx nvb validate src/views --fail-on warning
```

| Option | What it does |
| --- | --- |
| `--json` | Prints the report as JSON, one entry per file. |
| `--fail-on warning` | Fails on warnings too, not only errors. |
| `--allow-type a,b` | Element types your app registers itself, so they are not reported as unknown. |

A reference to data your app passes in (`{tasks}` from `dataJson`) is not a field of the view, so it comes back as a warning. That is expected; the warning says so.

### The view JSON Schema

The schema is built from the builder's own element catalog, so it lists exactly the types and properties of the version you installed. It ships in the package:

```text
node_modules/@ngxviewbuilder/runtime/schema/view.schema.json
```

Point a view file at it and any editor that speaks JSON Schema completes property names and marks wrong values:

```json
{
  "$schema": "../../node_modules/@ngxviewbuilder/runtime/schema/view.schema.json",
  "settings": { "width": "900", "language": "en" },
  "pages": [],
  "elements": {}
}
```

`npx nvb schema --out <file>` writes a copy, and the latest one is also served at `https://ngxviewbuilder.io/schema/view.json`. Element bodies stay open: the runtime reads a few keys no sidebar control writes, and a schema that rejected them would only get switched off. Custom element types are allowed; `nvb validate` is what tells a custom type from a typo.

### Set a project up for AI assistants

```bash
npx nvb init
```

It adds four things and never overwrites anything that is already there:

| File | What it gets |
| --- | --- |
| `.mcp.json` | The hosted MCP server, `https://mcp.ngxviewbuilder.io/mcp`, for Claude Code and other clients that read it. It pairs with an open builder by its session key, so it does nothing until a person gives the key. |
| `.claude/skills/ngx-view-builder/SKILL.md` | An Agent Skill: how views are built, where the reference is, and that every change is checked with `nvb validate`, or over MCP with `nvb_validate`, `nvb_screenshot` and `nvb_preview_interact`. The assistant loads it only when a task touches a view. |
| `AGENTS.md` | A short section between `<!-- ngx-view-builder:start -->` markers, which Codex, Cursor, Copilot and most other assistants read. Running `init` again updates only that section. |
| `.vscode/settings.json` | `*.view.json` mapped to the schema. A settings file with comments is left alone, and `init` prints the entry to add by hand. |

`npx nvb init --dry-run` shows what it would write.

The skill and the notes also tell the assistant what not to do: no credentials in view JSON (it is sent to every browser), no real personal data in prompts, Preview tests or screenshots.

## Views as AI tools

A view already knows its fields, their types, their options and their limits. That is exactly what a tool definition for a language model needs, so the runtime API can write one.

### toToolSchema

```ts
const tool = api.toToolSchema({ name: 'fill_order', description: 'Fill in the order form' });
```

```json
{
  "name": "fill_order",
  "description": "Fill in the order form",
  "inputSchema": {
    "type": "object",
    "properties": {
      "customerName": { "type": "string", "description": "Customer name" },
      "email": { "type": "string", "format": "email", "description": "Email" },
      "customerType": { "enum": ["regular", "vip"], "description": "Customer type" },
      "qty": { "type": "number", "minimum": 1, "maximum": 500, "description": "Quantity" },
      "billing": {
        "type": "object",
        "properties": {
          "city": { "type": "string", "description": "City" },
          "zip": { "type": "string", "pattern": "^[0-9]{5}$", "description": "ZIP" }
        },
        "additionalProperties": false
      }
    },
    "required": ["customerName"],
    "additionalProperties": false
  },
  "parameters": { "...": "the same schema again, for APIs that call it parameters" },
  "fields": ["customerName", "email", "customerType", "qty", "billing.city", "billing.zip"]
}
```

Only fields a person fills in are offered, and only the ones placed on a page. Calculated fields (`expression`), read only, disabled and hidden fields are left out, and so are file uploads and signatures: a model has no business producing either. Object panels become nested objects, dynamic panels and tables become arrays of rows. `exclude: ['internalNote']` leaves out more.

Pass `inputSchema` to an MCP tool or to any function calling API as it is.

### applyToolInput

When the model calls the tool, hand its arguments to the view:

```ts
const result = await api.applyToolInput(toolCall.arguments);
```

```json
{
  "applied": ["customerName", "qty", "billing.city", "billing.zip"],
  "ignored": [
    { "field": "customerType", "reason": "not one of the options (regular, vip)" },
    { "field": "total", "reason": "not a field this tool fills" }
  ],
  "isValid": false,
  "issues": [{ "field": "billing.zip", "errors": ["Value does not match the pattern."] }]
}
```

Values go through the same path as typing, so rules and calculations run. A number written as `"3"` is taken as 3 and `"yes"` as true for a checkbox; a value that is not one of the options, a number outside its limits or a field the tool does not offer is refused and named in `ignored`, never guessed. Send `result` back to the model and it can ask the person for what is missing.

The result names fields and messages, never values, so it hands the model nothing it did not send. Nothing is submitted: the person reviews the form and presses Submit.

### WebMCP

Browsers are starting to let an AI agent use tools a page offers (`navigator.modelContext`, the WebMCP proposal). The runtime can offer a view that way:

```ts
const remove = api.registerWebMcpTool({ name: 'fill_order', description: 'Fill in the order form' });

// later, when the view goes away
remove();
```

It is off until you call it, does nothing in a browser without WebMCP, and the agent's call runs `applyToolInput`, so the same rules apply: only offered fields, nothing submitted.

## Privacy

Everything on this page is built to send as little as possible:

- `nvb` runs on your machine and sends nothing anywhere.
- Ask AI requests in the builder carry the person's words and the names, types, labels and option values of fields, never form data ([details](./ai-command-api#requests-from-the-builder)).
- `toToolSchema` describes the form, not its contents. `applyToolInput` reports field names and messages, not values.
- Over MCP, Preview runs report values only for fields the AI wrote itself and for calculated fields, and screenshots never show a password.

Which model you send a tool definition or a person's message to, and under what terms, is your decision and your data processing agreement with that provider. Use made-up data when you test.
