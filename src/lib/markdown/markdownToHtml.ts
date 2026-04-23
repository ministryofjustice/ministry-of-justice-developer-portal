import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

import { rewriteDocAnchorLinks, rewriteDocAssetSources } from './processLinks';
import { normalizeMalformedDocsPathsInHtml } from './paths';

export type DocsLinkContext = {
  sourceSlug: string;
  currentSlug: string[];
};

export async function markdownToHtml(markdown: string, ctx?: DocsLinkContext): Promise<string> {
  const html = await renderMarkdown(markdown);

  if (!ctx) return html;

  return transformHtml(html, ctx);
}

async function renderMarkdown(markdown: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(html).process(markdown);

  return addHeadingIds(result.toString());
}

function transformHtml(html: string, ctx: DocsLinkContext): string {
  return normalizeMalformedDocsPathsInHtml(
    rewriteDocAssetSources(rewriteDocAnchorLinks(html, ctx), ctx),
  );
}

/* ------------------ Heading IDs ------------------ */

function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_full, tag: string, inner: string) => {
    const text = extractText(inner);
    const id = slugify(text);

    if (!id) return `<${tag}>${inner}</${tag}>`;
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
}

function extractText(fragment: string): string {
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
    if (!inTag) output += char;
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
