import { SectionProps } from '@/types';

export function Subsection({
  heading,
  children,
  className = 'govuk-!-margin-bottom-6',
  contentClassName = 'app-prose-scope',
  id,
}: SectionProps) {
  return (
    <section className={className} aria-label={heading} id={id}>
      <h3 className="govuk-heading-s">{heading}</h3>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
