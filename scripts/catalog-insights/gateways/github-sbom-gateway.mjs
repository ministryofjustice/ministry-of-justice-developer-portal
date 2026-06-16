/** @typedef {import('../shared/types.mjs').CatalogSource} CatalogSource */
/** @typedef {import('../shared/types.mjs').FetchOptions} FetchOptions */

import { requestGithubJson, requestGithubJsonWithHeaders } from '../infrastructure/github-http-dependency.mjs';

/**
 * Builds the GitHub dependency graph SBOM endpoint for a repository.
 * @param {CatalogSource} args
 * @returns {string}
 */
export function buildSbomEndpoint({ owner, repo }) {
  return `https://api.github.com/repos/${owner}/${repo}/dependency-graph/sbom`;
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
 * Fetches SBOM data from GitHub and returns both endpoint metadata and payload.
 * @param {CatalogSource} repository
 * @param {FetchOptions} options
 * @returns {Promise<{ endpoint: string, payload: object }>}
 */
export async function fetchSbomByRepository(
  { owner, repo },
  { token, apiVersion, userAgent },
) {
  const endpoint = buildSbomEndpoint({ owner, repo });
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
