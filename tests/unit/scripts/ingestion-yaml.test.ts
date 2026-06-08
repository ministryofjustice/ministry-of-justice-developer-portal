// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { buildFrontmatter, parseSimpleYaml } from '../../../scripts/ingestion/yaml.mjs';

describe('parseSimpleYaml', () => {
  it('parses primitives, nested keys and lists', () => {
    const parsed = parseSimpleYaml([
      'title: "Hello"',
      'enabled: true',
      'count: 3',
      'ratio: 2.5',
      'docs:',
      '  path: source/documentation',
      'tags:',
      '  - alpha',
      '  - beta',
    ].join('\n'));

    expect(parsed).toEqual({
      title: 'Hello',
      enabled: true,
      count: 3,
      ratio: 2.5,
      docs: { path: 'source/documentation' },
      tags: ['alpha', 'beta'],
    });
  });

  it('treats blank or null-like values as null', () => {
    const parsed = parseSimpleYaml([
      'owner: ',
      'repo: null',
      'channel: ~',
    ].join('\n'));

    expect(parsed).toEqual({
      owner: null,
      repo: null,
      channel: null,
    });
  });
});

describe('buildFrontmatter', () => {
  it('emits yaml-like key values and escapes special string values', () => {
    const output = buildFrontmatter({
      title: 'Welcome',
      owner_slack: '#team-platform',
      notes: 'path: "docs\\guide"',
      enabled: true,
      count: 7,
      skip: null,
      ignore: undefined,
    });

    expect(output).toContain('title: Welcome');
    expect(output).toContain('owner_slack: "#team-platform"');
    expect(output).toContain('notes: "path: \\"docs\\\\guide\\""');
    expect(output).toContain('enabled: true');
    expect(output).toContain('count: 7');
    expect(output).not.toContain('skip:');
    expect(output).not.toContain('ignore:');
  });
});
