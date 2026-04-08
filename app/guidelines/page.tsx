import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import guidelines from '@/content/guidelines/guidelines.json';

interface Phase {
  key: string;
  title: string;
  description: string;
  cssModifier: string;
}

const phases: Phase[] = [
  {
    key: 'inception',
    title: '1. Project Inception',
    description: 'Starting your project — understanding the problem, assessing feasibility, and planning your approach.',
    cssModifier: 'inception',
  },
  {
    key: 'development',
    title: '2. Development & Iteration',
    description: 'Building your service — coding standards, security practices, and agile delivery.',
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
    description: 'Cross-cutting standards — accessibility, security, incident management, and operational excellence.',
    cssModifier: 'standards',
  },
  {
    key: 'measuring',
    title: '5. Measuring Success',
    description: 'Understanding impact — metrics, monitoring, service health, and user satisfaction.',
    cssModifier: 'measuring',
  },
];

export default function GuidelinesPage() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Guidelines' }]} />

      <h1 className="govuk-heading-xl">Guidelines</h1>
      <p className="govuk-body-l">
        Standards and best practices organised by project lifecycle. Follow these guidelines
        to build services that meet Ministry of Justice and cross-government expectations.
      </p>

      {phases.map((phase) => {
        const phaseGuidelines = guidelines.filter((g) => g.phase === phase.key);
        return (
          <div key={phase.key} className={`app-phase-card app-phase-card--${phase.cssModifier}`}>
            <h2 className="govuk-heading-l govuk-!-margin-bottom-1">{phase.title}</h2>
            <p className="govuk-body">{phase.description}</p>
            {phaseGuidelines.length > 0 && (
              <ul className="govuk-list">
                {phaseGuidelines.map((g) => (
                  <li key={g.slug}>
                    {'externalUrl' in g && g.externalUrl ? (
                      <a
                        href={g.externalUrl}
                        className="govuk-link"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {g.title}
                      </a>
                    ) : (
                      <Link href={`/guidelines/${g.slug}`} className="govuk-link">
                        {g.title}
                      </Link>
                    )}
                    <span className="govuk-body-s" style={{ color: '#505a5f', marginLeft: 8 }}>
                      — {g.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      <ChatBot />
    </div>
  );
}
