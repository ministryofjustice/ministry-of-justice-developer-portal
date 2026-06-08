import * as techDocsParser from './techDocsParser.mjs';
import * as markdownParser from './markdownParser.mjs';

/**
 * Parser registry
 *
 * Maps source format strings to their parser implementations.
 * Each parser must export: parse(file, source) => IR
 *
 * To register a new parser:
 *   1. Create parsers/<name>Parser.mjs implementing parse(file, source).
 *   2. Import it here and add an entry to REGISTRY below.
 *   3. Set the matching `format` value on sources in sources.json.
 *
 * Connector registry (future — see connectors/githubConnector.mjs):
 *   A connectorRegistry.mjs will map `source.connector` → connector module.
 *   Pattern is identical: import connector, register by key, call fetchSource(source).
 */
const REGISTRY = {
  'tech-docs-template': techDocsParser,
  markdown: markdownParser,
  mdx: markdownParser,
};

/**
 * Returns the parser for the given format string.
 * Throws if no parser is registered for the format.
 */
export function getParser(format) {
  const parser = REGISTRY[format];
  if (!parser) {
    throw new Error(
      `No parser registered for format "${format}". ` +
        `Registered formats: ${Object.keys(REGISTRY).join(', ')}`
    );
  }
  return parser;
}
