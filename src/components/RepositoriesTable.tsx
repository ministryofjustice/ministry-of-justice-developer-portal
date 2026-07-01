'use client';

import { useMemo, useState } from 'react';
import { ProductRepositoryInsight } from '@/types/types';

type Props = {
  repositories: ProductRepositoryInsight[];
};

function toRepositoryStatus(repository: ProductRepositoryInsight) {
  if (repository.status === 'archived') return 'archived';
  if (repository.visibility === 'public') return 'public';
  if (repository.visibility === 'private') return 'private';
  if (repository.visibility === 'internal') return 'internal';
  return 'unknown';
}

function formatRef(ref?: string, refKind?: ProductRepositoryInsight['deploymentRefKind']) {
  if (!ref) return '—';
  if (refKind === 'branch') return ref.replace(/^refs\/heads\//, '');
  if (refKind === 'tag') return ref.replace(/^refs\/tags\//, '');
  return ref;
}

function formatSha(sha?: string) {
  if (!sha) return '—';
  return sha;
}

function formatDeploymentRef(repository: ProductRepositoryInsight) {
  if (repository.deploymentRef) {
    return formatRef(repository.deploymentRef, repository.deploymentRefKind);
  }
  return 'Not specified';
}

function formatDeploymentEnvironment(repository: ProductRepositoryInsight) {
  if (
    typeof repository.deploymentEnvironment === 'string'
    && repository.deploymentEnvironment.trim().length > 0
  ) {
    return repository.deploymentEnvironment;
  }
  return 'Not specified';
}

function formatDeploymentDate(value?: string) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(date);
}

export function RepositoriesTable({ repositories }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusOptions = useMemo(() => {
    return Array.from(new Set(repositories.map((repository) => toRepositoryStatus(repository)))).sort();
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    if (statusFilter === 'all') return repositories;
    return repositories.filter((repository) => toRepositoryStatus(repository) === statusFilter);
  }, [repositories, statusFilter]);

  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <div className="app-tabs__filters govuk-!-margin-bottom-3">
        <div className="app-tabs__filter-item">
          <label className="govuk-label govuk-label--s" htmlFor="repo-status-filter">Repository status</label>
          <select
            id="repo-status-filter"
            className="govuk-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="govuk-body-s govuk-!-margin-bottom-2">
        Showing <strong>{filteredRepositories.length}</strong> of <strong>{repositories.length}</strong> repositories.
      </p>

      <table className="govuk-table govuk-!-margin-bottom-0 app-repositories-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col">Repository</th>
            <th className="govuk-table__header" scope="col">Repo status</th>
            <th className="govuk-table__header" scope="col">Packages</th>
            <th className="govuk-table__header" scope="col">Ecosystems</th>
            <th className="govuk-table__header app-repositories-table__deployment-header" scope="col">Last deployment</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {filteredRepositories.length > 0 ? (
            filteredRepositories.map((repository) => {
              const repoStatus = toRepositoryStatus(repository);
              return (
                <tr className="govuk-table__row" key={`${repository.owner}/${repository.repo}`}>
                  <td className="govuk-table__cell">
                    {repository.reportUrl ? (
                      <a className="govuk-link" href={repository.reportUrl} target="_blank" rel="noreferrer">
                        {repository.repo}
                      </a>
                    ) : (
                      repository.repo
                    )}
                  </td>
                  <td className="govuk-table__cell" style={{ textTransform: 'capitalize' }}>{repoStatus}</td>
                  <td className="govuk-table__cell">
                    {typeof repository.packageCount === 'number' ? repository.packageCount : '—'}
                  </td>
                  <td className="govuk-table__cell">
                    {repository.ecosystems ? Object.keys(repository.ecosystems).join(', ') : '—'}
                  </td>
                  <td className="govuk-table__cell govuk-body-s app-repositories-table__deployment-cell">
                    <div>
                      <strong className="app-repositories-table__deployment-label">SHA:</strong>{' '}
                      <span className="app-repositories-table__sha-value">{formatSha(repository.sbomRef)}</span>
                    </div>
                    <div><strong className="app-repositories-table__deployment-label">Branch/Tag:</strong> {formatDeploymentRef(repository)}</div>
                    <div><strong className="app-repositories-table__deployment-label">Environment:</strong> {formatDeploymentEnvironment(repository)}</div>
                    <div><strong className="app-repositories-table__deployment-label">Deployment date:</strong> {formatDeploymentDate(repository.deploymentDate)}</div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="govuk-table__row">
              <td className="govuk-table__cell" colSpan={5}>No repositories match the selected status.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
