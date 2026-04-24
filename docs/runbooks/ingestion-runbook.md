# Documentation Ingestion Runbook

## Review Dates

- Last reviewed: 2026-04-24

## Purpose

This runbook defines a reusable ingestion process for any repository that
pulls documentation from external sources and publishes normalized content into
the portal/site repository.

## Where To Update This Template

Update this file in:

- `docs/runbooks/ingestion-runbook.md`

Add or modify repository-specific values under the section **Repository-Specific Values To Fill**.

## Repository-Specific Values To Fill

Replace placeholders below for your target repository:

- `<ORG>/<REPO>`: GitHub repository slug
- `<DEFAULT_BRANCH>`: default branch (usually `main`)
- `<INGEST_WORKFLOW_PATH>`: path to workflow file (for example `.github/workflows/ingest.yml`)
- `<INGEST_SCRIPT_PATH>`: path to ingestion script (for example `scripts/ingest.mjs`)
- `<SOURCES_CONFIG_PATH>`: source configuration file (for example `sources.json`)
- `<CONTENT_OUTPUT_DIR>`: output folder (for example `content/docs`)
- `<PUBLIC_ASSET_DIR>`: public assets folder (for example `public/docs`)
- `<NODE_VERSION_VAR>`: Actions variable used by workflow (for example `NODE_VERSION`)
- `<DISPATCH_EVENT_TYPE>`: repository dispatch type (for example `docs-update`)
- `<SOURCE_INPUT_NAME>`: manual workflow input name (for example `source`)

Absolute links pattern:

- Repository: `https://github.com/<ORG>/<REPO>`
- Workflow: `https://github.com/<ORG>/<REPO>/blob/<DEFAULT_BRANCH>/<INGEST_WORKFLOW_PATH>`
- Script: `https://github.com/<ORG>/<REPO>/blob/<DEFAULT_BRANCH>/<INGEST_SCRIPT_PATH>`
- Sources config: `https://github.com/<ORG>/<REPO>/blob/<DEFAULT_BRANCH>/<SOURCES_CONFIG_PATH>`
- Output directory: `https://github.com/<ORG>/<REPO>/tree/<DEFAULT_BRANCH>/<CONTENT_OUTPUT_DIR>`

## Canonical Links

- Repository: `https://github.com/<ORG>/<REPO>`
- Ingestion workflow: `https://github.com/<ORG>/<REPO>/blob/<DEFAULT_BRANCH>/<INGEST_WORKFLOW_PATH>`
- Ingestion script: `https://github.com/<ORG>/<REPO>/blob/<DEFAULT_BRANCH>/<INGEST_SCRIPT_PATH>`
- Sources config: `https://github.com/<ORG>/<REPO>/blob/<DEFAULT_BRANCH>/<SOURCES_CONFIG_PATH>`
- Output directory: `https://github.com/<ORG>/<REPO>/tree/<DEFAULT_BRANCH>/<CONTENT_OUTPUT_DIR>`

## What Ingestion Should Do

1. Read enabled source definitions from source config.
2. Clone/pull source repositories into a cache directory.
3. Convert source docs into normalized markdown/content format.
4. Write converted docs to `<CONTENT_OUTPUT_DIR>/<source-id>`.
5. Copy referenced assets to both content and public asset directories.
6. Write metadata file per source (for example `_meta.json`).

## Source Configuration Contract

Define each source under a list (for example `sources[]`) with fields like:

- `id`: output folder name
- `repo`: source repo slug (`owner/repo`)
- `branch`: source branch
- `docsPath`: docs root path in source repo
- `format`: converter type (`tech-docs-template`, `markdown`, etc.)
- `enabled`: include/exclude source
- `owner_slack` or equivalent owner metadata (optional)

## How To Add A New Source

1. Add a new object under `sources[]` in `<SOURCES_CONFIG_PATH>` with at least:

- `id` (kebab-case, unique)
- `name`
- `repo` (`owner/repo`)
- `branch`
- `docsPath`
- `format` (`tech-docs-template` or `markdown`)
- `enabled` (`true`)

1. Validate source path and format assumptions in the source repo:

