# Guideline Template Contract

Status: Draft v1  
Owner: Developer Experience  
Applies to: Guideline and standards pages under `/guidelines`.

## Purpose

Guideline pages should make it clear:

- what the guidance is
- when it applies
- who owns it
- how fresh it is
- whether this portal is the source of truth or a signpost

## Current implementation in this repo

Guideline metadata currently lives in `content/guidelines/guidelines.json`.

The detail route is rendered by `app/guidelines/[slug]/page.tsx`.

Today the repo splits guideline data in two ways:

- structured metadata in `guidelines.json`
- page body content inline in `app/guidelines/[slug]/page.tsx`

That means the metadata contract is fairly stable, but the body-content model is still transitional.

## Current metadata model

Current fields in `guidelines.json` are:

- `slug`
- `title`
- `phase`
- `description`
- `owner`
- `lastReviewedOn`
- `reviewIn`
- optional `externalUrl`

## Target page contract

Required sections:

1. Header: title, phase, summary, owner
2. Guidance body: the standard or expectation itself
3. Metadata: last reviewed, review cadence, review status, owner

Optional sections:

- external canonical link
- related links
- examples and anti-patterns
- decision steps
- compliance references
- feedback prompt

## Target metadata model

Required:

- `slug` (string)
- `title` (string)
- `phase` (string)
- `description` (string)
- `owner` (string)
- `lastReviewedOn` (ISO date)
- `reviewIn` (for example `6 months`)

Recommended:

- `externalUrl` (string)
- `tags` (string array)
- `pageType` (`guideline`)

## Content guidance

Do:

- explain the rule and why it exists
- make the lifecycle phase explicit
- show review metadata
- link out when another source is canonical

Do not:

- mix unrelated guidance on one page
- publish without an owner
- duplicate large external guidance without a good reason

## MVP

The minimum useful guideline page is:

- title, phase, summary, owner
- one clear guidance section
- last reviewed date and owner metadata
