/** @typedef {import('../shared/types.mjs').CatalogSource} CatalogSource */
/** @typedef {import('../shared/types.mjs').FetchOptions} FetchOptions */
/** @typedef {import('../shared/types.mjs').InsightsOutput} InsightsOutput */
/** @typedef {import('../shared/types.mjs').RepositoryInsight} RepositoryInsight */

import {
  fetchSbomByRepository,
  fetchVulnerabilityAlerts,
  fetchCodeScanningAlerts,
  fetchLatestSuccessfulDeploymentRef,
  fetchRepositoryMetadata,
  fetchTeamRepositories,
  toFailureSummary,
  toSbomSummary,
  extractEcosystems,
  extractLicenses,
  extractTopPackages,
  normaliseVulnerabilityAlerts,
  normaliseCodeScanningAlerts,
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
  const defaultDeploymentEnvironment =
    typeof options?.deploymentEnvironment === 'string' && options.deploymentEnvironment.trim().length > 0
      ? options.deploymentEnvironment.trim().toLowerCase()
      : 'prod';

  const normaliseDeploymentEnvironment = (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) return undefined;
    const normalised = value.trim().toLowerCase();
    return normalised === 'none' ? undefined : normalised;
  };

  for (const product of products) {
    if (typeof product?.slug !== 'string' || product.slug.trim().length === 0) continue;
    if (!hasCatalogTeam(product)) continue;

    const locator = resolveCatalogTeam(product);
    if (!locator) continue;

    const repositories = await fetchTeamRepositories(
      { org: locator.org, teamSlug: locator.teamSlug },
      options,
    );

    const hasExplicitNoneOverride =
      (typeof product?.catalogDeploymentEnvironment === 'string'
        && product.catalogDeploymentEnvironment.trim().toLowerCase() === 'none')
      || (typeof product?.deploymentEnvironment === 'string'
        && product.deploymentEnvironment.trim().toLowerCase() === 'none');

    const configuredDeploymentEnvironment =
      normaliseDeploymentEnvironment(product?.catalogDeploymentEnvironment)
      ?? normaliseDeploymentEnvironment(product?.deploymentEnvironment);

    for (const repository of repositories) {
      sources.push({
        productSlug: product.slug,
        owner: repository.owner,
        repo: repository.repo,
        visibility: repository.visibility,
        deploymentEnvironment:
          hasExplicitNoneOverride
            ? undefined
            : configuredDeploymentEnvironment !== undefined
            ? configuredDeploymentEnvironment
            : defaultDeploymentEnvironment,
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
  const sourceOptions = {
    ...options,
    deploymentEnvironment:
      typeof source?.deploymentEnvironment === 'string' && source.deploymentEnvironment.trim().length > 0
        ? source.deploymentEnvironment
        : (
          typeof options?.deploymentEnvironment === 'string' && options.deploymentEnvironment.trim().length > 0
            ? options.deploymentEnvironment
            : 'prod'
        ),
  };

  const deploymentRef = await fetchLatestSuccessfulDeploymentRef(
    { owner: source.owner, repo: source.repo },
    sourceOptions,
  );
  const sbomRef = deploymentRef?.sha;

  const { endpoint, payload } = await fetchSbomByRepository(
    { owner: source.owner, repo: source.repo, ref: sbomRef },
    options,
  );
  const rawAlerts = await fetchVulnerabilityAlerts(
    { owner: source.owner, repo: source.repo },
    options,
  );
  const rawCodeScanningAlerts = await fetchCodeScanningAlerts(
    { owner: source.owner, repo: source.repo },
    options,
  );

  const summary = toSbomSummary(payload, endpoint);
  const ecosystems = extractEcosystems(summary.sbom);
  const licenses = extractLicenses(summary.sbom);
  const packages = extractTopPackages(summary.sbom);
  const vulnerabilities = rawAlerts.length > 0 ? normaliseVulnerabilityAlerts(rawAlerts) : undefined;
  const codeScanning = rawCodeScanningAlerts.length > 0
    ? normaliseCodeScanningAlerts(rawCodeScanningAlerts)
    : undefined;

  return {
    owner: source.owner,
    repo: source.repo,
    status: summary.status,
    visibility: source.visibility,
    sbomRef,
    sbomRefType: sbomRef ? 'deployment_sha' : 'default_branch',
    deploymentRef: deploymentRef?.ref,
    deploymentRefKind: deploymentRef?.refKind,
    deploymentEnvironment: deploymentRef?.environment,
    deploymentDate: deploymentRef?.deployedAt,
    generatedAt: summary.generatedAt,
    packageCount: summary.packageCount,
    reportUrl: summary.reportUrl,
    ecosystems: Object.keys(ecosystems).length > 0 ? ecosystems : undefined,
    licenses: Object.keys(licenses).length > 0 ? licenses : undefined,
    packages: packages.length > 0 ? packages : undefined,
    vulnerabilities,
    codeScanning,
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
      let status = failure.status;
      let errorMessage = failure.error;

      try {
        const repoMetadata = await fetchRepositoryMetadata(
          { owner: source.owner, repo: source.repo },
          options,
        );
        if (repoMetadata.archived) {
          status = 'archived';
          errorMessage = undefined;
        }
      } catch {
        // Silently ignore metadata fetch errors, use original error status
      }

      if (!Array.isArray(output.reports[source.productSlug])) {
        output.reports[source.productSlug] = [];
      }
      output.reports[source.productSlug].push({
        owner: source.owner,
        repo: source.repo,
        status,
        visibility: source.visibility,
        sbomRef: undefined,
        sbomRefType: undefined,
        deploymentRef: undefined,
        deploymentRefKind: undefined,
        deploymentEnvironment: undefined,
        deploymentDate: undefined,
        generatedAt: undefined,
        packageCount: undefined,
        reportUrl: undefined,
        codeScanning: undefined,
        error: errorMessage,
      });
    }
  }

  for (const value of Object.values(output.reports)) {
    value.sort((a, b) => `${a.owner}/${a.repo}`.localeCompare(`${b.owner}/${b.repo}`));
  }

  return output;
}
