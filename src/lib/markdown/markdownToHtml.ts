import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

import { rewriteDocAnchorLinks, rewriteDocAssetSources } from './processLinks';
import { normalizeMalformedDocsPathsInHtml } from './paths';

export type DocsLinkContext = {
  sourceSlug: string;
  currentSlug: string[];
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const alertClassLookup: Record<string, [string, string?]> = {
  NOTE: ['moj-alert--information', 'icon-alert-information.svg'],
  TIP: ['moj-alert--success', 'icon-alert-success.svg'],
  IMPORTANT: ['moj-alert--warning', 'icon-alert-warning.svg'],
  WARNING: ['moj-alert--warning', 'icon-alert-warning.svg'],
  CAUTION: ['moj-alert--error', 'icon-alert-warning.svg'],
};

export async function markdownToHtml(markdown: string, ctx?: DocsLinkContext): Promise<string> {
  const html = await renderMarkdown(markdown);

  if (!ctx) return html;

  return transformHtml(html, ctx);
}

function processCallouts(htmlContent: string): string {
  const calloutRegex = /<blockquote>\s*<p>\[!([A-Z]+)\](?:\s*<\/p>)?\s*([\s\S]*?)<\/blockquote>/g;

  const result = htmlContent.replace(calloutRegex, (match, type, content) => {
    return generateCalloutHtml(type, content.trim());
  });

  if (result !== htmlContent) {
    console.log('Callouts processed');
  }

  return result;
}

function generateCalloutHtml(type: string, content: string): string {
    const [alertClass, icon] = alertClassLookup[type] || ['moj-alert--information', 'icon-alert-information.svg'];
    return `<div class="moj-alert ${alertClass}">
              <div>
                <svg class="moj-alert__icon" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" height="30" width="30">
                  <use href="${basePath}/assets/images/${icon}"></use>
                </svg>
              </div>
              <div class="moj-alert__content">
                ${content}
              </div>
            </div>`;
  }

async function renderMarkdown(markdown: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(html).process(markdown);

  return processCallouts(addHeadingIds(result.toString()));

}

function transformHtml(html: string, ctx: DocsLinkContext): string {
  return normalizeMalformedDocsPathsInHtml(
    rewriteDocAssetSources(rewriteDocAnchorLinks(html, ctx), ctx),
  );
}

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
