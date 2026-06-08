import fs from 'fs';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { parseSimpleYaml } from '../yaml.mjs';

/**
 * Parser: markdown / mdx passthrough
 *
 * Handles plain .md and .mdx files without source-specific preprocessing.
 * Implements the same parser contract as techDocsParser.
 *
 * To add a new format (e.g. Docsify, Jira):
 *   1. Create parsers/<name>Parser.mjs implementing parse(file, source).
 *   2. Register it in parsers/parserRegistry.mjs.
 *   3. Add the format string to the relevant source in sources.json.
 */

const processor = remark().use(remarkGfm);

export function parse(file, _source) {
  const raw = fs.readFileSync(file.absolute, 'utf-8');

  let frontmatter = {};
  let bodyText = raw;

  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fmMatch) {
    frontmatter = parseSimpleYaml(fmMatch[1]);
    bodyText = fmMatch[2];
  }

  const ast = processor.parse(bodyText);

  return { sourcePath: file.relative, outputPath: file.relative, frontmatter, ast, format: 'markdown' };
}
