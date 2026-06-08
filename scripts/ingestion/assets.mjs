import fs from 'fs';
import path from 'path';

import assetExtensions from '../../src/lib/markdown/assetExtensions.json' with { type: 'json' };

const ASSET_EXTENSIONS = new Set(assetExtensions.map((ext) => `.${ext}`));

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