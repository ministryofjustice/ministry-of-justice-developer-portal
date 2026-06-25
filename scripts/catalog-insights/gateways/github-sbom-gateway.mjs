/** @typedef {import('../shared/types.mjs').FetchOptions} FetchOptions */

import { requestGithubJson, requestGithubJsonWithHeaders } from '../infrastructure/github-http-dependency.mjs';

/**
 * Builds the GitHub dependency graph SBOM endpoint for a repository.
 * @param {{ owner: string, repo: string, ref?: string }} args
 * @returns {string}
 */
export function buildSbomEndpoint({ owner, repo, ref }) {
  const endpoint = new URL(`https://api.github.com/repos/${owner}/${repo}/dependency-graph/sbom`);
  if (typeof ref === 'string' && ref.trim().length > 0) {
    endpoint.searchParams.set('ref', ref.trim());
  }
  return endpoint.toString();
}

/**
 * Builds the endpoint used to list repositories for an organization team.
 * @param {{ org: string, teamSlug: string, page: number }} args
 * @returns {string}
 */
export function buildTeamRepositoriesEndpoint({ org, teamSlug, page }) {
  return `https://api.github.com/orgs/${org}/teams/${teamSlug}/repos?per_page=100&page=${page}`;
}

/**
 * Builds the endpoint used to list deployments for a repository.
 * @param {{ owner: string, repo: string, environment?: string }} args
 * @returns {string}
 */
export function buildDeploymentsEndpoint({ owner, repo, environment }) {
  const endpoint = new URL(`https://api.github.com/repos/${owner}/${repo}/deployments`);
  endpoint.searchParams.set('per_page', '20');
  if (typeof environment === 'string' && environment.trim().length > 0) {
    endpoint.searchParams.set('environment', environment.trim());
  }
  return endpoint.toString();
}

/**
 * Builds the endpoint used to list statuses for a deployment.
 * @param {{ owner: string, repo: string, deploymentId: number }} args
 * @returns {string}
 */
export function buildDeploymentStatusesEndpoint({ owner, repo, deploymentId }) {
  return `https://api.github.com/repos/${owner}/${repo}/deployments/${deploymentId}/statuses?per_page=1`;
}

/**
 * Fetches SBOM data from GitHub and returns both endpoint metadata and payload.
 * @param {{ owner: string, repo: string, ref?: string }} repository
 * @param {FetchOptions} options
 * @returns {Promise<{ endpoint: string, payload: object }>}
 */
export async function fetchSbomByRepository(
  { owner, repo, ref },
  { token, apiVersion, userAgent },
) {
  const endpoint = buildSbomEndpoint({ owner, repo, ref });
  const payload = await requestGithubJson({
    endpoint,
    token,
    apiVersion,
    userAgent,
  });

  return {
    endpoint,
    payload,
  };
}

/**
 * Builds the Dependabot alerts endpoint for a repository.
 * @param {{ owner: string, repo: string, after?: string }} args
 * @returns {string}
 */
export function buildDependabotAlertsEndpoint({ owner, repo, after }) {
  const searchParams = new URLSearchParams({
    state: 'open',
    per_page: '100',
  });
  if (after) searchParams.set('after', after);
  return `https://api.github.com/repos/${owner}/${repo}/dependabot/alerts?${searchParams.toString()}`;
}

/**
 * Builds the Code Scanning alerts endpoint for a repository.
 * @param {{ owner: string, repo: string, page: number }} args
 * @returns {string}
 */
export function buildCodeScanningAlertsEndpoint({ owner, repo, page }) {
  const searchParams = new URLSearchParams({
    state: 'open',
    per_page: '100',
    page: String(page),
  });
  return `https://api.github.com/repos/${owner}/${repo}/code-scanning/alerts?${searchParams.toString()}`;
}

function extractNextAfterCursor(linkHeader) {
  if (typeof linkHeader !== 'string' || linkHeader.length === 0) return undefined;

  const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/i);
  if (!nextMatch) return undefined;

  try {
    const nextUrl = new URL(nextMatch[1]);
    return nextUrl.searchParams.get('after') || undefined;
  } catch {
    return undefined;
  }
}

function extractNextPageNumber(linkHeader) {
  if (typeof linkHeader !== 'string' || linkHeader.length === 0) return undefined;

  const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/i);
  if (!nextMatch) return undefined;

  try {
    const nextUrl = new URL(nextMatch[1]);
    const value = nextUrl.searchParams.get('page');
    if (!value) return undefined;
    const page = Number.parseInt(value, 10);
    return Number.isFinite(page) ? page : undefined;
  } catch {
    return undefined;
  }
}

function inferDeploymentRefKind(ref) {
  if (typeof ref !== 'string' || ref.trim().length === 0) return 'unknown';
  const value = ref.trim();

  if (/^[a-f0-9]{40}$/i.test(value)) return 'sha';
  if (value.startsWith('refs/heads/')) return 'branch';
  if (value.startsWith('refs/tags/')) return 'tag';
  return 'unknown';
}

/**
 * Fetches all open Dependabot alerts for a repository.
 * Returns an empty array when the repo has no alerts or the token lacks `security_events` scope.
 * @param {{ owner: string, repo: string }} repository
 * @param {import('../shared/types.mjs').FetchOptions} options
 * @returns {Promise<Array<object>>}
 */
