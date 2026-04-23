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

const phaseLabels: Record<string, string> = {
  inception: 'Project Inception',
  development: 'Development & Iteration',
  technology: 'Technology Choice',
  standards: 'Standards & Best Practices',
  measuring: 'Measuring Success',
};

type Params = { slug: string };

export function generateStaticParams() {
  return guidelines.items.filter((g) => !g.externalUrl).map((g) => ({ slug: g.slug }));
}

export default async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guideline = guidelines.items.find((g) => g.slug === slug);

  if (!guideline) {
    notFound();
  }

  // Handle external URLs
  if (guideline.externalUrl) {
    // Redirect or show external link (adjust as needed)
    return (
      <div className="govuk-width-container">
        <Breadcrumbs
          items={[{ label: guidelines.title, href: '/guidelines' }, { label: guideline.title }]}
        />
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <PageIntro
              title={guideline.title}
              titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
            />
            <p>This guideline is hosted externally: <a href={guideline.externalUrl} className="govuk-link">{guideline.externalUrl}</a></p>
          </div>
        </div>
        <ChatBot />
      </div>
    );
  }

  // Load content from MDX or use placeholder
  const pageData = getGuidelinePage(guideline.slug);
  const content = pageData ? await markdownToHtml(pageData.content) : `
## ${guideline.title}

This guideline is coming soon. Content is being developed.

**Owner:** ${guideline.owner}

If you have questions, reach out to the ${guideline.owner} team.
  `;

  const reviewStatus = getReviewStatus(guideline.lastReviewedOn, guideline.reviewIn);

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[{ label: guidelines.title, href: '/guidelines' }, { label: guideline.title }]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <TagRow categoryTag={phaseLabels[guideline.phase]} />
          <PageIntro
            title={guideline.title}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
          />

          <div
            className="app-prose-scope"
            dangerouslySetInnerHTML={{ __html: content }}
          />

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


