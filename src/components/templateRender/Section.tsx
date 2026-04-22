import type { ReactNode } from 'react';

export interface SectionProps {
  heading: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Section({
  heading,
  children,
  className = 'govuk-!-margin-bottom-6',
  contentClassName = 'app-prose-scope',
}: SectionProps) {
  return (
    <section className={className} aria-label={heading}>
      <h2 className="govuk-heading-m">{heading}</h2>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
