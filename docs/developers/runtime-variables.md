---
title: Runtime variables
description: Inject route params, user context, and derived values into views.
---

# Runtime variables

Views reference host context through variables: `{__variables.name}` and `{__external.name}` in expressions. The host controls what those resolve to.

## External context (simplest)

Push any object; every key becomes `{__external.key}`:

```ts
this.api.setRuntimeVariableContext({
  userId: 'u-42',
  userRole: 'admin',
  tenantId: 'acme',
});
```

```text
disableIf:  {__external.userRole} != "admin"
Default value: {__external.userId}
```

`setRuntimeVariableContext(values, merge = true)` merges by default; `clearRuntimeVariableContext()` resets.

## Variable definitions

Definitions add typed, named variables with fallbacks and refresh rules. Creators can manage them in the **Variables** tab; hosts can also supply them:

```ts
this.api.setRuntimeVariableDefinitions([
  { name: 'clientId', sourceType: 'route',     source: 'id' },
  { name: 'apiBase',  sourceType: 'constant',  constantValue: '/api/v2' },
  { name: 'isEdit',   sourceType: 'expression', expression: 'notEmpty({__variables.clientId})' },
  { name: 'settings', sourceType: 'dataSource', source: 'loadSettings',
    fallbackValue: {} },
]);
```

| `sourceType` | Resolves from |
| --- | --- |
| `route` | Angular route/query params |
| `external` | the external context object |
| `constant` | `constantValue` |
| `expression` | evaluated expression (`refreshPaths` re-evaluates) |
| `dataSource` | a named data source's result |
| `manual` | left to be set at runtime |

Useful definition flags: `fallbackValue`, `targetPath` (mirror into form data), `includeInDataJson` (ship with submits), `refreshOnChange` / `refreshPaths`.

Two things to keep in mind when defining them by hand:

- An `expression` variable resolves element references the same way an element expression does, so `{el1} + {el2}` reads those fields even before the user has touched them. Its dependencies are tracked automatically and it recomputes whenever one of them changes, along with anything reading the variable.
- A `dataSource` variable needs an explicit `source`. If it is missing, the variable stays unresolved rather than picking up whichever source happens to be first in the structure.

## One-call configuration

```ts
this.api.configureRuntimeVariables({
  mappings: [...definitions],
  external: { userRole: 'admin' },
  mergeExternal: true,
});
```

Or declaratively via `runtimeSettings`:

```ts
runtimeSettings = {
  runtimeVariables: [...definitions],
  runtimeVariableContext: { userRole: 'admin' },
};
```

## Typical pattern: route-driven edit form

```ts
// /clients/:id/edit
ngOnInit(): void {
  this.api.configureRuntimeVariables({
    mappings: [{ name: 'clientId', sourceType: 'route', source: 'id' }],
    external: { userName: this.auth.userName },
  });
}
```

Inside the view: a data source `GET /api/clients/{id}` with param `id = {__variables.clientId}` loads the record; `{__external.userName}` prefills the author field.

## Timing

Set context **before** the view renders (constructor / `ngOnInit` ahead of passing `pageJson`). Later updates propagate (expressions referencing `__variables` re-evaluate on change) but avoid churn during initial load.
