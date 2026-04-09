import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ChatBot } from '@/components/ChatBot';
import { getCommunityCategoryLabel } from '@/lib/categoryLabels';
import { formatEventDateTime } from '@/lib/date';
import { ActionLinks } from '@/components/templateRender/ActionLinks';
import { MetaBar } from '@/components/templateRender/MetaBar';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { Section } from '@/components/templateRender/Section';
import { StatusTag, type StatusTagValue } from '@/components/templateRender/StatusTag';
import { TagRow } from '@/components/templateRender/TagRow';
import { TagList } from '@/components/templateRender/TagList';
import community from '@/content/community/community.json';

type CommunityParams = { slug: string };

type CommunityItem = (typeof community.items)[number];

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

  const status = item.status as StatusTagValue;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Community', href: '/community' }, { label: item.title }]} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <TagRow categoryTag={getCommunityCategoryLabel(item.category)} />
          <PageIntro
            title={item.title}
            summary={item.description}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
          />

          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">Status</th>
                <td className="govuk-table__cell">
                  <StatusTag status={status} />
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">Owner</th>
                <td className="govuk-table__cell">{item.owner}</td>
              </tr>
              {'eventDate' in item && item.eventDate && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">Starts</th>
                  <td className="govuk-table__cell">{formatEventDateTime(item.eventDate)}</td>
                </tr>
              )}
              {'endDate' in item && item.endDate && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">Ends</th>
                  <td className="govuk-table__cell">{formatEventDateTime(item.endDate)}</td>
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
                <td className="govuk-table__cell"><TagList tags={item.tags} /></td>
              </tr>
            </tbody>
          </table>

          <ActionLinks links={item.primaryLinks} />

          <MetaBar
            items={[
              { label: 'Owner', value: item.owner },
              { label: 'Status', value: <StatusTag status={status} /> },
              { label: 'Schedule', value: 'isRecurring' in item && item.isRecurring ? 'Recurring series' : null },
            ]}
          />

          {item.sections.map((section) => (
            <Section key={section.heading} heading={section.heading} className="govuk-!-margin-top-6" contentClassName="">
              <>
                {section.body && <p className="govuk-body">{section.body}</p>}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="govuk-list govuk-list--bullet">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </>
            </Section>
          ))}

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}