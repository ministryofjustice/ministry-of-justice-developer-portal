# Documentation Template Contract

Status: Draft v1  
Owner: Developer Experience  
Applies to: Generated documentation shown under `/docs`.

## Purpose

Documentation pages should help users understand:

- how to do a task
- where the content came from
- where they are in the docs tree
- how fresh the content is, when that metadata exists

## Current implementation in this repo

The Documentation section is generated content, not hand-authored route content.

Current flow:

1. `sources.json` declares external documentation sources.
2. `scripts/ingest.mjs` clones and converts those sources.
3. Generated files are written to `content/docs/<source-id>/`.
4. `lib/docs.ts` loads that output for `app/docs/page.tsx` and `app/docs/[...slug]/page.tsx`.

Because of that, `content/docs/` may not exist until `npm run ingest` has been run.

## Current metadata model

Current page-level metadata is inconsistent by source.

Common page fields:

- `title`
- optional `lastReviewedOn` or `last_reviewed_on`
- optional `reviewIn` or `review_in`
- optional `ownerSlack` or `owner_slack`
- optional `sourceRepo` or `source_repo`
- optional `sourcePath` or `source_path`
- optional `ingestedAt` or `ingested_at`
- optional `weight`

Current source-level metadata in `_meta.json` typically includes:

- `name`
- `description`
- `category`
- `source_repo`
- `ingested_at`

## Target page contract

Required sections:

1. Header: page title, plus source context on landing pages where useful
2. Navigation: breadcrumbs and source or section navigation
3. Body: rendered markdown content
4. Metadata: review and provenance details when available

Optional sections:

- summary or intro
- related pages
- source description on landing pages
- callouts and warnings
- feedback prompt

## Target standardisation goals

- use one metadata naming convention, ideally camelCase
- introduce a first-class summary field if intros should be standard
- keep source-level and page-level metadata distinct
- only add `primaryLinks[]` if docs pages need explicit actions beyond markdown links

## Content guidance

Do:

- keep the external repo as source of truth where appropriate
- preserve navigation structure
- expose provenance when available
- degrade gracefully when metadata is sparse

Do not:

- assume every page has a summary
- treat generated docs like hand-authored CMS content
- merge source metadata and page metadata into one flat contract

## MVP

The minimum useful documentation page is:

- title
- markdown body
- navigation context

Review, owner, and source metadata should appear when available, but they are not universal today.

## Operations

Useful commands:

```bash
npm run ingest
npm run ingest:dry-run
node scripts/ingest.mjs cloud-platform
npm run ingest:build
```

Adding a source:

1. Add it to `sources.json`.
2. Run `npm run ingest:dry-run`.
3. Run `npm run ingest`.
4. Confirm output under `content/docs/<source-id>/`.
5. Confirm it appears on `/docs`.
