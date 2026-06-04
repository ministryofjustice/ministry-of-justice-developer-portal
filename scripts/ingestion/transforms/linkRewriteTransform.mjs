import { visit } from 'unist-util-visit';

/**
 * Transform: link rewriting
 *
 * Rewrites links in the MDAST to match portal routing conventions.
 * Format-aware: tech-docs-template sources require .html link normalisation;
 * markdown sources are passed through unchanged.
 *
 * tech-docs-template rules applied to Link nodes:
 *   1. /docsPath/page.html  → /docs/<source-id>/page
 *   2. /page.html           → /docs/<source-id>/page
 *   3. page.html            → page  (relative links — strip .html only)
 *
 * Code block language:
 *   `erb` fenced code blocks are rewritten to plain fenced blocks (no language tag).
 */

/**
 * @param {object} ir     - IR doc object { sourcePath, outputPath, frontmatter, ast }
 * @param {object} source - Source config from sources.json
 * @returns {object}      - Same IR with rewritten links (mutated in place)
 */
export function linkRewriteTransform(ir, source) {
  if (ir.format !== 'tech-docs-template') return ir;

  const docsPath = source.docsPath
    ? source.docsPath.replace(/^source\//, '')
    : 'documentation';

  const docsPathPattern = new RegExp(
    `^\\/${docsPath.replace('/', '\\/')}\/([^)]+?)\\.html$`
  );
  const absoluteHtmlPattern = /^\/(.+?)\.html$/;
  const relativeHtmlPattern = /^([^/][^)]*?)\.html$/;

  visit(ir.ast, 'link', (node) => {
    const url = node.url;

    if (docsPathPattern.test(url)) {
      node.url = `/docs/${source.id}/${url.match(docsPathPattern)[1]}`;
      return;
    }

    if (absoluteHtmlPattern.test(url)) {
      node.url = `/docs/${source.id}/${url.match(absoluteHtmlPattern)[1]}`;
      return;
    }

    if (relativeHtmlPattern.test(url)) {
      node.url = url.replace(/\.html$/, '');
    }
  });

  // Rewrite `erb` fenced code block language to plain (no language)
  visit(ir.ast, 'code', (node) => {
    if (node.lang === 'erb') {
      node.lang = null;
    }
  });

  return ir;
}
