#!/usr/bin/env node

/**
 * Ingestion Pipeline
 *
 * Clones external documentation repos, converts their content
 * (including tech-docs-template .html.md.erb files) into standard
 * Markdown, and writes it to content/docs/ for the portal build.
 *
 * Usage:
 *   node scripts/ingest.mjs                  # ingest all enabled sources
 *   node scripts/ingest.mjs cloud-platform   # ingest a single source
 *   node scripts/ingest.mjs --dry-run        # preview without writing
 */
import { runIngestion } from './ingestion/pipeline.mjs';

runIngestion(process.argv.slice(2)).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
