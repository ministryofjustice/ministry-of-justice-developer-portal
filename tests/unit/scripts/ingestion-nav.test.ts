// @vitest-environment node

import path from 'path';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  extractGroupsFromIndex,
  buildGroupedChildren,
  generateGroupedNav,
} from '../../../scripts/ingestion/nav.mjs';

vi.mock('fs');

import fs from 'fs';

describe('extractGroupsFromIndex', () => {
  it('extracts grouped page slugs from a configured section in index content', () => {
    const content = [
      '## Standards',
      '',
      '### Operating services',
      '* [Avoiding code freezes](documentation/standards/code-freezes.html)',
      '* [How to host services](documentation/standards/hosting.html)',
      '',
      '### Building software',
      '* [Naming things](documentation/standards/naming-things.html)',
      '',
      '## Adding new guidance',
    ].join('\n');

    const result = extractGroupsFromIndex(content, {
      sectionHeading: 'Standards',
      sourceLinkPrefix: 'documentation/',
      linkPathPrefix: 'standards/',
      groupHeadingLevel: 3,
    });

    expect(result).toEqual([
      { title: 'Operating services', pages: ['code-freezes', 'hosting'] },
      { title: 'Building software', pages: ['naming-things'] },
    ]);
  });
});

describe('buildGroupedChildren', () => {
  it('groups standards pages while preserving existing child page slugs', () => {
    const sourceId = 'ministry-of-justice-technical-guidance';
    const standardsChildren = [
      { title: 'Avoid code freezes', slug: [sourceId, 'standards', 'code-freezes'] },
      { title: 'How to host services', slug: [sourceId, 'standards', 'hosting'] },
      { title: 'Naming things', slug: [sourceId, 'standards', 'naming-things'] },
    ];

    const groups = [
      { title: 'Operating services', pages: ['code-freezes', 'hosting'] },
      { title: 'Building software', pages: ['naming-things'] },
    ];

    const result = buildGroupedChildren(sourceId, 'standards', standardsChildren, groups);

    expect(result.children).toHaveLength(2);
    expect(result.children[0].title).toBe('Operating services');
    expect(result.children[0].slug).toEqual([
      'ministry-of-justice-technical-guidance',
      'standards',
      'operating-services',
    ]);
    expect(result.children[0].children?.map((item: any) => item.slug[item.slug.length - 1])).toEqual([
      'code-freezes',
      'hosting',
    ]);
    expect(result.children[1].title).toBe('Building software');
    expect(result.children[1].children?.map((item: any) => item.slug[item.slug.length - 1])).toEqual([
      'naming-things',
    ]);
  });
  it('avoids group slug collisions with existing child slugs', () => {
    const sourceId = 'ministry-of-justice-technical-guidance';
    const standardsChildren = [
      { title: 'Operating services (existing page)', slug: [sourceId, 'standards', 'operating-services'] },
      { title: 'Avoid code freezes', slug: [sourceId, 'standards', 'code-freezes'] },
    ];

    const groups = [{ title: 'Operating services', pages: ['code-freezes'] }];

    const result = buildGroupedChildren(sourceId, 'standards', standardsChildren, groups);

    expect(result.children[0].slug).toEqual([sourceId, 'standards', 'operating-services-2']);
  });
});

describe('generateGroupedNav', () => {
  const sourceId = 'test-source';
  const repoDir = '/repo';
  const outputDir = '/output';
  const indexPath = path.join(repoDir, 'source/index.html.md.erb');
  const standardsDir = path.join(outputDir, 'standards');

  const source = {
    id: sourceId,
    navGrouping: {
      enabled: true,
      indexPath: 'source/index.html.md.erb',
      sectionSlug: 'standards',
      sectionHeading: 'Standards',
      groupHeadingLevel: 3,
      sourceLinkPrefix: 'documentation/',
      linkPathPrefix: 'standards/',
    },
  };

  const indexContent = [
    '## Standards',
    '',
    '### Operating services',
    '* [Avoid code freezes](documentation/standards/code-freezes.html)',
    '',
    '### Building software',
    '* [Naming things](documentation/standards/naming-things.html)',
  ].join('\n');

  function makeDirent(name: string, isDir: boolean): fs.Dirent {
    return {
      name,
      isDirectory: () => isDir,
      isFile: () => !isDir,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
      isSocket: () => false,
      isSymbolicLink: () => false,
      parentPath: '',
      path: '',
    } as fs.Dirent;
  }

  beforeEach(() => {
    vi.mocked(fs.existsSync).mockReset();
    vi.mocked(fs.readFileSync).mockReset();
    vi.mocked(fs.readdirSync).mockReset();
    vi.mocked(fs.mkdirSync).mockReset();
    vi.mocked(fs.writeFileSync).mockReset();
  });

  it('writes group landing pages and _nav.json with grouped structure', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = String(p);
      return (
        ps === indexPath ||
        ps === outputDir ||
        ps === standardsDir
      );
    });

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const ps = String(p);
      if (ps === indexPath) return indexContent;
      // .md files in standards/
      if (ps.endsWith('code-freezes.md')) return '---\ntitle: Avoid code freezes\n---\nContent';
      if (ps.endsWith('naming-things.md')) return '---\ntitle: Naming things\n---\nContent';
      return '';
    });

    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const ps = String(p);
      if (ps === outputDir) return [makeDirent('standards', true)] as any;
      if (ps === standardsDir) return [
        makeDirent('code-freezes.md', false),
        makeDirent('naming-things.md', false),
      ] as any;
      return [] as any;
    });

    generateGroupedNav(source, repoDir, outputDir);

    const writeFileCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const writtenPaths = writeFileCalls.map(([p]) => String(p));

    // _nav.json should be written
    expect(writtenPaths).toContain(path.join(outputDir, '_nav.json'));

    // Group landing pages should be written
    expect(writtenPaths).toContain(
      path.join(outputDir, 'standards', 'operating-services', 'index.md')
    );
    expect(writtenPaths).toContain(
      path.join(outputDir, 'standards', 'building-software', 'index.md')
    );

    // _nav.json content should have grouped structure
    const navCall = writeFileCalls.find(([p]) => String(p).endsWith('_nav.json'));
    const nav = JSON.parse(navCall![1] as string);
    const standardsItem = nav.find((item: any) => item.slug.join('/') === `${sourceId}/standards`);
    expect(standardsItem).toBeDefined();
    expect(standardsItem.children[0].title).toBe('Operating services');
    expect(standardsItem.children[1].title).toBe('Building software');
  });

  it('does nothing when navGrouping is not enabled', () => {
    generateGroupedNav({ id: sourceId, navGrouping: { enabled: false } }, repoDir, outputDir);

    expect(fs.existsSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('does nothing when index file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    generateGroupedNav(source, repoDir, outputDir);

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});



