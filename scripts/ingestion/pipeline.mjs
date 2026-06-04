import fs from 'fs';

import { CLONE_DIR, CONTENT_DIR, SOURCES_FILE } from './constants.mjs';
import { parseCliArgs, loadSources } from './config.mjs';
import { ingestSource } from './ingestSource.mjs';

export async function runIngestion(args = process.argv.slice(2)) {
  const { dryRun, targetId } = parseCliArgs(args);
  const sources = loadSources();

  console.log(`\n📚 Developer Portal — Content Ingestion`);
  console.log(`   Sources file: ${SOURCES_FILE}`);
  console.log(`   Output dir:   ${CONTENT_DIR}`);
  if (dryRun) console.log('   ⚠️  DRY RUN — no files will be written\n');
  else console.log('');

  fs.mkdirSync(CLONE_DIR, { recursive: true });

  const toProcess = sources.filter(
    (s) => s.enabled && (!targetId || s.id === targetId)
  );

  if (toProcess.length === 0) {
    console.log('No matching sources found.');
    process.exit(1);
  }

  const results = [];

  for (const source of toProcess) {
    console.log(`\n─── ${source.name} (${source.id}) ───`);
    try {
      const stats = await ingestSource(source, { dryRun });
      results.push({ id: source.id, ...stats });
      console.log(`  ✅ ${stats.pages} pages ingested, ${stats.assets} assets copied`);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      results.push({ id: source.id, pages: 0, error: err.message });
    }
  }

  console.log('\n─── Summary ───');
  for (const r of results) {
    const status = r.error ? `❌ ${r.error}` : `✅ ${r.pages} pages, ${r.assets} assets`;
    console.log(`  ${r.id}: ${status}`);
  }
  console.log('');
}