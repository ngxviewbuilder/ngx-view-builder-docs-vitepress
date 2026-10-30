// Regenerates docs/public/llms.txt and docs/public/llms-full.txt from the
// current docs/**/*.md source, following the llmstxt.org convention:
//   - llms.txt      : a short linked index (title + one-line description per page)
//   - llms-full.txt : the full text of every page concatenated, for tools/agents
//                      that fetch a single URL instead of crawling links
// Run via `npm run generate:llms`, or automatically before `docs:build`.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const SITE_URL = 'https://ngxviewbuilder.io';

// The YouTube lessons. Pages embed them as <YouTubeVideo id="…" />; in the Markdown
// copies they become plain links an agent can follow.
const { videos } = JSON.parse(readFileSync(path.join(DOCS_DIR, '.vitepress', 'videos.json'), 'utf8'));
const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function videoMarkdown(id, start = 0) {
  const video = videos.find((v) => v.id === id);
  if (!video) return '';
  const url = `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`;
  const chapters = video.chapters.map((c) => `${formatTime(c.at)} ${c.title}`).join(', ');
  return (
    `**Video lesson ${video.lesson} (${formatTime(video.seconds)}):** [${video.title}](${url}). ` +
    `${video.description} Chapters: ${chapters}.`
  );
}

function replaceVideoComponents(body) {
  return body.replace(/<YouTubeVideo\s+id="([^"]+)"(?:\s+:start="(\d+)")?\s*\/>/g, (_, id, start) =>
    videoMarkdown(id, Number(start ?? 0)),
  );
}

const SUMMARY =
  'NGX View Builder is a visual builder for complete Angular views: forms, dashboards, data tables, and guided flows are designed in a drag-and-drop builder, stored as JSON, and rendered natively in an Angular app. It installs as @ngxviewbuilder/runtime (free) and @ngxviewbuilder/designer (the builder); the old unscoped ngx-view-builder package is no longer updated. The builder has no AI chat or model inside it: AI clients (Claude, ChatGPT, Cursor, agents) drive it from outside over MCP, and Ask AI by an expression sends what the person wrote to that same client. View JSON is checked with `npx nvb validate` and the JSON Schema in @ngxviewbuilder/runtime/schema/view.schema.json.';

// A few top-level pages use VitePress's `home`/`page` layouts instead of plain
// prose and have no `description:` frontmatter, so they are described by hand instead.
const MANUAL_DESCRIPTIONS = {
  'demo.md':
    'Live, interactive demo: build a view in the Builder tab and see it rendered in the Runtime tab, right in the browser.',
  'privacy.md': 'Privacy policy.',
};

// Pages without a plain `title:` or `# heading` get a title here.
const MANUAL_TITLES = {};

const AI_PAGE_ORDER = [
  'ai/index.md',
  'ai/generation-contract.md',
  'ai/layout-model.md',
  'ai/json-authoring-rules.md',
  'ai/element-selection-map.md',
  'ai/logic-and-expressions.md',
  'ai/element-rules.md',
  'ai/properties-reference.md',
  'ai/common-mistakes.md',
  'ai/good-practices.md',
  'ai/examples.md',
];

function walkMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '.vitepress') continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkMarkdownFiles(full));
    } else if (entry.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, '').trim();
}

// `extensionlessPath` is a docs-relative path with no `.md` extension, e.g.
// `developers/licensing` or `ai/index`. Directory-index pages are served at
// the trailing-slash URL (matches `cleanUrls: true` + the site's own nav
// config, e.g. `/developers/`, `/ai/`), everything else drops the extension.
function pathToUrl(extensionlessPath) {
  if (extensionlessPath === 'index') return `${SITE_URL}/`;
  if (extensionlessPath.endsWith('/index')) {
    return `${SITE_URL}/${extensionlessPath.slice(0, -'index'.length)}`;
  }
  return `${SITE_URL}/${extensionlessPath}`;
}

function toUrl(relFromDocs) {
  return pathToUrl(relFromDocs.replace(/\.md$/, ''));
}

// Resolves a markdown link found inside `relFromDocs` to an absolute site URL,
// so llms-full.txt (a single concatenated file with no surrounding site
// context) still has working links. Absolute/mailto/anchor-only links pass
// through; everything else is resolved against the source file's own
// directory in the docs tree (VitePress's own relative-link convention).
function resolveLink(relFromDocs, link) {
  if (/^([a-z][a-z0-9+.-]*:)/i.test(link)) return link; // http(s):, mailto:, etc.
  if (link.startsWith('#')) return `${toUrl(relFromDocs)}${link}`;

  const hashIndex = link.indexOf('#');
  const pathPart = hashIndex === -1 ? link : link.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? '' : link.slice(hashIndex);

  const baseDir = link.startsWith('/') ? '' : path.posix.dirname(relFromDocs);
  const joined = link.startsWith('/')
    ? pathPart.slice(1)
    : path.posix.normalize(path.posix.join(baseDir, pathPart));

  return `${pathToUrl(joined.replace(/\.md$/, ''))}${hashPart}`;
}

