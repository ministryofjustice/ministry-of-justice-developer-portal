import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function copyDirContents(sourceDir, destinationDir) {
  mkdirSync(destinationDir, { recursive: true });
  cpSync(sourceDir, destinationDir, { recursive: true });
}

function resolveFromRoot(...parts) {
  return path.resolve(rootDir, ...parts);
}

function main() {
  const targets = [
    {
      source: resolveFromRoot('node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets', 'fonts'),
      destination: resolveFromRoot('public', 'assets', 'fonts'),
      label: 'GOV.UK fonts',
    },
    {
      source: resolveFromRoot('node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets', 'images'),
      destination: resolveFromRoot('public', 'assets', 'images'),
      label: 'GOV.UK images',
    },
    {
      source: resolveFromRoot('node_modules', '@ministryofjustice', 'frontend', 'moj', 'assets', 'images'),
      destination: resolveFromRoot('public', 'assets', 'images'),
      label: 'MOJ images',
    },
  ];

  for (const target of targets) {
    copyDirContents(target.source, target.destination);
    console.log(`Synced ${target.label}`);
  }
}

main();
