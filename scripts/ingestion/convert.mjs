import fs from 'fs';

import { buildFrontmatter, parseSimpleYaml } from './yaml.mjs';

export function convertFile(file, source) {
  const raw = fs.readFileSync(file.absolute, 'utf-8');
  const isTechDocs = file.relative.endsWith('.html.md.erb');

  let content = isTechDocs ? stripErb(raw) : raw;

  let frontmatter = {};
  let body = content;

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (fmMatch) {
    frontmatter = parseSimpleYaml(fmMatch[1]);
    body = fmMatch[2];
  }

  frontmatter.source_repo = source.repo;
  frontmatter.source_path = file.relative;
  frontmatter.ingested_at = new Date().toISOString();

  if (!frontmatter.owner_slack && source.owner_slack) {
    frontmatter.owner_slack = source.owner_slack;
  }

  if (isTechDocs) {
    body = convertTechDocsPatterns(body, source);
  }

  const outputFm = buildFrontmatter(frontmatter);
  const outputContent = `---\n${outputFm}---\n\n${body.trim()}\n`;

  let outputRelative = file.relative;
  if (outputRelative.endsWith('.html.md.erb')) {
    outputRelative = outputRelative.replace(/\.html\.md\.erb$/, '.md');
  }

  return { content: outputContent, outputRelative };
}

export function stripErb(content) {
  let result = content.replace(/<%=\s*[\s\S]*?%>/g, '');
  result = result.replace(/<%[\s\S]*?%>/g, '');
  result = result.replace(
    /<%=?\s*partial\s*\(\s*['"]([^'"]+)['"]\s*\)\s*%>/g,
    '\n> *Content from partial: $1*\n'
  );
  result = result.replace(/^(#{1,6})\s*$/gm, '');

  return result;
}

export function convertTechDocsPatterns(body, source) {
  const docsPath = source.docsPath ? source.docsPath.replace(/^source\//, '') : 'documentation';

  let result = body.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\/${docsPath.replace('/', '\\/')}\/([^)]+?)\\.html\\)`, 'g'),
    `[$1](/docs/${source.id}/$2)`
  );

  result = result.replace(
    /\[([^\]]+)\]\(\/([^)]+?)\.html\)/g,
    `[$1](/docs/${source.id}/$2)`
  );

  result = result.replace(
    /\[([^\]]+)\]\(([^)]+?)\.html\)/g,
    '[$1]($2)'
  );

  result = result.replace(/```erb\n/g, '```\n');

  return result;
}