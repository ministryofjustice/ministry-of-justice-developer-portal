#!/usr/bin/env node

/**
 * Ingestion Pipeline
 *
 * Clones external documentation repos, converts their content
 * (including tech-docs-template .html.md.erb files) into standard
 * Markdown, and writes it to content/docs/ for the portal build.
 *
 * Usage:
 *   node scripts/ingest.mjs                  # ingest all enabled sources
 *   node scripts/ingest.mjs cloud-platform   # ingest a single source
 *   node scripts/ingest.mjs --dry-run        # preview without writing
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'docs');
const SOURCES_FILE = path.join(ROOT, 'sources.json');
const CLONE_DIR = path.join(ROOT, '.ingestion-cache');
const SUPPORTED_FORMATS = new Set(['tech-docs-template', 'markdown', 'docsify']);
const ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.avif',
  '.bmp',
  '.ico',
  '.pdf',
  '.csv',
  '.xlsx',
  '.xls',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.zip',
  '.drawio',
  '.excalidraw',
]);

// ── CLI args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetId = args.find((a) => !a.startsWith('--'));

// ── Load sources ────────────────────────────────────────────────
const { sources } = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'));

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📚 Developer Portal — Content Ingestion`);
  console.log(`   Sources file: ${SOURCES_FILE}`);
  console.log(`   Output dir:   ${CONTENT_DIR}`);
  if (dryRun) console.log('   ⚠️  DRY RUN — no files will be written\n');
  else console.log('');

  fs.mkdirSync(CLONE_DIR, { recursive: true });

  const toProcess = sources.filter(
    (s) => s.enabled && (!targetId || s.id === targetId)
  );

  if (toProcess.length === 0) {
    console.log('No matching sources found.');
    process.exit(1);
  }

  const results = [];

  for (const source of toProcess) {
    console.log(`\n─── ${source.name} (${source.id}) ───`);
    try {
      validateSource(source);
      const stats = await ingestSource(source);
      results.push({ id: source.id, ...stats });
      console.log(`  ✅ ${stats.pages} pages ingested, ${stats.assets} assets copied`);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      results.push({ id: source.id, pages: 0, error: err.message });
    }
  }

  // Summary
  console.log('\n─── Summary ───');
  for (const r of results) {
    const status = r.error ? `❌ ${r.error}` : `✅ ${r.pages} pages, ${r.assets} assets`;
    console.log(`  ${r.id}: ${status}`);
  }
  console.log('');

  if (results.some((r) => r.error)) {
    process.exit(1);
  }
}

// ── Ingest a single source ──────────────────────────────────────
async function ingestSource(source) {
  const repoDir = cloneOrPull(source);
  const portalYamlPath = path.join(repoDir, 'portal.yaml');
  let config = { ...source };

  // If repo has a portal.yaml, merge it
  if (fs.existsSync(portalYamlPath)) {
    console.log('  Found portal.yaml — merging config');
    const yaml = parseSimpleYaml(fs.readFileSync(portalYamlPath, 'utf-8'));
    if (yaml.docs?.path) config.docsPath = yaml.docs.path;
    if (yaml.owner_slack) config.owner_slack = yaml.owner_slack;
  }

  const docsRoot = path.join(repoDir, config.docsPath || '');
  if (!fs.existsSync(docsRoot)) {
    throw new Error(`Docs path not found: ${config.docsPath}`);
  }

  const outputDir = path.join(CONTENT_DIR, source.id);
  const publicAssetsDir = path.join(ROOT, 'public', 'docs', source.id);

  // Discover source files
  const files = discoverFiles(docsRoot, config.format);
  console.log(`  Found ${files.length} source files in ${config.docsPath}`);

  if (files.length === 0) {
    throw new Error(`No source files found for format '${config.format}' in docsPath '${config.docsPath}'`);
  }

  if (dryRun) {
    let dryRunAssetCount = 0;
    const dryRunAssetPaths = new Set();

    for (const f of files) {
      console.log(`  [dry-run] ${f.relative}`);
      const converted = convertFile(f, source);
      const referencedAssets = collectReferencedAssets(
        converted.content,
        f.absolute,
        docsRoot,
        config.docsPath || ''
      );

      for (const relPath of referencedAssets) {
        if (dryRunAssetPaths.has(relPath)) continue;
        dryRunAssetPaths.add(relPath);
        dryRunAssetCount++;
      }
    }
    console.log(`  [dry-run] ${dryRunAssetCount} referenced assets to copy`);
    return { pages: files.length, assets: dryRunAssetCount };
  }

  const stagingRoot = fs.mkdtempSync(path.join(CLONE_DIR, `staging-${source.id}-`));
  const stageOutputDir = path.join(stagingRoot, 'content');
  const stagePublicAssetsDir = path.join(stagingRoot, 'public');

  fs.mkdirSync(stageOutputDir, { recursive: true });
  fs.mkdirSync(stagePublicAssetsDir, { recursive: true });

  let pageCount = 0;
  const assetPaths = new Set();

  for (const file of files) {
    const converted = convertFile(file, source);
    const outputPath = path.join(stageOutputDir, converted.outputRelative);
    assertPathInside(outputPath, stageOutputDir, 'output page path');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, converted.content, 'utf-8');

    const referencedAssets = collectReferencedAssets(
      converted.content,
      file.absolute,
      docsRoot,
      config.docsPath || ''
    );
    for (const relPath of referencedAssets) {
      assetPaths.add(relPath);
    }

    pageCount++;
  }

  let assetCount = 0;
  for (const relPath of assetPaths) {
    const src = path.join(docsRoot, relPath);
    const contentDest = path.join(stageOutputDir, relPath);
    const publicDest = path.join(stagePublicAssetsDir, relPath);

    assertPathInside(contentDest, stageOutputDir, 'content asset path');
    assertPathInside(publicDest, stagePublicAssetsDir, 'public asset path');

    fs.mkdirSync(path.dirname(contentDest), { recursive: true });
    fs.copyFileSync(src, contentDest);

    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
    fs.copyFileSync(src, publicDest);

    assetCount++;
  }

  // Write _meta.json
  const meta = {
    name: source.name,
    description: source.description,
    category: source.category,
    source_repo: source.repo,
    ingested_at: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(stageOutputDir, '_meta.json'),
    JSON.stringify(meta, null, 2),
    'utf-8'
  );

  assertPathInside(outputDir, CONTENT_DIR, 'final output directory');
  assertPathInside(publicAssetsDir, path.join(ROOT, 'public', 'docs'), 'final public assets directory');

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  if (fs.existsSync(publicAssetsDir)) {
    fs.rmSync(publicAssetsDir, { recursive: true });
  }

  fs.mkdirSync(path.dirname(outputDir), { recursive: true });
  fs.mkdirSync(path.dirname(publicAssetsDir), { recursive: true });
  fs.renameSync(stageOutputDir, outputDir);
  fs.renameSync(stagePublicAssetsDir, publicAssetsDir);

  fs.rmSync(stagingRoot, { recursive: true, force: true });

  return { pages: pageCount, assets: assetCount };
}

function validateSource(source) {
  if (!source || typeof source !== 'object') {
    throw new Error('Invalid source: expected object');
  }

  const required = ['id', 'name', 'repo', 'docsPath', 'format'];
  for (const field of required) {
    if (!source[field] || typeof source[field] !== 'string') {
      throw new Error(`Invalid source '${source.id || 'unknown'}': missing required field '${field}'`);
    }
  }

  if (!/^[a-z0-9-]+$/.test(source.id)) {
    throw new Error(`Invalid source id '${source.id}': must be kebab-case`);
  }

  if (!SUPPORTED_FORMATS.has(source.format)) {
    throw new Error(`Unsupported format '${source.format}' for source '${source.id}'`);
  }
}

function assertPathInside(targetPath, allowedRoot, label) {
  const normalizedTarget = path.resolve(targetPath);
  const normalizedRoot = path.resolve(allowedRoot);
  const relative = path.relative(normalizedRoot, normalizedTarget);

  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return;
  }

  throw new Error(`Unsafe ${label}: ${targetPath}`);
}

// ── Git operations ──────────────────────────────────────────────
function cloneOrPull(source) {
  const repoSlug = source.repo.replace(/\//g, '--');
  const repoDir = path.join(CLONE_DIR, repoSlug);
  const repoUrl = `https://github.com/${source.repo}.git`;
  const branch = source.branch || 'main';

  if (fs.existsSync(path.join(repoDir, '.git'))) {
    console.log(`  Pulling latest from ${source.repo}...`);
    execFileSync('git', ['fetch', 'origin', branch, '--depth=1'], {
      cwd: repoDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['reset', '--hard', `origin/${branch}`], {
      cwd: repoDir,
      stdio: 'pipe',
    });
  } else {
    console.log(`  Cloning ${source.repo} (shallow)...`);
    execFileSync('git', ['clone', '--depth=1', '--branch', branch, repoUrl, repoDir], {
      stdio: 'pipe',
    });
  }

  return repoDir;
}

// ── File discovery ──────────────────────────────────────────────
function discoverFiles(docsRoot, format) {
  const files = [];
  walkForFiles(docsRoot, docsRoot, files, format);
  return files;
}

function walkForFiles(dir, root, files, format) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip hidden, partials, and metadata
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    if (entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
      walkForFiles(fullPath, root, files, format);
    } else if (isDocFile(entry.name, format)) {
      files.push({
        absolute: fullPath,
        relative: path.relative(root, fullPath),
      });
    }
  }
}

function isDocFile(name, format) {
  if (format === 'tech-docs-template') {
    return name.endsWith('.html.md.erb') || name.endsWith('.md');
  }
  if (format === 'docsify') {
    return name.endsWith('.md');
  }
  return name.endsWith('.md') || name.endsWith('.mdx');
}

// ── File conversion ─────────────────────────────────────────────
function convertFile(file, source) {
  const raw = fs.readFileSync(file.absolute, 'utf-8');
  const isTechDocs = file.relative.endsWith('.html.md.erb');

  // 1. Strip ERB tags
  let content = isTechDocs ? stripErb(raw) : raw;

  // 2. Parse existing frontmatter
  let frontmatter = {};
  let body = content;

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fmMatch) {
    frontmatter = parseSimpleYaml(fmMatch[1]);
    body = fmMatch[2];
  }

  // 3. Enrich frontmatter with ingestion metadata
  frontmatter.source_repo = source.repo;
  frontmatter.source_path = file.relative;
  frontmatter.ingested_at = new Date().toISOString();

  if (!frontmatter.owner_slack && source.owner_slack) {
    frontmatter.owner_slack = source.owner_slack;
  }

  // 4. Convert tech-docs-template specific patterns
  if (isTechDocs) {
    body = convertTechDocsPatterns(body, source);
  }

  if (source.format === 'docsify') {
    body = convertDocsifyPatterns(body, source, file.relative);
  }

  // 5. Reconstruct the file
  const outputFm = buildFrontmatter(frontmatter);
  const outputContent = `---\n${outputFm}---\n\n${body.trim()}\n`;

  // 6. Compute output path
  let outputRelative = file.relative;
  if (outputRelative.endsWith('.html.md.erb')) {
    outputRelative = outputRelative.replace(/\.html\.md\.erb$/, '.md');
  }

  return { content: outputContent, outputRelative };
}

function convertDocsifyPatterns(body, source, currentFileRelative) {
  return body.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (fullMatch, text, href, offset, input) => {
    if (offset > 0 && input[offset - 1] === '!') {
      return fullMatch;
    }

    const rewritten = rewriteDocsifyLink(href, source.id, currentFileRelative);
    if (!rewritten) {
      return fullMatch;
    }

    return `[${text}](${rewritten})`;
  });
}

function rewriteDocsifyLink(rawHref, sourceId, currentFileRelative) {
  if (!rawHref) return null;

  const href = rawHref.trim();
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href) || href.startsWith('//')) {
    return null;
  }

  if (href.startsWith('#/') || href.startsWith('/#/')) {
    const route = href.startsWith('/#/') ? href.slice(3) : href.slice(2);
    return toPortalDocsRoute(route, sourceId);
  }

  if (href.startsWith('#')) {
    return null;
  }

  const { pathPart, suffix } = splitLinkSuffix(href);
  if (!pathPart.toLowerCase().endsWith('.md')) {
    return null;
  }

  const currentPosix = currentFileRelative.replace(/\\/g, '/');
  const currentDir = path.posix.dirname(currentPosix);
  const resolved = pathPart.startsWith('/')
    ? path.posix.normalize(pathPart.slice(1))
    : path.posix.normalize(path.posix.join(currentDir, pathPart));

  if (!resolved || resolved.startsWith('..')) {
    return null;
  }

  const route = toDocsifyRouteWithoutExtension(resolved);
  const convertedSuffix = convertDocsifySuffix(suffix);
  return buildPortalRoute(route, sourceId, convertedSuffix);
}

function splitLinkSuffix(href) {
  const hashIndex = href.indexOf('#');
  const queryIndex = href.indexOf('?');

  let cutIndex = -1;
  if (hashIndex >= 0 && queryIndex >= 0) {
    cutIndex = Math.min(hashIndex, queryIndex);
  } else if (hashIndex >= 0) {
    cutIndex = hashIndex;
  } else if (queryIndex >= 0) {
    cutIndex = queryIndex;
  }

  if (cutIndex === -1) {
    return { pathPart: href, suffix: '' };
  }

  return {
    pathPart: href.slice(0, cutIndex),
    suffix: href.slice(cutIndex),
  };
}

function toPortalDocsRoute(rawRoute, sourceId) {
  const { pathPart, suffix } = splitLinkSuffix(rawRoute || '');
  const normalizedPath = path.posix.normalize(pathPart.replace(/^\/+/, ''));
  const route = toDocsifyRouteWithoutExtension(normalizedPath);
  const convertedSuffix = convertDocsifySuffix(suffix);
  return buildPortalRoute(route, sourceId, convertedSuffix);
}

function toDocsifyRouteWithoutExtension(rawPath) {
  if (!rawPath || rawPath === '.' || rawPath === '/') {
    return '';
  }

  let route = rawPath.replace(/^\/+|\/+$/g, '');
  route = route.replace(/\.md$/i, '');
  route = route.replace(/\/README$/i, '');
  if (/^README$/i.test(route)) {
    return '';
  }

  return route;
}

function convertDocsifySuffix(suffix) {
  if (!suffix) return '';

  let query = '';
  let hash = '';

  if (suffix.startsWith('?')) {
    const hashIndex = suffix.indexOf('#');
    query = hashIndex === -1 ? suffix : suffix.slice(0, hashIndex);
    hash = hashIndex === -1 ? '' : suffix.slice(hashIndex);
  } else if (suffix.startsWith('#')) {
    hash = suffix;
  } else {
    return suffix;
  }

  if (query) {
    const params = new URLSearchParams(query.slice(1));
    if (!hash && params.has('id')) {
      hash = `#${params.get('id')}`;
      params.delete('id');
    }
    const remaining = params.toString();
    query = remaining ? `?${remaining}` : '';
  }

  return `${query}${hash}`;
}

function buildPortalRoute(route, sourceId, suffix = '') {
  const normalized = route ? `/${route}` : '';
  return `/docs/${sourceId}${normalized}${suffix}`;
}

// ── ERB stripping ───────────────────────────────────────────────
function stripErb(content) {
  // Remove ERB output tags: <%= ... %>
  let result = content.replace(/<%=\s*[\s\S]*?%>/g, '');

  // Remove ERB execution tags: <% ... %>
  result = result.replace(/<%[\s\S]*?%>/g, '');

  // Remove ERB-style partial includes and replace with a note
  result = result.replace(
    /<%=?\s*partial\s*\(\s*['"]([^'"]+)['"]\s*\)\s*%>/g,
    '\n> *Content from partial: $1*\n'
  );

  // Remove now-empty markdown headings (e.g., "# " or "## ")
  result = result.replace(/^(#{1,6})\s*$/gm, '');

  return result;
}

// ── Tech-docs-template pattern conversion ───────────────────────
function convertTechDocsPatterns(body, source) {
  // Convert [link text](/path.html) to [link text](/docs/source-id/path)
  // Also strip the docsPath prefix if it's in the link
  const docsPath = source.docsPath ? source.docsPath.replace(/^source\//, '') : 'documentation';
  
  // First, convert internal links that include the docsPath prefix
  let result = body.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\/${docsPath.replace('/', '\\/')}\/([^)]+?)\\.html\\)`, 'g'),
    `[$1](/docs/${source.id}/$2)`
  );
  
  // Then convert any remaining /path.html links (that don't have the docsPath)
  result = result.replace(
    /\[([^\]]+)\]\(\/([^)]+?)\.html\)/g,
    `[$1](/docs/${source.id}/$2)`
  );

  // Remove .html extensions from internal links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+?)\.html\)/g,
    '[$1]($2)'
  );

  // Convert indented code blocks that use ERB markers
  result = result.replace(/```erb\n/g, '```\n');

  return result;
}

function collectReferencedAssets(markdownContent, markdownSourceFile, docsRoot, docsPath) {
  const links = extractCandidateLinks(markdownContent);
  const relPaths = new Set();
  const fileDir = path.dirname(markdownSourceFile);

  for (const rawLink of links) {
    const normalized = normalizeAssetLink(rawLink);
    if (!normalized) continue;
    if (!isLocalAssetLink(normalized)) continue;

    const resolved = resolveAssetAbsolutePath(normalized, fileDir, docsRoot, docsPath);
    if (!resolved) continue;

    const relPath = path.relative(docsRoot, resolved);
    if (!relPath || relPath.startsWith('..') || path.isAbsolute(relPath)) continue;
    relPaths.add(relPath);
  }

  return relPaths;
}

function extractCandidateLinks(markdownContent) {
  const links = [];

  const markdownLinkRegex = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of markdownContent.matchAll(markdownLinkRegex)) {
    links.push(match[1]);
  }

  const htmlLinkRegex = /(?:src|href)=['"]([^'"]+)['"]/g;
  for (const match of markdownContent.matchAll(htmlLinkRegex)) {
    links.push(match[1]);
  }

  return links;
}

function normalizeAssetLink(rawLink) {
  if (!rawLink) return null;
  let link = rawLink.trim();
  if (!link) return null;

  if ((link.startsWith('"') && link.endsWith('"')) || (link.startsWith("'") && link.endsWith("'"))) {
    link = link.slice(1, -1);
  }

  // Markdown allows optional title text after URL: [x](path "title")
  const withTitle = link.match(/^\s*<?([^>\s]+)>?\s+(?:"[^"]*"|'[^']*')\s*$/);
  if (withTitle) {
    return withTitle[1];
  }

  const bracketed = link.match(/^<([^>]+)>$/);
  if (bracketed) {
    return bracketed[1];
  }

  return link;
}

function isLocalAssetLink(link) {
  if (!link || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(link) || link.startsWith('//')) {
    return false;
  }

  const [pathOnly] = link.split(/[?#]/);
  if (!pathOnly) return false;

  const ext = path.extname(pathOnly).toLowerCase();
  return ASSET_EXTENSIONS.has(ext);
}

function resolveAssetAbsolutePath(link, markdownFileDir, docsRoot, docsPath) {
  const [pathOnly] = link.split(/[?#]/);
  if (!pathOnly) return null;

  const docsPrefix = docsPath.replace(/^\/+|\/+$/g, '');
  let candidates = [];

  if (pathOnly.startsWith('/')) {
    const withoutLeadingSlash = pathOnly.replace(/^\/+/, '');
    const withoutDocsPrefix = docsPrefix && withoutLeadingSlash.startsWith(`${docsPrefix}/`)
      ? withoutLeadingSlash.slice(docsPrefix.length + 1)
      : withoutLeadingSlash;

    candidates = [
      path.join(docsRoot, withoutDocsPrefix),
      path.join(docsRoot, withoutLeadingSlash),
    ];
  } else {
    candidates = [path.resolve(markdownFileDir, pathOnly)];
  }

  for (const candidate of candidates) {
    if (!candidate.startsWith(docsRoot)) continue;
    if (!fs.existsSync(candidate)) continue;
    if (!fs.statSync(candidate).isFile()) continue;
    return candidate;
  }

  return null;
}

// ── Simple YAML parser (no dependency) ──────────────────────────
function parseSimpleYaml(text) {
  const result = {};
  let currentKey = null;

  for (const line of text.split('\n')) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    // Nested object (indented key: value)
    const nestedMatch = line.match(/^  (\w+):\s*(.*)$/);
    if (nestedMatch && currentKey) {
      if (typeof result[currentKey] !== 'object' || result[currentKey] === null) {
        result[currentKey] = {};
      }
      result[currentKey][nestedMatch[1]] = cleanYamlValue(nestedMatch[2]);
      continue;
    }

    // List item
    const listMatch = line.match(/^  - (.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(cleanYamlValue(listMatch[1]));
      continue;
    }

    // Top-level key: value
    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === '' || val === '~' || val === 'null') {
        result[currentKey] = null;
      } else {
        result[currentKey] = cleanYamlValue(val);
      }
    }
  }

  return result;
}

function cleanYamlValue(val) {
  if (!val || val === '~' || val === 'null') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;
  // Remove surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  // Try number
  if (/^\d+$/.test(val)) return parseInt(val, 10);
  if (/^\d+\.\d+$/.test(val)) return parseFloat(val);
  return val;
}

// ── Frontmatter builder ─────────────────────────────────────────
function buildFrontmatter(obj) {
  let result = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      // Quote strings that contain special chars
      if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes('\\')) {
        // Escape backslashes first, then double quotes to prevent incomplete escaping
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        result += `${key}: "${escaped}"\n`;
      } else {
        result += `${key}: ${value}\n`;
      }
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      result += `${key}: ${value}\n`;
    }
  }
  return result;
}

// ── Run ─────────────────────────────────────────────────────────
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
