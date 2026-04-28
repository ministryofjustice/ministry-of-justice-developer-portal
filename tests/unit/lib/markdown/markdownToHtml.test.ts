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

    it('can slugify complex headings', async () => {
      const result = await markdownToHtml('# Hello & World!');

      expect(result).toContain('id="hello--world"');
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

  describe('callouts', () => {
    it.each([
      ['NOTE',      'moj-alert--information', 'icon-alert-information.svg'],
      ['TIP',       'moj-alert--success',     'icon-alert-success.svg'],
      ['IMPORTANT', 'moj-alert--warning',     'icon-alert-warning.svg'],
      ['WARNING',   'moj-alert--warning',     'icon-alert-warning.svg'],
      ['CAUTION',   'moj-alert--error',       'icon-alert-warning.svg'],
    ])('[!%s] renders with class %s and icon %s', async (type, alertClass, icon) => {
      const result = await markdownToHtml(`> [!${type}]\n> Some message`);

      expect(result).toContain(`moj-alert ${alertClass}`);
      expect(result).toContain(icon);
    });

    it('includes the callout body text', async () => {
      const result = await markdownToHtml('> [!NOTE]\n> Check your configuration');

      expect(result).toContain('Check your configuration');
    });

    it('wraps content in moj-alert__content div', async () => {
      const result = await markdownToHtml('> [!TIP]\n> A helpful tip');

      expect(result).toContain('class="moj-alert__content"');
      expect(result).toContain('A helpful tip');
    });

    it('renders multi-paragraph callout content', async () => {
      const result = await markdownToHtml('> [!WARNING]\n> First line\n>\n> Second paragraph');

      expect(result).toContain('First line');
      expect(result).toContain('Second paragraph');
    });

    it('does not convert an unknown callout type', async () => {
      const result = await markdownToHtml('> [!UNKNOWN]\n> Some text');

      expect(result).toContain('<blockquote>');
      expect(result).not.toContain('moj-alert');
    });

    it('does not convert a regular blockquote', async () => {
      const result = await markdownToHtml('> Just a regular quote');

      expect(result).toContain('<blockquote>');
      expect(result).not.toContain('moj-alert');
    });
  });
});
