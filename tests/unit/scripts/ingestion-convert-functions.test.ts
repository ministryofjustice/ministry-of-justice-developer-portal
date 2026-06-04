// @vitest-environment node

import { remark } from 'remark';
import { describe, expect, it } from 'vitest';

import { stripErb } from '../../../scripts/ingestion/parsers/techDocsParser.mjs';
import { linkRewriteTransform } from '../../../scripts/ingestion/transforms/linkRewriteTransform.mjs';

function makeIr(markdownBody: string, format = 'tech-docs-template') {
  return {
    sourcePath: 'test.md',
    outputPath: 'test.md',
    frontmatter: {},
    ast: remark().parse(markdownBody),
    format,
  };
}

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

describe('linkRewriteTransform', () => {
  it('rewrites docsPath-prefixed html links to docs routes', () => {
    const ir = makeIr('[Guide](/documentation/getting-started.html)');
    const source = { id: 'cloud-platform', docsPath: 'source/documentation', format: 'tech-docs-template' };

    linkRewriteTransform(ir, source);

    const output = remark().stringify(ir.ast);
    expect(output).toContain('[Guide](/docs/cloud-platform/getting-started)');
  });

  it('rewrites absolute html links and erb fenced code block language', () => {
    const ir = makeIr(['[Other](/status.html)', '```erb', 'content', '```'].join('\n'));
    const source = { id: 'cloud-platform', format: 'tech-docs-template' };

    linkRewriteTransform(ir, source);

    const output = remark().stringify(ir.ast);
    expect(output).toContain('[Other](/docs/cloud-platform/status)');
    expect(output).not.toContain('```erb');
  });
});
