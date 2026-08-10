---
title: AI assistant backend
description: Wire the builder's AI chat panel to your own AI service, covering configuration, protocol, models, and the reference backend.
---

# AI assistant backend

The builder ships with an [AI chat panel](../creators/ai-assistant) that opens in place of the properties sidebar. The panel is **frontend only**: it speaks a small HTTP + WebSocket protocol to a backend that _you_ host. This page covers everything needed to connect one: settings, the wire protocol, model configuration, and the reference backend implementation.

## Enabling and configuring

The panel is controlled through the builder's `runtimeSettings`:

```ts
builderSettings: INgxViewBuilderBuilderSettings = {
  // master switch (root-level alias: enableAiAssistant)
  aiAssistant: {
    enabled: true,
    backendUrl: "https://ai.example.com", // default: http://localhost:8000
    defaultModel: "gemini-2.5-flash",
    models: [
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    ],
  },
};
```

| Option         | What it does                                                                                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | Shows/hides the AI button in the builder header. `enableAiAssistant` at the settings root is an alias; `aiAssistant.enabled` wins when both are set.                                                                                                                                          |
| `backendUrl`   | Base URL of your AI service. Trailing slashes are stripped.                                                                                                                                                                                                                                   |
| `defaultModel` | Pre-selected model id in the picker.                                                                                                                                                                                                                                                          |
| `models`       | The model picker's entries (`{ id, label }`). When omitted, the built-in list is used (Gemini 2.5 Pro / Flash / Flash Lite). The `id` is passed verbatim to your backend, so it can be any string your service understands (a Gemini id, an OpenAI-compatible id, or your own routing alias). |

The backend URL can also be set (or changed) at runtime through the API service:

```ts
api.setAiAssistantConfig({ backendUrl: 'https://ai.example.com' });
api.getAiAssistantConfig();               // { backendUrl }
api.onAiAssistantConfigChanged.add(({ config }) => ...);
```

Until a URL is known, the panel shows _"Host application has not provided AI assistant backend URL via API yet."_

## The wire protocol

The panel makes exactly two kinds of connections:

### 1. Create a session: `POST {backendUrl}/ai/session`

```jsonc
// request
{ "language": "en" }
// response
{ "session_id": "..." }
```

### 2. Chat: `WS {backendUrl → ws(s)}/ai/ws/{session_id}`

The `http(s)` scheme is swapped for `ws(s)` automatically.

**Client → server messages:**

```jsonc
// sent right after the socket opens: the current view definition
{ "type": "set_context", "context": { "structure": { /* IStructure */ } } }

// one per user message
{
  "type": "user_message",
  "text": "Add a client details panel",
  "language": "en",
  "agent": { "model": "gemini-2.5-flash" },           // present when a model is picked
  "context": { "structure": { /* current IStructure */ } }, // always sent, never stale
  "images": [ { "mediaType": "image/png", "dataUrl": "data:image/png;base64,..." } ],
  "files":  [ { "name": "requirements.docx", "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "size": 18234, "data": "UEsDBBQ..." } ]
}
```

Notes: images arrive as data URLs. Files arrive as **raw bytes**, base64-encoded in `data` (no data-URL prefix), with the original `name`, `mimeType`, and `size`. The panel does not parse or convert anything, so your backend is responsible for reading each file (extracting text from `.docx`, decoding `.txt`/`.csv`, and so on). The panel rejects a single file over 10 MB and stops attaching once the batch passes 25 MB.

**Server → client messages:**

