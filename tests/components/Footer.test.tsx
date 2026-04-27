import { Footer } from '@/components/Footer';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Footer', () => {
  it('renders footer landmark', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders Open Government Licence link', () => {
    render(<Footer />);

    const licenceLink = screen.getByRole('link', {
      name: /Open Government Licence v3.0/i,
    });

    expect(licenceLink).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
    );

    expect(licenceLink).toHaveAttribute('rel', 'license');
  });

  it('renders Crown copyright link', () => {
    render(<Footer />);

    const crownLink = screen.getByRole('link', {
      name: /Crown copyright/i,
    });

    expect(crownLink).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/',
    );
  });

  it('renders licence description text', () => {
    render(<Footer />);

    expect(screen.getByText(/All content is available under the/i)).toBeInTheDocument();

    expect(screen.getByText(/except where otherwise stated/i)).toBeInTheDocument();
  });

  it('renders licence svg', () => {
    const { container } = render(<Footer />);

    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
