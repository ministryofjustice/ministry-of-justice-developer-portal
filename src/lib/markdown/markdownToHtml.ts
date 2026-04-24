import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

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

  return htmlContent.replace(calloutRegex, (match, type, content) => {
    return generateCalloutHtml(type, content.trim());
  });
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
    const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);

  return processCallouts(result.toString());

}

function transformHtml(html: string, ctx: DocsLinkContext): string {
  return normalizeMalformedDocsPathsInHtml(
    rewriteDocAssetSources(rewriteDocAnchorLinks(html, ctx), ctx),
  );
}

