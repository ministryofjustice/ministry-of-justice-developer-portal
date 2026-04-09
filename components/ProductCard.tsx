import Link from 'next/link';
import { getProductCategoryLabel } from '@/lib/categoryLabels';

interface ProductCardProps {
  slug: string;
  name: string;
  category: string;
  description: string;
  status: string;
  tags: string[];
}

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
      {status === 'beta' && (
        <strong className="govuk-tag govuk-tag--blue" style={{ marginTop: 10 }}>
          Beta
        </strong>
      )}
    </div>
  );
}
