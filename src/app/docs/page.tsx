import Link from 'next/link';
import { getDocSources } from '@/lib/docs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import guidelines from '../../../content/guidelines/guidelines.json';

type GuidelineLink = {
  slug: string;
  title: string;
  description: string;
  externalUrl?: string;
};

type GuidelinesContent = {
  items: GuidelineLink[];
};

export default function DocsIndex() {
  const sources = getDocSources();
  const guidelineItems = (guidelines as GuidelinesContent).items || [];

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Documentation' }]} />

      <h1 className="govuk-heading-xl">Documentation</h1>
      <p className="govuk-body-l">
        Technical documentation, guidelines, and API references for platforms and engineering teams
        in one portal experience.
      </p>

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          API reference pages are available under{' '}
          <Link href="/docs/api" className="govuk-link">
            API References
          </Link>
          . Read publishing guidance in{' '}
          <Link href="/docs/publisher-guide" className="govuk-link">
            Documentation Portal Publisher Guide
          </Link>
          .
        </p>
      </div>

      {sources.length > 0 ? (
        <>
          <h2 className="govuk-heading-l">Documentation Sources</h2>
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
        </>
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

      {guidelineItems.length > 0 && (
        <>
          <h2 className="govuk-heading-l govuk-!-margin-top-8">Guidelines</h2>
          <div className="app-cards">
            {guidelineItems.map((item) => (
              <div key={item.slug} className="app-card">
                <span className="app-card__tag">guideline</span>
                <h3 className="govuk-heading-s app-card__title">
                  {item.externalUrl ? (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="govuk-link govuk-link--no-visited-state app-card__title-link"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <Link
                      href={`/guidelines/${item.slug}`}
                      className="govuk-link govuk-link--no-visited-state app-card__title-link"
                    >
                      {item.title}
                    </Link>
                  )}
                </h3>
                <p className="govuk-body app-card__description">{item.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <ChatBot />
    </div>
  );
}
