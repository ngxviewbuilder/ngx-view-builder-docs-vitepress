---
title: Templates plugin reference
description: Full syntax reference for the Templates plugin  control flow, translations, click actions  plus how to persist templates to your own database.
---

# Templates plugin reference

`ngx-view-builder-plugin-templates` adds the **Templates** tab: a library of reusable HTML/CSS snippets that List grid card templates, Select option templates, row templates, and header templates reference by name. The [creator guide](../creators/templates) covers the tab from a form-builder's point of view; this page is the developer reference the exact template syntax, how the plugin decides where templates are read from, and (the part hosts always ask about) how to wire template Save/Delete to your own backend and database.

## Install & register

```bash
npm install ngx-view-builder-plugin-templates
```

```ts
import { provideNgxViewBuilderTemplates } from 'ngx-view-builder-plugin-templates';

providers: [ provideNgxViewBuilderTemplates() ],
```

That's the whole plugin: one feature pack (`ngx-view-builder-templates`), one capability (`templates`), one builder tab (tab code `templates`). See [Using plugins](./plugins) for the general install/registration mechanism.

## Template syntax

A template's **HTML content** is rendered by a small purpose-built engine, not the real Angular compiler it accepts an Angular-flavoured syntax (so it looks familiar to anyone who knows Angular templates) but only understands what's documented below.

### Interpolation <code v-pre>{{ expression }}</code>

```html
<strong>{{ item.name }}</strong>
<span>Row {{ index + 1 }} of {{ $count }}</span>
```

The expression runs against the template's runtime context: `item` / `row` / `value` (the bound record all three names point at the same object), `index`, every field in the current form data, and (inside `@for`) the loop variables below. Output is HTML-escaped automatically.

### Legacy single-brace tokens `{path}`

`{status.code}` also works as a shorthand for a plain data-path lookup (no operators allowed). Prefer <code v-pre>{{ }}</code> for anything that isn't a bare path <code v-pre>{{ }}</code> supports real expressions, `{ }` doesn't.

### Translations `[[ key ]]` and `t()` / `tr()`

```html
<h4>[[ card.title | Card title ]]</h4>
<button>{{ t('actions.approve') }}</button>
```

- `[[ key | fallback ]]` looks the key up in the view's `localization.texts` for the active language (falling back to the default language, then the fallback text, then the raw key). See [Translations](../creators/translations) for how `localization` gets populated.
- `t('key')` / `tr('key', 'fallback')` do the same lookup from inside any expression position <code v-pre>{{ }}</code>, `@if (...)`, `@switch (...)`, click handlers.
- `[[ someField ]]` (no literal key) evaluates `someField` as an expression first if the data has a value there, _that value_ becomes the translation key, so `[[ status ]]` looks up whatever `status` currently holds (e.g. `"ACTIVE"`). Use a path that resolves to nothing when you want a literal key instead of a dynamic one.

### Control flow `@if` / `@for` / `@switch` / `@let`

```html
@if (item.status == "Active") {
<span class="ok">Active</span>
} @else if (item.status == "Pending") {
<span class="pending">Pending</span>
} @else {
<span class="muted">{{ item.status }}</span>
} @for (line of item.lines; track $index) {
<li>{{ line.label }} {{ line.qty }}</li>
} @empty {
<li class="muted">No lines</li>
} @switch (item.tier) { @case ('gold') {
<span class="tier tier--gold">Gold</span> } @case ('silver') {
<span class="tier tier--silver">Silver</span> } @default {
<span class="tier">Standard</span> } } @let total = sumInArray(item.lines,
'qty'); <span>Total: {{ total }}</span>
```

Loop variables inside `@for`: `$index`, `$count`, `$first`, `$last`, `$even`, `$odd`, plus any `let x = expr` aliases declared in the loop header. Conditions and iterable expressions use the same expression language as **Visible if** / logic properties elsewhere in the builder see [Expressions basics](../creators/expressions) evaluated against the runtime context above.

`===` / `!==` are accepted and treated as `==` / `!=`; `?.` is treated as `.`. There's no real Angular pipe system, no `*ngIf` / `*ngFor`, no arbitrary JavaScript only the constructs on this page.

### Conditional classes `[class.name]="expr"`

```html
<div
  [class.overdue]="item.dueDate < today()"
  [class.paid]="item.status == 'paid'"
>
  {{ item.label }}
</div>
```

