import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

type DocsLinkContext = {
  sourceSlug: string;
  currentSlug: string[];
};

const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');

const DOC_MARKDOWN_EXTENSIONS = new Set(['md', 'markdown', 'html', 'htm']);
const DOC_ASSET_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'bmp',
  'ico',
  'pdf',
  'csv',
  'xlsx',
  'xls',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'zip',
  'drawio',
  'excalidraw',
]);

export async function markdownToHtml(markdown: string, docsLinkContext?: DocsLinkContext): Promise<string> {
  const result = await remark().use(remarkGfm).use(html).process(markdown);
  const htmlOutput = addHeadingIds(result.toString());

  if (!docsLinkContext) {
    return htmlOutput;
  }

  const withAnchorLinks = rewriteDocAnchorLinks(htmlOutput, docsLinkContext);
  const withAssetLinks = rewriteDocAssetSources(withAnchorLinks, docsLinkContext);
  return normalizeMalformedDocsPathsInHtml(withAssetLinks);
}

function rewriteDocAnchorLinks(htmlContent: string, docsLinkContext: DocsLinkContext): string {
  return htmlContent.replace(/href="([^"]+)"/g, (_full, href: string) => {
    const rewritten = rewriteDocHref(href, docsLinkContext);
    return `href="${rewritten}"`;
  });
}

function rewriteDocHref(href: string, docsLinkContext: DocsLinkContext): string {
  const rewrittenAbsoluteDocsHref = rewriteAbsoluteGithubPagesDocsHref(href);
  if (rewrittenAbsoluteDocsHref) {
    return rewrittenAbsoluteDocsHref;
  }

  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
  ) {
    return href;
  }

  if (href.startsWith('/')) {
    const [hrefPath, suffix] = splitHrefSuffix(href);
    const hrefWithoutBase = stripBasePath(hrefPath);

    if (hrefWithoutBase.startsWith('/docs/')) {
      const normalizedDocsPath = ensureDocsTrailingSlash(normalizeMalformedDocsHref(hrefWithoutBase));
      return `${withBasePath(normalizedDocsPath)}${suffix}`;
    }
    if (hrefWithoutBase.startsWith('/assets/')) {
      return `${withBasePath(hrefWithoutBase)}${suffix}`;
    }
    if (isBasePathPrefixed(href)) {
      return href;
    }
  }

  const [pathPart, suffix] = splitHrefSuffix(href);
  if (!pathPart) {
    return href;
  }

  const rewrittenAssetHref = rewriteAssetPath(pathPart, suffix, docsLinkContext);
  if (rewrittenAssetHref) {
    return rewrittenAssetHref;
  }

  const pathExtension = getFileExtension(pathPart);
  if (pathExtension && !DOC_MARKDOWN_EXTENSIONS.has(pathExtension)) {
    return href;
  }

  const normalizedPath = normalizeDocPath(pathPart, docsLinkContext);
  if (normalizedPath === null) {
    return href;
  }

  const rewrittenPath = normalizedPath
    ? `/docs/${docsLinkContext.sourceSlug}/${normalizedPath}`
    : `/docs/${docsLinkContext.sourceSlug}`;
  return `${withBasePath(ensureDocsTrailingSlash(rewrittenPath))}${suffix}`;
}

function rewriteDocAssetSources(htmlContent: string, docsLinkContext: DocsLinkContext): string {
  return htmlContent.replace(/src="([^"]+)"/g, (_full, src: string) => {
    if (src.startsWith('/') && !isBasePathPrefixed(src)) {
      if (src.startsWith('/docs/') || src.startsWith('/assets/')) {
        return `src="${withBasePath(src)}"`;
      }
    }

    const [pathPart, suffix] = splitHrefSuffix(src);
    if (!pathPart) {
      return `src="${src}"`;
    }

    const rewritten = rewriteAssetPath(pathPart, suffix, docsLinkContext);
    return `src="${rewritten || src}"`;
  });
}

function rewriteAssetPath(pathPart: string, suffix: string, docsLinkContext: DocsLinkContext): string | null {
  if (
    pathPart.startsWith('#') ||
    pathPart.startsWith('mailto:') ||
    pathPart.startsWith('tel:') ||
    pathPart.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(pathPart) ||
    pathPart.startsWith('/docs/') ||
    pathPart.startsWith('/assets/')
  ) {
    return null;
  }

  const extension = getFileExtension(pathPart);
  if (!extension || !DOC_ASSET_EXTENSIONS.has(extension)) {
    return null;
  }

  const segments = resolveDocPathSegments(pathPart, docsLinkContext);
  if (!segments) {
    return null;
  }

  const normalized = segments.join('/').replace(/\/+$/, '');
  if (!normalized) {
    return null;
  }

  return withBasePath(`/docs/${docsLinkContext.sourceSlug}/${normalized}${suffix}`);
}

