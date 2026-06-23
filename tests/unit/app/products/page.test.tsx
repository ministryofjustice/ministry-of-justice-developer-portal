import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('@/../content/products/products.json', () => ({
  default: [
    {
      slug: 'cloud-platform',
      name: 'Cloud Platform',
      category: 'platforms',
      description: 'Host services on the Ministry of Justice Cloud Platform.',
      owner: 'Cloud Platform team',
      status: 'live',
      tags: ['hosting', 'kubernetes', 'platform'],
    },
    {
      slug: 'api-catalogue',
      name: 'API Catalogue',
      category: 'apis',
      description: 'Find APIs available across government.',
      owner: 'Developer Experience',
      status: 'live',
      tags: ['api', 'documentation'],
    },
    {
      slug: 'repo-health',
      name: 'Repository Health',
      category: 'tools',
      description: 'Understand repository health and risk.',
      owner: 'Operations Engineering',
      status: 'beta',
      tags: ['github', 'security'],
    },
    {
      slug: 'security-guidance',
      name: 'Security Guidance',
      category: 'security',
      description: 'Security guidance for building services.',
      owner: 'Security team',
      status: 'live',
      tags: ['security', 'standards'],
    },
    {
      slug: 'service-auth',
      name: 'Service Auth',
      category: 'platforms',
      description: 'Excluded product.',
      owner: 'Developer Experience',
      status: 'live',
      tags: ['authentication'],
    },
  ],
}));

vi.mock('@/components/ProductCard', () => ({
  ProductCard: ({ slug, name }: { slug: string; name: string }) => (
    <article data-testid="product-card">
      <h2>{name}</h2>
      <a href={`/products/${slug}`}>{name}</a>
    </article>
  ),
}));

import ProductsPage from '@/app/products/page';

describe('ProductsPage', () => {
  it('renders the page title and summary', () => {
    render(<ProductsPage />);

    expect(screen.getByRole('heading', { name: 'Products & Services' })).toBeInTheDocument();

    expect(
      screen.getByText(/Browse the catalogue of platforms, tools, APIs, and services/i),
    ).toBeInTheDocument();
  });

  it('renders the breadcrumbs', () => {
    render(<ProductsPage />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders visible products and excludes service-auth', () => {
    render(<ProductsPage />);

    expect(screen.getByRole('heading', { name: 'Cloud Platform' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'API Catalogue' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Repository Health' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Security Guidance' })).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Service Auth' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 4 products')).toBeInTheDocument();
  });

  it('renders category filters', () => {
    render(<ProductsPage />);

    expect(screen.getByRole('radio', { name: /All/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Platforms/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /APIs/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Tools/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Security/i })).toBeInTheDocument();
  });

  it('filters products by category', async () => {
    const user = userEvent.setup();

    render(<ProductsPage />);

    await user.click(screen.getByRole('radio', { name: /APIs/i }));

    expect(screen.getByText('Showing 1 product')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'API Catalogue' })).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Cloud Platform' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Repository Health' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Security Guidance' })).not.toBeInTheDocument();
  });

  it('renders tag filters with formatted labels', () => {
    render(<ProductsPage />);

    expect(screen.getByRole('checkbox', { name: /Api/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Documentation/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Github/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Security/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Standards/i })).toBeInTheDocument();
  });

  it('filters products by selected tag', async () => {
    const user = userEvent.setup();

    render(<ProductsPage />);

    await user.click(screen.getByRole('checkbox', { name: /Security/i }));

    expect(screen.getByText('Showing 2 products')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Repository Health' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Security Guidance' })).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Cloud Platform' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'API Catalogue' })).not.toBeInTheDocument();
  });

  it('removes a selected tag when clicked again', async () => {
    const user = userEvent.setup();

    render(<ProductsPage />);

    const securityTag = screen.getByRole('checkbox', { name: /Security/i });

    await user.click(securityTag);

    expect(screen.getByText('Showing 2 products')).toBeInTheDocument();
    expect(securityTag).toBeChecked();

    await user.click(securityTag);

    expect(screen.getByText('Showing 4 products')).toBeInTheDocument();
    expect(securityTag).not.toBeChecked();
  });

  it('combines category and tag filters', async () => {
    const user = userEvent.setup();

    render(<ProductsPage />);

    await user.click(screen.getByRole('radio', { name: /Tools/i }));
    await user.click(screen.getByRole('checkbox', { name: /Security/i }));

    expect(screen.getByText('Showing 1 product')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Repository Health' })).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Security Guidance' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cloud Platform' })).not.toBeInTheDocument();
  });

  it('renders an empty state when no products match the filters', async () => {
    const user = userEvent.setup();

    render(<ProductsPage />);

    await user.click(screen.getByRole('radio', { name: /APIs/i }));
    await user.click(screen.getByRole('checkbox', { name: /Security/i }));

    expect(screen.getByText('Showing 0 products')).toBeInTheDocument();
    expect(screen.getByText('No products found in this category.')).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'API Catalogue' })).not.toBeInTheDocument();
  });

  it('shows and uses the clear filters button', async () => {
    const user = userEvent.setup();

    render(<ProductsPage />);

    await user.click(screen.getByRole('radio', { name: /APIs/i }));
    await user.click(screen.getByRole('checkbox', { name: /Documentation/i }));

    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    expect(screen.getByText('Showing 1 product')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByRole('radio', { name: /All/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Documentation/i })).not.toBeChecked();
    expect(screen.getByText('Showing 4 products')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });
});
