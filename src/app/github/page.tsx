import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import { PageIntro } from '@/components/templateRender/PageIntro';
import github from '../../../content/github/github.json';
import { GuidelinesContent } from '@/types/guidelines';

export default function GitHubPage() {
  const pageContent = github as GuidelinesContent;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: pageContent.title }]} />

      <PageIntro
        title={pageContent.title}
        summary={pageContent.summary}
        summaryClassName="govuk-body-l"
      />

      {pageContent.sections.map((section) => {
        const sectionGuidelines = pageContent.items.filter((item) => item.section === section.key);

        if (sectionGuidelines.length === 0) {
          return null;
        }

        return (
          <section
            key={section.key}
            className={`app-phase-card app-phase-card--${section.modifier}`}
          >
            <h2 className="govuk-heading-l govuk-!-margin-bottom-1">{section.title}</h2>

            <p className="govuk-body">{section.description}</p>

            <ul className="govuk-list">
              {sectionGuidelines.map((item) => (
                <li key={item.slug}>
                  {item.externalUrl ? (
                    <a
                      href={item.externalUrl}
                      className="govuk-link govuk-link--no-visited-state"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                      <span className="govuk-visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={`/github/${item.slug}`}
                      className="govuk-link govuk-link--no-visited-state"
                    >
                      {item.title}
                    </Link>
                  )}

                  <span className="govuk-body-s" style={{ color: '#505a5f', marginLeft: 8 }}>
                    — {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <ChatBot />
    </div>
  );
}
