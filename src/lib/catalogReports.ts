import fs from 'fs/promises';
import path from 'path';
import { CatalogReportEntry, CatalogReportFile } from '@/types/types';

const catalogReportsDirectory = path.join(process.cwd(), 'content', 'products', 'catalog_reports');

/**
 * Loads all generated catalog report files and returns entries by slug.
 * Returns an empty object when the generated directory is missing or unreadable.
 */
export async function loadCatalogReportEntriesBySlug(): Promise<Record<string, CatalogReportEntry>> {
  try {
    const entries = await fs.readdir(catalogReportsDirectory, { withFileTypes: true });
    const reportsBySlug: Record<string, CatalogReportEntry> = {};

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

      const filePath = path.join(catalogReportsDirectory, entry.name);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content) as CatalogReportFile;

      if (!parsed.report?.catalog?.slug) continue;
      reportsBySlug[parsed.report.catalog.slug] = parsed.report;
    }

    return reportsBySlug;
  } catch {
    return {};
  }
}

/**
 * Loads the generated catalog report file for a single product slug.
 * Returns undefined when that slug has no generated report file.
 */
export async function loadCatalogReportEntryBySlug(
  slug: string,
): Promise<CatalogReportFile | undefined> {
  try {
    const filePath = path.join(catalogReportsDirectory, `${slug}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as CatalogReportFile;
  } catch {
    return undefined;
  }
}
