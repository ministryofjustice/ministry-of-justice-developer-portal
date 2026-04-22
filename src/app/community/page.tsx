import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import { getCommunityCategoryLabel } from '@/lib/categoryLabels';
import { formatEventDateTime } from '@/lib/date';
import { Callout } from '@/components/templateRender/Callout';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { Section } from '@/components/templateRender/Section';
import community from '../../../content/community/community.json';

export default function CommunityPage() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Community' }]} />

      <PageIntro
        title={community.title}
        summary={community.summary}
        summaryClassName="govuk-body-l"
      />

      <div className="app-cards">
        {community.items.map((item) => (
          <div key={item.slug} className="app-card">
            <span className="app-card__tag">{getCommunityCategoryLabel(item.category)}</span>
            <h2 className="govuk-heading-m app-card__title">
              <Link
                href={`/community/${item.slug}`}
                className="govuk-link govuk-link--no-visited-state app-card__title-link"
              >
                {item.title}
              </Link>
            </h2>
            <p className="govuk-body app-card__description">{item.description}</p>
            {'eventDate' in item && item.eventDate && (
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                <strong>Next event:</strong> {formatEventDateTime(item.eventDate)}
              </p>
            )}
          </div>
        ))}
      </div>

      {community.supportingSections.map((section) => (
        <Section
          key={section.title}
          heading={section.title}
          className="govuk-!-margin-top-6 govuk-!-margin-bottom-0"
          contentClassName=""
        >
          <ul className="govuk-list govuk-list--bullet">
            {section.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="govuk-link"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <div className="govuk-!-margin-top-6">
        <Callout title={community.contribution.title}>
          <p className="govuk-body">{community.contribution.summary}</p>
          <ul className="govuk-list govuk-list--bullet">
            {community.contribution.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </Callout>
      </div>

      <ChatBot />
    </div>
  );
}
