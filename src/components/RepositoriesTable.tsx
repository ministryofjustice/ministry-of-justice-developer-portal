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

function shortSha(sha?: string) {
  if (!sha) return '—';
  return sha.slice(0, 12);
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

      <table className="govuk-table govuk-!-margin-bottom-0">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col">Repository</th>
            <th className="govuk-table__header" scope="col">Repo status</th>
            <th className="govuk-table__header" scope="col">Packages</th>
            <th className="govuk-table__header" scope="col">Ecosystems</th>
            <th className="govuk-table__header" scope="col">Last deployment</th>
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
                  <td className="govuk-table__cell govuk-body-s">
                    <div><strong>SHA:</strong> {shortSha(repository.sbomRef)}</div>
                    <div><strong>Branch/Tag:</strong> {formatRef(repository.deploymentRef, repository.deploymentRefKind)}</div>
                      <div><strong>Date:</strong> {repository.deploymentDate || repository.generatedAt || '—'}</div>
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
