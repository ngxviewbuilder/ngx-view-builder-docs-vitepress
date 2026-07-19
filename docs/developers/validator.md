---
title: Headless validation
description: Validate structure + data without rendering a visible view.
---

# Headless validation

Two tools cover validation outside the normal UI flow.

## In-app: `api.validateData()`

For a rendered view, validate programmatically through the API service:

```ts
const result = await this.api.validateData({
  emitValidationEvent: true,
  includeHidden: false,
  includeDisabled: false,
});
// result: { isValid: boolean, issues: [{ elementName, dataPath, errors[] }] }
```

## Standalone: `<ngx-view-builder-validator>`

A component with no visible UI that loads a structure + data, runs the full runtime validation (including expressions), and emits the result. Designed for validation services — e.g. a small Angular app rendered server-side or in a headless browser that your backend calls to verify submissions with the *same* rules the form used.

```html
<ngx-view-builder-validator
  [pageJson]="structure"
  [dataJson]="submittedData"
  [autoValidateOnInit]="true"
  (validated)="onValidated($event)"
  (validationError)="onError($event)"
/>
```

| Input | Default | Purpose |
| --- | --- | --- |
| `pageJson` / `dataJson` | — | Structure and data to validate |
| `autoValidateOnInit` | `true` | Validate immediately |
| `backendUrl` / `validatePath` | `http://127.0.0.1:8010` / `/validate` | Remote validation endpoint mode |
| `waitMs` / `timeoutMs` | `300` / `45000` | Stabilisation delay and timeout |
| `headlessApiKey` | `__NGX_VIEW_BUILDER__` | Global API key for headless drivers |
| `sessionHeaderName` / `sessionKey` / `requestHeaders` | — | Auth headers for the remote mode |

You can also call `validate()` on the component instance for on-demand runs.

## Global headless API

For E2E tests and headless automation, expose a global validation API at startup:

```ts
inject(ForgeInitializerService).load({
  exposeHeadlessValidationApi: true,
  headlessValidationApiKey: '__NGX_VIEW_BUILDER__',
});
```

The driver (Playwright, Puppeteer…) can then invoke validation through `window.__NGX_VIEW_BUILDER__`.

## Why server-side validation matters

Client-side rules protect UX, not integrity. Re-run the same structure + data through the validator on trusted infrastructure before persisting anything — the definitions are identical, so rules never drift between client and server.
