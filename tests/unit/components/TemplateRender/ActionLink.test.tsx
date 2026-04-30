import { ActionLinks } from '@/components/templateRender/ActionLinks';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ActionLinks', () => {
  it('renders nothing when no links', () => {
    const { container } = render(<ActionLinks links={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders using Next Link', () => {
    render(<ActionLinks links={[{ label: 'Start now', href: '/start' }]} />);

    const link = screen.getByRole('link', { name: 'Start now' });

    expect(link).toHaveAttribute('href', '/start');
    expect(link).toHaveClass('govuk-button');
  });

  it('renders first link as the primary button', () => {
    render(
      <ActionLinks
        links={[
          { label: 'Start now', href: '/start' },
          { label: 'Learn more', href: '/learn-more' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Start now' })).toHaveClass('govuk-button');
    expect(screen.getByRole('link', { name: 'Start now' })).not.toHaveClass(
      'govuk-button--secondary',
    );
  });

  it('renders subsequent links as secondary buttons', () => {
    render(
      <ActionLinks
        links={[
          { label: 'Start now', href: '/start' },
          { label: 'Learn more', href: '/learn-more' },
        ]}
      />,
    );

    const secondaryLink = screen.getByRole('link', { name: 'Learn more' });

    expect(secondaryLink).toHaveClass('govuk-button');
    expect(secondaryLink).toHaveClass('govuk-button--secondary');
  });

  it('renders external links with security attributes', () => {
    render(
      <ActionLinks
        links={[
          {
            label: 'External service',
            href: 'https://example.com',
            external: true,
          },
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'External service' });

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add external attributes to internal links', () => {
    render(<ActionLinks links={[{ label: 'Internal page', href: '/internal' }]} />);

    const link = screen.getByRole('link', { name: 'Internal page' });

    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});