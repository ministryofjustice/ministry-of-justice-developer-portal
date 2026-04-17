import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

type DocsLinkContext = {
  sourceSlug: string;
  currentSlug: string[];
};

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
  const result = await remark().use(remarkGfm).use(remarkHeadingIds).use(html).process(markdown);
  const htmlOutput = result.toString();

  if (!docsLinkContext) {
    return htmlOutput;
  }

  const withAnchorLinks = rewriteDocAnchorLinks(htmlOutput, docsLinkContext);
  return rewriteDocAssetSources(withAnchorLinks, docsLinkContext);
}

function rewriteDocAnchorLinks(htmlContent: string, docsLinkContext: DocsLinkContext): string {
  return htmlContent.replace(/href="([^"]+)"/g, (_full, href: string) => {
    const rewritten = rewriteDocHref(href, docsLinkContext);
    return `href="${rewritten}"`;
  });
}

function rewriteDocHref(href: string, docsLinkContext: DocsLinkContext): string {
  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href) ||
    href.startsWith('/docs/')
  ) {
    return href;
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

  return normalizedPath ? `/docs/${docsLinkContext.sourceSlug}/${normalizedPath}${suffix}` : `/docs/${docsLinkContext.sourceSlug}${suffix}`;
}

function rewriteDocAssetSources(htmlContent: string, docsLinkContext: DocsLinkContext): string {
  return htmlContent.replace(/src="([^"]+)"/g, (_full, src: string) => {
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

  return `/docs/${docsLinkContext.sourceSlug}/${normalized}${suffix}`;
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

type MarkdownNode = {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
  data?: {
    hProperties?: Record<string, unknown>;
  };
};

function remarkHeadingIds() {
  return (tree: MarkdownNode) => {
    walkNodes(tree, (node) => {
      if (node.type !== 'heading') {
        return;
      }

      const text = extractText(node).trim();
      const id = slugify(text);
      if (!id) {
        return;
      }

      node.data = node.data || {};
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        id,
      };
    });
  };
}

function walkNodes(node: MarkdownNode, visit: (node: MarkdownNode) => void): void {
  visit(node);
  for (const child of node.children || []) {
    walkNodes(child, visit);
  }
}

function extractText(node: MarkdownNode): string {
  if (typeof node.value === 'string') {
    return node.value;
  }

  let output = '';
  for (const child of node.children || []) {
    output += extractText(child);
  }
  return output;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
