// @vitest-environment node

import { describe, expect, it } from 'vitest';

import {
  extractGroupsFromIndex,
  buildGroupedChildren,
} from '../../../scripts/ingestion/nav.mjs';

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
});



