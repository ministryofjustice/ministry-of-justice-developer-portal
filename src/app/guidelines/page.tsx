import Link from 'next/link';
import { Breadcrumbs } from '@/src/components/Breadcrumbs';
import { ChatBot } from '@/src/components/ChatBot';
import { PageIntro } from '@/src/components/templateRender/PageIntro';
import guidelines from '@/content/guidelines/guidelines.json';

interface Phase {
  key: string;
  title: string;
  description: string;
  cssModifier: string;
}

interface Guideline {
  slug: string;
  title: string;
  phase: string;
  description: string;
  owner: string;
  lastReviewedOn: string;
  reviewIn: string;
  externalUrl?: string;
}

interface GuidelinesContent {
  title: string;
  summary: string;
  items: Guideline[];
}

const phases: Phase[] = [
  {
    key: 'inception',
    title: '1. Project Inception',
    description:
      'Starting your project — understanding the problem, assessing feasibility, and planning your approach.',
    cssModifier: 'inception',
  },
  {
    key: 'development',
    title: '2. Development & Iteration',
    description:
      'Building your service — coding standards, security practices, and agile delivery.',
    cssModifier: 'development',
  },
  {
    key: 'technology',
    title: '3. Technology Choice',
    description: 'Choosing the right tools — languages, frameworks, platforms, and open source.',
    cssModifier: 'technology',
  },
  {
    key: 'standards',
    title: '4. Standards & Best Practices',
    description:
      'Cross-cutting standards — accessibility, security, incident management, and operational excellence.',
    cssModifier: 'standards',
  },
  {
    key: 'measuring',
    title: '5. Measuring Success',
    description:
      'Understanding impact — metrics, monitoring, service health, and user satisfaction.',
    cssModifier: 'measuring',
  },
];

export default function GuidelinesPage() {
  const pageContent = guidelines as GuidelinesContent;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: pageContent.title }]} />

      <PageIntro
        title={pageContent.title}
        summary={pageContent.summary}
        summaryClassName="govuk-body-l"
      />

      {phases.map((phase) => {
        const phaseGuidelines = pageContent.items.filter((g) => g.phase === phase.key);

        return (
          <section
            key={phase.key}
            className={`app-phase-card app-phase-card--${phase.cssModifier}`}
          >
            <h2 className="govuk-heading-l govuk-!-margin-bottom-1">{phase.title}</h2>

            <p className="govuk-body">{phase.description}</p>

            {phaseGuidelines.length > 0 && (
              <ul className="govuk-list">
                {phaseGuidelines.map((item) => (
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
                        href={`/guidelines/${item.slug}`}
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
            )}
          </section>
        );
      })}

      <ChatBot />
    </div>
  );
}
