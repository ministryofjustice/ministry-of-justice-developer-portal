// @vitest-environment node

import path from 'path';
import { describe, expect, it } from 'vitest';

import { convertFile } from '../../../scripts/ingestion/convert.mjs';

const FIXTURES_ROOT = path.resolve(process.cwd(), 'tests/fixtures/ingestion');

describe('ingestion conversion parity', () => {
  it('converts tech-docs-template page output while preserving current behavior', () => {
    const inputPath = path.join(FIXTURES_ROOT, 'convert/guide/index.html.md.erb');

    const result = convertFile(
      {
        absolute: inputPath,
        relative: 'guide/index.html.md.erb',
      },
      {
        id: 'cloud-platform',
        repo: 'ministryofjustice/cloud-platform',
        docsPath: 'source/documentation',
        owner_slack: '#cp-team',
      }
    );

    expect(result.outputRelative).toBe('guide/index.md');
    expect(result.content).toContain('title: Welcome');
    expect(result.content).toContain('source_repo: ministryofjustice/cloud-platform');
    expect(result.content).toContain('source_path: guide/index.html.md.erb');
    expect(result.content).toContain('owner_slack: "#cp-team"');
    expect(result.content).toContain('[Platform guide](/docs/cloud-platform/platform)');
    expect(result.content).toContain('[Relative guide](another-page)');
    expect(result.content).toContain('```\nsome code');
    expect(result.content).not.toContain('<%=');
  });
});