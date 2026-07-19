---
title: Custom elements
description: Build your own element — model, component, properties — and register it.
---

# Custom elements

A custom element is three parts:

1. a **model** class extending `ElementBaseModel` — the element's data/config fields,
2. a **component** that renders it (receives the model as an input),
3. a **registration** describing type, label, icon, sidebar group, and editable properties.

The library's own demo (`projects/test-app/src/app/demo/`) contains this exact example.

## 1. Model

```ts
import { ElementBaseModel } from 'ngx-view-builder';

export class NoteElementModel extends ElementBaseModel {
  text = '';
  variant: 'neutral' | 'info' | 'success' | 'warn' = 'warn';
  showEditButton = true;

  constructor(data?: Partial<NoteElementModel>) {
    super();
    this.type = 'noteCard' as any;
    this.label = 'Note card';
    this.width = '100%';
    if (data) Object.assign(this, data);
  }
}
```

Fields you declare here are persisted in the structure JSON and editable through the properties you register in step 3.

## 2. Component

```ts
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgxViewBuilderApiService, TemplateEngineService } from 'ngx-view-builder';
import { NoteElementModel } from './note-element.model';

@Component({
  selector: 'app-note-element',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="note" [attr.data-variant]="model().variant">
      <div [innerHTML]="renderedText()"></div>
    </section>
  `,
})
export class NoteElementComponent {
  model = input.required<NoteElementModel>();   // the library passes the model in

  private templates = inject(TemplateEngineService);
  private api = inject(NgxViewBuilderApiService);
  private version = signal(0);

  readonly renderedText = computed(() => {
    this.version();
    return this.templates.renderTemplate(this.model().text ?? '', {
      element: this.model(),
    });
  });

  ngOnInit(): void {
    // re-render when form values change so {{placeholders}} stay live
    this.disposer = this.api.onValueChanged.add(() => this.version.update((v) => v + 1));
  }
  ngOnDestroy(): void { this.disposer?.(); }
  private disposer?: () => void;
}
```

Useful services inside element components:

| Service | For |
| --- | --- |
| `TemplateEngineService.renderTemplate(tpl, ctx)` | <code v-pre>{{placeholder}}</code> rendering |
| `ElementActionService.runActions(model, model.events, 'click', ctx)` | firing the element's configured actions |
| `NgxViewBuilderApiService` | values, events, everything |
| `EventService.afterPropertyChanged` | react to property edits in the builder |

For value-producing elements, write through the data service path (`api.setValue(model.dataPath, v)`) so expressions and validation react. Extending the input base classes in `core/shared/base-elements` gives you label/description/error chrome for free.

## 3. Registration

```ts
import { provideNgxViewBuilderExtensions } from 'ngx-view-builder';
import { NoteElementComponent } from './note-element.component';
import { NoteElementModel } from './note-element.model';

provideNgxViewBuilderExtensions({
  elementGroups: [{ code: 'custom', label: 'Custom', icon: 'extension', order: 90 }],
  elements: [{
    type: 'noteCard',            // unique type id (stored in JSON)
    label: 'Note card',          // sidebar caption
    icon: 'noteIcon',            // registered SVG icon name
    groupCode: 'custom',         // which sidebar group
    component: NoteElementComponent,
    model: NoteElementModel,
    properties: {
      name:  { label: 'Name',  type: 'text',     category: 'general' },
      label: { label: 'Label', type: 'text',     category: 'general' },
      text:  { label: 'Text',  type: 'textarea', category: 'general',
               hint: 'Supports {{firstName}}-style placeholders.' },
      variant: { label: 'Variant', type: 'select', category: 'general',
                 choices: [
                   { label: 'Info', value: 'info' },
                   { label: 'Success', value: 'success' },
                   { label: 'Warn', value: 'warn' },
                 ] },
      events: { label: 'Events', type: 'eventActions', category: 'events' },
      width:       { label: 'Width', type: 'size', category: 'design' },
      mobileWidth: { label: 'Mobile width', type: 'size', category: 'design' },
    },
  }],
});
```

`properties` drives the properties sidebar — each key maps a model field to an editor. Available editor `type`s and categories: [Custom properties](./custom-properties).

Optional registration fields: `aliases` (alternative type ids), `order` (position in group), `allowInTableHeader`.

## Behaviour you get for free

Once registered, the element supports everything generic: drag & drop, responsive widths, `visibleIf`/`disableIf` logic, events (if you expose an `events` property and run them), translations of its text properties, and JSON round-tripping.

## Checklist

- [ ] `type` is unique and stable (it lives in saved JSON forever).
- [ ] Model defaults are sensible — the element must look right when first dropped.
- [ ] Component is `OnPush` and reacts to value/property change events.
- [ ] Colors use the library's CSS variables so light/dark themes work ([Theming](./theming)).
- [ ] `properties` covers every model field creators should edit.
