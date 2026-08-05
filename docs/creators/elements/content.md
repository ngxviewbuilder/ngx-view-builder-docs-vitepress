---
title: Content & media
description: Rich text, Custom HTML, Image, Video, Iframe, Icon, Avatar, Page title, Breadcrumbs, and Chart, with full property tables.
---

# Content & media

Presentational elements. They display information and add nothing to the form data.

## Rich text (`richText` / `richTextViewer`)

Formatted text written in a WYSIWYG editor: headings, bold, lists, links, images, video. Use it for instructions, section intros, and legal text. The viewer variant renders content read-only at runtime.

| Property | What it does |
| --- | --- |
| **HTML content** | The content itself. Opens in a dialog you can move and resize, with a *Text editor* and an *HTML* tab. Placeholders render live values: <code v-pre>{{firstName}}</code> or `{user.name}`. See [Dynamic text & templates](../templates). |
| **HTML source path** | Viewer only: take the markup from a data path or a source response instead of the property. |
| **Visible tools** | Which toolbar buttons the editor offers: bold, italic, underline, strikethrough, headings, font family, text size, colors, highlight, alignment, lists, quote, inline code, link, image, horizontal rule, line spacing, sub/superscript, undo/redo, clear formatting. |

The viewer resolves placeholders too, so markup arriving from data can carry `{el2}`, `{variable1}`, or `{row.column3}` inside a table row.

Content written in a Custom HTML element renders the same way here. Both elements read the same `<style>` block and the same classes, so text colors, fonts, sizes, and alignment survive a copy from one to the other.

## Custom HTML (`customHtml` / `htmlSnippet`)

Raw HTML for layouts the rich text editor can't produce. HTML is sanitised at runtime, so scripts are stripped.

| Property | What it does |
| --- | --- |
| **HTML template** | Supports `@if`/`@for` blocks, <code v-pre>{{...}}</code> placeholders, and click bindings: `(click)="action('Open dialog')"` or `(click)="loadData(id)"`. |
| **Template ref** | Reference to a [Templates-tab](../templates) template. Wins over the inline HTML. |
| **HTML source path** | Take the markup from a data path or source response instead of a static property. |

## Image (`image`)

| Property | What it does |
| --- | --- |
| **Source URL** | Image address (can contain `{tokens}`). |
| **Local file** | Pick an image from your computer. It is stored as a data URL and takes priority over the URL. |
| **Alt text** | Accessibility text, also shown when the image fails to load. |
| **Fit** | How the image fills its box: `cover`, `contain`, `fill`, `none` (CSS `object-fit`). |
| **Object position** | Which part stays visible with `cover` (CSS `object-position`). |
| **Image height / Radius** | Sizing and corner rounding. |
| **Loading mode** | `eager` or `lazy`. |
| **Link URL** + **Open in new tab** | Make the image clickable. |
| **Caption** + **Caption alignment** | Short context or source line under the image. |

## Video (`video`)

Embedded video player.

| Property | What it does |
| --- | --- |
| **Provider** | `native`, `youtube`, or `vimeo`. Determines which extra settings apply. |
| **Source URL** | Video or YouTube/Vimeo URL. Insecure or missing URLs are blocked. |
| **Autoplay** | Browsers usually require **Muted** together with autoplay. |
| **Muted / Loop / Controls** | Playback basics; disable controls only with your own UI. |
| **Plays inline** | Play inline instead of fullscreen on mobile (important on iOS). |
| **Poster** | Preview image before playback. |
| **Privacy mode** | Reduced-tracking embed where the provider supports it. |
| **Aspect ratio** | Keeps a constant width-to-height ratio. |

## IFrame (`iframe`)

Embeds an external page: maps, dashboards, documents. The URL can include field tokens: `https://maps.example.com?q={city}`. Insecure sources are blocked.

| Property | What it does |
| --- | --- |
| **Source URL** | The embedded address. |
| **Frame height** | Base height for the frame. |
| **Allow** | The iframe `allow` attribute. Grant only what's needed (`fullscreen; clipboard-read`). |
| **Allow fullscreen** | Lets the embedded content go fullscreen. |
| **Sandbox** | The `sandbox` attribute. Restrict carefully; an overly strict sandbox can break the content. |
| **Referrer policy** | Only when the embedded host requires specific behaviour. |

## Icon (`icon`)

A single icon by name, for decoration or visual anchors.

| Property | What it does |
| --- | --- |
| **Icon** | Material Symbol code or a registered SVG icon name. Developers can register extra SVG icons; ask which names your project has. |
| **Icon color / Icon size** | Visual tuning. |

## Avatar (`avatar`)

A round profile image with fallback initials. Configure the image URL, the name text, size, and shape; an optional **Link URL** makes it clickable.

## Page title (`pageTitle`)

A styled heading for the top of a page, larger than a label.

| Property | What it does |
| --- | --- |
| **Title / Subtitle** | Heading and support text. |
| **Level** | Heading level (h1, h2…) for consistent document structure. |
| **Show divider** | A separator line under the title block. |
| **Title underline** (+ color, width) | Accent line under the title text. |

## Breadcrumbs (`breadcrumbs`)

A navigation trail (*Clients / Jonas / Edit*). Items can be static or built from the route and data.

| Property | What it does |
| --- | --- |
| **Show home** + **Home label** + **Home URL** | The leading home link. |
| **Separator** | The divider between items. |
| **Include current page** | Whether the current page appears as the last crumb. |
| **Route label data key** | Take item labels from a data-source object. |
| **Use path fallback** | Fall back to the URL segment when no label is found. |

## Chart (`chart`)

Renders a chart from a data source or expression-provided data.

| Property | What it does |
| --- | --- |
| **Chart type** | `bar`, `line`, `pie`, … Match it to the data shape. |
| **Data source / Chart data path** | Where the series data comes from; point the path at the dataset (`stats.points`). |
| **Points** | Data passed directly at the property level (instead of a source). |
| **Label / value mapping** | Which fields feed axes and series. |
| **Chart height** | Stable widget size for dashboards and cards. |
| **Show legend** | Explains colors/series. |

Charts refresh when their data source reloads. Combine that with **React to change** to make dashboards live.
