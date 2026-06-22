// @vitest-environment node

import path from 'path';
import { describe, expect, it } from 'vitest';

import { discoverFiles } from '../../../scripts/ingestion/discovery.mjs';

const FIXTURES_ROOT = path.resolve(process.cwd(), 'tests/fixtures/ingestion');

describe('discoverFiles', () => {
  it('finds tech-docs-template files and skips hidden or underscored entries', () => {
    const docsRoot = path.join(FIXTURES_ROOT, 'discovery-techdocs');

    const files = discoverFiles(docsRoot, 'tech-docs-template').map((f) => f.relative).sort();

    expect(files).toEqual(['guide/index.html.md.erb', 'guide/intro.md']);
  });

  it('finds md and mdx for non-tech-doc formats', () => {
    const docsRoot = path.join(FIXTURES_ROOT, 'discovery-markdown');

    const files = discoverFiles(docsRoot, 'markdown').map((f) => f.relative).sort();

    expect(files).toEqual(['content/a.md', 'content/b.mdx']);
  });

  it('only includes eleventy index pages and ignores utility pages', () => {
    const docsRoot = path.join(FIXTURES_ROOT, 'discovery-eleventy');

    const files = discoverFiles(docsRoot, 'eleventy').map((f) => f.relative).sort();

    expect(files).toEqual([
      'content/index.md',
      'content/section-a/index.md',
      'content/section-b/index.mdx',
    ]);
  });
});
