import { visit } from 'unist-util-visit';

/**
 * Transform: content cleanup
 *
 * Removes structural artefacts left by upstream processing (e.g. empty headings
 * after ERB tag removal). Operates on the MDAST AST.
 *
 * Currently removes heading nodes whose text content is empty or whitespace-only.
 * Extend this transform for additional source-agnostic hygiene rules.
 */

/**
 * @param {object} ir - IR doc object { sourcePath, outputPath, frontmatter, ast }
 * @returns {object}  - Same IR with cleaned AST (mutated in place)
 */
export function contentCleanupTransform(ir) {
  const toRemove = [];

  visit(ir.ast, 'heading', (node, index, parent) => {
    const text = node.children
      .filter((c) => c.type === 'text')
      .map((c) => c.value)
      .join('');

    if (!text.trim()) {
      toRemove.push({ parent, index });
    }
  });

  // Remove in reverse order to preserve indices
  for (const { parent, index } of toRemove.reverse()) {
    parent.children.splice(index, 1);
  }

  return ir;
}
