#!/usr/bin/env node

/**
 * Self-service source registration
 *
 * Reads a repository_dispatch event payload and inserts or updates one source entry
 * in sources.json with onboardingMode=automated.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SOURCES_FILE = path.join(ROOT, 'sources.json');

const eventPath = process.argv[2];

if (!eventPath) {
  fail('Missing event payload path argument.');
}

const event = readJsonFile(eventPath, `Event payload file not found: ${eventPath}`);
const payload = event.client_payload || {};

// Normalize first so validation and persistence operate on one stable shape.
const source = normalizeSource(payload);
validateSource(source);

const current = readJsonFile(SOURCES_FILE, null, { sources: [] });

const existing = Array.isArray(current.sources) ? current.sources : [];
const existingEntry = existing.find((entry) => entry.id === source.id);
const existingOnboardingMode = existingEntry?.onboardingMode || 'manual';

// Guardrail: self-service must not overwrite manually governed entries.
if (existingOnboardingMode === 'manual') {
  fail(
    `source_id '${source.id}' is managed manually in sources.json and cannot be updated by self-service`,
  );
}

const filtered = existing.filter((entry) => entry.id !== source.id);
const updated = [...filtered, source].sort((a, b) => a.id.localeCompare(b.id));

writeJsonFileAtomic(SOURCES_FILE, { sources: updated });

process.stdout.write(source.id);

function normalizeSource(payload) {
  const id = String(payload.source_id || payload.id || '').trim();

  // Keep payload aliases so callers can use source_id/docsPath or id/docs_path.
  return {
    id,
    name: String(payload.name || id).trim(),
    description: String(payload.description || `Documentation source ${id}`).trim(),
    category: String(payload.category || 'platform').trim(),
    repo: String(payload.repo || '').trim(),
    branch: String(payload.branch || 'main').trim(),
    docsPath: String(payload.docsPath || payload.docs_path || '').trim(),
    format: String(payload.format || '').trim(),
    ...(payload.owner_slack ? { owner_slack: String(payload.owner_slack).trim() } : {}),
    onboardingMode: 'automated',
    enabled: payload.enabled !== false,
  };
}

function validateSource(source) {
  // Keep validation explicit and fail-fast so workflow logs are actionable.
  if (!source.id) {
    fail('client_payload.source_id is required for self-service onboarding.');
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id)) {
    fail('source_id must be kebab-case (lowercase letters, numbers, hyphens).');
  }

  if (!source.repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repo)) {
    fail('repo must be provided as owner/repo.');
  }

  if (!source.docsPath) {
    fail('docsPath (or docs_path) is required.');
  }

  if (!source.format) {
    fail('format is required.');
  }

  const allowedFormats = new Set(['tech-docs-template', 'markdown', 'mdx']);
  if (!allowedFormats.has(source.format)) {
    fail(`format must be one of: ${Array.from(allowedFormats).join(', ')}`);
  }
}

function fail(message) {
  console.error(`Self-service source registration failed: ${message}`);
  process.exit(1);
}

function readJsonFile(filePath, notFoundMessage, defaultValue) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      if (notFoundMessage) {
        fail(notFoundMessage);
      }
      return defaultValue;
    }
    fail(`Failed to read JSON file '${filePath}': ${err.message}`);
  }
}

function writeJsonFileAtomic(filePath, value) {
  const dir = path.dirname(filePath);
  const tempPath = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );

  // Write to a temp file in the same directory, then rename atomically.
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
  fs.renameSync(tempPath, filePath);
}
