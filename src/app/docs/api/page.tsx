import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getApiReferences } from '@/lib/apiReferences';

export const dynamic = 'force-static';

export default function ApiReferenceIndexPage() {
  const references = getApiReferences();

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Documentation', href: '/docs' },
          { label: 'API References' },
        ]}
      />

      <h1 className="govuk-heading-xl">API References</h1>
      <p className="govuk-body-l">
        OpenAPI references rendered with ReDoc inside the MoJ portal experience.
      </p>

      {references.length > 0 ? (
        <div className="app-cards">
          {references.map((reference) => (
            <div key={reference.slug} className="app-card">
              <span className="app-card__tag">api</span>
              <h2 className="govuk-heading-m app-card__title">
                <Link
                  href={`/docs/api/${encodeURIComponent(reference.slug)}`}
                  className="govuk-link govuk-link--no-visited-state app-card__title-link"
                >
                  {reference.title}
                </Link>
              </h2>
              <p className="govuk-body app-card__description">{reference.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="govuk-body">No API references are configured yet.</p>
      )}
    </div>
  );
}
