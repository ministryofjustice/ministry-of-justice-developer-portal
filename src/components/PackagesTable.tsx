'use client';

import { useMemo, useState } from 'react';
import { SbomPackageLite } from '@/types/types';

type Props = {
  packages: SbomPackageLite[];
};

export function PackagesTable({ packages }: Props) {
  const [ecosystemFilter, setEcosystemFilter] = useState<string>('all');

  const ecosystemOptions = useMemo(() => {
    return Array.from(
      new Set(
        packages
          .map((pkg) => (pkg.ecosystem || 'unknown').toLowerCase())
          .filter((value) => value.trim().length > 0),
      ),
    ).sort();
  }, [packages]);

  const filteredPackages = useMemo(() => {
    if (ecosystemFilter === 'all') return packages;
    return packages.filter((pkg) => (pkg.ecosystem || 'unknown').toLowerCase() === ecosystemFilter);
  }, [packages, ecosystemFilter]);

  return (
    <div>
      <div className="app-tabs__filters govuk-!-margin-bottom-3">
        <div className="app-tabs__filter-item">
          <label className="govuk-label govuk-label--s" htmlFor="package-ecosystem-filter">Ecosystem</label>
          <select
            id="package-ecosystem-filter"
            className="govuk-select"
            value={ecosystemFilter}
            onChange={(e) => setEcosystemFilter(e.target.value)}
          >
            <option value="all">All ecosystems</option>
            {ecosystemOptions.map((ecosystem) => (
              <option key={ecosystem} value={ecosystem}>
                {ecosystem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="govuk-body-s govuk-!-margin-bottom-2">
        Showing <strong>{filteredPackages.length}</strong> of <strong>{packages.length}</strong> packages.
      </p>

      <div className="app-tabs__table-wrapper">
        <table className="govuk-table govuk-!-margin-bottom-0 app-tabs__table app-tabs__table--packages">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">Package</th>
              <th className="govuk-table__header" scope="col">Details</th>
              <th className="govuk-table__header" scope="col">Repositories</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg, i) => (
                <tr className="govuk-table__row" key={`${pkg.name}@${pkg.version ?? ''}-${i}`}>
                  <td className="govuk-table__cell app-tabs__package-name-cell">
                    {pkg.purl ? (
                      <a className="govuk-link app-tabs__package-name" href={`https://deps.dev/${pkg.purl}`} target="_blank" rel="noreferrer">
                        {pkg.name}
                      </a>
                    ) : (
                      <span className="app-tabs__package-name">{pkg.name}</span>
                    )}
                    <div className="govuk-body-s govuk-!-colour-secondary govuk-!-margin-top-1">
                      {pkg.version || 'Version not available'}
                    </div>
                  </td>
                  <td className="govuk-table__cell">
                    <dl className="app-tabs__meta-list">
                      <div>
                        <dt>Ecosystem</dt>
                        <dd>{pkg.ecosystem || '—'}</dd>
                      </div>
                      <div>
                        <dt>License</dt>
                        <dd>{pkg.license || '—'}</dd>
                      </div>
                      {pkg.purpose?.trim() && (
                        <div>
                          <dt>Purpose</dt>
                          <dd>{pkg.purpose}</dd>
                        </div>
                      )}
                      {pkg.supplier?.trim() && (
                        <div>
                          <dt>Supplier</dt>
                          <dd>{pkg.supplier}</dd>
                        </div>
                      )}
                    </dl>
                  </td>
                  <td className="govuk-table__cell app-tabs__repos-cell">
                    {pkg.repos.length === 1
                      ? <span className="govuk-body-s">{pkg.repos[0]}</span>
                      : (
                        <details className="app-tabs__details">
                          <summary className="govuk-body-s">{pkg.repos.length} repositories</summary>
                          <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                            {pkg.repos.map((r, repoIndex) => <li key={`${r}-${repoIndex}`}><span className="govuk-body-s">{r}</span></li>)}
                          </ul>
                        </details>
                      )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="govuk-table__row">
                <td className="govuk-table__cell" colSpan={3}>No packages match the selected ecosystem.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
