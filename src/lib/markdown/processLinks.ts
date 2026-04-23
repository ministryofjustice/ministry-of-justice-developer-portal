import {
  splitHrefSuffix,
  getFileExtension,
  normalizeDocPath,
  resolveDocPathSegments,
  withBasePath,
  stripBasePath,
  isBasePathPrefixed,
  ensureDocsTrailingSlash,
  normalizeMalformedDocsHref,
  rewriteAbsoluteGithubPagesDocsHref,
} from './paths';

import type { DocsLinkContext } from './markdownToHtml';

const EXTENSIONS = {
  markdown: new Set(['md', 'markdown', 'html', 'htm']),
  assets: new Set([
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
  ]),
};

export function rewriteDocAnchorLinks(html: string, ctx: DocsLinkContext) {
  return rewriteHtmlAttribute(html, 'href', (href) => rewriteDocHref(href, ctx));
}

export function rewriteDocAssetSources(html: string, ctx: DocsLinkContext) {
  return rewriteHtmlAttribute(html, 'src', (src) => {
    const [pathname, suffix] = splitHrefSuffix(src);
    if (!pathname) return src;

    const rewritten = rewriteAssetPath(pathname, suffix, ctx);
    return rewritten || src;
  });
}

function rewriteDocHref(href: string, ctx: DocsLinkContext): string {
  const absolute = rewriteAbsoluteGithubPagesDocsHref(href);
  if (absolute) return absolute;

  if (isExternalOrAnchor(href)) return href;

  if (href.startsWith('/')) {
    const [pathname, suffix] = splitHrefSuffix(href);
    const withoutBase = stripBasePath(pathname);

    if (withoutBase.startsWith('/docs/')) {
      return `${withBasePath(
        ensureDocsTrailingSlash(normalizeMalformedDocsHref(withoutBase)),
      )}${suffix}`;
    }

    if (withoutBase.startsWith('/assets/')) {
      return `${withBasePath(withoutBase)}${suffix}`;
    }

    if (isBasePathPrefixed(href)) return href;
  }

  const [pathname, suffix] = splitHrefSuffix(href);
  if (!pathname) return href;

  const asset = rewriteAssetPath(pathname, suffix, ctx);
  if (asset) return asset;

  const ext = getFileExtension(pathname);
  if (ext && !EXTENSIONS.markdown.has(ext)) return href;

  const normalized = normalizeDocPath(pathname, ctx);
  if (normalized === null) return href;

  const rewritten = normalized
    ? `/docs/${ctx.sourceSlug}/${normalized}`
    : `/docs/${ctx.sourceSlug}`;

  return `${withBasePath(ensureDocsTrailingSlash(rewritten))}${suffix}`;
}

function rewriteAssetPath(pathname: string, suffix: string, ctx: DocsLinkContext): string | null {
  if (isExternalOrAnchor(pathname)) return null;
  if (pathname.startsWith('/docs/') || pathname.startsWith('/assets/')) return null;

  const ext = getFileExtension(pathname);
  if (!ext || !EXTENSIONS.assets.has(ext)) return null;

  const segments = resolveDocPathSegments(pathname, ctx);
  if (!segments) return null;

  const normalized = segments.join('/').replace(/\/+$/, '');
  if (!normalized) return null;

  return withBasePath(`/docs/${ctx.sourceSlug}/${normalized}${suffix}`);
}

function rewriteHtmlAttribute(
  html: string,
  attr: 'href' | 'src',
  rewriter: (value: string) => string,
): string {
  return html.replace(
    new RegExp(`${attr}="([^"]+)"`, 'g'),
    (_full, value: string) => `${attr}="${rewriter(value)}"`,
  );
}

function isExternalOrAnchor(url: string): boolean {
  return (
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)
  );
}
