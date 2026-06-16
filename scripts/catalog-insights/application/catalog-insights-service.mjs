/** @typedef {import('../shared/types.mjs').CatalogSource} CatalogSource */
/** @typedef {import('../shared/types.mjs').FetchOptions} FetchOptions */
/** @typedef {import('../shared/types.mjs').InsightsOutput} InsightsOutput */
/** @typedef {import('../shared/types.mjs').RepositoryInsight} RepositoryInsight */

import {
  fetchSbomByRepository,
  fetchVulnerabilityAlerts,
  fetchTeamRepositories,
  toFailureSummary,
  toSbomSummary,
  extractEcosystems,
  extractLicenses,
  extractTopPackages,
  normaliseVulnerabilityAlerts,
} from './application-dependencies.mjs';
import { hasCatalogTeam, resolveCatalogTeam } from '../shared/index.mjs';

/**
 * Resolves all repository sources for team-enabled products.
 * @param {{ products: Array<object>, options: FetchOptions }} args
 * @returns {Promise<Array<CatalogSource>>}
 */
export async function resolveCatalogSourcesFromProducts({ products, options }) {
  if (!Array.isArray(products)) return [];

  const sources = [];

  for (const product of products) {
    if (typeof product?.slug !== 'string' || product.slug.trim().length === 0) continue;
    if (!hasCatalogTeam(product)) continue;

    const locator = resolveCatalogTeam(product);
    if (!locator) continue;

    const repositories = await fetchTeamRepositories(
      { org: locator.org, teamSlug: locator.teamSlug },
      options,
    );

    for (const repository of repositories) {
      sources.push({
        productSlug: product.slug,
        owner: repository.owner,
        repo: repository.repo,
      });
    }
  }

  return sources;
}

/**
 * Fetches and normalizes SBOM insights for a single configured source.
 * @param {CatalogSource} source
 * @param {FetchOptions} options
 * @returns {Promise<RepositoryInsight>}
 */
export async function buildCatalogInsightForSource(source, options) {
  const { endpoint, payload } = await fetchSbomByRepository(
    { owner: source.owner, repo: source.repo },
    options,
  );
  const rawAlerts = await fetchVulnerabilityAlerts(
    { owner: source.owner, repo: source.repo },
    options,
  );

  const summary = toSbomSummary(payload, endpoint);
  const ecosystems = extractEcosystems(summary.sbom);
  const licenses = extractLicenses(summary.sbom);
  const packages = extractTopPackages(summary.sbom);
  const vulnerabilities = rawAlerts.length > 0 ? normaliseVulnerabilityAlerts(rawAlerts) : undefined;

  return {
    owner: source.owner,
    repo: source.repo,
    status: summary.status,
    generatedAt: summary.generatedAt,
    packageCount: summary.packageCount,
    reportUrl: summary.reportUrl,
    ecosystems: Object.keys(ecosystems).length > 0 ? ecosystems : undefined,
    licenses: Object.keys(licenses).length > 0 ? licenses : undefined,
    packages: packages.length > 0 ? packages : undefined,
    vulnerabilities,
    error: undefined,
  };
}

/**
 * Builds the per-slug SBOM insights map for all configured sources.
 * @param {{ sources: Array<CatalogSource>, options: FetchOptions }} args
 * @returns {Promise<InsightsOutput>}
 */
export async function generateCatalogInsights({ sources, options }) {
  const output = {
    fetchedAt: new Date().toISOString(),
    reports: {},
  };

  for (const source of sources) {
    try {
      const summary = await buildCatalogInsightForSource(source, options);
      if (!Array.isArray(output.reports[source.productSlug])) {
        output.reports[source.productSlug] = [];
      }
      output.reports[source.productSlug].push(summary);
    } catch (error) {
      const failure = toFailureSummary(error);
      if (!Array.isArray(output.reports[source.productSlug])) {
        output.reports[source.productSlug] = [];
      }
      output.reports[source.productSlug].push({
        owner: source.owner,
        repo: source.repo,
        status: failure.status,
        generatedAt: undefined,
        packageCount: undefined,
        reportUrl: undefined,
        error: failure.error,
      });
    }
  }

  for (const value of Object.values(output.reports)) {
    value.sort((a, b) => `${a.owner}/${a.repo}`.localeCompare(`${b.owner}/${b.repo}`));
  }

  return output;
}
