import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getGuidelinePage, getDocSources, getDocPage, getAllDocSlugs, buildNavFromDir } from '@/lib/docs';

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

/** Minimal fs.Dirent stand-in */
function makeDirent(name: string, isDirectory: boolean): fs.Dirent {
  return {
    name,
    isDirectory: () => isDirectory,
    isFile: () => !isDirectory,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    isSymbolicLink: () => false,
    parentPath: '',
    path: '',
  } as fs.Dirent;
}

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

describe('getGuidelinePage', () => {
  it('returns content when .mdx file exists', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('.mdx'));
    vi.mocked(fs.readFileSync).mockReturnValue('---\ntitle: Test\n---\nHello world');

    const result = getGuidelinePage('my-guideline');

    expect(result).not.toBeNull();
    expect(result?.content).toContain('Hello world');
  });

  it('falls back to .md when .mdx does not exist', () => {
    vi.mocked(fs.existsSync)
      .mockImplementationOnce(() => false)   // .mdx doesn't exist
      .mockImplementationOnce(() => true);   // .md does
    vi.mocked(fs.readFileSync).mockReturnValue('# Heading\nContent');

    const result = getGuidelinePage('my-guideline');

    expect(result?.content).toContain('Content');
  });

  it('returns null when neither file exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = getGuidelinePage('missing');

    expect(result).toBeNull();
  });
});

describe('getDocSources', () => {
  it('returns empty array when docs directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(getDocSources()).toEqual([]);
  });

  it('skips non-directory entries', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === DOCS_DIR);
    vi.mocked(fs.readdirSync).mockReturnValue([makeDirent('README.md', false)] as any);

    expect(getDocSources()).toEqual([]);
  });

  it('derives name from directory name when no _meta.json', () => {
    const sourceDir = path.join(DOCS_DIR, 'cloud-platform');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === DOCS_DIR || ps === sourceDir;
    });
    vi.mocked(fs.readdirSync).mockReturnValue([makeDirent('cloud-platform', true)] as any);

    const sources = getDocSources();

    expect(sources).toHaveLength(1);
    expect(sources[0].slug).toBe('cloud-platform');
    expect(sources[0].name).toBe('Cloud Platform');
    expect(sources[0].description).toBe('');
    expect(sources[0].category).toBe('documentation');
  });

  it('uses name, description and category from _meta.json', () => {
    const metaPath = path.join(DOCS_DIR, 'cloud-platform', '_meta.json');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === DOCS_DIR || ps === metaPath;
    });
    vi.mocked(fs.readdirSync).mockReturnValue([makeDirent('cloud-platform', true)] as any);
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if (String(p) === metaPath) {
        return JSON.stringify({ name: 'Cloud Platform', description: 'Hosting platform', category: 'platform' });
      }
      return '';
    });

    const sources = getDocSources();

    expect(sources[0].name).toBe('Cloud Platform');
    expect(sources[0].description).toBe('Hosting platform');
    expect(sources[0].category).toBe('platform');
  });

  it('loads nav items from _nav.json when present', () => {
    const navPath = path.join(DOCS_DIR, 'cloud-platform', '_nav.json');
    const navItems = [{ title: 'Getting Started', slug: ['cloud-platform', 'getting-started'] }];
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === DOCS_DIR || ps === navPath;
    });
    vi.mocked(fs.readdirSync).mockReturnValue([makeDirent('cloud-platform', true)] as any);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(navItems));

    const sources = getDocSources();

    expect(sources[0].items).toEqual(navItems);
  });

  it('auto-generates nav from directory when no _nav.json', () => {
    const sourceDir = path.join(DOCS_DIR, 'cloud-platform');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === DOCS_DIR || ps === sourceDir;
    });
    vi.mocked(fs.readdirSync)
      .mockImplementationOnce(() => [makeDirent('cloud-platform', true)] as any)
      .mockImplementationOnce(() => [makeDirent('getting-started.md', false)] as any);
    vi.mocked(fs.readFileSync).mockReturnValue('---\ntitle: Getting Started\n---\nContent');

    const sources = getDocSources();

    expect(sources[0].items).toHaveLength(1);
    expect(sources[0].items[0].title).toBe('Getting Started');
    expect(sources[0].items[0].slug).toEqual(['cloud-platform', 'getting-started']);
  });
});

