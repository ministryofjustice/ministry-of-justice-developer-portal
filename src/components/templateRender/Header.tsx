import type { ReactNode } from 'react';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { TagRow } from '@/components/templateRender/TagRow';
import type { StatusTagValue } from '@/components/templateRender/StatusTag';

export type HeaderStatus = StatusTagValue;

export interface HeaderProps {
  title: string;
  categoryTag?: string;
  owner?: string;
  status?: HeaderStatus;
  summary?: string;
  kicker?: string;
  actions?: ReactNode;
}

export function Header({
  title,
  categoryTag,
  owner,
  status,
  summary,
  kicker,
  actions,
}: HeaderProps) {
  return (
    <header aria-labelledby="template-header-title" className="govuk-!-margin-bottom-6">
      <TagRow kicker={kicker} categoryTag={categoryTag} status={status} />
      <PageIntro title={title} summary={summary} titleId="template-header-title" />

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
