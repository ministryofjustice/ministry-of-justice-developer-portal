import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ApiReferenceViewer } from '@/components/ApiReferenceViewer';
import { getApiReference, getApiReferences } from '@/lib/apiReferences';

type Params = { slug: string };

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return getApiReferences().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const reference = getApiReference(slug);
  if (!reference) return {};
  return { title: reference.title };
}

export default async function ApiReferencePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const reference = getApiReference(slug);

  if (!reference) {
    notFound();
  }

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Documentation', href: '/docs' },
          { label: 'API References', href: '/docs/api' },
          { label: reference.title },
        ]}
      />

      <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{reference.title}</h1>
      <p className="govuk-body govuk-!-margin-bottom-3">{reference.description}</p>

      <ul className="govuk-list govuk-list--spaced">
        {reference.owner && (
          <li>
            <strong>Owner:</strong> {reference.owner}
          </li>
        )}
        {reference.sourceUrl && (
          <li>
            <strong>Source:</strong>{' '}
            <a className="govuk-link" href={reference.sourceUrl} target="_blank" rel="noopener noreferrer">
              Open repository
            </a>
          </li>
        )}
        <li>
          <strong>OpenAPI Spec:</strong>{' '}
          <a className="govuk-link" href={reference.specUrl} target="_blank" rel="noopener noreferrer">
            Open spec URL
          </a>
        </li>
      </ul>

      <div className="govuk-!-margin-top-5">
        <ApiReferenceViewer specUrl={reference.specUrl} />
      </div>

      <p className="govuk-body govuk-!-margin-top-6">
        Looking for narrative docs? Return to{' '}
        <Link href="/docs" className="govuk-link">
          Documentation
        </Link>
        .
      </p>
    </div>
  );
}
