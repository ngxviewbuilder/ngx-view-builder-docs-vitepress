import { defineConfig } from "vitepress";
import { GA_ID } from "./theme/analytics";

const SITE_URL = "https://ngxviewbuilder.io";
const SITE_DESCRIPTION =
  "NGX View Builder is a visual, drag-and-drop form and view builder for Angular. Design forms, dashboards, and data tables as JSON in a low-code builder, and render them natively with a full Angular runtime.";
const OG_IMAGE = `${SITE_URL}/LOGO.png`;

// Keyword-forward title for the home page and its social cards. The brand name
// alone ("NGX View Builder") is not something people search for, so the home
// <title> leads with the generic terms it should rank for.
const HOME_TITLE = "Angular Form, View & Dashboard Builder | NGX View Builder";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NGX View Builder",
  alternateName: "Angular Form & View Builder",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: OG_IMAGE,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  keywords:
    "Angular form builder, Angular view builder, Angular dashboard builder, low-code Angular, drag-and-drop form builder, JSON schema forms",
  featureList: [
    "Drag-and-drop visual form and view builder for Angular",
    "47 elements: inputs, choices, data tables, charts, KPI cards, tabs, steppers",
    "No-code conditional logic, validation, and expression language",
    "Live REST/route data sources with dependent fields and server-side tables",
    "Native Angular runtime with a typed API service and 59 events",
  ],
  sameAs: ["https://github.com/ngxviewbuilder/ngx-view-builder-community"],
};

export default defineConfig({
  lang: "en-US",
  title: "NGX View Builder",
  // Inner pages get "<Page title> | NGX View Builder". The home page overrides
  // this with `titleTemplate: false` in its own frontmatter (see index.md).
  titleTemplate: ":title | NGX View Builder",
  description: SITE_DESCRIPTION,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: SITE_URL,
  },
  head: [
    ["link", { rel: "icon", href: "/brand-mark.svg" }],
    ["meta", { name: "theme-color", content: "#1554ff" }],
    ["meta", { name: "google-site-verification", content: "Gu0m-v64N5w1PHAX9p0uPPm-epZSUrNr1v-IZqBGLdw" }],
    ["meta", { name: "keywords", content: "Angular form builder, Angular view builder, Angular dashboard builder, drag-and-drop form builder, low-code Angular, JSON schema forms, visual view builder, Angular data table builder, Angular low-code builder" }],
    // Site-wide Open Graph. Per-page og:title / og:description / og:url and the
    // canonical link are added in transformPageData below so every page reflects
    // its own content instead of the home page's.
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "NGX View Builder" }],
    ["meta", { property: "og:image", content: OG_IMAGE }],
    // Twitter card (per-page title/description added in transformPageData)
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: OG_IMAGE }],
    // Structured data so answer engines (Perplexity, Google AI Overviews, etc.)
    // can identify what this product is without parsing prose.
    ["script", { type: "application/ld+json" }, JSON.stringify(STRUCTURED_DATA)],
    // gtag.js bootstrap, loads on every page like any standard gtag.js setup
    // (loading the library alone sends nothing, sets no cookie). Consent
    // defaults to denied here; theme/analytics.ts flips it to granted (and
    // only then calls `config`, which is what actually starts sending
    // measurement requests) once the visitor accepts the cookie banner. See
    // theme/components/CookieConsent.vue.
    ["script", { async: "", src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}` }],
    [
      "script",
      {},
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});`,
    ],
  ],
  // Emit a correct canonical URL and per-page Open Graph / Twitter tags for
  // every page. Without this, all pages would share the home page's og:url and
  // have no canonical, which weakens indexing of the individual doc pages.
  transformPageData(pageData) {
    const rel = pageData.relativePath;
    const isHome = rel === "index.md";

    let route: string;
    if (isHome) route = "/";
    else if (rel.endsWith("/index.md"))
      route = "/" + rel.slice(0, -"index.md".length); // e.g. "/developers/"
    else route = "/" + rel.replace(/\.md$/, ""); // e.g. "/developers/installation"

    // Trailing slash on "/" matches what VitePress emits in sitemap.xml.
    const canonical = `${SITE_URL}${route}`;
    const title = isHome ? HOME_TITLE : `${pageData.title} | NGX View Builder`;
    const description = pageData.description || SITE_DESCRIPTION;

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
    );
  },
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
            { text: "Live builder command API", link: "/ai/command-api" },
            { text: "Generation contract", link: "/ai/generation-contract" },
            { text: "Layout model", link: "/ai/layout-model" },
            { text: "JSON authoring rules", link: "/ai/json-authoring-rules" },
            {
              text: "Element selection map",
              link: "/ai/element-selection-map",
            },
            { text: "Logic & expressions", link: "/ai/logic-and-expressions" },
            { text: "Element rules & value shapes", link: "/ai/element-rules" },
            { text: "Properties reference", link: "/ai/properties-reference" },
            { text: "Common mistakes", link: "/ai/common-mistakes" },
            { text: "Verified examples", link: "/ai/examples" },
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
            {
              text: "Schema versioning",
              link: "/developers/schema-versioning",
            },
            { text: "AI assistant backend", link: "/developers/ai-chat" },
            { text: "Licensing", link: "/developers/licensing" },
          ],
        },
        {
          text: "Host API",
          collapsed: false,
          items: [
            { text: "API service reference", link: "/developers/api-service" },
            { text: "AI command API", link: "/developers/ai-command-api" },
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
            {
              text: "Custom validator types",
              link: "/developers/custom-validators",
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
              text: "Templates plugin reference",
              link: "/developers/plugin-templates",
            },
            {
              text: "Building a plugin",
              link: "/developers/plugin-development",
            },
          ],
        },
      ],
    },
    // socialLinks sąmoningai tuščias: GitHub navbare rodomas kaip
    // GitHubStarBadge (theme/Layout.vue), kad matytųsi ir žvaigždučių skaičius.
    search: { provider: "local" },
    outline: { level: [2, 3], label: "On this page" },
    docFooter: { prev: "Previous", next: "Next" },
    // Data be laiko: dokumentacijos puslapiui valanda nieko nereiškia, o
    // "7/28/26, 9:15 PM" atrodo kaip commit'o žyma, ne kaip atnaujinimo data.
    lastUpdated: { formatOptions: { dateStyle: "medium" } },
    footer: {
      message:
        'Documentation for NGX View Builder. Found a bug or have an idea? <a href="https://github.com/ngxviewbuilder/ngx-view-builder-community/issues" target="_blank" rel="noopener">Open an issue</a>. ' +
        '<a href="https://github.com/ngxviewbuilder/ngx-view-builder-community/releases" target="_blank" rel="noopener">Releases</a> · <a href="/developers/licensing">License</a> · <a href="/privacy">Privacy</a> · <a href="mailto:support@ngxviewbuilder.io">support@ngxviewbuilder.io</a>',
      copyright: `Copyright © ${new Date().getFullYear()} NGX View Builder`,
    },
  },
});
