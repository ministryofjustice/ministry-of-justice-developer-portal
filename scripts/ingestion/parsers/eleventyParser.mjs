import fs from 'fs';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { parseSimpleYaml } from '../yaml.mjs';

/**
 * Parser: Eleventy (11ty)
 *
 * Handles markdown files authored for 11ty projects.
 * 11ty commonly uses frontmatter and may include templating markers.
 * This parser treats 11ty markdown as standard markdown + frontmatter.
 *
 * Parser contract (all parsers must return this shape):
 *   parse(file, source) => IR {
 *     sourcePath: string,       // original relative file path
 *     outputPath: string,       // output relative file path
 *     frontmatter: object,      // parsed YAML frontmatter as plain JS object
 *     ast: Root,                // MDAST root node of the body (remark/unist)
 *     format: string            // format identifier
 *   }
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

  // Map common 11ty frontmatter conventions to portal fields if present
  if (frontmatter.eleventyNavigation?.order !== undefined) {
    frontmatter.order = frontmatter.eleventyNavigation.order;
  }

  const ast = processor.parse(bodyText);

  return { sourcePath: file.relative, outputPath: file.relative, frontmatter, ast, format: 'eleventy' };
}
