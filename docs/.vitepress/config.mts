import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "NGX View Builder",
  description: "Create, integrate, and ship dynamic Angular views.",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", href: "/brand-mark.svg" }],
    ["meta", { name: "theme-color", content: "#1554ff" }],
    // Google Analytics is loaded client-side from theme/analytics.ts, gated
    // behind the cookie-consent banner — see theme/components/CookieConsent.vue.
  ],
  themeConfig: {
    // Full logotype in the navbar (name is part of the image, so no text title).
    logo: { src: "/logo-header.png", alt: "NGX View Builder" },
    siteTitle: false,
    nav: [
      { text: "Creators", link: "/creators/", activeMatch: "/creators/" },
      { text: "Developers", link: "/developers/", activeMatch: "/developers/" },
      // AI reference intentionally has no nav tab: the /ai/ pages stay published
      // for AI agents (see public/llms.txt), humans reach them via direct links.
      { text: "Demo", link: "/demo", activeMatch: "/demo" },
      { text: "Pricing", link: "/pricing" },
      {
        text: "Community",
        link: "https://github.com/ngxviewbuilder/ngx-view-builder-community",
      },
      // Log In hidden for the demo-preview launch; restore with the deployed
      // portal URL when the full product ships:
      // { text: 'Log In', link: 'https://portal.ngxviewbuilder.io/login' },
    ],
    sidebar: {
      "/creators/": [
        {
          text: "Start here",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/creators/" },
            { text: "The builder workspace", link: "/creators/workspace" },
            { text: "Your first form", link: "/creators/first-form" },
            { text: "AI assistant", link: "/creators/ai-assistant" },
          ],
        },
        {
          text: "Building views",
          collapsed: false,
          items: [
            { text: "Pages & navigation", link: "/creators/pages" },
            { text: "Layout & containers", link: "/creators/layout" },
            { text: "Common properties", link: "/creators/properties" },
            { text: "Form settings", link: "/creators/form-settings" },
          ],
        },
        {
          text: "Elements",
          collapsed: false,
          items: [
            { text: "Overview", link: "/creators/elements/" },
            { text: "Text & number inputs", link: "/creators/elements/inputs" },
            {
              text: "Date & time inputs",
              link: "/creators/elements/date-time",
            },
            { text: "Choice inputs", link: "/creators/elements/choices" },
            { text: "Buttons & actions", link: "/creators/elements/buttons" },
            { text: "Containers", link: "/creators/elements/containers" },
            { text: "Tables & lists", link: "/creators/elements/tables" },
            { text: "Content & media", link: "/creators/elements/content" },
            { text: "Feedback & status", link: "/creators/elements/feedback" },
            { text: "Special inputs", link: "/creators/elements/special" },
          ],
        },
        {
          text: "Logic & expressions",
          collapsed: false,
          items: [
            { text: "Expressions basics", link: "/creators/expressions" },
            { text: "Conditional logic", link: "/creators/conditional-logic" },
            { text: "Calculated values", link: "/creators/calculated-values" },
            { text: "Function reference", link: "/creators/functions" },
            { text: "Cheat sheet", link: "/creators/cheat-sheet" },
          ],
        },
        {
          text: "Data & behaviour",
          collapsed: false,
          items: [
            { text: "Validation", link: "/creators/validation" },
            { text: "Events & actions", link: "/creators/events-actions" },
            { text: "Data sources", link: "/creators/data-sources" },
            { text: "Variables", link: "/creators/variables" },
            { text: "Dynamic text & templates", link: "/creators/templates" },
            { text: "Translations", link: "/creators/translations" },
          ],
        },
        {
          text: "Finishing",
          collapsed: false,
          items: [
            { text: "Preview & testing", link: "/creators/preview" },
            { text: "JSON editor", link: "/creators/json-editor" },
          ],
        },
      ],
      "/ai/": [
        {
          text: "AI reference",
          collapsed: false,
          items: [
            { text: "Overview & index", link: "/ai/" },
            { text: "Generation contract", link: "/ai/generation-contract" },
            { text: "JSON authoring rules", link: "/ai/json-authoring-rules" },
            {
              text: "Element selection map",
              link: "/ai/element-selection-map",
            },
            { text: "Logic & expressions", link: "/ai/logic-and-expressions" },
            { text: "Element rules & value shapes", link: "/ai/element-rules" },
            { text: "Properties reference", link: "/ai/properties-reference" },
            { text: "Common mistakes", link: "/ai/common-mistakes" },
            {
              text: "Legacy form migration",
              link: "/ai/legacy-form-migration",
            },
          ],
        },
      ],
      "/developers/": [
        {
          text: "Start here",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/developers/" },
            { text: "Installation", link: "/developers/installation" },
            { text: "Architecture", link: "/developers/architecture" },
          ],
        },
        {
          text: "Integration",
          collapsed: false,
          items: [
            {
              text: "Embedding the builder",
              link: "/developers/builder-integration",
            },
            {
              text: "Rendering views (runtime)",
              link: "/developers/runtime-integration",
            },
            { text: "Headless validation", link: "/developers/validator" },
            { text: "Structure JSON", link: "/developers/structure-json" },
            { text: "AI assistant backend", link: "/developers/ai-chat" },
            { text: "Licensing", link: "/developers/licensing" },
          ],
        },
        {
          text: "Host API",
          collapsed: false,
          items: [
            { text: "API service reference", link: "/developers/api-service" },
            { text: "Events reference", link: "/developers/events" },
            {
              text: "Runtime variables",
              link: "/developers/runtime-variables",
            },
            {
              text: "Data source integration",
              link: "/developers/data-sources",
            },
          ],
        },
        {
          text: "Extending",
          collapsed: false,
          items: [
            { text: "Extensions overview", link: "/developers/extensions" },
            { text: "Custom elements", link: "/developers/custom-elements" },
            {
              text: "Custom expression functions",
              link: "/developers/custom-functions",
            },
            {
              text: "Custom properties",
              link: "/developers/custom-properties",
            },
            { text: "Custom SVG icons", link: "/developers/icons" },
          ],
        },
        {
          text: "Appearance",
          collapsed: false,
          items: [
            { text: "Theming & design tokens", link: "/developers/theming" },
            { text: "Custom CSS", link: "/developers/custom-css" },
            { text: "UI translations", link: "/developers/ui-translations" },
          ],
        },
        {
          text: "Plugins",
          collapsed: false,
          items: [
            { text: "Using plugins", link: "/developers/plugins" },
            {
              text: "Building a plugin",
              link: "/developers/plugin-development",
            },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/ngxviewbuilder/ngx-view-builder-community",
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3], label: "On this page" },
    docFooter: { prev: "Previous", next: "Next" },
    footer: {
      message:
        'Documentation for NGX View Builder. Found a bug or have an idea? <a href="https://github.com/ngxviewbuilder/ngx-view-builder-community/issues" target="_blank" rel="noopener">Open an issue</a>. ' +
        '<a href="/developers/licensing">License</a> · <a href="/privacy">Privacy</a> · <a href="mailto:support@ngxviewbuilder.io">support@ngxviewbuilder.io</a>',
      copyright: `Copyright © ${new Date().getFullYear()} NGX View Builder`,
    },
  },
});