function absolutizeLinks(relFromDocs, body) {
  return body.replace(/(!?\[[^\]]*\]\()([^)\s]+)(\s*(?:"[^"]*")?\))/g, (match, prefix, link, suffix) =>
    `${prefix}${resolveLink(relFromDocs, link)}${suffix}`,
  );
}

function parsePage(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const relFromDocs = path.relative(DOCS_DIR, filePath).split(path.sep).join('/');

  let body = raw;
  let title = '';
  let description = '';

  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
    const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
    if (titleMatch) title = stripQuotes(titleMatch[1]);
    if (descriptionMatch) description = stripQuotes(descriptionMatch[1]);
    body = raw.slice(frontmatterMatch[0].length);
  }

  if (!description) description = MANUAL_DESCRIPTIONS[relFromDocs] ?? '';
  if (!title) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    title = h1Match ? h1Match[1].trim() : (MANUAL_TITLES[relFromDocs] ?? relFromDocs);
  }

  // Strip raw <style>...</style> blocks (page-local CSS), which is noise for an AI corpus.
  body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim();
  body = replaceVideoComponents(body);

  return { relFromDocs, title, description, body, url: toUrl(relFromDocs) };
}

function pagesUnder(prefix, pages) {
  return pages
    .filter((p) => p.relFromDocs.startsWith(prefix))
    .sort((a, b) => {
      const aIsIndex = a.relFromDocs === `${prefix}index.md`;
      const bIsIndex = b.relFromDocs === `${prefix}index.md`;
      if (aIsIndex !== bIsIndex) return aIsIndex ? -1 : 1;
      return a.relFromDocs.localeCompare(b.relFromDocs);
    });
}

function orderAiPages(aiPages) {
  return [...aiPages].sort(
    (a, b) => AI_PAGE_ORDER.indexOf(a.relFromDocs) - AI_PAGE_ORDER.indexOf(b.relFromDocs),
  );
}

const allFiles = walkMarkdownFiles(DOCS_DIR).sort();
const pages = allFiles.map(parsePage);

const groups = [
  { title: 'AI reference (machine-first, start here)', pages: orderAiPages(pagesUnder('ai/', pages)) },
  { title: 'Developer documentation', pages: pagesUnder('developers/', pages) },
  { title: 'Creator documentation', pages: pagesUnder('creators/', pages) },
  {
    title: 'Product',
    pages: pages.filter((p) => !p.relFromDocs.includes('/')),
  },
];

// --- llms.txt: linked index ---

let llmsTxt = `# NGX View Builder\n\n> ${SUMMARY} This file indexes the documentation an AI agent should read, most important first.\n\n`;
llmsTxt +=
  `Every page below is also served as plain Markdown: add \`.md\` to its URL ` +
  `(\`${SITE_URL}/creators/functions.md\`), or \`index.md\` when the URL ends in a slash ` +
  `(\`${SITE_URL}/developers/index.md\`).\n\n`;

for (const group of groups) {
  if (!group.pages.length) continue;
  llmsTxt += `## ${group.title}\n\n`;
  for (const p of group.pages) {
    llmsTxt += `- [${p.title}](${p.url}): ${p.description}\n`;
  }
  llmsTxt += `\n`;
}
llmsTxt +=
  `## Single-file bundles\n\n` +
  `- [JSON authoring reference](${SITE_URL}/llms-authoring.txt): every AI reference page in one file. ` +
  `Paste this when the task is writing or fixing NGX View Builder structure JSON.\n` +
  `- [Everything](${SITE_URL}/llms-full.txt): the full site, including host integration, theming and plugins.\n` +
  `- [Machine index](${SITE_URL}/ai/retrieval-map.json): JSON map of request profiles to source files.\n`;

writeFileSync(path.join(DOCS_DIR, 'public', 'llms.txt'), `${llmsTxt.trimEnd()}\n`);

// --- llms-full.txt: full text of every page, concatenated ---

let llmsFull =
  `# NGX View Builder\n\n> ${SUMMARY}\n\n` +
  `This file contains the full text of every documentation page, concatenated for AI agents and ` +
  `tools that cannot crawl links. See ${SITE_URL}/llms.txt for a linked index instead.\n\n---\n\n`;

