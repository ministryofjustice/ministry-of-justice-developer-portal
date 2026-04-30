import { StatusTag } from '@/components/templateRender/StatusTag';
import { TagRowProps } from '@/types/types';

export function TagRow({ kicker, categoryTag, status, children }: TagRowProps) {
  if (!kicker && !categoryTag && !status && !children) {
    return null;
  }

  return (
    <div
      className="govuk-!-margin-bottom-3"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
    >
      {kicker && <span className="govuk-caption-l">{kicker}</span>}
      {categoryTag && <span className="app-card__tag">{categoryTag}</span>}
      {status && <StatusTag status={status} />}
      {children}
    </div>
  );
}
