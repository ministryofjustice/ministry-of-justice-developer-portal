import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '@/lib/markdown/markdownToHtml';

describe('markdownToHtml', () => {
  describe('basic markdown rendering', () => {
    it('converts markdown to HTML', async () => {
      const result = await markdownToHtml('**bold**');

      expect(result).toContain('<strong>bold</strong>');
    });

    it('handles empty input', async () => {
      const result = await markdownToHtml('');

      expect(result).toBe('');
    });
  });

  describe('heading IDs', () => {
    it('adds id to headings', async () => {
      const result = await markdownToHtml('# Hello World');

      expect(result).toContain('<h1 id="hello-world">Hello World</h1>');
    });

    it('slugifies complex headings', async () => {
      const result = await markdownToHtml('# Hello & World!');

      expect(result).toContain('id="hello-world"');
    });
  });

  describe('without context', () => {
    it('does not rewrite links', async () => {
      const result = await markdownToHtml('[link](page.md)');

      expect(result).toContain('href="page.md"');
    });
  });

  describe('with context', () => {
    const ctx = {
      sourceSlug: 'test-source',
      currentSlug: ['docs', 'current-page'],
    };

    it('rewrites relative markdown links to docs paths', async () => {
      const result = await markdownToHtml('[link](other-page.md)', ctx);

      expect(result).toContain('/docs/test-source/');
    });

    it('leaves external links untouched', async () => {
      const result = await markdownToHtml('[google](https://google.com)', ctx);

      expect(result).toContain('href="https://google.com"');
    });

    it('rewrites image src paths', async () => {
      const result = await markdownToHtml('![img](image.png)', ctx);

      expect(result).toContain('/docs/test-source/');
    });
  });
});