describe('getDocPage', () => {

  it('returns page content when .md file exists', () => {
    const filePath = path.join(DOCS_DIR, 'cloud-platform', 'overview.md');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === filePath);
    vi.mocked(fs.readFileSync).mockReturnValue('---\ntitle: Overview\n---\nPage content');

    const result = getDocPage(['cloud-platform', 'overview']);

    expect(result).not.toBeNull();
    expect(result?.content).toContain('Page content');
    expect(result?.meta.title).toBe('Overview');
    expect(result?.meta.slug).toEqual(['cloud-platform', 'overview']);
  });

  it('falls back to index.md when direct .md file does not exist', () => {
    const indexPath = path.join(DOCS_DIR, 'cloud-platform', 'index.md');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === indexPath);
    vi.mocked(fs.readFileSync).mockReturnValue('---\ntitle: Cloud Platform\n---\nIntro');

    const result = getDocPage(['cloud-platform']);

    expect(result?.meta.title).toBe('Cloud Platform');
    expect(result?.content).toContain('Intro');
  });

  it('parses all supported frontmatter fields', () => {
    const filePath = path.join(DOCS_DIR, 'docs', 'page.md');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === filePath);
    vi.mocked(fs.readFileSync).mockReturnValue(
      '---\ntitle: My Page\nlastReviewedOn: "2025-01-01"\nreviewIn: 6 months\nownerSlack: "#my-team"\nsourceRepo: my-repo\nsourcePath: /docs/page.md\ningestedAt: "2025-06-01"\nweight: 5\n---\nContent',
    );

    const result = getDocPage(['docs', 'page']);

    expect(result?.meta.lastReviewedOn).toBe('2025-01-01');
    expect(result?.meta.reviewIn).toBe('6 months');
    expect(result?.meta.ownerSlack).toBe('#my-team');
    expect(result?.meta.sourceRepo).toBe('my-repo');
    expect(result?.meta.sourcePath).toBe('/docs/page.md');
    expect(result?.meta.ingestedAt).toBe('2025-06-01');
    expect(result?.meta.weight).toBe(5);
  });

  it('supports snake_case frontmatter aliases', () => {
    const filePath = path.join(DOCS_DIR, 'docs', 'page.md');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === filePath);
    vi.mocked(fs.readFileSync).mockReturnValue(
      '---\nlast_reviewed_on: "2025-01-01"\nreview_in: 3 months\nowner_slack: "#team"\nsource_repo: repo\nsource_path: /path\ningested_at: "2025-06-01"\n---\nContent',
    );

    const result = getDocPage(['docs', 'page']);

    expect(result?.meta.lastReviewedOn).toBe('2025-01-01');
    expect(result?.meta.reviewIn).toBe('3 months');
    expect(result?.meta.ownerSlack).toBe('#team');
  });

  it('derives title from slug when frontmatter has no title', () => {
    const filePath = path.join(DOCS_DIR, 'cloud-platform', 'getting-started.md');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === filePath);
    vi.mocked(fs.readFileSync).mockReturnValue('No frontmatter here');

    const result = getDocPage(['cloud-platform', 'getting-started']);

    expect(result?.meta.title).toBe('Getting Started');
  });

  it('generates a synthetic landing page for a directory without index.md', () => {
    const dirPath = path.join(DOCS_DIR, 'cloud-platform');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === dirPath);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);

    const result = getDocPage(['cloud-platform']);

    expect(result).not.toBeNull();
    expect(result?.meta.title).toBe('Cloud Platform');
  });

  it('includes _meta.json title and description in synthetic landing page', () => {
    const dirPath = path.join(DOCS_DIR, 'cloud-platform');
    const metaPath = path.join(dirPath, '_meta.json');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === dirPath || ps === metaPath;
    });
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: 'Cloud Hosting Platform', description: 'Our cloud infrastructure.' }),
    );

    const result = getDocPage(['cloud-platform']);

    expect(result?.meta.title).toBe('Cloud Hosting Platform');
    expect(result?.content).toContain('Our cloud infrastructure.');
  });

  it('returns null when no file, index, or directory is found', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(getDocPage(['cloud-platform', 'missing'])).toBeNull();
  });
});

