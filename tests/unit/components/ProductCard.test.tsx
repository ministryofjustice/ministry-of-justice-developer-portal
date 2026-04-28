import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from '@/components/ProductCard';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ProductCard', () => {
  const baseProps = {
    slug: 'slug',
    name: 'name',
    category: 'category',
    description: 'descriptions',
    tags: [],
  };

  it('renders product name as link', () => {
    render(<ProductCard {...baseProps} status="live" />);

    const link = screen.getByRole('link', {
      name: 'name',
    });

    expect(link).toHaveAttribute('href', '/products/slug');
  });

  it('renders description', () => {
    render(<ProductCard {...baseProps} status="live" />);

    expect(screen.getByText('descriptions')).toBeInTheDocument();
  });

  it('renders category label', () => {
    render(<ProductCard {...baseProps} status="live" />);

    expect(screen.getByText(/category/i)).toBeInTheDocument();
  });

  it('shows beta tag when status is beta', () => {
    render(<ProductCard {...baseProps} status="beta" />);

    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('does not show beta tag for non-beta products', () => {
    render(<ProductCard {...baseProps} status="live" />);

    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });
});
