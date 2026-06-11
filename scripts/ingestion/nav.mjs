import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import { stripErb } from './parsers/techDocsParser.mjs';

function toTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function toGroupSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function uniqueSlug(base, usedSlugs) {
  if (!usedSlugs.has(base)) return base;

  let suffix = 2;
  let candidate = `${base}-${suffix}`;
  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

export function buildNavFromDir(dir, basePath) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;

    if (entry.isDirectory()) {
      const slugPath = [...basePath, entry.name];
      const indexPath = path.join(dir, entry.name, 'index.md');
      let title = toTitle(entry.name);
      let weight = 100;

      if (fs.existsSync(indexPath)) {
        const { data } = matter(fs.readFileSync(indexPath, 'utf-8'));
        title = data.title || title;
        weight = data.weight ?? 100;
      }

      const children = buildNavFromDir(path.join(dir, entry.name), slugPath);
      items.push({
        title,
        slug: slugPath,
        children: children.length > 0 ? children : undefined,
        weight,
      });
      continue;
    }

    if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      const slug = entry.name.replace(/\.md$/, '');
      const slugPath = [...basePath, slug];
      const { data } = matter(fs.readFileSync(path.join(dir, entry.name), 'utf-8'));
      const title = data.title || toTitle(slug);
      const weight = data.weight ?? 100;
      items.push({ title, slug: slugPath, weight });
    }
  }

  return items.sort((a, b) => {
    const weightDiff = (a.weight ?? 100) - (b.weight ?? 100);
    if (weightDiff !== 0) return weightDiff;
    return a.title.localeCompare(b.title);
  });
}

export function extractGroupsFromIndex(indexContent, options = {}) {
  const sectionHeading = options.sectionHeading || 'Standards';
  const groupHeadingLevel = options.groupHeadingLevel || 3;
  const sourceLinkPrefix = options.sourceLinkPrefix || 'documentation/';
  const linkPathPrefix = options.linkPathPrefix || 'standards/';

  const cleaned = stripErb(indexContent);
  const lines = cleaned.split(/\r?\n/);

  const sectionPattern = new RegExp(`^##\\s+${sectionHeading}\\s*$`, 'i');
  const sectionStart = lines.findIndex((line) => sectionPattern.test(line.trim()));
  if (sectionStart === -1) return [];

  const groups = [];
  let currentGroup = null;
  const groupHeadingPattern = new RegExp(`^#{${groupHeadingLevel}}\\s+(.+)$`);

  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (/^##\s+/.test(line)) break;

    const heading = line.match(groupHeadingPattern);
    if (heading) {
      currentGroup = { title: heading[1].trim(), pages: [] };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) continue;

    const link = line.match(/\[[^\]]+\]\(([^)]+)\)/);
    if (!link) continue;

    let url = link[1].trim().split('#')[0];
    if (/^https?:\/\//i.test(url)) continue;

    url = url.replace(/^\//, '').replace(new RegExp(`^${sourceLinkPrefix}`), '').replace(/\.html$/, '');
    if (!url.startsWith(linkPathPrefix)) continue;

    const pageSlug = url.slice(linkPathPrefix.length);
    if (!pageSlug || currentGroup.pages.includes(pageSlug)) continue;

    currentGroup.pages.push(pageSlug);
  }

  return groups.filter((group) => group.pages.length > 0);
}

export function buildGroupedChildren(sourceId, sectionSlug, sectionChildren, groups) {
  if (!sectionChildren?.length || !groups?.length) return { children: sectionChildren || [], groups: [] };

  const bySlug = new Map(
    sectionChildren.map((item) => [item.slug[item.slug.length - 1], item])
  );
  const usedPageSlugs = new Set();
  const usedGroupSlugs = new Set();
  const groupedItems = [];

  for (const group of groups) {
    const pages = [];
    for (const pageSlug of group.pages) {
      const child = bySlug.get(pageSlug);
      if (!child) continue;
      pages.push(child);
      usedPageSlugs.add(pageSlug);
    }

    if (pages.length === 0) continue;

    let groupSlug = toGroupSlug(group.title) || `${sectionSlug}-group`;
    groupSlug = uniqueSlug(groupSlug, usedGroupSlugs);
    usedGroupSlugs.add(groupSlug);

    groupedItems.push({
      title: group.title,
      slug: [sourceId, sectionSlug, groupSlug],
      children: pages,
      weight: 100,
    });
  }

  const ungroupedItems = sectionChildren.filter(
    (item) => !usedPageSlugs.has(item.slug[item.slug.length - 1])
  );

  return {
    children: [...groupedItems, ...ungroupedItems],
    groups: groupedItems,
  };
}

function buildGroupPageContent(sourceId, sectionLabel, group) {
  const links = (group.children || [])
    .map((item) => `- [${item.title}](/docs/${sourceId}/${item.slug.slice(1).join('/')})`)
    .join('\n');

  return [
    '---',
    `title: ${group.title}`,
    '---',
    '',
    `# ${group.title}`,
    '',
    `## ${sectionLabel} in this section`,
    '',
    links,
    '',
  ].join('\n');
}

function toTitleFromSlug(slug) {
  return toTitle((slug || '').replace(/\//g, ' '));
}

export function generateGroupedNav(source, repoDir, outputDir) {
  const grouping = source.navGrouping;
  if (!grouping?.enabled) return;

  const indexPath = path.join(repoDir, grouping.indexPath || 'source/index.html.md.erb');
  if (!fs.existsSync(indexPath)) return;

  const sectionSlug = grouping.sectionSlug || 'standards';
  const sectionHeading = grouping.sectionHeading || toTitleFromSlug(sectionSlug);
  const sourceLinkPrefix = grouping.sourceLinkPrefix || 'documentation/';
  const linkPathPrefix = grouping.linkPathPrefix || `${sectionSlug}/`;
  const groupHeadingLevel = grouping.groupHeadingLevel || 3;

  const groups = extractGroupsFromIndex(fs.readFileSync(indexPath, 'utf-8'), {
    sectionHeading,
    groupHeadingLevel,
    sourceLinkPrefix,
    linkPathPrefix,
  });
  if (groups.length === 0) return;

  const nav = buildNavFromDir(outputDir, [source.id]);
  const sectionItem = nav.find((item) => item.slug.join('/') === `${source.id}/${sectionSlug}`);
  if (!sectionItem || !sectionItem.children?.length) return;

  const grouped = buildGroupedChildren(source.id, sectionSlug, sectionItem.children, groups);
  if (grouped.groups.length === 0) return;

  sectionItem.children = grouped.children;

  for (const group of grouped.groups) {
    const groupDir = path.join(outputDir, ...group.slug.slice(1));
    fs.mkdirSync(groupDir, { recursive: true });
    fs.writeFileSync(
      path.join(groupDir, 'index.md'),
      buildGroupPageContent(source.id, sectionHeading, group),
      'utf-8'
    );
  }

  fs.writeFileSync(path.join(outputDir, '_nav.json'), JSON.stringify(nav, null, 2), 'utf-8');
}


