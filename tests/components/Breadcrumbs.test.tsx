import type React from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// In component tests where functionality is tested, mock inline.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('Breadcrumbs', () => {
  it('renders Home link', () => {
    render(<Breadcrumbs items={[]} />);

    const home = screen.getByRole('link', { name: 'Home' });

    expect(home).toHaveAttribute('href', '/');
  });

  it('renders linked breadcrumb items', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Docs', href: '/docs' },
          { label: 'Guides', href: '/guides' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');

    expect(screen.getByRole('link', { name: 'Guides' })).toHaveAttribute('href', '/guides');
  });

  it('renders current page breadcrumb as text', () => {
    render(<Breadcrumbs items={[{ label: 'Docs', href: '/docs' }, { label: 'Current page' }]} />);

    const current = screen.getByText('Current page');

    expect(current).toHaveAttribute('aria-current', 'page');

    expect(screen.queryByRole('link', { name: 'Current page' })).not.toBeInTheDocument();
  });

  it('renders correct number of list items including Home', () => {
    render(<Breadcrumbs items={[{ label: 'Docs', href: '/docs' }, { label: 'Current page' }]} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3); // Home + 2 items
  });
});