function splitHrefSuffix(href: string): [string, string] {
  const markerIndex = href.search(/[?#]/);
  if (markerIndex === -1) {
    return [href, ''];
  }
  return [href.slice(0, markerIndex), href.slice(markerIndex)];
}

function getFileExtension(pathPart: string): string | null {
  const match = pathPart.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : null;
}

function normalizeDocPath(pathPart: string, docsLinkContext: DocsLinkContext): string | null {
  const pathSegments = resolveDocPathSegments(pathPart, docsLinkContext);
  if (!pathSegments) {
    return null;
  }

  const joined = pathSegments.join('/').replace(/\.(html?|md|markdown)$/i, '').replace(/\/+$/, '');
  if (!joined || joined === 'index') {
    return '';
  }
  if (joined.endsWith('/index')) {
    return joined.slice(0, -('/index'.length));
  }
  return joined;
}

function resolveDocPathSegments(pathPart: string, docsLinkContext: DocsLinkContext): string[] | null {
  const sourceSlug = docsLinkContext.sourceSlug;
  const currentDocPath = docsLinkContext.currentSlug.slice(1);
  const baseDir = currentDocPath.slice(0, -1);

  if (pathPart.startsWith('/')) {
    const cleaned = pathPart
      .replace(/^\/+/, '')
      .replace(/^source\/documentation\//, '')
      .replace(/^documentation\//, '')
      .replace(new RegExp(`^${escapeRegExp(sourceSlug)}\/`), '');

    return cleaned.split('/').filter(Boolean);
  }

  return normalizePathSegments([...baseDir, ...pathPart.split('/')]);
}

function normalizePathSegments(segments: string[]): string[] {
  const output: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === '.') {
      continue;
    }
    if (segment === '..') {
      output.pop();
      continue;
    }
    output.push(segment);
  }
  return output;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeBasePath(value: string): string {
  if (!value || value === '/') {
    return '';
  }
  return value.replace(/\/+$/, '');
}

function isBasePathPrefixed(urlPath: string): boolean {
  if (!BASE_PATH) {
    return false;
  }
  return urlPath === BASE_PATH || urlPath.startsWith(`${BASE_PATH}/`);
}

function withBasePath(urlPath: string): string {
  if (!urlPath.startsWith('/') || !BASE_PATH || isBasePathPrefixed(urlPath)) {
    return urlPath;
  }
  return `${BASE_PATH}${urlPath}`;
}

function stripBasePath(urlPath: string): string {
  if (!BASE_PATH || !isBasePathPrefixed(urlPath)) {
    return urlPath;
  }
  const trimmed = urlPath.slice(BASE_PATH.length);
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function normalizeMalformedDocsHref(href: string): string {
  const match = href.match(/^\/docs\/([^/]+)\/documentation\/(.+)$/);
  if (!match) {
    return href;
  }
  return `/docs/${match[1]}/${match[2]}`;
}

function rewriteAbsoluteGithubPagesDocsHref(href: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(href);
  } catch {
    return null;
  }

  if (parsed.hostname !== 'ministryofjustice.github.io') {
    return null;
  }

  let docsPathname = parsed.pathname;

  if (BASE_PATH && docsPathname.startsWith(`${BASE_PATH}/docs/`)) {
    docsPathname = stripBasePath(docsPathname);
  } else {
    const repoScopedDocsMatch = docsPathname.match(/^\/[^/]+\/docs(\/.*)?$/);
    if (repoScopedDocsMatch) {
      docsPathname = `/docs${repoScopedDocsMatch[1] || ''}`;
    }
  }

  if (!docsPathname.startsWith('/docs/')) {
    return null;
  }

  const normalizedDocsPath = ensureDocsTrailingSlash(normalizeMalformedDocsHref(docsPathname));
  return `${withBasePath(normalizedDocsPath)}${parsed.search}${parsed.hash}`;
}

function ensureDocsTrailingSlash(path: string): string {
  if (!path.startsWith('/docs/')) {
    return path;
  }

  if (path.endsWith('/')) {
    return path;
  }

  const lastSegment = path.split('/').pop() || '';
  if (lastSegment.includes('.')) {
    return path;
  }

  return `${path}/`;
}

function normalizeMalformedDocsPathsInHtml(htmlContent: string): string {
  return htmlContent.replace(/\/docs\/([^/"?#]+)\/documentation\//g, '/docs/$1/');
}

function addHeadingIds(htmlContent: string): string {
  return htmlContent.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_full, tag: string, inner: string) => {
    const text = extractTextFromHtmlFragment(inner);
    const id = slugify(text);
    if (!id) {
      return `<${tag}>${inner}</${tag}>`;
    }
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
}

function extractTextFromHtmlFragment(fragment: string): string {
  let output = '';
  let inTag = false;

  for (const char of fragment) {
    if (char === '<') {
      inTag = true;
      continue;
    }
    if (char === '>') {
      inTag = false;
      continue;
    }
    if (!inTag) {
      output += char;
    }
  }

  return decodeHtmlEntities(output).trim();
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|#39|#x27);/gi, (entity) => {
    switch (entity.toLowerCase()) {
      case '&amp;':
        return '&';
      case '&lt;':
        return '<';
      case '&gt;':
        return '>';
      case '&quot;':
        return '"';
      case '&#39;':
      case '&#x27;':
        return "'";
      default:
        return entity;
    }
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
