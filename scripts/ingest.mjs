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
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'docs');
const SOURCES_FILE = path.join(ROOT, 'sources.json');
const CLONE_DIR = path.join(ROOT, '.ingestion-cache');

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
      const stats = await ingestSource(source);
      results.push({ id: source.id, ...stats });
      console.log(`  ✅ ${stats.pages} pages ingested`);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      results.push({ id: source.id, pages: 0, error: err.message });
    }
  }

  // Summary
  console.log('\n─── Summary ───');
  for (const r of results) {
    const status = r.error ? `❌ ${r.error}` : `✅ ${r.pages} pages`;
    console.log(`  ${r.id}: ${status}`);
  }
  console.log('');
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

  // Discover source files
  const files = discoverFiles(docsRoot, config.format);
  console.log(`  Found ${files.length} source files in ${config.docsPath}`);

  if (dryRun) {
    for (const f of files) {
      console.log(`  [dry-run] ${f.relative}`);
    }
    return { pages: files.length };
  }

  // Clean previous output and write fresh
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  let pageCount = 0;

  for (const file of files) {
    const converted = convertFile(file, source);
    const outputPath = path.join(outputDir, converted.outputRelative);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, converted.content, 'utf-8');
    pageCount++;
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
    path.join(outputDir, '_meta.json'),
    JSON.stringify(meta, null, 2),
    'utf-8'
  );

  return { pages: pageCount };
}

// ── Git operations ──────────────────────────────────────────────
function cloneOrPull(source) {
  const repoSlug = source.repo.replace(/\//g, '--');
  const repoDir = path.join(CLONE_DIR, repoSlug);
  const repoUrl = `https://github.com/${source.repo}.git`;
  const branch = source.branch || 'main';

  if (fs.existsSync(path.join(repoDir, '.git'))) {
    console.log(`  Pulling latest from ${source.repo}...`);
    execSync(`git -C ${JSON.stringify(repoDir)} fetch origin ${branch} --depth=1`, {
      stdio: 'pipe',
    });
    execSync(
      `git -C ${JSON.stringify(repoDir)} reset --hard origin/${branch}`,
      { stdio: 'pipe' }
    );
  } else {
    console.log(`  Cloning ${source.repo} (shallow)...`);
    execSync(
      `git clone --depth=1 --branch ${branch} ${repoUrl} ${JSON.stringify(repoDir)}`,
      { stdio: 'pipe' }
    );
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
