// @vitest-environment node

import fs from 'fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadSources, parseCliArgs } from '../../../scripts/ingestion/config.mjs';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseCliArgs', () => {
  it('parses dry-run flag and target id', () => {
    const result = parseCliArgs(['--dry-run', 'cloud-platform']);

    expect(result).toEqual({ dryRun: true, targetId: 'cloud-platform' });
  });

  it('returns undefined target id when no positional argument exists', () => {
    const result = parseCliArgs(['--dry-run']);

    expect(result).toEqual({ dryRun: true, targetId: undefined });
  });
});

describe('loadSources', () => {
  it('reads and returns sources from the configured json file', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(
      JSON.stringify({
        sources: [{ id: 'cloud-platform' }, { id: 'analytical-platform' }],
      })
    );

    expect(loadSources()).toEqual([{ id: 'cloud-platform' }, { id: 'analytical-platform' }]);
  });

  it('returns an empty array when the sources key is missing', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({}));

    expect(loadSources()).toEqual([]);
  });
});
