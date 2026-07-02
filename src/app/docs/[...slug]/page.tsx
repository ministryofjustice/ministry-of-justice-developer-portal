import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocPage, getDocSources, getAllDocSlugs } from '@/lib/docs';

import { markdownToHtml } from '@/lib/markdown/markdownToHtml';
import { formatLongDate } from '@/lib/date';
import { getReviewStatus } from '@/lib/review';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ChatBot } from '@/components/ChatBot';
import { MetaBar } from '@/components/templateRender/MetaBar';
import { NavItem, ReviewStatus } from '@/types';
import { ReviewBadge } from '@/components/templateRender/ReviewBadge';

type Params = { slug: string[] };

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = params;
  const page = getDocPage(slug);
  if (!page) return {};
  return { title: page.meta.title };
}

function hasActiveDescendant(item: NavItem, currentPath: string): boolean {
  if (!item.children?.length) return false;

  return item.children.some((child) => {
    const childPath = child.slug.join('/');
    return childPath === currentPath || hasActiveDescendant(child, currentPath);
  });
}

function SidebarNav({
  items,
  currentSlug,
  level = 0,
}: {
  items: NavItem[];
  currentSlug: string[];
  level?: number;
}) {
  const currentPath = currentSlug.join('/');

  return (
    <ul className={`app-subnav${level > 0 ? ' app-subnav--nested' : ''}`}>
      {items.map((item) => {
        const itemPath = item.slug.join('/');
        const isActive = currentPath === itemPath;
        const isParent = hasActiveDescendant(item, currentPath);
        const shouldShowChildren =
          Boolean(item.children?.length) && (isActive || isParent);

        return (
          <li key={itemPath} className="app-subnav__item">
            <Link
              href={`/docs/${itemPath}`}
              className={`app-subnav__link${
                isActive ? ' app-subnav__link--active' : ''
              }${isParent ? ' app-subnav__link--parent-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.title}
            </Link>
            {shouldShowChildren && (
              <SidebarNav
                items={item.children!}
                currentSlug={currentSlug}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function DocPage({ params }: { params: Params }) {
  const { slug } = params;
  const page = getDocPage(slug);
  if (!page) notFound();

  const sourceSlug = slug[0];
  const htmlContent = await markdownToHtml(page.content, {
    sourceSlug,
    currentSlug: slug,
  });
  const sources = getDocSources();
  const currentSource = sources.find((s) => s.slug === sourceSlug);

  const reviewStatus = getReviewStatus(
    page.meta.lastReviewedOn,
    page.meta.reviewIn,
  );

  const breadcrumbs = [
    { label: 'Documentation', href: '/docs' },
    ...(currentSource
      ? [{ label: currentSource.name, href: `/docs/${sourceSlug}` }]
      : []),
    { label: page.meta.title },
  ];

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={breadcrumbs} />

      <div className="app-layout">
        {currentSource && (
          <nav
            className="app-layout__sidebar"
            aria-label="Documentation navigation"
          >
            <h2 className="app-subnav__section-title">{currentSource.name}</h2>
            <SidebarNav items={currentSource.items} currentSlug={slug} />
          </nav>
        )}

        <div className="app-layout__content">
          <h1 className="govuk-heading-xl">{page.meta.title}</h1>

          <div
            className="app-prose-scope"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <MetaBar
            items={[
              {
                label: 'Last reviewed',
                value: page.meta.lastReviewedOn
                  ? formatLongDate(page.meta.lastReviewedOn)
                  : null,
              },
              {
                label: 'Review status',
                value: reviewStatus ? (
                  <ReviewBadge status={reviewStatus as ReviewStatus} />
                ) : null,
              },
              { label: 'Owner', value: page.meta.ownerSlack || null },
              {
                label: 'Source',
                value: page.meta.sourceRepo ? (
                  <a
                    className="govuk-link"
                    href={`https://github.com/${page.meta.sourceRepo}/blob/main/${
                      page.meta.sourcePath || ''
                    }`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View source on GitHub
                  </a>
                ) : null,
              },
            ]}
          />

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}