import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getLiveDocSources } from '@/lib/docs';

type Params = { sourceId: string };
type SearchParams = { url?: string };

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

function resolveLiveSourceUrl(defaultUrl: string, requestedUrl?: string): string {
  const fallback = new URL(defaultUrl);
  if (!requestedUrl) return fallback.toString();

  try {
    const resolved = new URL(requestedUrl, fallback);
    if (!/^https?:$/.test(resolved.protocol) || resolved.host !== fallback.host) {
      return fallback.toString();
    }
    return resolved.toString();
  } catch {
    return fallback.toString();
  }
}

function rewriteExternalAnchorsForInlineNavigation(
  html: string,
  sourceId: string,
  activeUrl: string
): string {
  return html.replace(/(<a\b[^>]*\shref=(['"])([^'"]+)\2[^>]*>)/gi, (full, _openTag, quote, href) => {
    const rawHref = String(href || '').trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return full;
    }

    try {
      const resolved = new URL(rawHref, activeUrl);
      if (!/^https?:$/.test(resolved.protocol)) return full;

      const inlineHref = `/docs/live/${sourceId}?url=${encodeURIComponent(resolved.toString())}`;
      return full.replace(`${quote}${href}${quote}`, `${quote}${inlineHref}${quote}`);
    } catch {
      return full;
    }
  });
}

async function fetchExternalLiveHtml(url: string): Promise<string | null> {
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

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return getLiveDocSources().map((item) => ({ sourceId: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { sourceId } = await params;
  const source = getLiveDocSources().find((item) => item.slug === sourceId);
  if (!source) return {};
  return { title: source.name };
}

export default async function LiveSourcePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: SearchParams;
}) {
  const { sourceId } = await params;
  const { url } = searchParams || {};
  const source = getLiveDocSources().find((item) => item.slug === sourceId);

  if (!source || !source.externalUrl) {
    notFound();
  }

  const activeUrl = resolveLiveSourceUrl(source.externalUrl, url);
  const rawHtml = await fetchExternalLiveHtml(activeUrl);
  const externalHtml = rawHtml
    ? rewriteExternalAnchorsForInlineNavigation(rawHtml, source.slug, activeUrl)
    : null;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Documentation', href: '/docs' },
          { label: source.name },
        ]}
      />

      <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{source.name}</h1>
      {source.description ? <p className="govuk-body-l">{source.description}</p> : null}

      <div className="govuk-inset-text">
        This source is rendered on the fly from its canonical external location and is not ingested
        into portal content.
      </div>

      {externalHtml ? (
        <>
          <div className="govuk-inset-text">
            Canonical source: <a href={activeUrl} className="govuk-link">{activeUrl}</a>
          </div>
          <div className="app-prose-scope" dangerouslySetInnerHTML={{ __html: externalHtml }} />
        </>
      ) : (
        <>
          <div className="govuk-inset-text">We could not render this source inline right now.</div>
          <p className="govuk-body">
            <a href={activeUrl} className="govuk-link">Open full source site</a>
          </p>
        </>
      )}
    </div>
  );
}
