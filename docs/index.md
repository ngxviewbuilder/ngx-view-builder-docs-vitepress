---
title: Angular Form, View & Dashboard Builder | NGX View Builder
titleTemplate: false
layout: home

hero:
  name: NGX View Builder
  text: The visual form, view & dashboard builder for Angular
  tagline: Design entire pages (forms, dashboards, data tables, guided flows) in a drag-and-drop, low-code builder, ship them as JSON, and render them natively in your Angular app. One library, a full runtime, and a typed API for everything.
  image:
    light: /hero-dashboard-light.png
    dark: /hero-dashboard-dark.png
    alt: A dashboard of charts and a data table built with NGX View Builder
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

---

<section class="caps">
<header class="caps__intro">
<h2 class="caps__headline">Everything a real screen needs, in three moves.</h2>
<p class="caps__lede">A view is one JSON document. You compose it, connect it to your systems, and ship it inside your own Angular app, with no separate runtime to host and no black box.</p>
</header>
<div class="caps__grid">
<div class="caps__phase">
<div class="caps__phase-head">
<h3 class="caps__phase-title">Compose</h3>
</div>
<ul class="caps__list">
<li><strong>Whole pages, not just forms</strong><span>55+ elements: inputs, choice controls, data tables, charts, KPI cards, tabs, dialogs, and steppers, with responsive layout per breakpoint.</span></li>
<li><strong>Enterprise-grade data tables</strong><span>Server-side paging, saved filters, per-user column settings, inline editing, row expansion, bulk actions, and status rules.</span></li>
<li><strong>Logic without code</strong><span>Show, hide, require, disable, and calculate with a concise expression language, 40+ functions, and a visual condition builder.</span></li>
</ul>
</div>
<div class="caps__phase">
<div class="caps__phase-head">
<h3 class="caps__phase-title">Connect</h3>
</div>
<ul class="caps__list">
<li><strong>Live data, first-class</strong><span>REST, route, and local sources feed options, tables, and values. Dependent fields, lazy tables, param mapping, and auto-reload are built in.</span></li>
<li><strong>Extensible at every layer</strong><span>Register your own elements, expression functions, properties, icons, themes, and whole builder tabs. Capability gating hides absent features cleanly.</span></li>
<li><strong>AI-assisted building</strong><span>A built-in chat edits the view from plain-language requests, screenshots, or documents, wired to your own backend and model.</span></li>
</ul>
</div>
<div class="caps__phase">
<div class="caps__phase-head">
<h3 class="caps__phase-title">Ship</h3>
</div>
<ul class="caps__list">
<li><strong>Angular-native architecture</strong><span>Standalone components, signals, zoneless-ready. A typed API service exposes every structure, data, and lifecycle operation, with 50+ events.</span></li>
<li><strong>Ready for real products</strong><span>Multi-language content, locale-aware formatting, light/dark theming with design tokens, headless validation, and a template library.</span></li>
<li><strong>Idea to production, fast</strong><span>Analysts build screens visually; developers embed them with one component. Version, review, and deploy a view like any other artifact.</span></li>
</ul>
</div>
</div>
</section>

## Built for both sides of the team

**Creators** get a professional visual workspace: drag elements onto pages, configure every property from a searchable sidebar, preview on desktop/tablet/mobile, and test with live data. No development environment required.

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

Everything the builder does is available programmatically: read and mutate structures, set values, reload data sources, switch themes and languages, validate headlessly, and observe 50+ typed events. See the [API service reference](/developers/api-service).

## The ideas it's built on

- **Views are data, not code.** A page is one JSON document, so you can store it in your database, template it, migrate it, diff it in code review, or generate it with AI. Nothing is compiled into your bundle at design time.
- **It runs in your app, not ours.** Views render inside *your* Angular app, using your router, your HTTP layer, your auth, and your design tokens. There is no hosted runtime to depend on and no vendor to route your data through.
- **The tedious parts are already solved.** Dependent dropdowns, server-side tables, wizard navigation, validation summaries, translations, and per-user table preferences are configured, not hand-coded for the hundredth time.
- **It scales from a form to an admin panel.** Start with a single contact form and grow into a builder-driven internal tool where your own domain elements sit in the sidebar next to the built-in ones.

Take the [5-minute first form tutorial](/creators/first-form), embed the [runtime](/developers/runtime-integration), or explore the [live demo](/demo).

## Community & feedback

Everything public about NGX View Builder lives in the [community repository](https://github.com/ngxviewbuilder/ngx-view-builder-community):

- **Found a bug?** [Open an issue](https://github.com/ngxviewbuilder/ngx-view-builder-community/issues). A minimal structure JSON that reproduces it makes fixes much faster.
- **Have an idea or feature request?** File it as an issue too. Real-world use cases directly shape the roadmap.
- **Questions and discussions** are welcome in the same repository.

## Built on excellent open source

NGX View Builder stands on the shoulders of a small set of battle-tested open-source libraries. Thank you to their authors and maintainers.

<div class="oss-grid">
  <a class="oss-card" href="https://codemirror.net/" target="_blank" rel="noopener">
    <div class="oss-card__head"><span class="oss-card__name">CodeMirror 6</span><span class="oss-card__license">MIT</span></div>
    <p class="oss-card__text">Powers the JSON, HTML, and JavaScript editors inside the builder: syntax highlighting, autocompletion, and editing commands.</p>
  </a>
  <a class="oss-card" href="https://github.com/TomFrost/Jexl" target="_blank" rel="noopener">
    <div class="oss-card__head"><span class="oss-card__name">Jexl</span><span class="oss-card__license">MIT</span></div>
    <p class="oss-card__text">The engine behind the expression language. Every <code>visibleIf</code>, calculated value, and condition is evaluated by Jexl.</p>
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
  border-radius: 8px;
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
  border-radius: 4px;
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
