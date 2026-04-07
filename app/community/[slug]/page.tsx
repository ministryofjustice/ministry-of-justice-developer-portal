import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ChatBot } from '@/components/ChatBot';
import community from '@/content/community/community.json';

type CommunityParams = { slug: string };

type CommunityItem = (typeof community.items)[number];

const categoryLabels: Record<string, string> = {
  chat: 'Chat',
  code: 'Code',
  learn: 'Learn',
  events: 'Events',
};

const statusLabels: Record<string, { label: string; className: string }> = {
  live: { label: 'Live', className: 'govuk-tag govuk-tag--green' },
  beta: { label: 'Beta', className: 'govuk-tag govuk-tag--blue' },
  alpha: { label: 'Alpha', className: 'govuk-tag govuk-tag--yellow' },
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

export function generateStaticParams() {
  return community.items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<CommunityParams> }) {
  const { slug } = await params;
  const item = community.items.find((entry) => entry.slug === slug);
  if (!item) return {};
  return { title: item.title };
}

export default async function CommunityDetailPage({ params }: { params: Promise<CommunityParams> }) {
  const { slug } = await params;
  const item = community.items.find((entry) => entry.slug === slug) as CommunityItem | undefined;

  if (!item) {
    notFound();
  }

  const statusTag = statusLabels[item.status] || statusLabels.live;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Community', href: '/community' }, { label: item.title }]} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="app-card__tag">{categoryLabels[item.category] || item.category}</span>
          <h1 className="govuk-heading-xl govuk-!-margin-top-2">{item.title}</h1>
          <p className="govuk-body-l">{item.description}</p>

          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">Status</th>
                <td className="govuk-table__cell">
                  <strong className={statusTag.className}>{statusTag.label}</strong>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">Owner</th>
                <td className="govuk-table__cell">{item.owner}</td>
              </tr>
              {'eventDate' in item && item.eventDate && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">Starts</th>
                  <td className="govuk-table__cell">{formatEventDate(item.eventDate)}</td>
                </tr>
              )}
              {'endDate' in item && item.endDate && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">Ends</th>
                  <td className="govuk-table__cell">{formatEventDate(item.endDate)}</td>
                </tr>
              )}
              {'location' in item && item.location && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">Location</th>
                  <td className="govuk-table__cell">{item.location}</td>
                </tr>
              )}
              {'isRecurring' in item && item.isRecurring && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">Schedule</th>
                  <td className="govuk-table__cell">Recurring series</td>
                </tr>
              )}
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">Tags</th>
                <td className="govuk-table__cell">
                  {item.tags.map((tag) => (
                    <strong key={tag} className="govuk-tag govuk-tag--grey govuk-!-margin-right-1">
                      {tag}
                    </strong>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>

          {item.primaryLinks.length > 0 && (
            <div className="govuk-button-group">
              {item.primaryLinks.map((link, index) => {
                const className = index === 0 ? 'govuk-button' : 'govuk-button govuk-button--secondary';

                if (link.external) {
                  return (
                    <a key={link.href} href={link.href} className={className} rel="noopener noreferrer">
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link key={link.href} href={link.href} className={className}>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {item.sections.map((section) => (
            <section key={section.heading} className="govuk-!-margin-top-6">
              <h2 className="govuk-heading-m">{section.heading}</h2>
              {section.body && <p className="govuk-body">{section.body}</p>}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="govuk-list govuk-list--bullet">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}