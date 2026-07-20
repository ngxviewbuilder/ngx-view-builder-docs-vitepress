// Regenerates docs/public/llms.txt and docs/public/llms-full.txt from the
// current docs/**/*.md source, following the llmstxt.org convention:
//   - llms.txt      — a short linked index (title + one-line description per page)
//   - llms-full.txt — the full text of every page concatenated, for tools/agents
//                      that fetch a single URL instead of crawling links
// Run via `npm run generate:llms`, or automatically before `docs:build`.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const SITE_URL = 'https://ngxviewbuilder.io';

const SUMMARY =
  'NGX View Builder is a visual builder for complete Angular views: forms, dashboards, data tables, and guided flows are designed in a drag-and-drop builder, stored as JSON, and rendered natively in an Angular app.';

// A few top-level pages use VitePress's `home`/`page` layouts instead of plain
// prose and have no `description:` frontmatter — described by hand instead.
const MANUAL_DESCRIPTIONS = {
  'index.md': 'Product homepage — what NGX View Builder is, key features, and links to get started.',
  'demo.md':
    'Live, interactive demo — build a view in the Builder tab and see it rendered in the Runtime tab, right in the browser.',
  'pricing.md': 'Licensing plans and pricing.',
  'privacy.md': 'Privacy policy.',
};

// `index.md` uses VitePress's `hero:` block (no plain `title:` or `# heading`).
const MANUAL_TITLES = {
  'index.md': 'NGX View Builder — the visual builder for complete Angular views',
};

const AI_PAGE_ORDER = [
  'ai/index.md',
  'ai/generation-contract.md',
  'ai/json-authoring-rules.md',
  'ai/element-selection-map.md',
  'ai/logic-and-expressions.md',
  'ai/element-rules.md',
  'ai/properties-reference.md',
  'ai/common-mistakes.md',
  'ai/legacy-form-migration.md',
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

  // Strip raw <style>...</style> blocks (page-local CSS) — noise for an AI corpus.
  body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim();

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
  { title: 'AI reference (machine-first — start here)', pages: orderAiPages(pagesUnder('ai/', pages)) },
  { title: 'Developer documentation', pages: pagesUnder('developers/', pages) },
  { title: 'Creator documentation', pages: pagesUnder('creators/', pages) },
  {
    title: 'Product & pricing',
    pages: pages.filter((p) => !p.relFromDocs.includes('/')),
  },
];

// --- llms.txt: linked index ---

let llmsTxt = `# NGX View Builder\n\n> ${SUMMARY} This file indexes the documentation an AI agent should read, most important first.\n\n`;

for (const group of groups) {
  if (!group.pages.length) continue;
  llmsTxt += `## ${group.title}\n\n`;
  for (const p of group.pages) {
    llmsTxt += `- [${p.title}](${p.url}): ${p.description}\n`;
  }
  llmsTxt += `\n`;
}
llmsTxt += `- [Machine index](${SITE_URL}/ai/retrieval-map.json): JSON map of request profiles to source files\n`;

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

console.log(`generate-llms: indexed ${pages.length} pages -> llms.txt + llms-full.txt`);
