import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

export interface DocMeta {
  slug: string[];
  title: string;
  lastReviewedOn?: string;
  reviewIn?: string;
  ownerSlack?: string;
  sourceRepo?: string;
  sourcePath?: string;
  ingestedAt?: string;
  weight?: number;
}

export interface DocPage {
  meta: DocMeta;
  content: string;
}

export interface NavItem {
  title: string;
  slug: string[];
  children?: NavItem[];
  weight?: number;
}

export interface DocSource {
  slug: string;
  name: string;
  description: string;
  category: string;
  items: NavItem[];
}

/**
 * Get all doc sources (top-level folders under content/docs/)
 */
export function getDocSources(): DocSource[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
  const sources: DocSource[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const navPath = path.join(DOCS_DIR, entry.name, '_nav.json');
    const metaPath = path.join(DOCS_DIR, entry.name, '_meta.json');

    let name = entry.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    let description = '';
    let category = 'documentation';

    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      name = meta.name || name;
      description = meta.description || '';
      category = meta.category || category;
    }

    let items: NavItem[] = [];
    if (fs.existsSync(navPath)) {
      items = JSON.parse(fs.readFileSync(navPath, 'utf-8'));
    } else {
      // Auto-generate nav from file system
      items = buildNavFromDir(path.join(DOCS_DIR, entry.name), [entry.name]);
    }

    sources.push({ slug: entry.name, name, description, category, items });
  }

  return sources;
}

/**
 * Get a single doc page by slug path
 */
export function getDocPage(slugPath: string[]): DocPage | null {
  const filePath = path.join(DOCS_DIR, ...slugPath) + '.md';
  const indexPath = path.join(DOCS_DIR, ...slugPath, 'index.md');
  
  let actualPath: string | null = null;
  if (fs.existsSync(filePath)) {
    actualPath = filePath;
  } else if (fs.existsSync(indexPath)) {
    actualPath = indexPath;
  }

  if (actualPath) {
    const raw = fs.readFileSync(actualPath, 'utf-8');
    const { data, content } = matter(raw);

    return {
      meta: {
        slug: slugPath,
        title: data.title || slugPath[slugPath.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        lastReviewedOn: data.lastReviewedOn || data.last_reviewed_on,
        reviewIn: data.reviewIn || data.review_in,
        ownerSlack: data.ownerSlack || data.owner_slack,
        sourceRepo: data.sourceRepo || data.source_repo,
        sourcePath: data.sourcePath || data.source_path,
        ingestedAt: data.ingestedAt || data.ingested_at,
        weight: data.weight,
      },
      content,
    };
  }

  // Generate a synthetic landing page for directories without index.md
  const dirPath = path.join(DOCS_DIR, ...slugPath);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const title = slugPath[slugPath.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const metaPath = path.join(dirPath, '_meta.json');
    let metaTitle = title;
    let description = '';
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      metaTitle = meta.name || title;
      description = meta.description || '';
    }

    // Build list of child pages
    const children = buildNavFromDir(dirPath, slugPath);
    const childLinks = children.map((c) =>
      `- [${c.title}](/docs/${c.slug.join('/')})`
    ).join('\n');

    return {
      meta: { slug: slugPath, title: metaTitle },
      content: (description ? description + '\n\n' : '') +
        (childLinks ? '## Pages in this section\n\n' + childLinks : ''),
    };
  }

  return null;
}

/**
 * Get all doc page slugs for static generation
 */
export function getAllDocSlugs(): string[][] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const slugs: string[][] = [];
  walkDir(DOCS_DIR, [], slugs);
  return slugs;
}

function walkDir(dir: string, currentPath: string[], slugs: string[][]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue; // skip _nav.json, _meta.json

    if (entry.isDirectory()) {
      // Always register directory paths so static export generates them
      slugs.push([...currentPath, entry.name]);
      // Also register explicit /index paths to support ingested links ending in /index
      const indexPath = path.join(dir, entry.name, 'index.md');
      if (fs.existsSync(indexPath)) {
        slugs.push([...currentPath, entry.name, 'index']);
      }
      walkDir(path.join(dir, entry.name), [...currentPath, entry.name], slugs);
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      const slug = entry.name.replace(/\.md$/, '');
      slugs.push([...currentPath, slug]);
    }
  }
}

function buildNavFromDir(dir: string, basePath: string[]): NavItem[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items: NavItem[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;

    if (entry.isDirectory()) {
      const children = buildNavFromDir(path.join(dir, entry.name), [...basePath, entry.name]);
      const indexPath = path.join(dir, entry.name, 'index.md');
      let title = entry.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      let weight = 100;

      if (fs.existsSync(indexPath)) {
        const { data } = matter(fs.readFileSync(indexPath, 'utf-8'));
        title = data.title || title;
        weight = data.weight ?? 100;
      }

      items.push({ title, slug: [...basePath, entry.name], children, weight });
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      const slug = entry.name.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(dir, entry.name), 'utf-8'));
      const title = data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const weight = data.weight ?? 100;
      items.push({ title, slug: [...basePath, slug], weight });
    }
  }

  return items.sort((a, b) => (a.weight ?? 100) - (b.weight ?? 100));
}