describe('getAllDocSlugs', () => {
  it('returns empty array when docs directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(getAllDocSlugs()).toEqual([]);
  });

  it('returns slugs for .md files, skipping index.md', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === DOCS_DIR);
    vi.mocked(fs.readdirSync).mockReturnValue([
      makeDirent('overview.md', false),
      makeDirent('index.md', false),
    ] as any);

    const slugs = getAllDocSlugs();

    expect(slugs).toContainEqual(['overview']);
    expect(slugs).not.toContainEqual(['index']);
  });

  it('skips entries whose names start with _', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === DOCS_DIR);
    vi.mocked(fs.readdirSync).mockReturnValue([
      makeDirent('_nav.json', false),
      makeDirent('_meta.json', false),
      makeDirent('page.md', false),
    ] as any);

    const slugs = getAllDocSlugs();

    expect(slugs).toEqual([['page']]);
  });

  it('registers directory slug and recurses into it', () => {
    const cloudPlatformDir = path.join(DOCS_DIR, 'cloud-platform');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === DOCS_DIR || ps === cloudPlatformDir;
    });
    vi.mocked(fs.readdirSync)
      .mockImplementationOnce(() => [makeDirent('cloud-platform', true)] as any)
      .mockImplementationOnce(() => [makeDirent('overview.md', false)] as any);

    const slugs = getAllDocSlugs();

    expect(slugs).toContainEqual(['cloud-platform']);
    expect(slugs).toContainEqual(['cloud-platform', 'overview']);
  });

  it('registers an explicit /index slug when directory has an index.md', () => {
    const cloudPlatformDir = path.join(DOCS_DIR, 'cloud-platform');
    const indexPath = path.join(cloudPlatformDir, 'index.md');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === DOCS_DIR || ps === cloudPlatformDir || ps === indexPath;
    });
    vi.mocked(fs.readdirSync)
      .mockImplementationOnce(() => [makeDirent('cloud-platform', true)] as any)
      .mockImplementationOnce(() => [makeDirent('index.md', false)] as any);

    const slugs = getAllDocSlugs();

    expect(slugs).toContainEqual(['cloud-platform']);
    expect(slugs).toContainEqual(['cloud-platform', 'index']);
  });
});

describe('buildNavFromDir', () => {
  it('returns empty array when directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(buildNavFromDir('/missing', ['docs'])).toEqual([]);
  });

  it('uses index.md title and weight for directory nav items', () => {
    const dir = path.join(DOCS_DIR, 'cloud-platform');
    const childDir = path.join(dir, 'getting-started');
    const indexPath = path.join(childDir, 'index.md');

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return ps === dir || ps === childDir || ps === indexPath;
    });

    vi.mocked(fs.readdirSync)
      .mockImplementationOnce(() => [makeDirent('getting-started', true)] as any)
      .mockImplementationOnce(() => [] as any);

    vi.mocked(fs.readFileSync).mockReturnValue(
      '---\ntitle: Getting Started Custom\nweight: 2\n---\nContent',
    );

    const result = buildNavFromDir(dir, ['cloud-platform']);

    expect(result).toEqual([
      {
        title: 'Getting Started Custom',
        slug: ['cloud-platform', 'getting-started'],
        children: [],
        weight: 2,
      },
    ]);
  });

  it('sorts nav items by weight', () => {
    const dir = path.join(DOCS_DIR, 'cloud-platform');

    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) === dir);

    vi.mocked(fs.readdirSync).mockReturnValue([
      makeDirent('second.md', false),
      makeDirent('first.md', false),
    ] as any);

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if (String(p).endsWith('second.md')) {
        return '---\ntitle: Second\nweight: 2\n---\nContent';
      }

      return '---\ntitle: First\nweight: 1\n---\nContent';
    });

    const result = buildNavFromDir(dir, ['cloud-platform']);

    expect(result.map((item) => item.title)).toEqual(['First', 'Second']);
  });
});