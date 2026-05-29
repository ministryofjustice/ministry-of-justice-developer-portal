# MVP Ingestion Flow

## Overview

This page describes the first iteration of the Markdown ingestion process for the developer portal.

The MVP ingestion flow is intentionally constrained. It reads from a configured source registry, fetches Markdown documentation from approved GitHub
repositories, normalises the content into the portal structure, generates or updates search indexes, and produces an ingestion outcome.

The process should fail safely. If a source cannot be processed, the ingestion workflow should report the failure and retain the last successful state rather
than publishing partial or broken content.

## Ingestion flow

![MVP ingestion flow](./diagrams/ingestion-mvp.png)

The editable diagram source is available here:

[View Mermaid source](./diagrams/ingestion-mvp.mmd)

## Flow description

### 1. Start scheduled ingestion

The ingestion process starts from a scheduled workflow.

For the MVP, this is expected to run through GitHub Actions on a fixed schedule. Daily ingestion is likely to be sufficient initially, although this can be
revisited if content freshness becomes a stronger requirement.

### 2. Read source registry

The workflow reads the source registry to determine which documentation sources should be ingested.

For the MVP, the source registry is stored in the portal repository. This keeps source configuration version-controlled and reviewable through pull requests.

The registry should include enough information to identify and process each source, such as:

- source ID;
- repository URL;
- documentation path;
- display name;
- owning team or contact;
- source type;
- ingestion configuration.

### 3. Fetch content

The workflow fetches content from each configured source repository.

For the MVP, this is limited to GitHub-hosted Markdown content. The ingestion process may use a clone, shallow fetch, or another lightweight retrieval approach,
depending on implementation needs.

The fetch step should only read configured paths. This avoids ingesting unrelated repository content and makes the ingestion behaviour easier to reason about.

### 4. Validate source configuration and Markdown

The ingestion process validates the source configuration and Markdown content before transforming it.

Validation may include checking that:

- required source configuration fields are present;
- configured documentation paths exist;
- Markdown files can be read;
- unsupported files are excluded;
- required metadata can be derived or applied;
- links and assets can be processed safely.

Validation should happen before content is written into the canonical portal structure.

### 5. Extract Markdown documents and assets

The workflow extracts Markdown documents and any referenced assets from the configured source paths.

Assets may include images or other files required by the documentation. The MVP should define which asset types are supported and where those assets are written
inside the portal structure.

### 6. Transform content

The transform step converts source documentation into the structure expected by the portal.

Typical transformation responsibilities include:

- rewriting links;
- normalising paths;
- applying frontmatter;
- adding source metadata;
- preserving or copying referenced assets;
- mapping content into the portal navigation model;
- excluding unsupported content.

This step should keep source-specific behaviour outside the portal rendering layer wherever possible.

### 7. Write to portal structure

The transformed content is written to the portal’s canonical content structure.

For the MVP, this structure can live directly in the portal repository. This keeps the implementation simple and allows generated content changes to be reviewed
through pull requests.

The portal should render from this canonical structure rather than directly from upstream source repositories.

### 8. Generate or update search indexes

Search indexes are generated or updated from the canonical portal content.

For the MVP, this may be automated as part of the build or ingestion process. Pagefind is a suitable initial option for static search, although this can be
revisited later if richer search requirements emerge.

### 9. Create ingestion report

The workflow may produce an ingestion report.

The report could summarise:

- sources processed;
- files ingested;
- files skipped;
- validation warnings;
- failures;
- generated content changes;
- search index updates.

Whether this is required for the MVP is still to be confirmed, but some level of reporting is useful for debugging and operational confidence.

### 10. Complete successful ingestion

If all required steps complete successfully, the ingestion is considered successful.

Where generated content changes are detected, the workflow should raise a pull request rather than automatically merging changes into the portal.

## Failure handling

Several ingestion steps may fail, including fetch, validation, extraction, transformation, writing to the portal structure, and search index generation.

When failures occur, the workflow should:

- stop unsafe publication;
- retain the last successful source state where possible;
- report the failure clearly;
- make the failed source and step visible;
- avoid publishing partial or broken generated content.

Failure handling is an important part of the MVP because ingestion will depend on external repositories and source content that may change independently of the
portal.

## MVP constraints

The first iteration of ingestion is constrained to keep the implementation focused.

The MVP constraints are:

- GitHub only;
- Markdown only;
- scheduled ingestion only;
- source registry stored in the portal repository;
- configured documentation paths only;
- canonical content written into the portal repository;
- static search initially;
- pull-request-based content updates;
- no automatic merge when generated content changes are present.

## Future considerations

The ingestion flow may evolve after the MVP.

Potential future improvements include:

- webhook-triggered ingestion;
- repository-owned `portal.yaml` configuration;
- richer source metadata;
- better ingestion reporting;
- support for private or internal repositories;
- support for additional source types;
- support for additional source adapters;
- permissions-aware search;
- richer validation and content quality checks.
