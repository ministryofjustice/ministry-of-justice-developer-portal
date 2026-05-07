---
title: Source Team Docs Ingestion Onboarding
owner_slack: "#developer-portal"
review_in: "6 months"
---

# Source Team Docs Ingestion Onboarding

Use this runbook when onboarding a new documentation source into the Developer Portal ingestion flow.

## 1. Confirm source readiness

- Repository is accessible from GitHub Actions
- Documentation lives in a stable directory (for example `docs` or `source/documentation`)
- Team owner and support channel are known
- Source format is one of: `tech-docs-template`, `markdown`, `docsify`

## 2. Add source configuration

Update `sources.json` with:

- `id` (unique slug)
- `name`
- `description`
- `category`
- `repo`
- `branch`
- `docsPath`
- `format`
- `enabled`

Optional fields:

- `externalUrl`
- `owner_slack`
- `linkMode` (for redirect/live patterns)

## 3. Validate locally

Run:

```bash
npm run ingest
npm run validate:ts
npm run build
```

Check:

- Source appears on `/docs`
- Links render correctly
- Assets resolve
- No unexpected deletions in `content/docs`

## 4. Raise pull request

In the PR include:

- Why this source is being onboarded
- Chosen publication model (ingested, live, or redirect)
- Owner/support details
- Screenshots of `/docs` card and target route

## 5. Post-deploy checks

After deploy:

- Verify source card on dev
- Verify source route and navigation
- Verify search behavior expected for selected model
- Confirm monitoring/alerts for ingestion if applicable
