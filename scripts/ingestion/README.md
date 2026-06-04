# Ingestion

This folder contains the modular ingestion pipeline used by `scripts/ingest.mjs`.

Run `npm run ingest` to fetch configured sources and write converted docs into `content/docs/<source-id>` (and copied assets under both `content/docs/<source-id>` and `public/docs/<source-id>`). Use `npm run ingest:dry-run` to preview which files and assets would be processed without writing files.


Detailed architecture and extension guidance will be documented in the Developer Experience Documentation repository:
https://github.com/ministryofjustice/developer-experience-documentation
