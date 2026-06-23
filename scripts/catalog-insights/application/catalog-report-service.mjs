/** @typedef {import('../shared/types.mjs').CatalogReportOutput} CatalogReportOutput */

import { buildRepositoryMetadata } from '../shared/repository-metadata.mjs';
import { hasCatalogTeam } from '../shared/index.mjs';
import { mergeCountMaps } from './sbom-summary-service.mjs';

function toOverallStatus({ repositoryCount, completedCount, failedCount }) {
  if (repositoryCount === 0) return 'pending';
  if (completedCount === repositoryCount) return 'completed';
  if (failedCount === repositoryCount) return 'failed';
  return 'partial';
}

function latestTimestamp(values) {
  const timestamps = values.filter((value) => typeof value === 'string').sort((a, b) => b.localeCompare(a));
  return timestamps[0];
}

/**
 * Merges static product metadata, repository/workflow metadata, and SBOM insights
 * into the generated report structure for SBOM-enabled products only.
 * @param {{ products: Array<object>, sbomReports: { reports?: Record<string, object> }, packageJson: object, workflowFiles: string[] }} args
 * @returns {CatalogReportOutput}
 */
export function buildCatalogReport({ products, sbomReports, packageJson, workflowFiles }) {
  const reports = Object.fromEntries(
    products.filter(hasCatalogTeam).map((product) => {
      const repositoryInsights = Array.isArray(sbomReports?.reports?.[product.slug])
        ? sbomReports.reports[product.slug]
        : [];
      const repositoryCount = repositoryInsights.length;
      const completedCount = repositoryInsights.filter((repo) => repo.status === 'completed').length;
      const failedCount = repositoryInsights.filter((repo) => repo.status === 'failed').length;
      const pendingCount = repositoryCount - completedCount - failedCount;
      const packageCount = repositoryInsights.reduce(
        (total, repo) => total + (typeof repo.packageCount === 'number' ? repo.packageCount : 0),
        0,
      );
      const generatedAt = latestTimestamp(repositoryInsights.map((repo) => repo.generatedAt));

      const ecosystems = repositoryInsights.reduce(
        (acc, repo) => (repo.ecosystems ? mergeCountMaps(acc, repo.ecosystems) : acc),
        {},
      );
      const licenses = repositoryInsights.reduce(
        (acc, repo) => (repo.licenses ? mergeCountMaps(acc, repo.licenses) : acc),
        {},
      );

      // Deduplicate packages across all repos — key by name@version, track which repos use each
      /** @type {Map<string, { name: string, version?: string, license?: string, ecosystem?: string, purpose?: string, purl?: string, supplier?: string, repos: string[] }>} */
      const packageMap = new Map();
      for (const repo of repositoryInsights) {
        if (!Array.isArray(repo.packages)) continue;
        for (const pkg of repo.packages) {
          const key = `${pkg.name}@${pkg.version ?? ''}`;
          if (packageMap.has(key)) {
            const existingPackage = packageMap.get(key);
            if (!existingPackage.repos.includes(repo.repo)) {
              existingPackage.repos.push(repo.repo);
            }
          } else {
            packageMap.set(key, { ...pkg, repos: [repo.repo] });
          }
        }
      }
      const packages = Array.from(packageMap.values());

      // Build repo-scoped package lookup for version resolution
      // Map: ecosystem:packageName → [versions]
      const packageLookup = new Map();
      for (const repo of repositoryInsights) {
        if (!Array.isArray(repo.packages)) continue;
        for (const pkg of repo.packages) {
          const pkgName = pkg?.name?.trim().toLowerCase();
          const pkgEcosystem = (pkg?.ecosystem ?? '').trim().toLowerCase();
          if (!pkgName) continue;

          const key = `${repo.repo}:${pkgEcosystem}:${pkgName}`;
          const versions = packageLookup.get(key) || new Set();
          if (pkg.version?.trim()) {
            versions.add(pkg.version.trim());
          }
          packageLookup.set(key, versions);
        }
      }

      // Aggregate vulnerability counts across all repos, enriching alerts with current version
      const vulnTotals = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
      const allAlerts = [];
      for (const repo of repositoryInsights) {
        if (!repo.vulnerabilities) continue;
        vulnTotals.critical += repo.vulnerabilities.critical || 0;
        vulnTotals.high += repo.vulnerabilities.high || 0;
        vulnTotals.medium += repo.vulnerabilities.medium || 0;
        vulnTotals.low += repo.vulnerabilities.low || 0;
        vulnTotals.total += repo.vulnerabilities.total || 0;
        if (Array.isArray(repo.vulnerabilities.alerts)) {
          for (const alert of repo.vulnerabilities.alerts) {
            const alertEcosystem = (alert?.ecosystem ?? '').trim().toLowerCase();
            const alertPackage = alert?.package?.trim().toLowerCase();
            const lookupKey = `${repo.repo}:${alertEcosystem}:${alertPackage}`;
            const versions = packageLookup.get(lookupKey);

            let currentVersion;
            let currentVersionReason;
            let observedVersions;
            let matchQuality;
            if (versions && versions.size > 0) {
              const sortedVersions = Array.from(versions).sort();
              observedVersions = sortedVersions;
              currentVersion = sortedVersions[sortedVersions.length - 1];
              matchQuality = 'inferred';
              currentVersionReason = undefined;
            } else if (!alertPackage) {
              currentVersionReason = 'no_package_name';
            } else {
              currentVersionReason = 'no_match';
            }

            allAlerts.push({
              ...alert,
              _repo: repo.repo,
              observedVersions,
              matchQuality,
              currentVersion,
              currentVersionReason,
            });
          }
        }
      }
      // Re-sort consolidated alerts critical → high → medium → low
      const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];
      allAlerts.sort((a, b) => {
        const ai = SEVERITY_ORDER.indexOf(a.severity);
        const bi = SEVERITY_ORDER.indexOf(b.severity);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const vulnerabilities = vulnTotals.total > 0
        ? { ...vulnTotals, alerts: allAlerts }
        : undefined;

      // Strip packages + vulnerabilities.alerts from per-repo entries to avoid duplication
      const repositoriesForOutput = repositoryInsights.map(({ packages: _p, vulnerabilities: repoVuln, ...rest }) => ({
        ...rest,
        vulnerabilities: repoVuln
          ? { critical: repoVuln.critical, high: repoVuln.high, medium: repoVuln.medium, low: repoVuln.low, total: repoVuln.total }
          : undefined,
      }));

      return [product.slug, {
        status: toOverallStatus({ repositoryCount, completedCount, failedCount }),
        generatedAt,
        packageCount,
        repositoryCount,
        completedRepositories: completedCount,
        failedRepositories: failedCount,
        pendingRepositories: pendingCount,
        ecosystems: Object.keys(ecosystems).length > 0 ? ecosystems : undefined,
        licenses: Object.keys(licenses).length > 0 ? licenses : undefined,
        packages: packages.length > 0 ? packages : undefined,
        vulnerabilities,
        repositories: repositoriesForOutput,
        catalog: {
          slug: product.slug,
          name: product.name,
          category: product.category,
          description: product.description,
          owner: product.owner,
          teamName: product.teamName,
          teamOrg: product.teamOrg,
          slackChannel: product.slackChannel,
          docsUrl: product.docsUrl,
          externalUrl: product.externalUrl,
          status: product.status,
          tags: product.tags,
        },
      }];
    }),
  );

  return {
    generatedAt: new Date().toISOString(),
    repository: buildRepositoryMetadata(packageJson),
    actions: {
      count: workflowFiles.length,
      files: workflowFiles,
    },
    reports,
  };
}
