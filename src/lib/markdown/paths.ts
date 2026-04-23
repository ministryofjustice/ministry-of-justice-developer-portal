const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');

export function splitHrefSuffix(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i === -1 ? [href, ''] : [href.slice(0, i), href.slice(i)];
}

export function getFileExtension(pathname: string): string | null {
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : null;
}

export function normalizeDocPath(
  pathname: string,
  ctx: { sourceSlug: string; currentSlug: string[] },
): string | null {
  const segments = resolveDocPathSegments(pathname, ctx);
  if (!segments) return null;

  const joined = segments
    .join('/')
    .replace(/\.(html?|md|markdown)$/i, '')
    .replace(/\/+$/, '');

  if (!joined || joined === 'index') return '';
  if (joined.endsWith('/index')) return joined.slice(0, -6);

  return joined;
}

export function resolveDocPathSegments(
  pathname: string,
  ctx: { sourceSlug: string; currentSlug: string[] },
): string[] | null {
  const baseDir = ctx.currentSlug.slice(1, -1);

  if (pathname.startsWith('/')) {
    const cleaned = pathname
      .replace(/^\/+/, '')
      .replace(/^docs\/[^/]+\//, '')
      .replace(/^source\/documentation\//, '')
      .replace(/^documentation\//, '')
      .replace(new RegExp(`^${escapeRegExp(ctx.sourceSlug)}\/`), '');

    return cleaned.split('/').filter(Boolean);
  }

  return normalizePathSegments([...baseDir, ...pathname.split('/')]);
}

function normalizePathSegments(segments: string[]): string[] {
  const out: string[] = [];

  for (const s of segments) {
    if (!s || s === '.') continue;
    if (s === '..') out.pop();
    else out.push(s);
  }

  return out;
}

function normalizeBasePath(value: string): string {
  return !value || value === '/' ? '' : value.replace(/\/+$/, '');
}

export function isBasePathPrefixed(path: string): boolean {
  if (!BASE_PATH) return false;
  return path === BASE_PATH || path.startsWith(`${BASE_PATH}/`);
}

export function withBasePath(path: string): string {
  if (!path.startsWith('/') || !BASE_PATH || isBasePathPrefixed(path)) return path;
  return `${BASE_PATH}${path}`;
}

export function stripBasePath(path: string): string {
  if (!BASE_PATH || !isBasePathPrefixed(path)) return path;
  const trimmed = path.slice(BASE_PATH.length);
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function normalizeMalformedDocsHref(href: string): string {
  const match = href.match(/^\/docs\/([^/]+)\/documentation\/(.+)$/);
  return match ? `/docs/${match[1]}/${match[2]}` : href;
}

export function normalizeMalformedDocsPathsInHtml(html: string): string {
  return html.replace(/\/docs\/([^/"?#]+)\/documentation\//g, '/docs/$1/');
}

export function ensureDocsTrailingSlash(path: string): string {
  if (!path.startsWith('/docs/')) return path;
  if (path.endsWith('/')) return path;

  const last = path.split('/').pop() || '';
  if (last.includes('.')) return path;

  return `${path}/`;
}

export function rewriteAbsoluteGithubPagesDocsHref(href: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }

  if (parsed.hostname !== 'ministryofjustice.github.io') return null;

  let pathname = parsed.pathname;

  if (BASE_PATH && pathname.startsWith(`${BASE_PATH}/docs/`)) {
    pathname = stripBasePath(pathname);
  } else {
    const match = pathname.match(/^\/[^/]+\/docs(\/.*)?$/);
    if (match) pathname = `/docs${match[1] || ''}`;
  }

  if (!pathname.startsWith('/docs/')) return null;

  return `${withBasePath(
    ensureDocsTrailingSlash(normalizeMalformedDocsHref(pathname)),
  )}${parsed.search}${parsed.hash}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
