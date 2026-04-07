import type { ReactNode } from 'react';

export type CalloutTone = 'info' | 'warning';

export interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}

export function Callout({ tone = 'info', title, children }: CalloutProps) {
  if (tone === 'warning') {
    return (
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-warning-text__assistive">Warning</span>
          {title ? `${title} ` : ''}
          {children}
        </strong>
      </div>
    );
  }

  return <div className="govuk-inset-text">{children}</div>;
}
