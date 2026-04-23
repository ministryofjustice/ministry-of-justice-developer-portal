import { describe, it, expect } from 'vitest';

import {
  splitHrefSuffix,
  getFileExtension,
  normalizeDocPath,
  resolveDocPathSegments,
  isBasePathPrefixed,
  withBasePath,
  stripBasePath,
  ensureDocsTrailingSlash,
  normalizeMalformedDocsHref,
} from '@/lib/markdown/paths';

describe('splitHrefSuffix', () => {
  it('splits query string', () => {
    expect(splitHrefSuffix('page.md?x=1')).toEqual(['page.md', '?x=1']);
  });

  it('splits hash', () => {
    expect(splitHrefSuffix('page.md#section')).toEqual(['page.md', '#section']);
  });

  it('returns no suffix when none exists', () => {
    expect(splitHrefSuffix('page.md')).toEqual(['page.md', '']);
  });
});

describe('getFileExtension', () => {
  it('extracts extension', () => {
    expect(getFileExtension('file.md')).toBe('md');
  });

  it('handles uppercase', () => {
    expect(getFileExtension('file.PNG')).toBe('png');
  });

  it('returns null when no extension', () => {
    expect(getFileExtension('file')).toBeNull();
  });
});

describe('normalizeDocPath', () => {
  const ctx = {
    sourceSlug: 'test',
    currentSlug: ['docs', 'current-page'],
  };

  it('removes .md extension', () => {
    expect(normalizeDocPath('page.md', ctx)).toBe('page');
  });

  it('removes .html extension', () => {
    expect(normalizeDocPath('page.html', ctx)).toBe('page');
  });

  it('handles index as root', () => {
    expect(normalizeDocPath('index.md', ctx)).toBe('');
  });

  it('handles nested index', () => {
    expect(normalizeDocPath('guide/index.md', ctx)).toBe('guide');
  });

  it('returns null for invalid resolution', () => {
    expect(normalizeDocPath('', ctx)).toBe('');
  });
});

describe('resolveDocPathSegments', () => {
  const ctx = {
    sourceSlug: 'test',
    currentSlug: ['docs', 'guide', 'page'],
  };

  it('resolves relative paths', () => {
    expect(resolveDocPathSegments('other.md', ctx)).toEqual(['guide', 'other.md']);
  });

  it('handles parent directory', () => {
    expect(resolveDocPathSegments('../other.md', ctx)).toEqual(['other.md']);
  });

  it('handles absolute paths', () => {
    expect(resolveDocPathSegments('/docs/test/page.md', ctx)).toEqual(['page.md']);
  });
});

describe('base path helpers', () => {
  it('withBasePath prefixes path', () => {
    const result = withBasePath('/docs/test');
    expect(typeof result).toBe('string');
  });

  it('stripBasePath removes prefix when present', () => {
    const prefixed = withBasePath('/docs/test');
    expect(stripBasePath(prefixed)).toBe('/docs/test');
  });

  it('isBasePathPrefixed returns boolean', () => {
    expect(typeof isBasePathPrefixed('/docs/test')).toBe('boolean');
  });
});

describe('docs helpers', () => {
  it('ensures trailing slash for docs paths', () => {
    expect(ensureDocsTrailingSlash('/docs/test/page')).toBe('/docs/test/page/');
  });

  it('does not modify file paths', () => {
    expect(ensureDocsTrailingSlash('/docs/test/file.pdf')).toBe('/docs/test/file.pdf');
  });

  it('normalizes malformed docs href', () => {
    expect(normalizeMalformedDocsHref('/docs/test/documentation/page')).toBe('/docs/test/page');
  });
});
