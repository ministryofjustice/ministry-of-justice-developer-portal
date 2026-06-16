#!/usr/bin/env node

/** @typedef {import('./catalog-insights/shared/types.mjs').FetchOptions} FetchOptions */
/** @typedef {import('./catalog-insights/shared/types.mjs').CatalogReportOutput} CatalogReportOutput */

import path from 'path';
import { pathToFileURL } from 'url';
import {
  buildCatalogReport,
  generateCatalogInsights,
  resolveCatalogSourcesFromProducts,
} from './catalog-insights/application/index.mjs';
import { fileSystemDependency } from './catalog-insights/infrastructure/filesystem-dependency.mjs';
import {
  writePerProductCatalogReports,
  listWorkflowFiles,
} from './catalog-insights/shared/index.mjs';

const DEFAULT_API_VERSION = '2026-03-10';
const DEFAULT_USER_AGENT = 'moj-developer-portal-sbom-fetch';

/**
 * Resolves all input, output, and legacy-cleanup paths used by catalog sync.
 * @param {string} rootDir
 * @returns {{ legacySbomReportsPath: string, legacyCatalogReportPath: string, legacySbomSourcesPath: string, productsPath: string, packageJsonPath: string, workflowsDirectory: string, catalogReportsDirectory: string }}
 */
function resolvePaths(rootDir) {
  return {
    legacySbomReportsPath: path.join(rootDir, 'content', 'products', 'sbom-reports.json'),
    legacyCatalogReportPath: path.join(rootDir, 'content', 'products', 'catalog-report.json'),
    legacySbomSourcesPath: path.join(rootDir, 'content', 'products', 'sbom-sources.json'),
    productsPath: path.join(rootDir, 'content', 'products', 'products.json'),
    packageJsonPath: path.join(rootDir, 'package.json'),
    workflowsDirectory: path.join(rootDir, '.github/workflows'),
    catalogReportsDirectory: path.join(rootDir, 'content', 'products', 'catalog_reports'),
  };
}

/**
 * Main orchestration entrypoint: fetches SBOM insights, merges catalog metadata,
 * and writes per-product report files under content/products/catalog_reports.
 * @param {object} [args]
 * @param {string} [args.rootDir]
 * @param {string | undefined} [args.token]
 * @param {string} [args.apiVersion]
 * @param {string} [args.userAgent]
 * @returns {Promise<CatalogReportOutput>}
 */
export async function run({
  rootDir = process.cwd(),
  token = process.env.GITHUB_TOKEN,
  apiVersion = DEFAULT_API_VERSION,
  userAgent = DEFAULT_USER_AGENT,
} = {}) {
  const {
    legacySbomReportsPath,
    legacyCatalogReportPath,
    legacySbomSourcesPath,
    productsPath,
    packageJsonPath,
    workflowsDirectory,
    catalogReportsDirectory,
  } = resolvePaths(rootDir);

  const products = fileSystemDependency.readJsonIfExists(productsPath, []);

  const emptyOutput = {
    fetchedAt: new Date().toISOString(),
    reports: {},
  };
  let sbomReports = emptyOutput;

  if (!token) {
    console.warn('Skipping SBOM fetch: GITHUB_TOKEN is not set.');
  } else {
    const fetchOptions = {
      token,
      apiVersion,
      userAgent,
    };

    const sources = await resolveCatalogSourcesFromProducts({
      products,
      options: fetchOptions,
    });

    sbomReports = await generateCatalogInsights({
      sources,
      options: fetchOptions,
    });
  }

  fileSystemDependency.removeFileIfExists(legacySbomReportsPath);
  fileSystemDependency.removeFileIfExists(legacyCatalogReportPath);
  fileSystemDependency.removeFileIfExists(legacySbomSourcesPath);

  const packageJson = fileSystemDependency.readJsonIfExists(packageJsonPath, {});
  const workflowFiles = listWorkflowFiles(workflowsDirectory);

  const catalogReport = buildCatalogReport({
    products,
    sbomReports,
    packageJson,
    workflowFiles,
  });

  writePerProductCatalogReports({
    outputDirectory: catalogReportsDirectory,
    catalogReport,
  });

  return catalogReport;
}

const isDirectExecution =
  Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  run().catch((error) => {
    console.error('Failed to fetch catalog insights:', error);
    process.exit(1);
  });
}
