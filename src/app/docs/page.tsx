import Link from 'next/link';
import { getDocSources } from '@/lib/docs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';

export default function DocsIndex() {
  const sources = getDocSources();

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Documentation' }]} />

      <h1 className="govuk-heading-xl">Documentation</h1>
      <p className="govuk-body-l">
        Technical documentation for our platforms, APIs, and tools. Documentation is automatically
        synced from source repositories and kept up to date.
      </p>

      {sources.length > 0 ? (
        <div className="app-cards">
          {sources.map((source) => (
            <div key={source.slug} className="app-card">
              <span className="app-card__tag">{source.category}</span>
              <h2 className="govuk-heading-m app-card__title">
                <Link
                  href={`/docs/${encodeURIComponent(source.slug)}`}
                  className="govuk-link govuk-link--no-visited-state app-card__title-link"
                >
                  {source.name}
                </Link>
              </h2>
              <p className="govuk-body app-card__description">{source.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="govuk-inset-text">
          <p className="govuk-body">
            No documentation sources have been ingested yet. Run the ingestion pipeline to pull in
            documentation from source repositories:
          </p>
          <pre>
            <code>npm run ingest</code>
          </pre>
        </div>
      )}

      <ChatBot />
    </div>
  );
}
