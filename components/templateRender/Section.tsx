import type { ReactNode } from 'react';

export interface SectionProps {
  heading: string;
  children: ReactNode;
}

export function Section({ heading, children }: SectionProps) {
  return (
    <section className="govuk-!-margin-bottom-6" aria-label={heading}>
      <h2 className="govuk-heading-m">{heading}</h2>
      <div className="app-prose-scope">{children}</div>
    </section>
  );
}
