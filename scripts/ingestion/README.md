# Ingestion

This folder contains the modular ingestion pipeline used by `scripts/ingest.mjs`.

Run `npm run ingest` to fetch configured sources and write converted docs into `content/docs/<source-id>` (and copied assets under both `content/docs/<source-id>` and `public/docs/<source-id>`). Use `npm run ingest:dry-run` to preview which files and assets would be processed without writing files.

## Optional grouped navigation from source index

Some sources maintain curated subgrouping in an index page (for example, `###` groups under a `##` section), which can be preserved during ingestion by adding `navGrouping` to that source in `sources.json`.

Example:

```json
{
  "id": "example-docs-source",
  "name": "Example Docs Source",
  "repo": "org/example-docs",
  "branch": "main",
  "docsPath": "source/documentation",
  "format": "tech-docs-template",
  "enabled": true,
  "navGrouping": {
    "enabled": true,
    "indexPath": "source/index.html.md.erb",
    "sectionSlug": "standards",
    "sectionHeading": "Standards",
    "groupHeadingLevel": 3,
    "sourceLinkPrefix": "documentation/",
    "linkPathPrefix": "standards/"
  }
}
```

Field guide:

- `indexPath`: index file in the source repo where the grouped list lives.
- `sectionSlug`: section in ingested output to group (for example `standards`).
- `sectionHeading`: heading text in the index file to scan (for example `## Standards`).
- `groupHeadingLevel`: heading level used for groups under that section (typically `3` for `###`).
- `sourceLinkPrefix`: link prefix used in source index links before the section path.
- `linkPathPrefix`: path prefix (relative to `sourceLinkPrefix`) used to match pages for this grouped section.

When enabled, ingestion writes a curated `content/docs/<source-id>/_nav.json` and generates group landing pages under `content/docs/<source-id>/<sectionSlug>/<group-slug>/index.md`.


Detailed architecture and extension guidance will be documented in the Developer Experience Documentation repository:
https://github.com/ministryofjustice/developer-experience-documentation
