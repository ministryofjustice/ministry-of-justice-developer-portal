// @vitest-environment node

import path from 'path';
import { describe, expect, it } from 'vitest';

import { collectReferencedAssets } from '../../../scripts/ingestion/assets.mjs';

const FIXTURES_ROOT = path.resolve(process.cwd(), 'tests/fixtures/ingestion');

describe('collectReferencedAssets', () => {
  it('collects relative and absolute local assets and deduplicates them', () => {
    const docsRoot = path.join(FIXTURES_ROOT, 'assets/docs');
    const markdownFile = path.join(docsRoot, 'guide/index.md');

    const markdown = [
      '![diagram](../images/diagram.png)',
      '![diagram duplicate](../images/diagram.png?query=1)',
      '[runbook](/documentation/files/runbook.pdf)',
    ].join('\n');

    const assets = Array.from(
      collectReferencedAssets(markdown, markdownFile, docsRoot, 'documentation')
    ).sort();

    expect(assets).toEqual(['files/runbook.pdf', 'images/diagram.png']);
  });

  it('ignores external, anchor and non-asset links', () => {
    const docsRoot = path.join(FIXTURES_ROOT, 'assets/docs');
    const markdownFile = path.join(docsRoot, 'guide/index.md');

    const markdown = [
      '[external](https://example.com/file.pdf)',
      '[anchor](#section)',
      '[email](mailto:test@example.com)',
      '[doc](other.md)',
      '<img src="https://cdn.example.com/image.png" />',
    ].join('\n');

    const assets = Array.from(
      collectReferencedAssets(markdown, markdownFile, docsRoot, 'documentation')
    );

    expect(assets).toEqual([]);
  });
});
