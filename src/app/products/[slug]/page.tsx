import { notFound } from 'next/navigation';
import Link from 'next/link';

import sources from '@/sources.json';
import { StatusTag, StatusTagValue } from '@/src/components/templateRender/StatusTag';
import { ActionLink, ActionLinks } from '@/src/components/templateRender/ActionLinks';
import { Breadcrumbs } from '@/src/components/Breadcrumbs';
import { TagRow } from '@/src/components/templateRender/TagRow';
import { getProductCategoryLabel } from '@/src/lib/categoryLabels';
import { PageIntro } from '@/src/components/templateRender/PageIntro';
import { TagList } from '@/src/components/templateRender/TagList';
import { MetaBar } from '@/src/components/templateRender/MetaBar';
import { FeedbackWidget } from '@/src/components/FeedbackWidget';
import { ChatBot } from '@/src/components/ChatBot';
import products from '@/src/content/products/products.json';

interface Product {
  slug: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  slackChannel?: string;
  docsUrl?: string;
  externalUrl?: string;
  status: StatusTagValue;
  tags: string[];
}

type Params = { slug: string };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug) as Product | undefined;

  if (!product) {
    notFound();
  }

  const sourceIds = new Set(
    sources.sources.filter((source) => source.enabled !== false).map((source) => source.id),
  );
  const isDocsSourceLink = Boolean(product.docsUrl?.startsWith('/docs/'));
  const docsSourceId = isDocsSourceLink
    ? product.docsUrl?.replace(/^\/docs\//, '').split('/')[0]
    : undefined;
  const hasValidDocsLink = Boolean(
    product.docsUrl && (!isDocsSourceLink || (docsSourceId && sourceIds.has(docsSourceId))),
  );
  const hasInternalServiceLink = Boolean(product.externalUrl?.startsWith('/'));
  const actionLinks: ActionLink[] = [
    ...(product.docsUrl && hasValidDocsLink
      ? [{ label: 'View documentation', href: product.docsUrl, external: false }]
      : []),
    ...(product.externalUrl
      ? [{ label: 'Visit service', href: product.externalUrl, external: !hasInternalServiceLink }]
      : []),
  ];

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Products', href: '/products' }, { label: product.name }]} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <TagRow categoryTag={getProductCategoryLabel(product.category)} />
          <PageIntro
            title={product.name}
            summary={product.description}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
          />

          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">
                  Status
                </th>
                <td className="govuk-table__cell">
                  <StatusTag status={product.status} />
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">
                  Owner
                </th>
                <td className="govuk-table__cell">{product.owner}</td>
              </tr>
              {product.slackChannel && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">
                    Slack
                  </th>
                  <td className="govuk-table__cell">{product.slackChannel}</td>
                </tr>
              )}
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">
                  Tags
                </th>
                <td className="govuk-table__cell">
                  <TagList tags={product.tags} />
                </td>
              </tr>
            </tbody>
          </table>

          <ActionLinks links={actionLinks} />

          <MetaBar
            items={[
              { label: 'Owner', value: product.owner },
              { label: 'Status', value: <StatusTag status={product.status} /> },
              { label: 'Slack', value: product.slackChannel || null },
            ]}
          />

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
