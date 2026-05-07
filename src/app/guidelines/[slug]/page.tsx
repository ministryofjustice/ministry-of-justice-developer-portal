import type { Metadata } from 'next';
import Link from 'next/link';
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

interface Params {
  slug: string;
}

interface GuidelineItem {
  slug: string;
  title: string;
  phase: 'inception' | 'development' | 'technology' | 'standards' | 'measuring';
  description: string;
  owner: string;
  lastReviewedOn: string;
  reviewIn: string;
  externalUrl?: string;
}

const phaseLabels: Record<GuidelineItem['phase'], string> = {
  inception: 'Project inception',
  development: 'Development and iteration',
  technology: 'Technology choice',
  standards: 'Standards and best practices',
  measuring: 'Measuring success',
};

function GuidelinesSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <nav className="app-layout__sidebar" aria-label="Guidelines navigation">
      <h2 className="app-subnav__section-title">Guidelines</h2>
      <ul className="app-subnav">
        {(guidelines.items as GuidelineItem[]).map((item) => (
          <li key={item.slug} className="app-subnav__item">
            {item.externalUrl ? (
              <a
                href={item.externalUrl}
                className="app-subnav__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            ) : (
              <Link
                href={`/guidelines/${item.slug}`}
                className={item.slug === currentSlug ? 'app-subnav__link app-subnav__link--current' : 'app-subnav__link'}
                aria-current={item.slug === currentSlug ? 'page' : undefined}
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function generateStaticParams() {
  return (guidelines.items as GuidelineItem[]).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guideline = (guidelines.items as GuidelineItem[]).find((g) => g.slug === slug);
  if (!guideline) return {};
  return { title: guideline.title };
}

export default async function GuidelineDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const guideline = (guidelines.items as GuidelineItem[]).find((g) => g.slug === slug);

  if (!guideline) {
    notFound();
  }

  const reviewStatus = getReviewStatus(guideline.lastReviewedOn, guideline.reviewIn);

  if (guideline.externalUrl) {
    return (
      <div className="govuk-width-container">
        <Breadcrumbs
          items={[{ label: guidelines.title, href: '/guidelines' }, { label: guideline.title }]}
        />

        <div className="app-layout">
          <GuidelinesSidebar currentSlug={guideline.slug} />

          <div className="app-layout__content">
            <TagRow categoryTag={phaseLabels[guideline.phase]} />
            <PageIntro
              title={guideline.title}
              titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
              summary={guideline.description}
            />

            <div className="govuk-inset-text">
              This guideline is maintained on a canonical external source.
            </div>

            <p className="govuk-body">
              <a href={guideline.externalUrl} className="govuk-link" target="_blank" rel="noopener noreferrer">
                Open full guidance at source
              </a>{' '}
              <span className="govuk-hint">(opens in a new tab)</span>
            </p>

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

  const pageData = getGuidelinePage(guideline.slug);
  const content = pageData ? await markdownToHtml(pageData.content) : `
## ${guideline.title}

This guideline is coming soon. Content is being developed.

**Owner:** ${guideline.owner}

If you have questions, reach out to the ${guideline.owner} team.
  `;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[{ label: guidelines.title, href: '/guidelines' }, { label: guideline.title }]}
      />

      <div className="app-layout">
        <GuidelinesSidebar currentSlug={guideline.slug} />

        <div className="app-layout__content">
          <TagRow categoryTag={phaseLabels[guideline.phase]} />
          <PageIntro
            title={guideline.title}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
            summary={guideline.description}
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


