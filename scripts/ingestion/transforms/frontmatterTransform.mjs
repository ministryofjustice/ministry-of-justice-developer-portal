/**
 * Transform: frontmatter enrichment
 *
 * Adds source-level metadata to the IR frontmatter object.
 * Source-agnostic: applies to all formats.
 */

/**
 * @param {object} ir       - IR doc object { sourcePath, outputPath, frontmatter, ast }
 * @param {object} source   - Source config from sources.json
 * @returns {object}        - Same IR with enriched frontmatter (mutated in place)
 */
export function frontmatterTransform(ir, source) {
  ir.frontmatter.source_repo = source.repo;
  ir.frontmatter.source_path = ir.sourcePath;
  ir.frontmatter.ingested_at = new Date().toISOString();

  if (!ir.frontmatter.owner_slack && source.owner_slack) {
    ir.frontmatter.owner_slack = source.owner_slack;
  }

  return ir;
}
