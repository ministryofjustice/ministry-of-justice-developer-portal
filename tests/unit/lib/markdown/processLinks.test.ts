import { describe, it, expect } from 'vitest';

import { rewriteDocAnchorLinks, rewriteDocAssetSources } from '@/lib/markdown/processLinks';

const ctx = {
  sourceSlug: 'test-source',
  currentSlug: ['docs', 'guide', 'page'],
};

describe('rewriteDocAnchorLinks', () => {
  it('leaves external links untouched', () => {
    const input = `<a href="https://google.com">link</a>`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('href="https://google.com"');
  });

  it('leaves mailto links untouched', () => {
    const input = `<a href="mailto:test@example.com">email</a>`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('mailto:test@example.com');
  });

  it('rewrites relative markdown doc links', () => {
    const input = `<a href="other-page.md">link</a>`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('/docs/test-source/');
  });

  it('handles hash links unchanged', () => {
    const input = `<a href="#section">link</a>`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('href="#section"');
  });

  it('rewrites /docs paths correctly', () => {
    const input = `<a href="/docs/test-source/page">link</a>`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('/docs/test-source/page');
  });
});

describe('rewriteDocAssetSources', () => {
  it('rewrites image assets', () => {
    const input = `<img src="image.png" />`;

    const result = rewriteDocAssetSources(input, ctx);

    expect(result).toContain('/docs/test-source/');
  });

  it('rewrites pdf assets', () => {
    const input = `<a src="file.pdf">file</a>`;

    const result = rewriteDocAssetSources(input, ctx);

    expect(result).toContain('/docs/test-source/');
  });

  it('leaves non-asset files untouched', () => {
    const input = `<img src="data.json" />`;

    const result = rewriteDocAssetSources(input, ctx);

    expect(result).toContain('data.json');
  });

  it('does not rewrite external src URLs', () => {
    const input = `<img src="https://cdn.com/image.png" />`;

    const result = rewriteDocAssetSources(input, ctx);

    expect(result).toContain('https://cdn.com/image.png');
  });
});

describe('rewriteDocHref deeper cases', () => {
  it('handles absolute github pages links', () => {
    const input = `<a href="https://ministryofjustice.github.io/repo/docs/page">`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('/docs/');
  });

  it('leaves /assets paths alone except basePath', () => {
    const input = `<a href="/assets/image.png">`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('/assets/image.png');
  });

  it('does not rewrite non-markdown extensions', () => {
    const input = `<a href="file.json">`;

    const result = rewriteDocAnchorLinks(input, ctx);

    expect(result).toContain('file.json');
  });
});

describe('rewriteAssetPath edge cases', () => {
  it('returns original when no extension', () => {
    const input = `<img src="image" />`;

    const result = rewriteDocAssetSources(input, ctx);

    expect(result).toContain('image');
  });

  it('does not rewrite docs-prefixed assets', () => {
    const input = `<img src="/docs/test/image.png" />`;

    const result = rewriteDocAssetSources(input, ctx);

    expect(result).toContain('/docs/test/image.png');
  });
});

describe('rewrite links edge cases', () => {
  it('handles multiple attributes in one HTML string', () => {
    const input = `
      <a href="page.md">link</a>
      <img src="image.png" />
    `;

    const result = rewriteDocAnchorLinks(input, ctx);
    const final = rewriteDocAssetSources(result, ctx);

    expect(final).toContain('/docs/test-source/');
  });

  it('does not crash on empty HTML', () => {
    expect(rewriteDocAnchorLinks('', ctx)).toBe('');
    expect(rewriteDocAssetSources('', ctx)).toBe('');
  });
});
