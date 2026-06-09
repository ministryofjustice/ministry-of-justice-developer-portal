import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('@/../content/guidelines/guidelines.json', () => ({
  default: {
    title: 'Guidelines',
    summary:
      'Standards and best practices organised by project lifecycle. Follow these guidelines to build services that meet Ministry of Justice and cross-government expectations.',
    sections: [
      {
        key: 'inception',
        title: 'Project Inception',
        description:
          'Starting your project — understanding the problem, assessing feasibility, and planning your approach.',
        modifier: 'inception',
      },
      {
        key: 'development',
        title: 'Development & Iteration',
        description:
          'Building your service — coding standards, security practices, and agile delivery.',
        modifier: 'development',
      },
      {
        key: 'empty-section',
        title: 'Empty section',
        description: 'This section has no guidelines.',
        modifier: 'empty-section',
      },
    ],
    items: [
      {
        slug: 'choosing-hosting',
        title: 'Choosing a hosting platform',
        section: 'inception',
        description:
          'How to decide between Cloud Platform, Modernisation Platform, and other hosting options for your service.',
        owner: 'Cloud Platform team',
        lastReviewedOn: '2026-02-01',
        reviewIn: '6 months',
      },
      {
        slug: 'api-design-standards',
        title: 'API design standards',
        section: 'development',
        description:
          'RESTful API design principles, versioning strategy, error handling, and pagination patterns.',
        owner: 'Technical Architecture',
        lastReviewedOn: '2026-02-15',
        reviewIn: '3 months',
      },
      {
        slug: 'govuk-service-manual',
        title: 'GOV.UK Service Manual',
        section: 'inception',
        description:
          'GDS guidance on researching, designing, building, and running government services.',
        owner: 'GDS',
        lastReviewedOn: '2026-02-27',
        reviewIn: '6 months',
        externalUrl: 'https://www.gov.uk/service-manual',
      },
    ],
  },
}));

import GuidelinesPage from '@/app/guidelines/page';

describe('GuidelinesPage', () => {
  it('renders the page title and summary', () => {
    render(<GuidelinesPage />);

    expect(screen.getByRole('heading', { name: 'Guidelines' })).toBeInTheDocument();

    expect(
      screen.getByText(/Standards and best practices organised by project lifecycle/i),
    ).toBeInTheDocument();
  });

  it('renders sections that have guidelines', () => {
    render(<GuidelinesPage />);

    expect(screen.getByRole('heading', { name: 'Project Inception' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Development & Iteration' })).toBeInTheDocument();
  });

  it('does not render sections that have no guidelines', () => {
    render(<GuidelinesPage />);

    expect(screen.queryByRole('heading', { name: 'Empty section' })).not.toBeInTheDocument();
  });

  it('renders internal guideline links', () => {
    render(<GuidelinesPage />);

    expect(screen.getByRole('link', { name: 'Choosing a hosting platform' })).toHaveAttribute(
      'href',
      '/guidelines/choosing-hosting',
    );

    expect(screen.getByRole('link', { name: 'API design standards' })).toHaveAttribute(
      'href',
      '/guidelines/api-design-standards',
    );
  });

  it('renders external guideline links', () => {
    render(<GuidelinesPage />);

    const link = screen.getByRole('link', {
      name: /GOV\.UK Service Manual/i,
    });

    expect(link).toHaveAttribute('href', 'https://www.gov.uk/service-manual');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders guideline descriptions', () => {
    render(<GuidelinesPage />);

    expect(screen.getByText(/How to decide between Cloud Platform/i)).toBeInTheDocument();

    expect(screen.getByText(/RESTful API design principles/i)).toBeInTheDocument();
  });

  it('applies section modifier classes', () => {
    const { container } = render(<GuidelinesPage />);

    expect(container.querySelector('.app-phase-card--inception')).toBeInTheDocument();

    expect(container.querySelector('.app-phase-card--development')).toBeInTheDocument();
  });

  it('renders the breadcrumbs', () => {
    render(<GuidelinesPage />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });
});