Each matching class is added to the element's `class` attribute when its expression is truthy; the binding itself is stripped from the rendered output.

### Click actions `(click)="..."`

```html
<button (click)="approve(item.id)">Approve</button>
```

`(click)` is rewritten to a `data-nvb-event-click` attribute at render time and intercepted by the engine directly (no Angular event binding involved). See [Wiring template actions](#wiring-template-actions-to-your-backend) below for what the call inside the quotes can do.

### Icons `<nvb-icon>`

```html
<nvb-icon name="check_circle"></nvb-icon>
```

Renders the same inline SVG set used by the rest of the builder (see [Custom SVG icons](./icons)); the `name` / `icon` / `data-icon` attribute or the tag's own text content picks the icon. Legacy `<span class="material-symbols-outlined">check_circle</span>` markup is upgraded automatically too.

### CSS the template's own `<style>` block

Write the **CSS** field as plain CSS, with SCSS-like nesting if you want it:

```css
.client-card {
  display: flex;
  gap: 4px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  .badge {
    color: #0a7;
    font-size: 12px;
  }
  &:hover {
    border-color: #0a7;
  }
}
@media (max-width: 480px) {
  .client-card {
    padding: 8px;
  }
}
```

Nesting (`&`, `:host`, plain descendant selectors) is flattened, and the whole block is scoped to the template's own host element at render/preview time it can't leak onto the rest of the page, and you never write a host selector yourself.

### What gets stripped (sanitization)

Template HTML goes through a sanitizing pass before rendering, and the rendered output through a second full-HTML sanitizer pass. In practice:

- `<script>`, `<iframe>`, `<object>`, `<embed>`, `<link>`, `<meta>`, `<base>` are removed entirely.
- Any `on*` attribute (`onclick`, `onmouseover`, …) is stripped use `(click)="..."` instead.
- Inline `style="..."` attributes are stripped put styles in the template's own CSS block, or use classes, not `style=`.
- `srcdoc` is stripped.

## Template field slots

Bracket-indexed references in the content `row[0]`, `item['status']`, `value[2]` are surfaced in the editor as **Template fields**, so a List grid or Select can map its own data onto those slots without touching the template markup. At render time the mapping rewrites `row` / `item` / `value` on the runtime context before the template renders.

## Where templates are read from at runtime

Every view has these structure settings (set via the JSON editor, `api.patchSettings()`, or `api.updateStructure()` there's no dedicated builder field for them yet):

| Setting                         | What it does                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `templateStorageMode`           | `'localStorage'` (default) or `'dataSource'`                                                     |
| `templateStorageLocalKey`       | Browser storage key for local mode (default `ngx-view-builder.templates.v1`)                     |
| `templateStorageDataSourceName` | Which registered [data source](../creators/data-sources) supplies templates in `dataSource` mode |
| `templateStorageDataPath`       | Path into that source's response where the template array lives                                  |

::: warning This is a read path, not your database integration
`dataSource` mode reliably **writes** only when the named source is a `local` (in-structure JSON) source anything backed by a real REST/websocket source silently falls back to writing into `localStorage` under a per-source key instead of hitting your API. Reading works for any source type (via the _Load from data source_ action). So treat `templateStorageMode: 'dataSource'` as a way to **seed/refresh** templates from a live source, not as the mechanism that persists edits to your database that's the API-level integration below, which every Save/Delete in the Templates tab already goes through regardless of this setting.
:::

## Persisting templates to your database

Templates always live in `structure.settings.templates`, and the Templates tab's Save/Delete buttons always go through `NgxViewBuilderApiService` so this is the one integration point to wire up, independent of the storage-mode setting above.

### Load your templates in

On startup, fetch your saved templates and push them into the builder:

```ts
private api = inject(NgxViewBuilderApiService);

async ngOnInit(): Promise<void> {
  const templates = await firstValueFrom(this.http.get<ITemplateDefinition[]>('/api/templates'));
  this.api.loadTemplates(templates); // replace = true by default
}
```

`loadTemplates(templates, replace = true)` (alias `setTemplates`) accepts objects shaped like `ITemplateDefinition` (`name`, `title?`, `description?`, `content`, `css?`, `tags?`, …) pass `replace: false` to merge instead of overwrite. It fires `onTemplatesLoaded`.

### React to Save / Delete

Two equivalent ways to hear about edits pick whichever fits how your app is wired:

**A. Component outputs**, if you embed `<ngx-view-builder-builder>` directly:

```html
<ngx-view-builder-builder
  [model]="builderModel"
  (templateSaved)="onTemplateSaved($event)"
  (templateDeleted)="onTemplateDeleted($event)"
  (templatesLoaded)="onTemplatesLoaded($event)"
/>
```

**B. `NgxViewBuilderApiService` events**, anywhere else (they fire identically the outputs above just forward these):

```ts
private api = inject(NgxViewBuilderApiService);

ngOnInit(): void {
  this.api.onTemplateSaved.add(({ template, previousCode }) => {
    const request = previousCode
      ? this.http.put(`/api/templates/${previousCode}`, template)  // renamed: previousCode -> template.code
      : this.http.put(`/api/templates/${template.code}`, template);
    firstValueFrom(request).catch((err) => this.api.showToast({
      title: 'Template not saved', message: err.message, variant: 'error',
    }));
  });

  this.api.onTemplateDeleted.add(({ code }) => {
    void firstValueFrom(this.http.delete(`/api/templates/${code}`));
  });
}
```

`onTemplateSaved`'s payload uses `code` for the template's unique name (same value as `template.name`, under the API's field name); `previousCode` is only set when the Save renamed an existing template, so you know to update rather than insert.

You can also read the current list on demand e.g. right before your own "save form" call with `api.getTemplates()`, and push/remove one template imperatively with `api.upsertTemplate(template)` / `api.saveTemplate(template, previousCode?)` and `api.removeTemplate(name)` / `api.deleteTemplate(code)`.

## Wiring template actions to your backend

The expression inside `(click)="..."` is a single function-style call `name(arg1, arg2)` or a bare `name` resolved in this order:

1. **An element action.** If the element hosting the template (the List grid, Select, table, …) has an [Events & actions](../creators/events-actions) entry whose `actionCode` (or `id` / `label`) matches, that action runs with the call's arguments available as context:
   ```html
   <button (click)="approveRow(item.id)">Approve</button>
   <!-- or, if you'd rather keep the action reference explicit: -->
   <button (click)="action('approveRow', item.id)">Approve</button>
   ```
   (`runAction` / `eventAction` are accepted aliases for `action`.)
2. **A data source**, otherwise. The call name is looked up in the map set by `api.setTemplateActionMap({...})` / `api.registerTemplateActionDataSource(fnName, dataSourceName)` (or the structure's `settings.templateActionMap`, or the builder's `templateActionMap` runtime setting), and the resolved [data source](./data-sources) runs directly no element action needed:
   ```ts
   this.api.setTemplateActionMap({ approve: "approveRequest" });
   ```
   ```html
   <button (click)="approve(item.id)">Approve</button>
   <!-- or call the data source name directly, with no map entry: -->
   <button (click)="dataSource('approveRequest', item.id)">Approve</button>
   ```
   (`runSource` / `runDataSource` / `loadDataSource` are accepted aliases for `dataSource`.)

Either way, the call's arguments are exposed to whatever runs as `{arg0}`, `{arg1}`, … (so a REST data source's URL can be `/api/requests/{arg0}/approve`), and as `{__action.name}`, `{__action.args}`, `{__action.item}`, `{__action.row}` everywhere else in the view for the duration of the call.

## Events at a glance

| Event               | Fires                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| `onTemplateSaved`   | a template was added or updated `{ template, previousCode?, timestamp }` |
| `onTemplateDeleted` | a template was removed `{ code, timestamp }`                             |
| `onTemplatesLoaded` | `loadTemplates` / `setTemplates` ran `{ templates, replace, timestamp }` |

Full list (including the sidebar-library equivalents used by the reusable-elements panel) in the [Events reference](./events#templates-sidebar-library).

## Related

- [Using plugins](./plugins) the general plugin/capability mechanism
- [Dynamic text & templates](../creators/templates) the creator-facing guide to the Templates tab
- [Events & actions](../creators/events-actions) `actionCode` and the action editor
- [Data source integration](./data-sources) host-side data source concerns
- [API service reference](./api-service#templates-sidebar-library) / [Events reference](./events#templates-sidebar-library)
