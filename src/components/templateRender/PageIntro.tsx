export interface PageIntroProps {
  title: string;
  summary?: string;
  titleId?: string;
  titleClassName?: string;
  summaryClassName?: string;
}

export function PageIntro({
  title,
  summary,
  titleId,
  titleClassName = 'govuk-heading-xl govuk-!-margin-bottom-2',
  summaryClassName = 'govuk-body-l govuk-!-margin-bottom-3',
}: PageIntroProps) {
  return (
    <>
      <h1 id={titleId} className={titleClassName}>
        {title}
      </h1>
      {summary && <p className={summaryClassName}>{summary}</p>}
    </>
  );
}