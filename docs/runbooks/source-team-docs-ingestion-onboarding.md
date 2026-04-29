# Source Team Runbook: Publish Documentation to the Developer Portal

## Review Dates

- Last reviewed: 2026-04-29

## Audience

This runbook is for source repository teams who want their documentation
ingested into the Ministry of Justice Developer Portal automatically.

## Outcome

After completing this runbook, your source repository can notify the
Developer Portal whenever docs change, and the portal ingestion workflow
will update content without manual intervention.

## Prerequisites

- You own or maintain a source repository in GitHub.
- You can add workflows and consume secrets to that source repository.
- Manual mode only: you have a confirmed `source_id` that exactly matches the entry in the Developer Portal `sources.json`.
- Self-service mode: choose a unique kebab-case `source_id`; it can be created via payload.

## Contract You Must Follow

- Managed mode uses `sources.json` in the Developer Portal for:
  - `id`
  - `repo`
  - `branch`
  - `format`
  - `enabled`
- Self-service mode writes to the same `sources.json` with `onboardingMode: automated`
- Source repo `portal.yaml` supports only these ingestion overrides:
  - `docs.path`
  - `owner_slack`
- Notification event must be:
  - `event-type: docs-update`
- Notification payload must include:
  - `client_payload.source_id` for targeted ingestion
  - source metadata fields when self-service creating/updating a source

## Step 1: Confirm Your `source_id`

Confirm your `source_id` and choose onboarding mode.

### Manual Mode (PR path)

Request onboarding in the Developer Portal repo with:

- repository slug (`owner/repo`)
- default branch
- docs root path
- format (`tech-docs-template` or `markdown`)
- owner Slack channel
- proposed `id` (kebab-case)
- raise a PR in the Developer Portal repository
- notify `#developer-experience-team` with the PR link

### Self-service Mode (no manual portal intervention)

Use a `repository_dispatch` payload with source metadata as shown in this runbook.

## Step 2: Add `portal.yaml` at Source Repo Root

Create `portal.yaml` in your source repository root.
Use the example in [`docs/runbooks/portal.yaml.example`](docs/runbooks/portal.yaml.example).

Use this minimal example:

```yaml
owner_slack: "#your-team-channel"

docs:
  path: source/documentation
```

Notes:

- Set `docs.path` to the folder that contains your docs.
- Keep this file limited to supported keys used by ingestion.

## Step 3: Add Source Repo Notification Workflow

Add this workflow file in your source repo:

- `.github/workflows/notify-portal.yml`
- Based on [`notify-portal.yml.example`](notify-portal.yml.example)

Use this template:

```yaml
name: Notify Developer Portal

on:
  push:
    branches: [main]
    paths:
      - "source/documentation/**"

jobs:
  notify:
    runs-on: ubuntu-latest
    env:
      SOURCE_ID: your-source-id
    steps:
      - name: Create GitHub App token
        id: app-token
        uses: actions/create-github-app-token@fee1f7d63c2ff003460e3d139729b119787bc349 # v2
        with:
          app-id: ${{ secrets.MOJ_DEV_PORTAL_ONBOARDING_APP_ID }}
          private-key: ${{ secrets.MOJ_DEV_PORTAL_ONBOARDING_APP_PRIVATE_KEY }}
          owner: ministryofjustice
          repositories: ministry-of-justice-developer-portal

      - name: Trigger portal ingestion
        uses: peter-evans/repository-dispatch@ff45666b9427631e3450c54a1bcbee4d9ff4d7c0 # v3
        with:
          token: ${{ steps.app-token.outputs.token }}
          repository: ministryofjustice/ministry-of-justice-developer-portal
          event-type: docs-update
          client-payload: '{"source_id": "${{ env.SOURCE_ID }}"}'
```

Replace:

- `SOURCE_ID`:
  - Manual mode: set to the exact `id` already present in `sources.json`
  - Self-service mode: set to the same `source_id` you send in registration payload
- `paths` glob if your docs path differs

Optional self-service registration payload (first run or updates):

```json
{
  "event_type": "docs-update",
  "client_payload": {
    "source_id": "my-team-docs",
    "repo": "ministryofjustice/my-team-repo",
    "branch": "main",
    "docsPath": "docs",
    "format": "markdown",
    "owner_slack": "#my-team"
  }
}
```

When this payload is sent, the portal workflow registers or updates the source in
`sources.json` (with `onboardingMode: automated`) and ingests only that source.

## Step 4: Consume Required Org Secrets

Consume the org-level secrets directly in workflows via `secrets.*`:

- `MOJ_DEV_PORTAL_ONBOARDING_APP_ID`
- `MOJ_DEV_PORTAL_ONBOARDING_APP_PRIVATE_KEY`

App requirements:

- GitHub App installed on the target portal repo (`ministry-of-justice-developer-portal`)
- Minimum repository permissions:
  - Contents: Write
  - Metadata: Read

## Step 5: Validate End-to-End

### Manual Mode Validation

1. Commit a small docs change in your source repo under the configured path.
2. Confirm source workflow `Notify Developer Portal` runs successfully.
3. Confirm Developer Portal ingest workflow runs.
4. Confirm only your configured source is ingested.
5. Confirm no commit is created in the portal repo when ingestion yields no content changes.

### Self-service Mode Validation

1. Send self-service registration payload with source metadata.
2. Confirm Developer Portal ingest workflow registers/updates source in `sources.json`.
3. Confirm only that `source_id` is ingested.
4. Commit a docs change and confirm subsequent notify runs ingest correctly.
5. Confirm no commit is created in the portal repo when ingestion yields no content changes.

## Step 6: Validate Failure Behavior

Test with an invalid `source_id` (manual run in portal ingest workflow):

- Expected message: `No matching sources found`
- Expected result: workflow fails fast and does not commit

## Operational Checklist (Quick)

- Shared (both modes):
  - `portal.yaml` present with valid `docs.path`
  - Source workflow uses `event-type: docs-update`
  - Source workflow sends `client_payload.source_id`
  - `MOJ_DEV_PORTAL_ONBOARDING_APP_ID` configured
  - `MOJ_DEV_PORTAL_ONBOARDING_APP_PRIVATE_KEY` configured
- Manual mode:
  - `source_id` already exists in `sources.json`
- Self-service mode:
  - `source_id` is unique and kebab-case
  - registration payload includes required source metadata fields

## Troubleshooting

### Portal workflow says "No matching sources found"

- Manual mode:
  - Check `SOURCE_ID` in source workflow matches `sources.json` exactly.
  - Check source entry is `enabled: true`.
- Self-service mode:
  - Check registration payload was sent (includes `source_id`, `repo`, `branch`, `docsPath`, `format`).
  - Check `SOURCE_ID` matches the payload `source_id`.

### Portal workflow says "Docs path not found"

- Check `portal.yaml` `docs.path` points to a real folder on default branch.
- If absent, check `docsPath` in Developer Portal `sources.json`.

### Source workflow succeeds but portal workflow does not trigger

- Verify app secrets are present and non-empty:
  - `MOJ_DEV_PORTAL_ONBOARDING_APP_ID`
  - `MOJ_DEV_PORTAL_ONBOARDING_APP_PRIVATE_KEY`
- Verify app installation and permissions on target repository are correct.
- Verify `event-type` is `docs-update`.

## References

- [Documentation ingestion runbook](ingestion-runbook.md)
- [Source notification workflow example](notify-portal.yml.example)
- [Source `portal.yaml` example](portal.yaml.example)
- [Documentation template contract](../templates/spec-documentation.md)