| Type                   | Payload                                                                        | Panel behaviour                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`               | `{ "message": "Generating structure…" }`                                       | Shown as the live status line.                                                                                                                                             |
| `assistant_json_delta` | `{ "chunk": "..." }`                                                           | Streamed JSON fragments, buffered by the panel (keeps the socket alive on long generations).                                                                               |
| `assistant_done`       | `{ "message": "...", "warnings": ["..."], "structure": { /* IStructure */ } }` | The chat message is appended; **if `structure` is a non-empty object it is applied to the canvas immediately** (rendered through the creator, exactly like a manual edit). |
| `error`                | `{ "message": "..." }`                                                         | Shown as the error banner; loading state ends.                                                                                                                             |

That's the whole contract. Any backend that implements these five message types works; language, framework, and AI provider are entirely your choice.

## The reference backend (`ngx-view-builder-ai-agent`)

A minimal Node.js implementation of this protocol ships alongside the library. It exposes:

- `GET /health`
- `POST /ai/session`
- `POST /ai/session/:sessionId/context` (optional REST alternative to `set_context`)
- `POST /ai/session/:sessionId/message` (optional REST alternative to the WS message)
- `WS /ai/ws/:sessionId`

### Setup

```bash
cd ngx-view-builder-ai-agent
copy .env.example .env     # then edit the keys
npm install
npm start                  # or: npm run dev
curl http://localhost:8000/health
```

### Environment variables

| Variable                | What it does                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `NVB_AI_PROVIDER`       | Default provider: `gemini` (Google AI Studio, the default) or `openai` (any OpenAI-compatible endpoint).                            |
| `NVB_AI_GEMINI_API_KEY` | Key for the Gemini provider (Google AI Studio → _Get API key_; the free tier works).                                                |
| `NVB_AI_OPENAI_API_KEY` | Key for the OpenAI-compatible provider.                                                                                             |
| `NVB_AI_DEFAULT_MODEL`  | Model used when the panel doesn't send one (default `gemini-2.5-flash`). The panel's `agent.model` overrides it per message.        |
| `NVB_AI_WORKSPACE_ROOT` | Folder containing all `ngx-view-builder*` projects (defaults to two levels above `src/`). Used to resolve the knowledge-base files. |
| `NVB_AI_REFERENCE_MAP`  | Explicit path to `retrieval-map.json` (defaults to `<workspace>/ngx-view-builder-docs-vitepress/docs/ai/retrieval-map.json`).       |
| `NVB_AI_DOCS_SOURCE`    | Where documentation pages are read from: `auto` (default local file, published site as fallback), `local`, or `remote`.             |
| `NVB_AI_DOCS_LLMS_URL`  | The published documentation bundle used by `auto`/`remote` (default `https://ngxviewbuilder.io/llms-full.txt`).                     |
| `NVB_AI_DOCS_URL`       | Optional live-docs URL injected into prompts. Off by default, because the retrieval-map sources are the primary reference.          |

Because the agent resolves `docs:` sources from disk _or_ from the published `llms-full.txt`, a deployed instance works without a checkout of the documentation repository. Only the `lib:` sources (library TypeScript interfaces and enums) are local-only, so keep the library repository next to the agent when you want those in the prompts.

The provider is also inferred from the model id: `gemini-*` always routes to Gemini regardless of `NVB_AI_PROVIDER`. Legacy `PF_AI_*` variable names still work as a fallback.

### How it builds answers

- Its knowledge base is the **[AI reference](../ai/) section of this documentation**, indexed by [`retrieval-map.json`](../ai/#the-machine-index-retrieval-map-json). Based on the request profile (create/modify/review, element types, logic/data/actions, or a developer question) it loads a _selected_ slice of docs pages, library interfaces, enums, and property datasets into the prompt, not the whole repo, so prompts stay small.
- It is not limited to generating JSON: **developer questions** (what an API method does, what it returns, how an event works, how to embed the builder) are answered in prose from the developer documentation via the map's `developer` source group.
- `GET /health` reports `reference_map_loaded`, `reference_sources_total`, and `reference_sources_missing`; check it after moving any docs files.
- Responses stream as `assistant_json_delta` chunks and finish with `assistant_done` carrying the generated/updated structure.

### Where to customise

| Concern                             | File                                               |
| ----------------------------------- | -------------------------------------------------- |
| Which docs/sources feed the prompts | `retrieval-map.json` in the docs repo (`docs/ai/`) |
| LLM prompts & request profiling     | `src/prompts.js`                                   |
| Reference-context loading & budgets | `src/reference-context.js`                         |
| Gemini (Google AI Studio) API call  | `src/gemini.js`                                    |
| OpenAI-compatible API call          | `src/openai.js`                                    |
| Session storage                     | `src/session-store.js`                             |
| Response JSON parsing               | `src/documentation.js`                             |
| Routes & WebSocket wiring           | `src/server.js`                                    |

## Adding models & providers

**Models in the picker** are pure configuration. Extend `aiAssistant.models` with any `{ id, label }` pairs and make sure the backend maps those ids to a provider call:

```ts
aiAssistant: {
  backendUrl: 'https://ai.example.com',
  defaultModel: 'fast',
  models: [
    { id: 'fast',    label: 'Fast (small model)' },
    { id: 'smart',   label: 'Smart (large model)' },
    { id: 'private', label: 'On-prem model' },
  ],
}
```

With the reference backend, switching **provider** is one env var (`NVB_AI_PROVIDER`); with your own backend you can route each model id to a different provider. The panel doesn't care; it only ever sends the id.

## Security checklist

- Host the backend yourself and keep **API keys server-side only**. The panel never handles provider keys.
- Put the endpoint behind your normal authentication (cookies/headers pass through the browser's `fetch` + WebSocket as usual for same-site setups).
- Remember that the **whole view structure** is sent with every message, so treat the AI backend with the same data-protection rules as the rest of your app.
- Validate/limit the structures your backend returns: whatever comes back in `assistant_done.structure` is applied to the canvas.
