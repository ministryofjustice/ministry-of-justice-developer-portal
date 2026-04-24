# Documentation Ingestion Runbook

## Scope

This runbook covers how documentation ingestion works for the Developer Portal, how to trigger it, how to troubleshoot failures, and how to validate outputs.

## Canonical Links

- Repository: https://github.com/ministryofjustice/ministry-of-justice-developer-portal
- Ingestion workflow: https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/.github/workflows/ingest.yml
- Ingestion script: https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/scripts/ingest.mjs
- Sources config: https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/sources.json
- Documentation output directory: https://github.com/ministryofjustice/ministry-of-justice-developer-portal/tree/main/content/docs

## What Ingestion Does

The ingestion pipeline:

1. Reads enabled sources from `sources.json`.
2. Clones/pulls source repositories into `.ingestion-cache`.
3. Converts source docs (including `tech-docs-template` `.html.md.erb` files) into Markdown.
4. Writes converted docs into `content/docs/<source-id>`.
5. Copies referenced assets into:
   - `content/docs/<source-id>/...`
   - `public/docs/<source-id>/...`
6. Writes `_meta.json` per source with provenance metadata.

## Configuring Sources

Sources are defined in `sources.json` under `sources[]`.

Fields used by ingestion:

- `id`: output folder name in `content/docs/`
- `repo`: GitHub repo slug (`owner/repo`)
- `branch`: branch to ingest from
- `docsPath`: path in source repo to ingest from
- `format`: `tech-docs-template` or `markdown`
- `enabled`: true/false
- `owner_slack`: optional fallback metadata

Current source IDs:

- `cloud-platform`
- `modernisation-platform`
- `analytical-platform`
- `security-guidance`

## How To Run Ingestion

### Local

From repository root:

```bash
# Ingest all enabled sources
node scripts/ingest.mjs

# Ingest one source
node scripts/ingest.mjs cloud-platform

# Dry run (no files written)
node scripts/ingest.mjs --dry-run
```

Equivalent npm scripts:

```bash
npm run ingest
npm run ingest:dry-run
npm run ingest:build
```

## GitHub Actions Triggers

Workflow: `Ingest Content`

Trigger modes:

1. Manual (`workflow_dispatch`)
2. Scheduled every 6 hours (`0 */6 * * *`)
3. `repository_dispatch` with type `docs-update`

Manual run link:

https://github.com/ministryofjustice/ministry-of-justice-developer-portal/actions/workflows/ingest.yml

### Manual Input

Optional input:

- `source`: source ID to ingest (leave empty to ingest all)

## Repository Dispatch Contract

The workflow reads source ID from `github.event.client_payload.source_id`.

Example dispatch payload body:

```json
{
  "event_type": "docs-update",
  "client_payload": {
    "source_id": "cloud-platform"
  }
}
```

## Workflow Runtime Requirements

The ingestion workflow expects:

- `vars.NODE_VERSION` configured in repository/environment variables
- GitHub token permissions to push commits (`contents: write`)

## Commit Behavior

After ingestion, workflow does:

1. `git add -A`
2. If no changes: exits successfully
3. If changes exist: commits and pushes with message:
   - `chore(ingest): refresh external documentation`

## Validation Checklist

After any ingestion run:

1. Check workflow status in Actions.
2. Confirm changed files under `content/docs/` and `public/docs/`.
3. Confirm each source still has `_meta.json`.
4. Run local build and search index generation:

```bash
npm run build
```

5. Spot-check key pages:

- `content/docs/cloud-platform/index.md`
- `content/docs/modernisation-platform/index.md`
- `content/docs/analytical-platform/index.md`
- `content/docs/security-guidance/index.md` (or equivalent root page)

## Troubleshooting

### No matching sources found

Cause:

- Invalid source ID passed to script, or all sources disabled.

Fix:

- Validate source ID against `sources.json`.
- Ensure `enabled: true` for desired source.

### Docs path not found

Cause:

- `docsPath` mismatch in `sources.json` or source repo structure changed.

Fix:

- Update `docsPath` in `sources.json`.
- Re-run ingestion for that source.

### Source clone/pull failure

Cause:

- Invalid repo slug/branch or transient GitHub availability issue.

Fix:

- Verify `repo` and `branch` in `sources.json`.
- Re-run workflow.

### Build fails after ingestion

Cause:

- Ingested markdown/content incompatible with current build assumptions.

Fix:

- Run `npm run build` locally.
- Identify failing file from stack trace.
- Patch converter logic in `scripts/ingest.mjs` or update source-specific handling.

## Operational Commands

Useful local inspection commands:

```bash
# Show changed ingested docs
git status --short content/docs public/docs

# See per-source output dirs
ls -1 content/docs

# Inspect latest metadata
cat content/docs/cloud-platform/_meta.json

# Quick grep for unresolved erb markers (should be none)
rg "<%|%>" content/docs
```

## Rollback

If an ingestion update introduces bad content:

1. Revert the ingestion commit on branch/main.
2. Re-run build checks.
3. Re-trigger ingestion only for corrected source once fixed.
