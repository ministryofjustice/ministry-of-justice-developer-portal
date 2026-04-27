import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element, Root, Text } from 'hast';

import { rewriteDocAnchorLinks, rewriteDocAssetSources } from './processLinks';
import { normalizeMalformedDocsPathsInHtml } from './paths';

export type DocsLinkContext = {
  sourceSlug: string;
  currentSlug: string[];
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const alertClassLookup: Record<string, [string, string]> = {
  NOTE: ['moj-alert--information', 'icon-alert-information.svg'],
  TIP: ['moj-alert--success', 'icon-alert-success.svg'],
  IMPORTANT: ['moj-alert--warning', 'icon-alert-warning.svg'],
  WARNING: ['moj-alert--warning', 'icon-alert-warning.svg'],
  CAUTION: ['moj-alert--error', 'icon-alert-warning.svg'],
};

// Matches /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/ at the start of a blockquote's first paragraph
const calloutMarkerRegex = new RegExp(`^\\[!(${Object.keys(alertClassLookup).join('|')})\\]\\s*`);

export async function markdownToHtml(markdown: string, ctx?: DocsLinkContext): Promise<string> {
  const html = await renderMarkdown(markdown);

  if (!ctx) {
    return rewriteAbsoluteLinksWithBasePath(html);
  }

  return transformHtml(html, ctx);
}

/**
 * Prefixes absolute site-local href and src with NEXT_PUBLIC_BASE_PATH.
 * Only applied when there is no DocsLinkContext (e.g. guideline pages), as the
 * docs pipeline handles base-path rewriting separately via transformHtml.
 */
function rewriteAbsoluteLinksWithBasePath(html: string): string {
  if (!basePath) return html;

  const prefixPath = (path: string) =>
    path.startsWith(basePath) || path.startsWith('//') ? path : `${basePath}${path}`;

  return html
    .replace(/href="(\/[^"]+)"/g, (_match, path) => `href="${prefixPath(path)}"`)
    .replace(/src="(\/[^"]+)"/g, (_match, path) => `src="${prefixPath(path)}"`);
}

function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Element | Root | undefined) => {
      if (node.tagName !== 'blockquote' || index === undefined || !parent) return;

      const result = extractCalloutMarker(node);
      if (!result) return;

      const { type, contentChildren } = result;
      const [alertClass, icon] = alertClassLookup[type];

      parent.children.splice(index, 1, buildCalloutElement(alertClass, icon, contentChildren));
    });
  };
}

function extractCalloutMarker(node: Element): { type: string; contentChildren: Element['children'] } | null {
  const firstPIndex = node.children.findIndex(
    (child) => child.type === 'element' && (child as Element).tagName === 'p',
  );
  if (firstPIndex === -1) return null;

  const firstP = node.children[firstPIndex] as Element;
  if (!firstP.children.length) return null;

  const firstChild = firstP.children[0];
  if (firstChild.type !== 'text') return null;

  const textMatch = (firstChild as Text).value.match(calloutMarkerRegex);
  if (!textMatch) return null;

  const type = textMatch[1];

  // Strip the [!TYPE] prefix from the text node
  (firstChild as Text).value = (firstChild as Text).value.slice(textMatch[0].length);

  // If the first <p> is now empty (marker was alone on its line), drop it
  const isFirstPEmpty = (firstChild as Text).value === '' && firstP.children.length === 1;
  const contentChildren = isFirstPEmpty
    ? node.children.filter((_, i) => i !== firstPIndex)
    : [...node.children];

  return { type, contentChildren };
}

function buildCalloutElement(alertClass: string, icon: string, contentChildren: Element['children']): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['moj-alert', alertClass] },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: {},
        children: [buildCalloutIcon(icon)],
      },
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['moj-alert__content'] },
        children: contentChildren as Element[],
      },
    ],
  };
}

function buildCalloutIcon(icon: string): Element {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: ['moj-alert__icon'],
      role: 'presentation',
      focusable: 'false',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 30 30',
      height: '30',
      width: '30',
    },
    children: [
      {
        type: 'element',
        tagName: 'use',
        properties: { href: `${basePath}/assets/images/${icon}` },
        children: [],
      },
    ],
  };
}

async function renderMarkdown(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCallouts)
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

function transformHtml(html: string, ctx: DocsLinkContext): string {
  return normalizeMalformedDocsPathsInHtml(
    rewriteDocAssetSources(rewriteDocAnchorLinks(html, ctx), ctx),
  );
}