for (const group of groups) {
  for (const p of group.pages) {
    const body = absolutizeLinks(p.relFromDocs, p.body);
    llmsFull += `## ${p.title}\n\nSource: ${p.url}\n\n${body}\n\n---\n\n`;
  }
}

writeFileSync(path.join(DOCS_DIR, 'public', 'llms-full.txt'), `${llmsFull.trimEnd()}\n`);

// --- llms-authoring.txt: the AI reference only ---
//
// llms-full.txt carries the whole site (privacy, creator guides, host
// integration), which is roughly three times the size and mostly irrelevant when
// the only task is "write me a view as NGX View Builder JSON". This file is the
// /ai/ section alone: the rules, the property reference and the worked examples.
// It is the file to paste into ChatGPT/Claude/Gemini for a JSON-authoring session.

const aiGroup = groups.find((g) => g.title.startsWith('AI reference'));

let llmsAuthoring =
  `# NGX View Builder: JSON authoring reference\n\n> ${SUMMARY}\n\n` +
  `This file is the complete AI reference for AUTHORING NGX View Builder structure JSON: ` +
  `the rules of engagement, the layout model, every supported property, and verified end-to-end examples. ` +
  `It is self-contained on purpose, so it can be pasted whole into a chat as system material.\n\n` +
  `Read it as a specification, not as inspiration. Element types, property names and object shapes are exact ` +
  `and case-sensitive; every JSON block here is machine-checked against the library source. ` +
  `A property that does not appear in this file does not exist, and writing one is silently ignored at runtime, ` +
  `so the view ships broken with no error anywhere.\n\n` +
  `For host-side integration (embedding the builder, the runtime API, events, theming, plugins) ` +
  `see ${SITE_URL}/llms-full.txt instead.\n\n---\n\n`;

for (const p of aiGroup?.pages ?? []) {
  const body = absolutizeLinks(p.relFromDocs, p.body);
  llmsAuthoring += `## ${p.title}\n\nSource: ${p.url}\n\n${body}\n\n---\n\n`;
}

writeFileSync(path.join(DOCS_DIR, 'public', 'llms-authoring.txt'), `${llmsAuthoring.trimEnd()}\n`);

// --- publish retrieval-map.json ---
//
// The map lives at docs/ai/retrieval-map.json because that is where the reference
// backend reads it from (see ngx-view-builder-ai-agent/src/reference-context.js).
// VitePress only copies docs/public verbatim, so without this step the documented
// URL https://ngxviewbuilder.io/ai/retrieval-map.json is a 404 in production.

const retrievalMapSource = path.join(DOCS_DIR, 'ai', 'retrieval-map.json');
const retrievalMapTarget = path.join(DOCS_DIR, 'public', 'ai', 'retrieval-map.json');
mkdirSync(path.dirname(retrievalMapTarget), { recursive: true });
copyFileSync(retrievalMapSource, retrievalMapTarget);

// --- one Markdown file per page ---
//
// Agents that fetch a single page (Claude Code, Cursor, ChatGPT browsing) read Markdown far
// better than the rendered HTML with its navigation and scripts. Every page is written as
// clean Markdown with absolute links; config.mts copies the folder next to the HTML at
// build end, so /creators/functions has /creators/functions.md beside it.

const MARKDOWN_DIR = path.join(DOCS_DIR, '.vitepress', 'markdown-pages');
rmSync(MARKDOWN_DIR, { recursive: true, force: true });
for (const p of pages) {
  if (p.relFromDocs === '404.md') continue;
  const body = absolutizeLinks(p.relFromDocs, p.body);
  const h1 = body.match(/^#\s+.+$/m);
  const heading = h1 && body.trimStart().startsWith(h1[0]) ? h1[0] : `# ${p.title}`;
  const rest = heading === h1?.[0] ? body.trimStart().slice(h1[0].length).trimStart() : body;
  const intro = `${p.description ? `> ${p.description}\n\n` : ''}Source: ${p.url}\n\n`;
  const target = path.join(MARKDOWN_DIR, p.relFromDocs);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${heading}\n\n${intro}${rest.trimEnd()}\n`);
}

const kb = (s) => `${Math.round(s.length / 1024)} KB`;
console.log(
  `generate-llms: indexed ${pages.length} pages -> ` +
    `llms.txt (${kb(llmsTxt)}), llms-full.txt (${kb(llmsFull)}), ` +
    `llms-authoring.txt (${kb(llmsAuthoring)}, ${aiGroup?.pages.length ?? 0} AI pages), ` +
    `public/ai/retrieval-map.json, ${pages.length} Markdown pages`,
);
