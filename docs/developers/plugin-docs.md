---
title: Documentation plugin
description: Field documentation kept apart from the view JSON, its storage on your server, the document format and AI access.
---

# Documentation plugin

`@ngxviewbuilder/plugin-docs` adds field documentation: a **Documentation** section in the Properties panel of every element and a **Documentation** tab with the generated field reference, ready to paste into Confluence. How creators use it is on the [Field documentation](../creators/documentation) page.

## Install

```bash
npm install @ngxviewbuilder/plugin-docs
```

```ts
import { provideNgxViewBuilderDocs, createHttpDocsStorage } from '@ngxviewbuilder/plugin-docs';

providers: [
  provideNgxViewBuilderDocs({
    storage: createHttpDocsStorage('/api/view-docs'),
  }),
],
```

Like the Logic map, it needs a genuine license key in the builder settings ([Licensed plugins](./licensing#licensed-plugins)) and brings `@ngxviewbuilder/plugin-shared` along.

## Where the documentation is kept

The text is never written into the view JSON. Each view has its own documentation document, keyed by a **view code**, and the plugin loads and saves it through the storage you give it.

`createHttpDocsStorage(baseUrl)` is a ready REST storage:

| Request | Meaning |
| --- | --- |
| `GET {baseUrl}/{viewCode}` | the stored document; `404` (or `204`) means none yet |
| `PUT {baseUrl}/{viewCode}` | the whole document as JSON |

It takes `headers` (a function, called before every request, for an Authorization header) and `withCredentials` for cookie sessions:

```ts
createHttpDocsStorage('/api/view-docs', {
  headers: () => ({ Authorization: `Bearer ${auth.token()}` }),
});
```

Or bring your own calls. A function runs in Angular's injection context, so `HttpClient` works and its Observables are accepted as they are:

```ts
provideNgxViewBuilderDocs({
  storage: () => {
    const http = inject(HttpClient);
    return {
      load: (viewCode) => http.get<INgxViewBuilderViewDocs | null>(`/api/view-docs/${viewCode}`),
      save: (docs) => http.put(`/api/view-docs/${docs.viewCode}`, docs),
      label: 'Confluence sync', // shown as "Saved to Confluence sync"
    };
  },
});
```

Without a storage the documentation stays in the browser's localStorage, which is fine for trying it out but shared with nobody; the tab says so.

The plugin saves a moment after typing stops (`saveDelayMs`, 800 by default). If a load fails, it does not save over the stored copy until a load succeeds.

### The view code

By default the view code is `settings.viewCode` in the view JSON; the first time something is documented, the plugin writes a new one there, so save the view afterwards. If your database already identifies the view, pass it instead:

```ts
provideNgxViewBuilderDocs({
  storage: createHttpDocsStorage('/api/view-docs'),
  viewCode: (structure) => currentViewId(),
});
```

## The document

```json
{
  "format": "ngx-view-builder-docs",
  "version": 1,
  "viewCode": "loan-application",
  "title": "Business loan application",
  "summary": "<p>Filled in by the client, checked by the credit team.</p>",
  "updatedAt": "2026-10-13T09:12:00.000Z",
  "elements": {
    "vatNumber": {
      "description": "<p>VAT number of the company. Finance checks it against VIES.</p>",
      "rows": ["required", "prop:placeholder"],
      "updatedAt": "2026-10-13T09:10:41.000Z"
    },
    "billing.city": { "description": "<p>City of the registered office.</p>" }
  }
}
```

Descriptions are keyed by element name, or by path for panel children. `rows` are the rows picked under the description: `required`, `logic`, `validation`, `data`, `events` (written from the view's logic) or `prop:<key>` for one of the element's own properties. Store the document as it is; the plugin only needs it back the same way.

## Translations

The tab, the Properties panel section and the copied or downloaded table follow the builder's language, headings, "Yes"/"No" and rule sentences included. The English texts are in `NGX_VIEW_BUILDER_DOCS_UI_EN` and `NGX_VIEW_BUILDER_SHARED_UI_EN`; property rows use the builder's own `property.<key>` names. See [Translating the plugins](./ui-translations#translating-the-plugins).

## AI clients

The plugin registers itself for AI clients as `documentation` ([AI plugins](./ai-command-api#plugins)):

| | |
| --- | --- |
| read | the documented fields with their rules; `{ "element": "vatNumber" }` for one, `{ "missingOnly": true }` for fields without a description, `{ "format": "markdown" }` or `"html"` for the finished table |
| `setDescription` | writes one element's description (text or simple HTML) |
| `setRows` | sets the rows under a description, e.g. `["required", "logic", "prop:placeholder"]` |
| `setSummary` | the summary of the whole form |
| `setTitle` | the page title |

A model asked to "document this form" writes the descriptions here and never into element properties.
