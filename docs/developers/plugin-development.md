---
title: Building a plugin
description: Ship your own builder tab as a reusable package.
---

# Building a plugin

A plugin is just a package (or app module) that calls `provideNgxViewBuilderExtensions()` with a **feature pack**: an id, optional capabilities, and one or more builder tabs backed by Angular components.

## Anatomy — the real Templates plugin

```ts
import { EnvironmentProviders } from '@angular/core';
import { provideNgxViewBuilderExtensions } from 'ngx-view-builder';
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

That's the whole registration — the official Templates plugin (`ngx-view-builder-plugin-templates`) is exactly this thin.

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

- `api.getStructure()` / `api.updateStructure(fn)` — read/write the view (updates flow to Undo history and `structureChanged`).
- `api.onStructureChanged.add(...)` — refresh when the creator edits elsewhere.
- Custom data can live in `structure.settings` under your own key — unknown settings keys are preserved by the core.
- `api.translateUi(key, fallback)` + `uiDictionaries` in your extensions config — localise your tab.
- Tab labels starting with `tab.` resolve through UI dictionaries automatically.

## Capabilities

`capabilities` are opaque strings other code can require. Property definitions support `requiredFeaturePacks` / `requiredCapabilities` — a property (or other gated UI) shows only when a matching pack is registered. Use this to make core-side features light up when your plugin is installed.

## Packaging checklist

- [ ] Ship as an Angular library with a single `provideX()` entry point.
- [ ] Peer-depend on `ngx-view-builder` (never bundle it).
- [ ] Version-lock releases to the core version you built against.
- [ ] Keep tab `id` stable — hosts may persist the active tab.
- [ ] Style with the design tokens so themes work ([Theming](./theming)).
