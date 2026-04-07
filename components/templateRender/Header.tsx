import type { ReactNode } from 'react';

export type HeaderStatus = 'live' | 'beta' | 'alpha' | 'deprecated';

export interface HeaderProps {
  title: string;
  categoryTag?: string;
  owner?: string;
  status?: HeaderStatus;
  summary?: string;
  kicker?: string;
  actions?: ReactNode;
}

const statusConfig: Record<HeaderStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'govuk-tag govuk-tag--green' },
  beta: { label: 'Beta', className: 'govuk-tag govuk-tag--blue' },
  alpha: { label: 'Alpha', className: 'govuk-tag govuk-tag--yellow' },
  deprecated: { label: 'Deprecated', className: 'govuk-tag govuk-tag--red' },
};

export function Header({
  title,
  categoryTag,
  owner,
  status,
  summary,
  kicker,
  actions,
}: HeaderProps) {
  const statusMeta = status ? statusConfig[status] : null;

  return (
    <header aria-labelledby="template-header-title" className="govuk-!-margin-bottom-6">
      <div className="govuk-!-margin-bottom-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {kicker && <span className="govuk-caption-l">{kicker}</span>}
        {categoryTag && <span className="app-card__tag">{categoryTag}</span>}
        {statusMeta && <strong className={statusMeta.className}>{statusMeta.label}</strong>}
      </div>

      <h1 id="template-header-title" className="govuk-heading-xl govuk-!-margin-bottom-2">
        {title}
      </h1>

      {summary && <p className="govuk-body-l govuk-!-margin-bottom-3">{summary}</p>}

      {(owner || actions) && (
        <div
          className="govuk-!-margin-bottom-3"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem 1.25rem',
          }}
        >
          {owner && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              <strong>Owner:</strong> {owner}
            </p>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
    </header>
  );
}
