import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import { PageIntro } from '@/components/templateRender/PageIntro';
import community from '@/content/community/community.json';

const categoryLabels: Record<string, string> = {
  chat: 'Chat',
  code: 'Code',
  learn: 'Learn',
  events: 'Events',
};

function formatEventDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

export default function CommunityPage() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Community' }]} />

      <PageIntro title={community.title} summary={community.summary} summaryClassName="govuk-body-l" />

      <div className="app-cards">
        {community.items.map((item) => (
          <div key={item.slug} className="app-card">
            <span className="app-card__tag">{categoryLabels[item.category] || item.category}</span>
            <h2 className="govuk-heading-m app-card__title">
              <Link href={`/community/${item.slug}`} className="govuk-link app-card__title-link">
                {item.title}
              </Link>
            </h2>
            <p className="govuk-body app-card__description">{item.description}</p>
            {'eventDate' in item && item.eventDate && (
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                <strong>Next event:</strong> {formatEventDate(item.eventDate)}
              </p>
            )}
          </div>
        ))}
      </div>

      {community.supportingSections.map((section) => (
        <div key={section.title}>
          <h2 className="govuk-heading-l govuk-!-margin-top-6">{section.title}</h2>
          <ul className="govuk-list govuk-list--bullet">
            {section.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="govuk-link" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="govuk-inset-text govuk-!-margin-top-6">
        <h2 className="govuk-heading-m">{community.contribution.title}</h2>
        <p className="govuk-body">{community.contribution.summary}</p>
        <ul className="govuk-list govuk-list--bullet">
          {community.contribution.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>

      <ChatBot />
    </div>
  );
}
