// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { convertTechDocsPatterns, stripErb } from '../../../scripts/ingestion/convert.mjs';

describe('stripErb', () => {
  it('removes erb tags and empty headings left behind', () => {
    const result = stripErb([
      '#',
      '<%= value %>',
      '<% if true %>content<% end %>',
    ].join('\n'));

    expect(result).not.toContain('<%');
    expect(result).not.toContain('\n#\n');
  });

  it('strips erb partial includes as part of erb tag removal', () => {
    const result = stripErb('<%= partial("govuk/notice") %>');

    expect(result).toBe('');
  });
});

describe('convertTechDocsPatterns', () => {
  it('rewrites docsPath-prefixed html links to docs routes', () => {
    const result = convertTechDocsPatterns(
      '[Guide](/documentation/getting-started.html)',
      { id: 'cloud-platform', docsPath: 'source/documentation' }
    );

    expect(result).toContain('[Guide](/docs/cloud-platform/getting-started)');
  });

  it('rewrites remaining html links and erb fenced code blocks', () => {
    const result = convertTechDocsPatterns(
      ['[Other](/status.html)', '```erb', 'content', '```'].join('\n'),
      { id: 'cloud-platform' }
    );

    expect(result).toContain('[Other](/docs/cloud-platform/status)');
    expect(result).toContain('```\ncontent');
  });
});
