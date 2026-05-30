import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT = path.resolve(__dirname, '..');
export const CONTENT_DIR = path.join(ROOT, 'content', 'docs');
export const SOURCES_FILE = path.join(ROOT, 'sources.json');
export const CLONE_DIR = path.join(ROOT, '.ingestion-cache');

export const ASSET_EXTENSIONS = new Set([
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

export function parseCliArgs(args = []) {
  return {
    dryRun: args.includes('--dry-run'),
    targetId: args.find((a) => !a.startsWith('--')),
  };
}

export function loadSources(sourcesFile = SOURCES_FILE) {
  const configured = JSON.parse(fs.readFileSync(sourcesFile, 'utf-8')).sources || [];

  // Keep backward compatibility with existing source entries.
  return configured.map((source) => ({
    ...source,
    onboardingMode: source.onboardingMode || 'manual',
  }));
}

export async function runIngestion(options = {}) {
  const {
    args = process.argv.slice(2),
    sourcesFile = SOURCES_FILE,
    contentDir = CONTENT_DIR,
    cloneDir = CLONE_DIR,
    root = ROOT,
    log = console,
    now = () => new Date().toISOString(),
    cloneOrPullImpl = cloneOrPull,
  } = options;

  const { dryRun, targetId } = parseCliArgs(args);
  const sources = loadSources(sourcesFile);

  log.log('\n📚 Developer Portal — Content Ingestion');
  log.log(`   Sources file: ${sourcesFile}`);
  log.log(`   Output dir:   ${contentDir}`);
  if (dryRun) {
    log.log('   ⚠️  DRY RUN — no files will be written\n');
  } else {
    log.log('');
  }

  fs.mkdirSync(cloneDir, { recursive: true });

  const toProcess = sources.filter(
    (s) => s.enabled && (!targetId || s.id === targetId)
  );

  if (toProcess.length === 0) {
    log.log('No matching sources found.');
    return { exitCode: 1, results: [] };
  }

  const results = [];

  for (const source of toProcess) {
    log.log(`\n─── ${source.name} (${source.id}) ───`);
    try {
      const stats = await ingestSource(source, {
        dryRun,
        contentDir,
        root,
        cloneDir,
        now,
        log,
        cloneOrPullImpl,
      });
      results.push({ id: source.id, ...stats });
      log.log(`  ✅ ${stats.pages} pages ingested, ${stats.assets} assets copied`);
    } catch (err) {
      log.error(`  ❌ Failed: ${err.message}`);
      results.push({ id: source.id, pages: 0, assets: 0, error: err.message });
    }
  }

  log.log('\n─── Summary ───');
  for (const result of results) {
    const status = result.error
      ? `❌ ${result.error}`
      : `✅ ${result.pages} pages, ${result.assets} assets`;
    log.log(`  ${result.id}: ${status}`);
  }
  log.log('');

  return { exitCode: 0, results };
}

export async function ingestSource(source, options = {}) {
  const {
    dryRun = false,
    contentDir = CONTENT_DIR,
    root = ROOT,
    cloneDir = CLONE_DIR,
    now = () => new Date().toISOString(),
    cloneOrPullImpl = cloneOrPull,
    log = console,
  } = options;

  const repoDir = cloneOrPullImpl(source, { cloneDir, log });
  const portalYamlPath = path.join(repoDir, 'portal.yaml');
  let config = { ...source };

  // Source repo owners can override only selected fields via portal.yaml.
  if (fs.existsSync(portalYamlPath)) {
    log.log('  Found portal.yaml — merging config');
    const yaml = parseSimpleYaml(fs.readFileSync(portalYamlPath, 'utf-8'));
    if (yaml.docs?.path) config.docsPath = yaml.docs.path;
    if (yaml.owner_slack) config.owner_slack = yaml.owner_slack;
  }

  const docsRoot = path.join(repoDir, config.docsPath || '');
  if (!fs.existsSync(docsRoot)) {
    throw new Error(`Docs path not found: ${config.docsPath}`);
  }

  const outputDir = path.join(contentDir, source.id);
  const publicAssetsDir = path.join(root, 'public', 'docs', source.id);

  const files = discoverFiles(docsRoot, config.format);
  log.log(`  Found ${files.length} source files in ${config.docsPath}`);

  if (dryRun) {
    let dryRunAssetCount = 0;
    const dryRunAssetPaths = new Set();

    for (const file of files) {
      log.log(`  [dry-run] ${file.relative}`);
      const converted = convertFile(file, config, now);
      const referencedAssets = collectReferencedAssets(
        converted.content,
        file.absolute,
        docsRoot,
        config.docsPath || ''
      );

      for (const relPath of referencedAssets) {
        if (dryRunAssetPaths.has(relPath)) continue;
        dryRunAssetPaths.add(relPath);
        dryRunAssetCount++;
      }
    }
    log.log(`  [dry-run] ${dryRunAssetCount} referenced assets to copy`);
    return { pages: files.length, assets: dryRunAssetCount };
  }

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  if (fs.existsSync(publicAssetsDir)) {
    fs.rmSync(publicAssetsDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(publicAssetsDir, { recursive: true });

  let pageCount = 0;
  const assetPaths = new Set();

  for (const file of files) {
    const converted = convertFile(file, config, now);
    const outputPath = path.join(outputDir, converted.outputRelative);
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
    const contentDest = path.join(outputDir, relPath);
    const publicDest = path.join(publicAssetsDir, relPath);

    fs.mkdirSync(path.dirname(contentDest), { recursive: true });
    fs.copyFileSync(src, contentDest);

    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
    fs.copyFileSync(src, publicDest);

    assetCount++;
  }

  const meta = {
    name: source.name,
    description: source.description,
    category: source.category,
    source_repo: source.repo,
    ingested_at: now(),
  };
  fs.writeFileSync(
    path.join(outputDir, '_meta.json'),
    JSON.stringify(meta, null, 2),
    'utf-8'
  );

  return { pages: pageCount, assets: assetCount };
}

export function cloneOrPull(source, options = {}) {
  const {
    cloneDir = CLONE_DIR,
    execFileSyncImpl = execFileSync,
    log = console,
  } = options;

  const repoSlug = source.repo.replace(/\//g, '--');
  const repoDir = path.join(cloneDir, repoSlug);
  const repoUrl = `https://github.com/${source.repo}.git`;
  const branch = source.branch || 'main';

  if (fs.existsSync(path.join(repoDir, '.git'))) {
    log.log(`  Pulling latest from ${source.repo}...`);
    execFileSyncImpl('git', ['fetch', 'origin', branch, '--depth=1'], {
      cwd: repoDir,
      stdio: 'pipe',
    });
    execFileSyncImpl('git', ['reset', '--hard', `origin/${branch}`], {
      cwd: repoDir,
      stdio: 'pipe',
    });
  } else {
    log.log(`  Cloning ${source.repo} (shallow)...`);
    execFileSyncImpl('git', ['clone', '--depth=1', '--branch', branch, repoUrl, repoDir], {
      stdio: 'pipe',
    });
  }

  return repoDir;
}

export function discoverFiles(docsRoot, format) {
  const files = [];
  walkForFiles(docsRoot, docsRoot, files, format);
  return files;
}

export function walkForFiles(dir, root, files, format) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

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

export function isDocFile(name, format) {
  if (format === 'tech-docs-template') {
    return name.endsWith('.html.md.erb') || name.endsWith('.md');
  }
  return name.endsWith('.md') || name.endsWith('.mdx');
}

export function convertFile(file, source, now = () => new Date().toISOString()) {
  const raw = fs.readFileSync(file.absolute, 'utf-8');
  const isTechDocs = file.relative.endsWith('.html.md.erb');

  let content = isTechDocs ? stripErb(raw) : raw;

  let frontmatter = {};
  let body = content;

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fmMatch) {
    frontmatter = parseSimpleYaml(fmMatch[1]);
    body = fmMatch[2];
  }

  frontmatter.source_repo = source.repo;
  frontmatter.source_path = file.relative;
  frontmatter.ingested_at = now();

  if (!frontmatter.owner_slack && source.owner_slack) {
    frontmatter.owner_slack = source.owner_slack;
  }

  if (isTechDocs) {
    body = convertTechDocsPatterns(body, source);
  }

  const outputFm = buildFrontmatter(frontmatter);
  const outputContent = `---\n${outputFm}---\n\n${body.trim()}\n`;

  let outputRelative = file.relative;
  if (outputRelative.endsWith('.html.md.erb')) {
    outputRelative = outputRelative.replace(/\.html\.md\.erb$/, '.md');
  }

  return { content: outputContent, outputRelative };
}

export function stripErb(content) {
  let result = content.replace(/<%=\s*[\s\S]*?%>/g, '');

  result = result.replace(/<%[\s\S]*?%>/g, '');

  result = result.replace(
    /<%=?\s*partial\s*\(\s*['"]([^'"]+)['"]\s*\)\s*%>/g,
    '\n> *Content from partial: $1*\n'
  );

  result = result.replace(/^(#{1,6})\s*$/gm, '');

  return result;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function convertTechDocsPatterns(body, source) {
  const docsPath = source.docsPath
    ? source.docsPath.replace(/^source\//, '').replace(/^\/+|\/+$/g, '')
    : 'documentation';

  let result = body;

  if (docsPath) {
    const docsPrefixPattern = escapeRegex(`/${docsPath}/`);
    result = result.replace(
      new RegExp(`\\[([^\\]]+)\\]\\(${docsPrefixPattern}([^)]+?)\\.html\\)`, 'g'),
      `[$1](/docs/${source.id}/$2)`
    );
  }

  result = result.replace(
    /\[([^\]]+)\]\(\/([^)]+?)\.html\)/g,
    `[$1](/docs/${source.id}/$2)`
  );

  result = result.replace(
    /\[([^\]]+)\]\(([^)]+?)\.html\)/g,
    '[$1]($2)'
  );

  result = result.replace(/```erb\n/g, '```\n');

  return result;
}

export function collectReferencedAssets(markdownContent, markdownSourceFile, docsRoot, docsPath) {
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

export function extractCandidateLinks(markdownContent) {
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

export function normalizeAssetLink(rawLink) {
  if (!rawLink) return null;
  let link = rawLink.trim();
  if (!link) return null;

  if ((link.startsWith('"') && link.endsWith('"')) || (link.startsWith("'") && link.endsWith("'"))) {
    link = link.slice(1, -1);
  }

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

export function isLocalAssetLink(link) {
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

export function resolveAssetAbsolutePath(link, markdownFileDir, docsRoot, docsPath) {
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

export function parseSimpleYaml(text) {
  const result = {};
  let currentKey = null;

  for (const line of text.split('\n')) {
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    const nestedMatch = line.match(/^  (\w+):\s*(.*)$/);
    if (nestedMatch && currentKey) {
      if (typeof result[currentKey] !== 'object' || result[currentKey] === null) {
        result[currentKey] = {};
      }
      result[currentKey][nestedMatch[1]] = cleanYamlValue(nestedMatch[2]);
      continue;
    }

    const listMatch = line.match(/^  - (.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(cleanYamlValue(listMatch[1]));
      continue;
    }

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

export function cleanYamlValue(val) {
  if (!val || val === '~' || val === 'null') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;

  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  if (/^\d+$/.test(val)) return parseInt(val, 10);
  if (/^\d+\.\d+$/.test(val)) return parseFloat(val);
  return val;
}

export function buildFrontmatter(obj) {
  let result = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes('\\')) {
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
