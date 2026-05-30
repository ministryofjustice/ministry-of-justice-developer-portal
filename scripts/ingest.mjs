#!/usr/bin/env node

import { runIngestion } from './ingest-lib.mjs';

runIngestion().then(({ exitCode }) => {
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