export async function fetchVulnerabilityAlerts({ owner, repo }, options) {
  const alerts = [];
  let after;
  const stableApiVersion = '2022-11-28';

  while (true) {
    const endpoint = buildDependabotAlertsEndpoint({ owner, repo, after });
    let response;
    try {
      response = await requestGithubJsonWithHeaders({
        endpoint,
        token: options.token,
        apiVersion: options.apiVersion,
        userAgent: options.userAgent,
      });
    } catch (error) {
      // Dependabot alerts are still reliably served on the stable REST version.
      try {
        response = await requestGithubJsonWithHeaders({
          endpoint,
          token: options.token,
          apiVersion: stableApiVersion,
          userAgent: options.userAgent,
        });
      } catch (fallbackError) {
        const finalError = fallbackError ?? error;
        const status = typeof finalError?.status === 'number' ? finalError.status : 'unknown';
        const message = finalError instanceof Error ? finalError.message : 'Unknown error';
        console.warn(
          `Skipping Dependabot alerts for ${owner}/${repo}: HTTP ${status} ${message}`,
        );
        // 403 = token lacks permissions; 404 = repo has no alerts access / Dependabot disabled.
        break;
      }
    }

    const { payload, headers } = response;

    if (!Array.isArray(payload) || payload.length === 0) break;
    alerts.push(...payload);
    const nextAfter = extractNextAfterCursor(headers.get('link'));
    if (!nextAfter) break;
    after = nextAfter;
  }

  return alerts;
}

/**
 * Fetches all open code scanning alerts for a repository.
 * Returns an empty array when the repo has no alerts or the token lacks permissions.
 * @param {{ owner: string, repo: string }} repository
 * @param {FetchOptions} options
 * @returns {Promise<Array<object>>}
 */
export async function fetchCodeScanningAlerts({ owner, repo }, options) {
  const alerts = [];
  let page = 1;

  while (true) {
    const endpoint = buildCodeScanningAlertsEndpoint({ owner, repo, page });
    let response;
    try {
      response = await requestGithubJsonWithHeaders({
        endpoint,
        token: options.token,
        apiVersion: options.apiVersion,
        userAgent: options.userAgent,
      });
    } catch (error) {
      const status = typeof error?.status === 'number' ? error.status : 'unknown';
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        `Skipping code scanning alerts for ${owner}/${repo}: HTTP ${status} ${message}`,
      );
      // 403 = token lacks permissions; 404 = code scanning not enabled or inaccessible.
      break;
    }

    const { payload, headers } = response;
    if (!Array.isArray(payload) || payload.length === 0) break;
    alerts.push(...payload);

    const nextPage = extractNextPageNumber(headers.get('link'));
    if (!nextPage) break;
    page = nextPage;
  }

  return alerts;
}

/**
 * Returns the latest successful deployment commit SHA for a repository when visible to the token.
 * Falls back silently when deployments are unavailable or inaccessible.
 * @param {{ owner: string, repo: string }} repository
 * @param {FetchOptions} options
 * @returns {Promise<{ sha: string, ref?: string, refKind: 'sha' | 'branch' | 'tag' | 'unknown', environment?: string } | undefined>}
 */
export async function fetchLatestSuccessfulDeploymentRef({ owner, repo }, options) {
  const environmentsToTry = [];

  if (typeof options?.deploymentEnvironment === 'string' && options.deploymentEnvironment.trim().length > 0) {
    environmentsToTry.push(options.deploymentEnvironment.trim());
  }
  environmentsToTry.push(undefined);

  for (const environment of environmentsToTry) {
    let deployments;
    try {
      deployments = await requestGithubJson({
        endpoint: buildDeploymentsEndpoint({ owner, repo, environment }),
        token: options.token,
        apiVersion: options.apiVersion,
        userAgent: options.userAgent,
      });
    } catch (error) {
      const status = typeof error?.status === 'number' ? error.status : undefined;
      if (status === 403 || status === 404) {
        continue;
      }
      throw error;
    }

    if (!Array.isArray(deployments) || deployments.length === 0) {
      continue;
    }

    for (const deployment of deployments) {
      const deploymentId = deployment?.id;
      const sha = deployment?.sha;
      if (typeof deploymentId !== 'number' || typeof sha !== 'string' || sha.trim().length === 0) {
        continue;
      }

      try {
        const statuses = await requestGithubJson({
          endpoint: buildDeploymentStatusesEndpoint({ owner, repo, deploymentId }),
          token: options.token,
          apiVersion: options.apiVersion,
          userAgent: options.userAgent,
        });

        if (!Array.isArray(statuses) || statuses.length === 0) {
          continue;
        }

        const latestStatus = statuses[0];
        if (latestStatus?.state === 'success') {
          const deploymentRef =
            typeof deployment?.ref === 'string' && deployment.ref.trim().length > 0
              ? deployment.ref.trim()
              : undefined;

          return {
            sha: sha.trim(),
            ref: deploymentRef,
            refKind: inferDeploymentRefKind(deploymentRef),
            environment:
              typeof deployment?.environment === 'string' && deployment.environment.trim().length > 0
                ? deployment.environment.trim()
                : undefined,
          };
        }
      } catch {
        continue;
      }
    }
  }

  return undefined;
}

/**
 * Fetches all repositories visible to a GitHub team.
 * @param {{ org: string, teamSlug: string }} team
 * @param {FetchOptions} options
 * @returns {Promise<Array<{ owner: string, repo: string }>>}
 */
export async function fetchTeamRepositories({ org, teamSlug }, options) {
  const repositories = [];
  let page = 1;

  while (true) {
    const endpoint = buildTeamRepositoriesEndpoint({ org, teamSlug, page });
    const payload = await requestGithubJson({
      endpoint,
      token: options.token,
      apiVersion: options.apiVersion,
      userAgent: options.userAgent,
    });

    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    for (const repo of payload) {
      const owner = repo?.owner?.login;
      const name = repo?.name;
      if (typeof owner !== 'string' || typeof name !== 'string') continue;

      repositories.push({ owner, repo: name });
    }

    if (payload.length < 100) {
      break;
    }

    page += 1;
  }

  return repositories;
}
