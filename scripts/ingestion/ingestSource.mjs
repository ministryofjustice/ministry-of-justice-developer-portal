import fs from 'fs';
import path from 'path';

import { ROOT, CONTENT_DIR } from './constants.mjs';
import { fetchSource } from './connectors/githubConnector.mjs';
import { parseSimpleYaml } from './yaml.mjs';
import { discoverFiles } from './discovery.mjs';
import { convertFile } from './convert.mjs';
import { collectReferencedAssets } from './assets.mjs';
import { generateGroupedNav } from './nav.mjs';

export async function ingestSource(source, options = {}) {
  const dryRun = Boolean(options.dryRun);

  const repoDir = fetchSource(source);
  const portalYamlPath = path.join(repoDir, 'portal.yaml');
  let config = { ...source };

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

  const files = discoverFiles(docsRoot, config.format);
  console.log(`  Found ${files.length} source files in ${config.docsPath}`);

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
    const converted = convertFile(file, source);
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
    ingested_at: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(outputDir, '_meta.json'),
    JSON.stringify(meta, null, 2),
    'utf-8'
  );

  generateGroupedNav(source, repoDir, outputDir);

  return { pages: pageCount, assets: assetCount };
}