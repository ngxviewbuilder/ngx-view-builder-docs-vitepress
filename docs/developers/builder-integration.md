---
title: Embedding the builder
description: Host the visual builder, persist structures, and customize the header.
---

# Embedding the builder

## Minimal setup

```ts
import { Component } from '@angular/core';
import { BuilderModel, IStructure, NgxViewBuilderBuilder } from 'ngx-view-builder';

@Component({
  selector: 'app-builder-page',
  imports: [NgxViewBuilderBuilder],
  template: `
    <ngx-view-builder-builder
      [model]="builderModel"
      (structureChanged)="onStructureChanged($event)"
      (saveRequested)="onSave()"
    />
  `,
})
export class BuilderPageComponent {
  builderModel = new BuilderModel();

  ngOnInit(): void {
    const saved = localStorage.getItem('my-view');
    if (saved) {
      this.builderModel.setJson(saved); // takes a JSON string
    }
  }

  onStructureChanged(structure: IStructure): void {
    localStorage.setItem('my-view', JSON.stringify(structure)); // autosave
  }

  onSave(): void {
    // user clicked Save in the builder header
  }
}
```

`BuilderModel` wraps the structure: `setJson(jsonString)`, `getJson(): IStructure`, plus `setDataJson`/`getDataJson` for preview data. An empty model starts with one blank page.

## Inputs

| Input | Type | Purpose |
| --- | --- | --- |
| `model` | `BuilderModel` | The structure being edited |
| `language` | `string` | Builder UI + content language |
| `theme` | `'light' \| 'dark'` | Color scheme |
| `runtimeSettings` | `INgxViewBuilderBuilderSettings` | The big config object (below) |
| `headerActions` | `INgxViewBuilderHeaderAction[]` | Extra header buttons |
| `hideSaveAction` | `boolean` | Hide the built-in Save |
| `hideHeaderTabs` | `boolean` | Chrome-less embedding |
| `activeTab` | tab code | Preselect a tab |
| `uiDictionaries` | `UiDictionaries` | Builder UI translations |
| `contentTranslations` | `Record<lang, Record<key,string>>` | Content translations |
| `cssVariables` | `Record<string,string>` | Token overrides |
| `viewportSettings` | `{ mobile?, tablet?, desktop? }` | Preview breakpoint widths |
| `externalConfig` / `externalConfigUrl` | config object / URL | Load host config as an object or JSON file |

## `runtimeSettings` highlights

```ts
readonly builderSettings: INgxViewBuilderBuilderSettings = {
  theme: 'light',
  language: 'en',
  builderPageDisplayMode: 'single',        // canvas shows one page at a time
  dataSources: { enableGraphql: true, enableWebsocket: true },
  defaultDataSources: [...],               // sources every view gets
  runtimeVariableContext: { userRole: 'admin' },
  propertyHints: { name: 'Unique data key' },  // extra hint texts in the sidebar
  aiAssistant: { enabled: true, backendUrl: 'https://ai.example.com' },  // AI assistant
  licenseKey: 'NVB-...',
};
```

## Outputs

| Output | Fires when |
| --- | --- |
| `structureChanged` | any edit changes the structure (autosave hook) |
| `saveRequested` | Save is clicked |
| `valueChanged` | a preview value changes |
| `tabChanged` / `languageChanged` | navigation events |
| `templateSaved` / `templateDeleted` / `templatesLoaded` | template library persistence (host-side storage) |
| `sidebarGroupSaved` / `sidebarGroupDeleted` / `sidebarGroupsLoaded` | element-library persistence |
| `headerActionRequested` | one of your `headerActions` was clicked |

## Custom header actions

```ts
readonly headerActions: INgxViewBuilderHeaderAction[] = [
  { id: 'save', label: 'Save', icon: 'save', tone: 'primary',
    onClick: () => this.saveToBackend() },
  { id: 'publish', label: 'Publish', onClick: () => this.publish() },
];
```

## Persisting templates and library items

When creators save templates or sidebar library groups, the builder emits events instead of assuming storage. Listen, persist wherever you like, and feed items back on startup:

```ts
ngAfterViewInit(): void {
  queueMicrotask(() => {
    this.api.loadTemplates(this.templatesFromBackend);
    this.api.loadSidebarGroups(this.groupsFromBackend);
  });
}
```

(`api` is [`NgxViewBuilderApiService`](./api-service).)
