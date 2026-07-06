import path from 'path';
import { fileSystemDependency } from '../infrastructure/filesystem-dependency.mjs';

/** @typedef {import('./types.mjs').CatalogReportOutput} CatalogReportOutput */

/**
 * Writes one generated catalog report file per SBOM-enabled product slug,
 * plus an index file used by the products list page.
 * @param {object} args
 * @param {string} args.outputDirectory
 * @param {CatalogReportOutput} args.catalogReport
 * @returns {void}
 */
export function writePerProductCatalogReports({ outputDirectory, catalogReport }) {
  fileSystemDependency.mkdirRecursiveSync(outputDirectory);

  const validFileNames = new Set();
  const reports = {};

  for (const [slug, report] of Object.entries(catalogReport.reports || {})) {
    const fileName = `${slug}.json`;
    validFileNames.add(fileName);
    reports[slug] = {
      status: report.status,
      generatedAt: report.generatedAt,
      packageCount: report.packageCount,
      repositoryCount: report.repositoryCount,
      completedRepositories: report.completedRepositories,
      failedRepositories: report.failedRepositories,
      pendingRepositories: report.pendingRepositories,
      sbomRefCoverage: report.sbomRefCoverage,
      error: report.error,
      reportUrl: report.reportUrl,
    };

    fileSystemDependency.writeJson(path.join(outputDirectory, fileName), {
      generatedAt: catalogReport.generatedAt,
      actions: catalogReport.actions,
      report,
    });
  }

  validFileNames.add('index.json');
  fileSystemDependency.writeJson(path.join(outputDirectory, 'index.json'), {
    generatedAt: catalogReport.generatedAt,
    repository: catalogReport.repository,
    actions: catalogReport.actions,
    reports,
  });

  for (const entry of fileSystemDependency.readdirWithFileTypesSync(outputDirectory)) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    if (validFileNames.has(entry.name)) continue;

    fileSystemDependency.unlinkSync(path.join(outputDirectory, entry.name));
  }
}
