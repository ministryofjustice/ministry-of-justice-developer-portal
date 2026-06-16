import Link from 'next/link';
import { getProductCategoryLabel } from '@/lib/categoryLabels';
import { ProductCardProps } from '@/types/types';

export function ProductCard({ slug, name, category, description, status, sbom }: ProductCardProps) {
  const formatSbomStatus = (value: string) => {
    const normalised = value.toLowerCase();
    if (normalised === 'completed') return 'Available';
    if (normalised === 'pending') return 'Pending';
    if (normalised === 'partial') return 'Partial';
    if (normalised === 'failed') return 'Failed';
    return value;
  };

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

      {sbom && (
        <div className="govuk-!-margin-top-3">
          <p className="govuk-body-s govuk-!-margin-bottom-1">
            Catalog insights: <strong>{formatSbomStatus(sbom.status)}</strong>
          </p>
          {typeof sbom.repositoryCount === 'number' && (
            <p className="govuk-body-s govuk-!-margin-bottom-1">Repositories: {sbom.repositoryCount}</p>
          )}
          {typeof sbom.packageCount === 'number' && (
            <p className="govuk-body-s govuk-!-margin-bottom-1">Packages: {sbom.packageCount}</p>
          )}
          {sbom.generatedAt && (
            <p className="govuk-body-s govuk-!-margin-bottom-1">Generated: {sbom.generatedAt}</p>
          )}
          {sbom.error && <p className="govuk-body-s govuk-!-margin-bottom-1">Error: {sbom.error}</p>}
          {sbom.reportUrl && (
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              <a href={sbom.reportUrl} className="govuk-link" target="_blank" rel="noreferrer">
                View catalog report
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
