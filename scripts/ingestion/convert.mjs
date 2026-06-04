/**
 * convert.mjs — pipeline orchestrator
 *
 * Wires together: parser → transforms → renderer
 * to produce the final markdown output for a single source file.
 *
 * Exports convertFile() with the same signature as before so callers
 * (ingestSource.mjs, tests) do not need to be updated together.
 *
 * stripErb and convertTechDocsPatterns are re-exported from their
 * new homes for backward compatibility with existing unit tests.
 */

import { getParser } from './parsers/parserRegistry.mjs';
import { frontmatterTransform } from './transforms/frontmatterTransform.mjs';
import { contentCleanupTransform } from './transforms/contentCleanupTransform.mjs';
import { linkRewriteTransform } from './transforms/linkRewriteTransform.mjs';
import { render } from './renderer/gfmRenderer.mjs';

export function convertFile(file, source) {
  const parser = getParser(source.format || 'tech-docs-template');

  let ir = parser.parse(file, source);

  ir = frontmatterTransform(ir, source);
  ir = contentCleanupTransform(ir);
  ir = linkRewriteTransform(ir, source);

  return render(ir);
}

// Re-exported for unit tests that import stripErb directly.
export { stripErb } from './parsers/techDocsParser.mjs';