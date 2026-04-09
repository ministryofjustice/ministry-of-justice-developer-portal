export interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <>
      {tags.map((tag) => (
        <strong key={tag} className="govuk-tag govuk-tag--grey govuk-!-margin-right-1">
          {tag}
        </strong>
      ))}
    </>
  );
}