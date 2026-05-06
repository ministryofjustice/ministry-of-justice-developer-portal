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

const phaseLabels: Record<string, string> = {
  inception: 'Project Inception',
  development: 'Development & Iteration',
  technology: 'Technology Choice',
  standards: 'Standards & Best Practices',
  measuring: 'Measuring Success',
};

type Params = { slug: string };

function stripDangerousTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

function absolutizeAssetUrls(html: string, pageUrl: string): string {
  return html.replace(/(href|src)=(['"])([^'"#][^'"]*)\2/gi, (full, attr, quote, value) => {
    try {
      const absolute = new URL(value, pageUrl).toString();
      return `${attr}=${quote}${absolute}${quote}`;
    } catch {
      return full;
    }
  });
}

function removeTargetBlank(html: string): string {
  return html.replace(/\s+target=(['"])_blank\1/gi, '');
}

function extractMainLikeContent(html: string): string | null {
  const mainMatch = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  if (mainMatch) return mainMatch[0];

  const articleMatch = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/i);
  if (articleMatch) return articleMatch[0];

  return null;
}

async function fetchExternalGuidanceHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
    if (!res.ok) return null;

    const rawHtml = await res.text();
    const extracted = extractMainLikeContent(rawHtml);
    if (!extracted) return null;

    const cleaned = stripDangerousTags(extracted);
    const withAbsoluteUrls = absolutizeAssetUrls(cleaned, url);
    return removeTargetBlank(withAbsoluteUrls);
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return guidelines.items.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guideline = guidelines.items.find((g) => g.slug === slug);
  if (!guideline) return {};
  return { title: guideline.title };
}

export default async function GuidelineDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guideline = guidelines.items.find((g) => g.slug === slug);

  if (!guideline) {
    notFound();
  }

  const reviewStatus = getReviewStatus(guideline.lastReviewedOn, guideline.reviewIn);

  // Render external guidance inside portal chrome as a single-page experience.
  if (guideline.externalUrl) {
    const externalHtml = await fetchExternalGuidanceHtml(guideline.externalUrl);

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
              summary={guideline.description}
            />

            {externalHtml ? (
              <>
                <div className="govuk-inset-text">
                  Canonical source: <a href={guideline.externalUrl} className="govuk-link">{guideline.externalUrl}</a>
                </div>
                <div
                  className="app-prose-scope"
                  dangerouslySetInnerHTML={{ __html: externalHtml }}
                />
              </>
            ) : (
              <>
                <div className="govuk-inset-text">
                  We could not render the canonical guidance inline right now.
                </div>
                <p className="govuk-body">
                  <a href={guideline.externalUrl} className="govuk-link">
                    Open full guidance at source
                  </a>
                </p>
              </>
            )}

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

  // Load content from MDX or use placeholder
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


