import { Header } from '@/components/Header';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Header', () => {
  it('renders branding', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    expect(
      screen.getByRole('link', {
        name: 'Ministry of Justice',
      }),
    ).toHaveAttribute('href', '/');

    expect(
      screen.getByRole('link', {
        name: 'Developer portal',
      }),
    ).toHaveAttribute('href', '/');
  });

  it('renders all navigation links', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');

    expect(screen.getByRole('link', { name: 'Guidelines' })).toHaveAttribute('href', '/guidelines');

    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');

    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community');

    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact-us');
  });

  it('marks active page correctly', () => {
    mockUsePathname.mockReturnValue('/docs/getting-started');

    render(<Header />);

    const docsLink = screen.getByRole('link', {
      name: 'Documentation',
    });

    expect(docsLink).toHaveAttribute('aria-current', 'page');

    expect(docsLink.closest('li')).toHaveClass('govuk-service-navigation__item--active');
  });

  it('does not mark unrelated links active', () => {
    mockUsePathname.mockReturnValue('/docs/getting-started');

    render(<Header />);

    expect(screen.getByRole('link', { name: 'Products' })).not.toHaveAttribute('aria-current');
  });

  it('renders banner landmark and menu nav', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', {
        name: 'Menu',
      }),
    ).toBeInTheDocument();
  });

  it('blurs the navigation link when clicked', async () => {
    const user = userEvent.setup();

    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    const productsLink = screen.getByRole('link', {
      name: 'Products',
    });

    const blurSpy = vi.spyOn(productsLink, 'blur');

    await user.click(productsLink);

    expect(blurSpy).toHaveBeenCalled();
  });
});
