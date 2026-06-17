import fs from 'fs';

import { SOURCES_FILE } from './constants.mjs';

export function parseCliArgs(args) {
  return {
    dryRun: args.includes('--dry-run'),
    targetId: args.find((a) => !a.startsWith('--')),
  };
}

export function loadSources() {
  const parsed = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'));
  return parsed.sources || [];
}