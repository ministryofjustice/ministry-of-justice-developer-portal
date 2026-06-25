// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestGithubJsonMock } = vi.hoisted(() => ({
  requestGithubJsonMock: vi.fn(),
}));

vi.mock('../../../scripts/catalog-insights/infrastructure/github-http-dependency.mjs', () => ({
  requestGithubJson: requestGithubJsonMock,
  requestGithubJsonWithHeaders: vi.fn(),
}));

import {
  buildSbomEndpoint,
  fetchLatestSuccessfulDeploymentRef,
} from '../../../scripts/catalog-insights/gateways/github-sbom-gateway.mjs';

beforeEach(() => {
  requestGithubJsonMock.mockReset();
});

describe('buildSbomEndpoint', () => {
  it('includes ref query param when provided', () => {
    const endpoint = buildSbomEndpoint({
      owner: 'ministryofjustice',
      repo: 'cloud-platform-user-guide',
      ref: 'abc123',
    });

    const url = new URL(endpoint);
    expect(url.pathname).toBe('/repos/ministryofjustice/cloud-platform-user-guide/dependency-graph/sbom');
    expect(url.searchParams.get('ref')).toBe('abc123');
  });

  it('omits ref query param when not provided', () => {
    const endpoint = buildSbomEndpoint({
      owner: 'ministryofjustice',
      repo: 'cloud-platform-user-guide',
    });

    const url = new URL(endpoint);
    expect(url.pathname).toBe('/repos/ministryofjustice/cloud-platform-user-guide/dependency-graph/sbom');
    expect(url.searchParams.get('ref')).toBeNull();
  });
});

describe('fetchLatestSuccessfulDeploymentRef', () => {
  const options = {
    token: 'token',
    apiVersion: '2026-03-10',
    userAgent: 'test-agent',
  };

  it('returns sha for the latest deployment with a successful status', async () => {
    requestGithubJsonMock
      .mockResolvedValueOnce([{ id: 101, sha: 'deadbeef', ref: 'refs/heads/main', environment: 'dev' }])
      .mockResolvedValueOnce([{ state: 'success' }]);

    const result = await fetchLatestSuccessfulDeploymentRef(
      { owner: 'ministryofjustice', repo: 'modernisation-platform' },
      { ...options, deploymentEnvironment: 'dev' },
    );

    expect(result).toEqual({
      sha: 'deadbeef',
      ref: 'refs/heads/main',
      refKind: 'branch',
      environment: 'dev',
    });
    expect(requestGithubJsonMock).toHaveBeenCalledTimes(2);

    const deploymentsUrl = new URL(requestGithubJsonMock.mock.calls[0][0].endpoint);
    expect(deploymentsUrl.pathname).toBe('/repos/ministryofjustice/modernisation-platform/deployments');
    expect(deploymentsUrl.searchParams.get('environment')).toBe('dev');

    const statusesUrl = new URL(requestGithubJsonMock.mock.calls[1][0].endpoint);
    expect(statusesUrl.pathname).toBe('/repos/ministryofjustice/modernisation-platform/deployments/101/statuses');
  });

  it('falls back to unfiltered deployments when environment-scoped call is forbidden', async () => {
    const forbidden = new Error('forbidden') as Error & { status?: number };
    forbidden.status = 403;

    requestGithubJsonMock
      .mockRejectedValueOnce(forbidden)
      .mockResolvedValueOnce([{ id: 7, sha: 'cafebabe', ref: 'refs/tags/v1.2.3' }])
      .mockResolvedValueOnce([{ state: 'success' }]);

    const result = await fetchLatestSuccessfulDeploymentRef(
      { owner: 'ministryofjustice', repo: 'cloud-platform-user-guide' },
      { ...options, deploymentEnvironment: 'prod' },
    );

    expect(result).toEqual({
      sha: 'cafebabe',
      ref: 'refs/tags/v1.2.3',
      refKind: 'tag',
      environment: undefined,
    });
    expect(requestGithubJsonMock).toHaveBeenCalledTimes(3);

    const firstUrl = new URL(requestGithubJsonMock.mock.calls[0][0].endpoint);
    const secondUrl = new URL(requestGithubJsonMock.mock.calls[1][0].endpoint);
    expect(firstUrl.searchParams.get('environment')).toBe('prod');
    expect(secondUrl.searchParams.get('environment')).toBeNull();
  });

  it('returns undefined when no successful deployment status is found', async () => {
    requestGithubJsonMock
      .mockResolvedValueOnce([{ id: 8, sha: 'a1b2c3' }])
      .mockResolvedValueOnce([{ state: 'failure' }]);

    const result = await fetchLatestSuccessfulDeploymentRef(
      { owner: 'ministryofjustice', repo: 'analytical-platform' },
      options,
    );

    expect(result).toBeUndefined();
  });
});
