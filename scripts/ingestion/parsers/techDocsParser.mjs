import fs from 'fs';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { parseSimpleYaml } from '../yaml.mjs';

/**
 * Parser: tech-docs-template
 *
 * Handles MoJ Tech Docs Generator source files (.html.md.erb and .md).
 * Strips ERB tags before parsing so the body is valid markdown.
 *
 * Parser contract (all parsers must return this shape):
 *   parse(file, source) => IR {
 *     sourcePath: string,       // original relative file path
 *     outputPath: string,       // output relative file path (after extension normalisation)
 *     frontmatter: object,      // parsed YAML frontmatter as plain JS object
 *     ast: Root,                // MDAST root node of the body (remark/unist)
 *   }
 */

const processor = remark().use(remarkGfm);

export function parse(file, _source) {
  const raw = fs.readFileSync(file.absolute, 'utf-8');
  const stripped = stripErb(raw);

  let frontmatter = {};
  let bodyText = stripped;

  const fmMatch = stripped.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fmMatch) {
    frontmatter = parseSimpleYaml(fmMatch[1]);
    bodyText = fmMatch[2];
  }

  const ast = processor.parse(bodyText);

  const outputPath = file.relative.endsWith('.html.md.erb')
    ? file.relative.replace(/\.html\.md\.erb$/, '.md')
    : file.relative;

  return { sourcePath: file.relative, outputPath, frontmatter, ast, format: 'tech-docs-template' };
}

/**
 * Strips ERB template tags from content before markdown parsing.
 * Called by this parser; also exported for direct unit testing.
 */
export function stripErb(content) {
  let result = content.replace(
    /<%=?\s*partial\s*\(\s*['"]([^'"]+)['"]\s*\)\s*%>/g,
    ''
  );
  result = result.replace(/<%=\s*[\s\S]*?%>/g, '');
  result = result.replace(/<%[\s\S]*?%>/g, '');
  result = result.replace(/^(#{1,6})\s*$/gm, '');
  return result;
}
