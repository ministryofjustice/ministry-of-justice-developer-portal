import Link from 'next/link';
import { StatusTag } from '@/components/templateRender/StatusTag';
import { getProductCategoryLabel } from '@/lib/categoryLabels';
import { ProductCardProps } from '@/types/products';

export function ProductCard({ slug, name, category, description, status, tags }: ProductCardProps) {
  return (
    <div className="app-card">
      <span className="app-card__tag">{getProductCategoryLabel(category)}</span>
      <h2 className="govuk-heading-m app-card__title">
        <Link
          href={`/products/${slug}`}
          className="govuk-link govuk-link--no-visited-state app-card__title-link"
        >
          {name}
        </Link>
      </h2>
      <p className="govuk-body app-card__description">{description}</p>
      {(status === 'beta' || status === 'alpha' || status === 'deprecated') && (
        <StatusTag status={status} />
      )}
    </div>
  );
}
