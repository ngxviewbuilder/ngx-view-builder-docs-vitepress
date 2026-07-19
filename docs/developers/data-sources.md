---
title: Data source integration
description: Host-side concerns — defaults, auth, interceptors, and observability.
---

# Data source integration

Creators configure data sources inside views ([creator guide](../creators/data-sources)). This page covers what the host application controls.

## Requests go through Angular HttpClient

REST sources use the host's `HttpClient` — so your existing **interceptors apply automatically**: auth tokens, tenant headers, error mapping, logging. That's the recommended way to secure view-issued requests.

```ts
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, apiPrefixInterceptor])),
```

An `apiPrefix` interceptor also lets creators use short relative URLs (`/clients`) while the host decides the actual host per environment.

## Default data sources

Give every view a base catalogue of sources so creators don't retype URLs:

```ts
this.api.setDefaultDataSources([
  { name: 'loadCountries', title: 'Countries', type: 'rest',
    params: { url: '/api/countries', method: 'GET' } },
  { name: 'saveForm', title: 'Save form', type: 'rest',
    params: { url: '/api/forms', method: 'POST' } },
]);
```

Or via `runtimeSettings.defaultDataSources` / `dataSourceDefinitions`.

## Observability

Subscribe to the data source events for global loading states and error handling:

```ts
api.onDataSourceLoading.add(({ sourceName }) => this.spinner.show(sourceName));
api.onDataSourceLoaded.add(({ sourceName, durationMs }) => this.spinner.hide(sourceName));
api.onDataSourceLoadFailed.add(({ sourceName, errorMessage }) => {
  this.spinner.hide(sourceName);
  this.api.showToast({ title: 'Load failed', message: errorMessage, variant: 'error' });
});
```

## Programmatic reloads

```ts
await api.reloadDataSource('loadClients');          // by source name
await api.reloadElementDataSource('clientsTable');  // one element's binding
await api.reloadElementsByDataSource('loadClients');// every element using it
```

Call these after host-side mutations so tables and dropdowns reflect new data.

## Caching & skipped requests

- Responses are cached per request signature (URL + method + payload); identical concurrent requests are coalesced. Force fresh data with the reload APIs.
- A request whose URL/body still contains an **unresolved `{placeholder}`** is skipped and yields empty data — that's by design (dependent dropdowns before their parent has a value).

## Mock data in development

Use an interceptor to fake endpoints while the backend is in flight — the demo app's `demo-data.interceptor.ts` in `projects/test-app` is a working example that pattern-matches URLs and returns canned JSON.
