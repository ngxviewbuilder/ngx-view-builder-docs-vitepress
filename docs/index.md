---
layout: home

hero:
  name: NGX View Builder
  text: The visual builder for complete Angular views
  tagline: Design entire pages — forms, dashboards, data tables, guided flows — in a drag-and-drop builder, ship them as JSON, and render them natively in your Angular app. One library, a full runtime, and a typed API for everything.
  actions:
    - theme: brand
      text: Try the live demo
      link: /demo
    - theme: alt
      text: Start as a Creator
      link: /creators/
    - theme: alt
      text: Developer guide
      link: /developers/

features:
  - icon: ◫
    title: Whole pages, not just forms
    details: 55+ elements — inputs, choice controls, full-featured data tables, charts, KPI cards, tabs, splitters, dialogs, steppers — compose into complete views with responsive layout per breakpoint.
  - icon: ⚡
    title: From idea to production in minutes
    details: Business users and analysts build screens visually; developers embed them with one component. A view is plain JSON — version it, review it, deploy it like any other artifact.
  - icon: ƒ
    title: Logic without code
    details: Show, hide, require, disable, reset, and calculate values with a concise expression language, 40+ built-in functions, and a visual condition builder for non-developers.
  - icon: ⇄
    title: Live data, first-class
    details: REST, route, and local sources feed options, tables, charts, and values. Dependent fields, lazy server-side tables, param mapping, and auto-reload are built in.
  - icon: ⊞
    title: Enterprise-grade data tables
    details: Server-side pagination, quick & detailed search, saved filters, column settings persisted per user, inline editing, row expansion, exports, selection with bulk actions, status rules.
  - icon: ⚙
    title: Angular-native architecture
    details: Standalone components, signals, zoneless-ready. A typed API service exposes every structure, data, element, theming, and lifecycle operation to the host application — with 50+ events.
  - icon: ✚
    title: Extensible at every layer
    details: Register your own elements, expression functions, properties, SVG icons, themes, and whole builder tabs. Capability gating hides features cleanly when a plugin is absent.
  - icon: ✦
    title: AI-assisted building
    details: A built-in AI chat edits the view from plain-language requests, screenshots, or documents — wired to your own backend and model of choice.
  - icon: 🌐
    title: Ready for real products
    details: Multi-language content and UI, locale-aware formatting, light/dark theming with design tokens, headless validation for your backend, and a reusable template library.
---

## Built for both sides of the team

**Creators** get a professional visual workspace: drag elements onto pages, configure every property from a searchable sidebar, preview on desktop/tablet/mobile, and test with live data — no development environment required.

**Developers** get a serious integration surface instead of a black box:

```ts
import { NgxViewBuilderRuntime, NgxViewBuilderApiService } from 'ngx-view-builder';

@Component({
  imports: [NgxViewBuilderRuntime],
  template: `<ngx-view-builder-runtime [pageJson]="view" [dataJson]="data" theme="dark" />`,
})
export class ClientPage {
  private api = inject(NgxViewBuilderApiService);

  ngOnInit() {
    this.api.onComplete.add(async ({ isValid, data }) => {
      if (isValid) await this.save(data);
    });
  }
}
```

Everything the builder does is available programmatically — read and mutate structures, set values, reload data sources, switch themes and languages, validate headlessly, and observe 50+ typed events. See the [API service reference](/developers/api-service).

## Why teams pick NGX View Builder

- **Views are data.** A page is one JSON document — store it in your database, template it, migrate it, diff it in code review, or generate it with AI.
- **No lock-in runtime.** Views render inside *your* Angular app with your router, your HTTP layer, your auth, and your design tokens.
- **The hard parts are done.** Dependent dropdowns, server-side tables, wizard navigation, validation summaries, translations, per-user table preferences — configured, not coded.
- **It grows with you.** Start with a contact form; end with a builder-driven admin panel where your own domain elements sit in the sidebar next to the built-ins.

Take the [5-minute first form tutorial](/creators/first-form), embed the [runtime](/developers/runtime-integration), or explore the [live demo](/demo).

## Community & feedback

Everything public about NGX View Builder lives in the [community repository](https://github.com/ngxviewbuilder/ngx-view-builder-community):

- **Found a bug?** [Open an issue](https://github.com/ngxviewbuilder/ngx-view-builder-community/issues) — a minimal structure JSON that reproduces it makes fixes much faster.
- **Have an idea or feature request?** File it as an issue too — real-world use cases directly shape the roadmap.
- **Questions and discussions** are welcome in the same repository.

## Built on excellent open source

NGX View Builder stands on the shoulders of a small set of battle-tested open-source libraries. Thank you to their authors and maintainers.

<div class="oss-grid">
  <a class="oss-card" href="https://codemirror.net/" target="_blank" rel="noopener">
    <div class="oss-card__head"><span class="oss-card__name">CodeMirror 6</span><span class="oss-card__license">MIT</span></div>
    <p class="oss-card__text">Powers the JSON, HTML, and JavaScript editors inside the builder — syntax highlighting, autocompletion, and editing commands.</p>
  </a>
  <a class="oss-card" href="https://github.com/TomFrost/Jexl" target="_blank" rel="noopener">
    <div class="oss-card__head"><span class="oss-card__name">Jexl</span><span class="oss-card__license">MIT</span></div>
    <p class="oss-card__text">The engine behind the expression language — every <code>visibleIf</code>, calculated value, and condition is evaluated by Jexl.</p>
  </a>
  <a class="oss-card" href="https://prettier.io/" target="_blank" rel="noopener">
    <div class="oss-card__head"><span class="oss-card__name">Prettier</span><span class="oss-card__license">MIT</span></div>
    <p class="oss-card__text">Formats structure JSON and code snippets in the editors so what you read is always tidy.</p>
  </a>
  <a class="oss-card" href="https://lodash.com/" target="_blank" rel="noopener">
    <div class="oss-card__head"><span class="oss-card__name">Lodash</span><span class="oss-card__license">MIT</span></div>
    <p class="oss-card__text">Utility functions (<code>lodash-es</code>) used across the library for safe, predictable data handling.</p>
  </a>
</div>

<style>
.oss-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 24px;
}
.oss-card {
  display: block;
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none !important;
  transition: border-color 0.2s, background 0.2s;
}
.oss-card:hover { border-color: var(--vp-c-brand-1); }
.oss-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.oss-card__name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.oss-card__license {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 999px;
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}
.oss-card__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
</style>
