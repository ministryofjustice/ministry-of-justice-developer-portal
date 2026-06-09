import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ChatBot } from '@/components/ChatBot';
import { formatLongDate } from '@/lib/date';
import { getReviewStatus } from '@/lib/review';
import { MetaBar } from '@/components/templateRender/MetaBar';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { ReviewBadge, type ReviewStatus } from '@/components/templateRender/ReviewBadge';
import { TagRow } from '@/components/templateRender/TagRow';
import guidelines from '../../../../content/guidelines/guidelines.json';
import { markdownToHtml } from '@/lib/markdown/markdownToHtml';
import { getGuidelinePage } from '@/lib/docs';
import { GuidelinesContent } from '@/types/guidelines';

type Params = { slug: string };

const pageContent = guidelines as GuidelinesContent;

export function generateStaticParams() {
  return pageContent.items
    .filter((guideline) => !guideline.externalUrl)
    .map((guideline) => ({ slug: guideline.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guideline = pageContent.items.find((item) => item.slug === slug);

  if (!guideline) {
    return {};
  }

  return { title: guideline.title };
}

export default async function GuidelineDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guideline = pageContent.items.find((item) => item.slug === slug);

  if (!guideline) {
    notFound();
  }

  const section = pageContent.sections.find((section) => section.key === guideline.section);

  if (guideline.externalUrl) {
    return (
      <div className="govuk-width-container">
        <Breadcrumbs
          items={[{ label: pageContent.title, href: '/guidelines' }, { label: guideline.title }]}
        />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {section && <TagRow categoryTag={section.title} />}

            <PageIntro
              title={guideline.title}
              titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
            />

            <p className="govuk-body">
              This guideline is hosted externally:{' '}
              <a href={guideline.externalUrl} className="govuk-link">
                {guideline.externalUrl}
              </a>
            </p>
          </div>
        </div>

        <ChatBot />
      </div>
    );
  }

  const pageData = getGuidelinePage(guideline.slug);

  const content = pageData
    ? await markdownToHtml(pageData.content)
    : `
## ${guideline.title}

This guideline is coming soon. Content is being developed.

**Owner:** ${guideline.owner}

If you have questions, reach out to the ${guideline.owner} team.
  `;

  const reviewStatus = getReviewStatus(guideline.lastReviewedOn, guideline.reviewIn);

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[{ label: pageContent.title, href: '/guidelines' }, { label: guideline.title }]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {section && <TagRow categoryTag={section.title} />}

          <PageIntro
            title={guideline.title}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
          />

          <div className="app-prose-scope" dangerouslySetInnerHTML={{ __html: content }} />

          <MetaBar
            items={[
              {
                label: 'Last reviewed',
                value: formatLongDate(guideline.lastReviewedOn),
              },
              {
                label: 'Review status',
                value: <ReviewBadge status={reviewStatus as ReviewStatus} />,
              },
              { label: 'Owner', value: guideline.owner },
            ]}
          />

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
