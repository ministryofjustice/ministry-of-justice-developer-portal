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

const phaseLabels: Record<string, string> = {
  inception: 'Project Inception',
  development: 'Development & Iteration',
  technology: 'Technology Choice',
  standards: 'Standards & Best Practices',
  measuring: 'Measuring Success',
};

const phaseOrder = ['inception', 'development', 'technology', 'standards', 'measuring'];

type GuidelineItem = {
  slug: string;
  title: string;
  phase: string;
  description: string;
  owner: string;
  lastReviewedOn: string;
  reviewIn: string;
  externalUrl?: string;
};

type Params = { slug: string };

type SearchParams = { url?: string };

function GuidelinesSidebar({ currentSlug }: { currentSlug: string }) {
  const items = (guidelines.items as GuidelineItem[]) || [];

  return (
    <nav className="app-layout__sidebar" aria-label="Guidelines navigation">
      <h2 className="app-subnav__section-title">Guidelines</h2>

      {phaseOrder.map((phaseKey) => {
        const phaseItems = items.filter((item) => item.phase === phaseKey);
        if (phaseItems.length === 0) return null;

        return (
          <div key={phaseKey} className="govuk-!-margin-bottom-4">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
              {phaseLabels[phaseKey] || phaseKey}
            </h3>
            <ul className="app-subnav">
              {phaseItems.map((item) => {
                const isActive = item.slug === currentSlug;
                return (
                  <li key={item.slug} className="app-subnav__item">
                    <Link
                      href={`/guidelines/${item.slug}`}
                      className={`app-subnav__link${isActive ? ' app-subnav__link--active' : ''}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

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

function rewriteExternalAnchorsForInlineNavigation(
  html: string,
  guidelineSlug: string,
  activeUrl: string
): string {
  return html.replace(/(<a\b[^>]*\shref=(['"])([^'"]+)\2[^>]*>)/gi, (full, openTag, quote, href) => {
    const rawHref = String(href || '').trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return full;
    }

    try {
      const resolved = new URL(rawHref, activeUrl);
      if (!/^https?:$/.test(resolved.protocol)) {
        return full;
      }

      const inlineHref = `/guidelines/${guidelineSlug}?url=${encodeURIComponent(resolved.toString())}`;
      return full.replace(`${quote}${href}${quote}`, `${quote}${inlineHref}${quote}`);
    } catch {
      return full;
    }
  });
}

function resolveGuidelineExternalUrl(defaultUrl: string, requestedUrl?: string): string {
  const fallback = new URL(defaultUrl);
  if (!requestedUrl) return fallback.toString();

  try {
    const resolved = new URL(requestedUrl, fallback);
    const allowedHosts = new Set([fallback.host]);
    if (!/^https?:$/.test(resolved.protocol) || !allowedHosts.has(resolved.host)) {
      return fallback.toString();
    }
    return resolved.toString();
  } catch {
    return fallback.toString();
  }
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

export default async function GuidelineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: SearchParams;
}) {
  const { slug } = await params;
  const { url } = searchParams || {};
  const guideline = guidelines.items.find((g) => g.slug === slug);

  if (!guideline) {
    notFound();
  }

  const reviewStatus = getReviewStatus(guideline.lastReviewedOn, guideline.reviewIn);

  // Render external guidance inside portal chrome as a single-page experience.
  if (guideline.externalUrl) {
    const activeExternalUrl = resolveGuidelineExternalUrl(guideline.externalUrl, url);
    const externalHtmlRaw = await fetchExternalGuidanceHtml(activeExternalUrl);
    const externalHtml = externalHtmlRaw
      ? rewriteExternalAnchorsForInlineNavigation(externalHtmlRaw, guideline.slug, activeExternalUrl)
      : null;

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

            {externalHtml ? (
              <>
                <div className="govuk-inset-text">
                  Canonical source: <a href={activeExternalUrl} className="govuk-link">{activeExternalUrl}</a>
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
                  <a href={activeExternalUrl} className="govuk-link">
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

      <div className="app-layout">
        <GuidelinesSidebar currentSlug={guideline.slug} />

        <div className="app-layout__content">
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


