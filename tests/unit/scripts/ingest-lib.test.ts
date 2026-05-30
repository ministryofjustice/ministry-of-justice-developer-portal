import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  loadSources,
  parseCliArgs,
  runIngestion,
  convertTechDocsPatterns,
} from '../../../scripts/ingest-lib.mjs';

const FIXTURE_REPO_DIR = path.join(
  process.cwd(),
  'tests',
  'unit',
  'scripts',
  'fixtures',
  'repo'
);

const createdDirs: string[] = [];

afterEach(() => {
  while (createdDirs.length > 0) {
    const dir = createdDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

function makeTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  createdDirs.push(dir);
  return dir;
}

describe('parseCliArgs', () => {
  it('extracts dry-run and optional source id', () => {
    expect(parseCliArgs(['--dry-run', 'cloud-platform'])).toEqual({
      dryRun: true,
      targetId: 'cloud-platform',
    });

    expect(parseCliArgs([])).toEqual({
      dryRun: false,
      targetId: undefined,
    });
  });
});

describe('loadSources', () => {
  it('adds default onboardingMode for backward compatibility', () => {
    const dir = makeTempDir('ingest-sources-');
    const sourcesFile = path.join(dir, 'sources.json');

    fs.writeFileSync(
      sourcesFile,
      JSON.stringify(
        {
          sources: [
            {
              id: 'source-a',
              name: 'Source A',
              enabled: true,
            },
            {
              id: 'source-b',
              name: 'Source B',
              enabled: true,
              onboardingMode: 'self-service',
            },
          ],
        },
        null,
        2
      )
    );

    const sources = loadSources(sourcesFile);

    expect(sources[0].onboardingMode).toBe('manual');
    expect(sources[1].onboardingMode).toBe('self-service');
  });
});

describe('convertTechDocsPatterns', () => {
  it('rewrites docsPath-prefixed .html links to portal docs routes', () => {
    const converted = convertTechDocsPatterns(
      '[Guide](/documentation/getting-started.html)',
      { id: 'cloud-platform', docsPath: 'documentation' }
    );

    expect(converted).toContain('[Guide](/docs/cloud-platform/getting-started)');
  });
});

describe('runIngestion', () => {
  it('returns exitCode 1 when no matching source id is found', async () => {
    const dir = makeTempDir('ingest-no-match-');
    const sourcesFile = path.join(dir, 'sources.json');

    fs.writeFileSync(
      sourcesFile,
      JSON.stringify(
        {
          sources: [
            {
              id: 'analytical-platform',
              name: 'Analytical Platform',
              enabled: true,
              repo: 'ministryofjustice/example',
              docsPath: 'documentation',
            },
          ],
        },
        null,
        2
      )
    );

    const result = await runIngestion({
      args: ['missing-source'],
      sourcesFile,
      cloneDir: path.join(dir, 'clone-cache'),
      contentDir: path.join(dir, 'content', 'docs'),
      root: dir,
      cloneOrPullImpl: () => FIXTURE_REPO_DIR,
      now: () => '2026-05-01T00:00:00.000Z',
      log: { log: () => {}, error: () => {} },
    });

    expect(result.exitCode).toBe(1);
    expect(result.results).toEqual([]);
  });

  it('ingests fixture docs and copies deduplicated assets', async () => {
    const dir = makeTempDir('ingest-happy-');
    const sourcesFile = path.join(dir, 'sources.json');

    fs.writeFileSync(
      sourcesFile,
      JSON.stringify(
        {
          sources: [
            {
              id: 'cloud-platform',
              name: 'Cloud Platform',
              description: 'Cloud docs',
              category: 'documentation',
              repo: 'ministryofjustice/cloud-platform',
              branch: 'main',
              docsPath: 'documentation',
              format: 'tech-docs-template',
              enabled: true,
            },
          ],
        },
        null,
        2
      )
    );

    const result = await runIngestion({
      args: [],
      sourcesFile,
      cloneDir: path.join(dir, 'clone-cache'),
      contentDir: path.join(dir, 'content', 'docs'),
      root: dir,
      cloneOrPullImpl: () => FIXTURE_REPO_DIR,
      now: () => '2026-05-01T00:00:00.000Z',
      log: { log: () => {}, error: () => {} },
    });

    expect(result.exitCode).toBe(0);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      id: 'cloud-platform',
      pages: 2,
      assets: 1,
    });

    const outputDir = path.join(dir, 'content', 'docs', 'cloud-platform');
    const ingestedIndex = path.join(outputDir, 'index.md');
    const ingestedAsset = path.join(outputDir, 'images', 'diagram.png');
    const publicAsset = path.join(dir, 'public', 'docs', 'cloud-platform', 'images', 'diagram.png');

    expect(fs.existsSync(ingestedIndex)).toBe(true);
    expect(fs.existsSync(ingestedAsset)).toBe(true);
    expect(fs.existsSync(publicAsset)).toBe(true);

    const markdown = fs.readFileSync(ingestedIndex, 'utf-8');
    expect(markdown).toContain('/docs/cloud-platform/guide');
    expect(markdown).toContain('owner_slack: "#portal-team"');

    const meta = JSON.parse(fs.readFileSync(path.join(outputDir, '_meta.json'), 'utf-8'));
    expect(meta.ingested_at).toBe('2026-05-01T00:00:00.000Z');
  });

  it('supports dry-run without writing any output files', async () => {
    const dir = makeTempDir('ingest-dry-');
    const sourcesFile = path.join(dir, 'sources.json');

    fs.writeFileSync(
      sourcesFile,
      JSON.stringify(
        {
          sources: [
            {
              id: 'cloud-platform',
              name: 'Cloud Platform',
              repo: 'ministryofjustice/cloud-platform',
              docsPath: 'documentation',
              format: 'tech-docs-template',
              enabled: true,
            },
          ],
        },
        null,
        2
      )
    );

    const result = await runIngestion({
      args: ['--dry-run'],
      sourcesFile,
      cloneDir: path.join(dir, 'clone-cache'),
      contentDir: path.join(dir, 'content', 'docs'),
      root: dir,
      cloneOrPullImpl: () => FIXTURE_REPO_DIR,
      now: () => '2026-05-01T00:00:00.000Z',
      log: { log: () => {}, error: () => {} },
    });

    expect(result.exitCode).toBe(0);
    expect(result.results[0]).toMatchObject({
      id: 'cloud-platform',
      pages: 2,
      assets: 1,
    });
    expect(fs.existsSync(path.join(dir, 'content', 'docs', 'cloud-platform'))).toBe(false);
  });
});
