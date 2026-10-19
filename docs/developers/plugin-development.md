---
title: Building a plugin
description: "Build your own NGX View Builder plugin: a designer tab, a properties panel section, AI client access, translations and packaging as an npm library."
---

# Building a plugin

A plugin is just a package (or app module) that calls `provideNgxViewBuilderExtensions()` with a **feature pack**: an id, optional capabilities, and one or more builder tabs backed by Angular components.

## Anatomy: the real Templates plugin

```ts
import { EnvironmentProviders } from '@angular/core';
import { provideNgxViewBuilderExtensions } from '@ngxviewbuilder/designer';
import { MyStudio } from './my-studio/my-studio';

export const MY_FEATURE_PACK_ID = 'acme-audit';

export function provideAcmeAuditStudio(): EnvironmentProviders {
  return provideNgxViewBuilderExtensions({
    featurePacks: [
      {
        id: MY_FEATURE_PACK_ID,
        title: 'Audit studio',
        capabilities: ['acme.audit'],        // optional gating keys
        builderTabs: [
          {
            id: 'acmeAudit',                 // tab code
            label: 'tab.audit',              // UI-dictionary key (or plain text)
            component: MyStudio,             // any standalone component
            order: 900,                      // position among tabs
          },
        ],
      },
    ],
  });
}
```

That's the whole registration. The official Templates plugin (`@ngxviewbuilder/plugin-templates`) is exactly this thin.

## The tab component

Your component renders inside the builder shell and talks to the same services as everything else:

```ts
@Component({ standalone: true, template: `...` })
export class MyStudio {
  private api = inject(NgxViewBuilderApiService);

  structure = computed(() => this.api.getStructure());

  addAuditNote(): void {
    this.api.updateStructure((s) => {
      (s.settings as any).auditNotes = [...(s.settings as any).auditNotes ?? [], { at: Date.now() }];
    });
  }
}
```

Useful building blocks:

- `api.getStructure()` / `api.updateStructure(fn)`: read/write the view (updates flow to Undo history and `structureChanged`).
- `api.onStructureChanged.add(...)`: refresh when the creator edits elsewhere.
- Custom data can live in `structure.settings` under your own key, and unknown settings keys are preserved by the core.
- `api.translateUi(key, fallback)` + `uiDictionaries` in your extensions config: localise your tab.
- Tab labels starting with `tab.` resolve through UI dictionaries automatically.

## Tab icon, description and the More menu

A tab can bring an `icon` (a built-in icon name, or SVG markup so it never depends on the host's icon set) and a `description`, a short line shown under its name in the header's **More** menu. Plugin tabs show after the built-in ones while they fit and move into the menu when they do not; `placement: 'menu'` keeps a tab in the menu always, for something people open rarely.

```ts
builderTabs: [
  {
    id: 'acmeAudit',
    label: 'tab.audit',
    component: MyStudio,
    order: 900,
    icon: '<svg viewBox="0 -960 960 960">…</svg>',
    description: 'tab.audit.description',
  },
],
```

## A section in the Properties panel

`propertyPanels` adds a category to the Properties panel of the selected element, after the built-in ones. The component gets two inputs, `element` (the selected element's model) and `elementName` (its name, or its path inside a panel):

```ts
featurePacks: [
  {
    id: 'acme-audit',
    propertyPanels: [
      { id: 'audit', label: 'propertyCategory.audit', icon: 'history', component: AuditPanel },
    ],
  },
],
```

`elementTypes` limits it to some element types, `order` places it among the built-in categories (they use 10 to 90; the default is last). The Documentation plugin's panel is built this way.

## A row in the data source editor

`dataSourceEditorExtensions` adds a row to the data source editor, above the request fields. The component gets two inputs: `source`, the data source being edited, and `context`, which is how it changes that source:

```ts
featurePacks: [
  {
    id: 'acme-catalog',
    dataSourceEditorExtensions: [
      { id: 'catalog', label: 'acme.catalog.row', component: CatalogPicker, sourceTypes: ['rest'] },
    ],
  },
],
```

```ts
export class CatalogPicker {
  source = input<IDataSource | null>(null);
  context = input<INgxViewBuilderDataSourceEditorContext | null>(null);

  pick(url: string): void {
    this.context()?.apply({ params: { url, method: 'GET' } });
  }
}
```

`apply()` takes `params` to merge into the source's params (a key set to `undefined` is removed), and optionally a new `name` and `title`. It goes through the same steps as a person's edit: a new name is carried into everything bound to the old one, and the editor shows the change at once. `context.openBodyBuilder()` opens the visual body builder on the current request body. Read the source from the `source` input and never change it directly.

`sourceTypes` limits the row to some source types (`rest`, `route`, `local`, `websocket`); `order` sorts the rows of several plugins. The OpenAPI plugin's endpoint search is built this way.

## Letting AI clients use your plugin

`NgxViewBuilderAiPluginRegistryService` lets a plugin tell AI clients what it offers. A plugin has an `id`, a `description` the model reads, an optional `query` description, a `read(query)` function and a list of `commands`, each with `params`, an `example` and a `run(args)`:

```ts
inject(NgxViewBuilderAiPluginRegistryService).register({
  id: 'audit',
  title: 'Audit notes',
  description: 'Notes reviewers left on the view. Read them before changing a field someone flagged.',
  read: () => ({ notes: auditNotes() }),
  commands: [
    {
      name: 'addNote',
      description: 'Adds a review note to an element.',
      params: { element: 'Element name or path.', text: 'The note.' },
      run: (args) => addNote(String(args['element']), String(args['text'])),
    },
  ],
});
```

Register it from `provideEnvironmentInitializer()` in your provider. The model finds it through `listPlugins()` and uses it with `readPlugin()` and `executePlugin()`, over MCP `nvb_list_plugins`, `nvb_read_plugin` and `nvb_plugin_execute` ([AI plugins](./ai-command-api#plugins)). `available()` and `unavailableReason()` let the plugin say no, with a reason the model can pass on.

## Translating your plugin

Give every text a key and put the English texts in your feature pack's `uiDictionaries`. Packs merge key by key, so your English never replaces another plugin's English. Hosts translate your keys the same way they translate the builder ([UI translations](./ui-translations)). Text your code builds from words (a status line, a sentence about a rule) needs keys too, with placeholders for the values, so a language with another word order can move them: `'audit.count': '{count} notes'`.

## Capabilities

`capabilities` are opaque strings other code can require. Property definitions support `requiredFeaturePacks` / `requiredCapabilities`: a property (or other gated UI) shows only when a matching pack is registered. Use this to make core-side features light up when your plugin is installed.

## Packaging checklist

- [ ] Ship as an Angular library with a single `provideX()` entry point.
- [ ] Peer-depend on `@ngxviewbuilder/designer` (never bundle it). A plugin adds a
      builder tab, so the designer is the package it extends; the runtime surface
      reaches you through the designer's re-exports.
- [ ] Version-lock releases to the core version you built against.
- [ ] Keep tab `id` stable, since hosts may persist the active tab.
- [ ] Style with the design tokens so themes work ([Theming](./theming)).
- [ ] Put every text behind a dictionary key, generated sentences included.
- [ ] Keep your code in your package: everything should leave with `npm uninstall`.
