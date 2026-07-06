'use client';

import { useMemo, useState } from 'react';
import { CodeScanningAlert } from '@/types/types';

type Props = {
  alerts: CodeScanningAlert[];
};

const ORDERED_SEVERITIES = ['critical', 'high', 'medium', 'low'];

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

export function CodeScanningTable({ alerts }: Props) {
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
    return alerts
      .filter((alert) => {
        const severityMatch = severityFilter === 'all' || alert.severity.toLowerCase() === severityFilter;
        const repoMatch = repoFilter === 'all' || alert._repo === repoFilter;
        return severityMatch && repoMatch;
      })
      .sort((a, b) => {
        const severityCompare = severityRank(a.severity) - severityRank(b.severity);
        if (severityCompare !== 0) return severityCompare;
        return (a.ruleName || a.ruleId || '').localeCompare(b.ruleName || b.ruleId || '');
      });
  }, [alerts, severityFilter, repoFilter]);

  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <div className="app-tabs__filters govuk-!-margin-bottom-3">
        <div className="app-tabs__filter-item">
          <label className="govuk-label govuk-label--s" htmlFor="code-scanning-severity-filter">Severity</label>
          <select
            id="code-scanning-severity-filter"
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
          <label className="govuk-label govuk-label--s" htmlFor="code-scanning-repo-filter">Repository</label>
          <select
            id="code-scanning-repo-filter"
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
        Showing <strong>{filteredAlerts.length}</strong> of <strong>{alerts.length}</strong> open alerts.
      </p>

      <div className="app-tabs__table-wrapper">
        <table className="govuk-table govuk-!-margin-bottom-0 app-tabs__table app-tabs__table--vulnerabilities">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">Severity</th>
              <th className="govuk-table__header" scope="col">Rule</th>
              <th className="govuk-table__header" scope="col">Repository</th>
              <th className="govuk-table__header" scope="col">Location</th>
              <th className="govuk-table__header" scope="col">Tool</th>
              <th className="govuk-table__header" scope="col">Alert</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => {
                const ruleLabel = alert.ruleName || alert.ruleId || '—';
                const location = alert.path
                  ? `${alert.path}${typeof alert.line === 'number' ? `:${alert.line}` : ''}`
                  : '—';

                return (
                  <tr className="govuk-table__row" key={`${alert._repo || 'repo'}-${alert.ruleId || ruleLabel}-${alert.number ?? index}`}>
                    <td className="govuk-table__cell">
                      <strong className={`govuk-tag ${severityColour(alert.severity)}`} style={{ textTransform: 'capitalize' }}>
                        {alert.severity}
                      </strong>
                    </td>
                    <td className="govuk-table__cell govuk-body-s">
                      {ruleLabel}
                      {alert.ruleType && <><br /><span className="govuk-!-colour-secondary">{alert.ruleType}</span></>}
                    </td>
                    <td className="govuk-table__cell govuk-body-s">{alert._repo || '—'}</td>
                    <td className="govuk-table__cell govuk-body-s">{location}</td>
                    <td className="govuk-table__cell govuk-body-s">{alert.tool || '—'}</td>
                    <td className="govuk-table__cell govuk-body-s">
                      {alert.htmlUrl ? (
                        <a className="govuk-link" href={alert.htmlUrl} target="_blank" rel="noreferrer">
                          View alert
                        </a>
                      ) : (
                        alert.number ? `#${alert.number}` : '—'
                      )}
                    </td>
                  </tr>
                );
              })
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
