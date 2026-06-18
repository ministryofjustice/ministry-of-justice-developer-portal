import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('@/../content/products/products.json', () => ({
  default: [
    {
      slug: 'cloud-platform',
      name: 'Cloud Platform',
      category: 'hosting',
      description: 'Host services on the Ministry of Justice Cloud Platform.',
      owner: 'Cloud Platform team',
      status: 'live',
      docsUrl: '/docs/cloud-platform/getting-started',
      externalUrl: 'https://user-guide.cloud-platform.service.justice.gov.uk/',
      slackChannel: '#cloud-platform',
      tags: ['hosting', 'kubernetes', 'platform'],
    },
    {
      slug: 'modernisation-platform',
      name: 'Modernisation Platform',
      category: 'hosting',
      description: 'Host services that need access to legacy infrastructure.',
      owner: 'Modernisation Platform team',
      status: 'live',
      docsUrl: '/docs/modernisation-platform/getting-started',
      externalUrl: '/products/modernisation-platform',
      tags: ['hosting', 'aws', 'platform'],
    },
    {
      slug: 'disabled-docs-product',
      name: 'Disabled Docs Product',
      category: 'tools',
      description: 'A product with docs from a disabled source.',
      owner: 'Developer Experience',
      status: 'beta',
      docsUrl: '/docs/disabled-source/getting-started',
      externalUrl: 'https://example.com/service',
      tags: ['tooling'],
    },
  ],
}));

vi.mock('@/../sources.json', () => ({
  default: {
    sources: [
      {
        id: 'cloud-platform',
        enabled: true,
      },
      {
        id: 'modernisation-platform',
        enabled: true,
      },
      {
        id: 'disabled-source',
        enabled: false,
      },
    ],
  },
}));

vi.mock('@/lib/categoryLabels', () => ({
  getProductCategoryLabel: (category: string) => `Category: ${category}`,
}));

import ProductDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/products/[slug]/page';

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates static params for each product', () => {
    expect(generateStaticParams()).toEqual([
      { slug: 'cloud-platform' },
      { slug: 'modernisation-platform' },
      { slug: 'disabled-docs-product' },
    ]);
  });

  it('generates metadata for a matching product', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    ).resolves.toEqual({
      title: 'Cloud Platform',
    });
  });

  it('returns empty metadata for a missing product', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'missing-product' }),
      }),
    ).resolves.toEqual({});
  });

  it('renders the page title and summary', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Cloud Platform' })).toBeInTheDocument();

    expect(
      screen.getByText('Host services on the Ministry of Justice Cloud Platform.'),
    ).toBeInTheDocument();
  });

  it('renders the breadcrumbs', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders the product category tag', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    expect(screen.getByText('Category: hosting')).toBeInTheDocument();
  });

  it('renders product details', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    expect(screen.getByRole('rowheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Owner' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Slack' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Tags' })).toBeInTheDocument();

    expect(screen.getAllByText('Cloud Platform team').length).toBeGreaterThan(0);
    expect(screen.getAllByText('#cloud-platform').length).toBeGreaterThan(0);

    expect(screen.getByText('hosting')).toBeInTheDocument();
    expect(screen.getByText('kubernetes')).toBeInTheDocument();
    expect(screen.getByText('platform')).toBeInTheDocument();
  });

  it('does not render the Slack row when the product has no Slack channel', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'modernisation-platform' }),
      }),
    );

    expect(screen.queryByRole('rowheader', { name: 'Slack' })).not.toBeInTheDocument();
  });

  it('renders a documentation link when the docs source is enabled', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    expect(screen.getByRole('link', { name: 'View documentation' })).toHaveAttribute(
      'href',
      '/docs/cloud-platform/getting-started',
    );
  });

  it('does not render a documentation link when the docs source is disabled', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'disabled-docs-product' }),
      }),
    );

    expect(screen.queryByRole('link', { name: 'View documentation' })).not.toBeInTheDocument();
  });

  it('renders an external service link', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    const link = screen.getByRole('link', { name: 'Visit service' });

    expect(link).toHaveAttribute(
      'href',
      'https://user-guide.cloud-platform.service.justice.gov.uk/',
    );
  });

  it('renders an internal service link', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'modernisation-platform' }),
      }),
    );

    const link = screen.getByRole('link', { name: 'Visit service' });

    expect(link).toHaveAttribute('href', '/products/modernisation-platform');
  });

  it('renders the feedback widget and chat bot', async () => {
    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: 'cloud-platform' }),
      }),
    );

    expect(screen.getByTestId('feedback-widget')).toBeInTheDocument();
  });
});
