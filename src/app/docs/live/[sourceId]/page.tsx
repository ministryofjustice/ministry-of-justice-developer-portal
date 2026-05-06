import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getLiveDocSources } from '@/lib/docs';

type Params = { sourceId: string };

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return getLiveDocSources().map((item) => ({ sourceId: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { sourceId } = await params;
  const source = getLiveDocSources().find((item) => item.slug === sourceId);
  if (!source) return {};
  return { title: source.name };
}

export default async function LiveSourcePage({ params }: { params: Promise<Params> }) {
  const { sourceId } = await params;
  const source = getLiveDocSources().find((item) => item.slug === sourceId);

  if (!source || !source.externalUrl) {
    notFound();
  }

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Documentation', href: '/docs' },
          { label: source.name },
        ]}
      />

      <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{source.name}</h1>
      {source.description ? <p className="govuk-body-l">{source.description}</p> : null}

      <div className="govuk-inset-text">
        This source is rendered on the fly from its canonical external location and is not ingested
        into portal content.
      </div>

      <div
        style={{
          border: '1px solid #b1b4b6',
          minHeight: '75vh',
          background: '#fff',
        }}
      >
        <iframe
          src={source.externalUrl}
          title={`${source.name} live documentation`}
          style={{ width: '100%', minHeight: '75vh', border: '0' }}
        />
      </div>
    </div>
  );
}
