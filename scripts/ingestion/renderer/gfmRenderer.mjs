import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { buildFrontmatter } from '../yaml.mjs';

/**
 * Renderer: GFM markdown
 *
 * Converts a fully-transformed IR doc object back to a GFM markdown string
 * with YAML frontmatter, ready to be written to disk.
 *
 * Returns the same shape that ingestSource expects:
 *   { outputRelative: string, content: string }
 */

const processor = remark().use(remarkGfm);

/**
 * @param {object} ir - IR doc object { sourcePath, outputPath, frontmatter, ast }
 * @returns {{ outputRelative: string, content: string }}
 */
export function render(ir) {
  const body = processor.stringify(ir.ast);
  const fm = buildFrontmatter(ir.frontmatter);
  const content = `---\n${fm}---\n\n${body.trim()}\n`;

  return { outputRelative: ir.outputPath, content };
}