- `docsPath` exists on the target branch
- files under `docsPath` match expected format (`.md`, `.mdx`, or `.html.md.erb` for tech-docs-template)

1. Run a dry run for the new source only:

```bash
node <INGEST_SCRIPT_PATH> <new-source-id> --dry-run
```

1. Run a real ingestion for the new source only:

```bash
node <INGEST_SCRIPT_PATH> <new-source-id>
```

1. Validate generated output:

- `<CONTENT_OUTPUT_DIR>/<new-source-id>/` exists
- metadata file exists (for example `_meta.json`)
- referenced assets are copied as expected

1. Run build validation:

```bash
npm run build
```

1. Commit the source config and generated content changes in one PR.

1. Optionally trigger workflow dispatch with `<SOURCE_INPUT_NAME>=<new-source-id>` to validate CI ingestion path.

## Running Ingestion

### Local

```bash
# Ingest all enabled sources
node <INGEST_SCRIPT_PATH>

# Ingest a single source
node <INGEST_SCRIPT_PATH> <source-id>

# Dry run
node <INGEST_SCRIPT_PATH> --dry-run
```

### Package Scripts (Optional)

```bash
npm run ingest
npm run ingest:dry-run
npm run ingest:build
```

## GitHub Actions Trigger Model

Recommended trigger modes:

1. `workflow_dispatch` for manual runs
2. `schedule` for periodic sync
3. `repository_dispatch` for source-driven updates

Manual run URL pattern:

`https://github.com/<ORG>/<REPO>/actions/workflows/<INGEST_WORKFLOW_FILE_NAME>`

### Manual Input

Optional input example:

- `<SOURCE_INPUT_NAME>`: source ID (empty means all)

### Repository Dispatch Payload

If workflow expects `client_payload.source_id`:

```json
{
  "event_type": "<DISPATCH_EVENT_TYPE>",
  "client_payload": {
    "source_id": "<source-id>"
  }
}
```

## Workflow Runtime Requirements

- Node version variable configured (for example `vars.<NODE_VERSION_VAR>`)
- Workflow permissions to commit content changes (`contents: write`) when auto-commit is enabled
- Network access from runner to source repositories

## Commit Strategy

Typical post-ingestion behavior:

1. `git add -A`
2. Exit success if no changes
3. Commit and push if changes exist

Suggested commit message:

- `chore(ingest): refresh external documentation`

## Validation Checklist

After each ingestion run:

1. Confirm Actions run success.
1. Verify changed files under `<CONTENT_OUTPUT_DIR>` and `<PUBLIC_ASSET_DIR>`.
1. Verify metadata file exists for each ingested source.
1. Run build locally:

```bash
npm run build
```

1. Spot-check representative pages for each source.

## Troubleshooting Guide

### No matching sources

Cause:

- Invalid source ID or all sources disabled.

Resolution:

- Validate source ID exists in config.
- Ensure target source has `enabled: true`.

### Docs path not found

Cause:

- Source docs path changed in upstream repo.

Resolution:

- Update `docsPath` in source config.
- Re-run ingestion for the affected source.

### Clone/pull failures

Cause:

- Invalid repo/branch or temporary network failure.

Resolution:

- Validate `repo` and `branch` values.
- Retry workflow run.

### Build fails after ingestion

Cause:

- Converted markdown/content incompatible with local renderer/build.

Resolution:

- Run build locally and inspect failure path.
- Update conversion logic in ingestion script.

## Useful Operational Commands

```bash
# Show staged/unstaged ingestion output
git status --short <CONTENT_OUTPUT_DIR> <PUBLIC_ASSET_DIR>


# List source output directories
ls -1 <CONTENT_OUTPUT_DIR>

# Check metadata files
find <CONTENT_OUTPUT_DIR> -name "_meta.json"

# Check unresolved ERB markers after conversion
rg "<%|%>" <CONTENT_OUTPUT_DIR>
```

## Rollback

If ingestion introduces bad content:

1. Revert ingestion commit(s).
1. Re-run build checks.
1. Re-run ingestion only for corrected source after config/script fix.
