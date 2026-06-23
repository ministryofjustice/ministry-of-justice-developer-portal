'use client';

import { useMemo, useState } from 'react';
import { VulnerabilityAlert } from '@/types/types';

type Props = {
  alerts: VulnerabilityAlert[];
};

const ORDERED_SEVERITIES = ['critical', 'high', 'medium', 'low'];

type GroupedAlert = {
  key: string;
  repo?: string;
  packageName?: string;
  ecosystem?: string;
  severity: string;
  currentVersion?: string;
  fixedVersions: string[];
  items: VulnerabilityAlert[];
};

function severityColour(sev: string) {
  if (sev === 'critical') return 'govuk-tag--red';
  if (sev === 'high') return 'govuk-tag--orange';
  if (sev === 'medium') return 'govuk-tag--yellow';
  return 'govuk-tag--blue';
}

function severityRank(sev: string) {
  const index = ORDERED_SEVERITIES.indexOf((sev || '').toLowerCase());
  return index === -1 ? 99 : index;
}

export function VulnerabilitiesTable({ alerts }: Props) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');

  const severityOptions = useMemo(() => {
    const inData = new Set(alerts.map((a) => (a.severity || '').toLowerCase()));
    const ordered = ORDERED_SEVERITIES.filter((s) => inData.has(s));
    const extra = Array.from(inData).filter((s) => s && !ORDERED_SEVERITIES.includes(s)).sort();
    return [...ordered, ...extra];
  }, [alerts]);

  const repoOptions = useMemo(() => {
    return Array.from(new Set(alerts.map((a) => a._repo).filter(Boolean) as string[])).sort();
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const severityMatch = severityFilter === 'all' || alert.severity.toLowerCase() === severityFilter;
      const repoMatch = repoFilter === 'all' || alert._repo === repoFilter;
      return severityMatch && repoMatch;
    });
  }, [alerts, severityFilter, repoFilter]);

  const groupedAlerts = useMemo(() => {
    const groups = new Map<string, GroupedAlert>();

    for (const alert of filteredAlerts) {
      const key = `${alert._repo || ''}:${(alert.package || '').toLowerCase()}:${(alert.ecosystem || '').toLowerCase()}`;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          key,
          repo: alert._repo,
          packageName: alert.package,
          ecosystem: alert.ecosystem,
          severity: alert.severity,
          currentVersion: alert.currentVersion,
          fixedVersions: alert.fixedIn ? [alert.fixedIn] : [],
          items: [alert],
        });
        continue;
      }

      if (severityRank(alert.severity) < severityRank(existing.severity)) {
        existing.severity = alert.severity;
      }

      if (!existing.currentVersion && alert.currentVersion) {
        existing.currentVersion = alert.currentVersion;
      }

      if (alert.fixedIn && !existing.fixedVersions.includes(alert.fixedIn)) {
        existing.fixedVersions.push(alert.fixedIn);
      }

      existing.items.push(alert);
    }

    return Array.from(groups.values()).sort((a, b) => {
      const sevCompare = severityRank(a.severity) - severityRank(b.severity);
      if (sevCompare !== 0) return sevCompare;
      return (a.packageName || '').localeCompare(b.packageName || '');
    });
  }, [filteredAlerts]);

  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <div className="app-tabs__filters govuk-!-margin-bottom-3">
        <div className="app-tabs__filter-item">
          <label className="govuk-label govuk-label--s" htmlFor="vuln-severity-filter">Severity</label>
          <select
            id="vuln-severity-filter"
            className="govuk-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All severities</option>
            {severityOptions.map((severity) => (
              <option key={severity} value={severity}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="app-tabs__filter-item">
          <label className="govuk-label govuk-label--s" htmlFor="vuln-repo-filter">Repository</label>
          <select
            id="vuln-repo-filter"
            className="govuk-select"
            value={repoFilter}
            onChange={(e) => setRepoFilter(e.target.value)}
          >
            <option value="all">All repositories</option>
            {repoOptions.map((repo) => (
              <option key={repo} value={repo}>
                {repo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="govuk-body-s govuk-!-margin-bottom-2">
        Showing <strong>{groupedAlerts.length}</strong> combined packages from <strong>{filteredAlerts.length}</strong> of <strong>{alerts.length}</strong> open alerts.
      </p>

      <div className="app-tabs__table-wrapper">
        <table className="govuk-table govuk-!-margin-bottom-0 app-tabs__table app-tabs__table--vulnerabilities">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">Severity</th>
              <th className="govuk-table__header" scope="col">Package</th>
              <th className="govuk-table__header" scope="col">Observed version</th>
              <th className="govuk-table__header" scope="col">Fixed in</th>
              <th className="govuk-table__header" scope="col">CVE / CVSS</th>
              <th className="govuk-table__header" scope="col">Repository</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {groupedAlerts.length > 0 ? (
              groupedAlerts.map((group) => (
                <tr className="govuk-table__row" key={group.key}>
                  <td className="govuk-table__cell">
                    <strong className={`govuk-tag ${severityColour(group.severity)}`} style={{ textTransform: 'capitalize' }}>
                      {group.severity}
                    </strong>
                  </td>
                  <td className="govuk-table__cell">
                    <span className="govuk-body-s">{group.packageName || '—'}</span>
                    {group.ecosystem && <><br /><span className="govuk-body-s govuk-!-colour-secondary">{group.ecosystem}</span></>}
                  </td>
                  <td className="govuk-table__cell govuk-body-s">{group.currentVersion || '—'}</td>
                  <td className="govuk-table__cell govuk-body-s">{group.fixedVersions.length > 0 ? group.fixedVersions.sort().join(', ') : 'No fix'}</td>
                  <td className="govuk-table__cell govuk-body-s">
                    {group.items.map((alert, index) => (
                      <span key={`${alert.number ?? index}-${alert.url ?? ''}`}>
                        {alert.url ? (
                          <a className="govuk-link" href={alert.url} target="_blank" rel="noreferrer">
                            {alert.cve ?? `#${alert.number}`}
                          </a>
                        ) : (alert.cve ?? '—')}
                        {alert.cvss !== undefined && <><span>{' '}CVSS {alert.cvss}</span></>}
                        {index < group.items.length - 1 ? <><br /></> : null}
                      </span>
                    ))}
                  </td>
                  <td className="govuk-table__cell govuk-body-s">{group.repo || '—'}</td>
                </tr>
              ))
            ) : (
              <tr className="govuk-table__row">
                <td className="govuk-table__cell" colSpan={6}>No alerts match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
