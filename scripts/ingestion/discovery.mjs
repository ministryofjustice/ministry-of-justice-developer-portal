import fs from 'fs';
import path from 'path';

export function discoverFiles(docsRoot, format) {
  const files = [];
  walkForFiles(docsRoot, docsRoot, files, format);
  return files;
}

function walkForFiles(dir, root, files, format) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    if (entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
      walkForFiles(fullPath, root, files, format);
    } else if (isDocFile(entry.name, format)) {
      files.push({
        absolute: fullPath,
        relative: path.relative(root, fullPath),
      });
    }
  }
}

function isDocFile(name, format) {
  if (format === 'tech-docs-template') {
    return name.endsWith('.html.md.erb') || name.endsWith('.md');
  }
  return name.endsWith('.md') || name.endsWith('.mdx');
}