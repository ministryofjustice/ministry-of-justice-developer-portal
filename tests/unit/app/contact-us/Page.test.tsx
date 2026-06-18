import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('@/../content/contact/contacts.json', () => ({
  default: {
    title: 'Contact us',
    summary: 'Get help from the Developer Experience team and related support channels.',
    items: [
      {
        slug: 'developer-experience-slack',
        title: 'Developer Experience Slack',
        description: 'Ask questions about the Developer Portal and developer experience work.',
        href: 'https://mojdt.slack.com/channels/developer-experience',
        linkText: 'Join the Developer Experience Slack channel',
        cssModifier: 'community',
      },
      {
        slug: 'developer-experience-email',
        title: 'Developer Experience email',
        description: 'Email the team for questions that are not suitable for Slack.',
        linkText: 'developer-experience@justice.gov.uk',
        isCopyOnly: true,
        cssModifier: 'support',
      },
      {
        slug: 'github-discussions',
        title: 'GitHub Discussions',
        description: 'Raise questions, ideas, and feedback in the open.',
        href: 'https://github.com/ministryofjustice/ministry-of-justice-developer-portal/discussions',
        linkText: 'Open GitHub Discussions',
      },
    ],
  },
}));

import ContactPage from '@/app/contact-us/page';

describe('ContactPage', () => {
  it('renders the page title and summary', () => {
    render(<ContactPage />);

    expect(screen.getByRole('heading', { name: 'Contact us' })).toBeInTheDocument();

    expect(screen.getByText(/Get help from the Developer Experience team/i)).toBeInTheDocument();
  });

  it('renders the breadcrumbs', () => {
    render(<ContactPage />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders contact option headings and descriptions', () => {
    render(<ContactPage />);

    expect(screen.getByRole('heading', { name: 'Developer Experience Slack' })).toBeInTheDocument();
    expect(screen.getByText(/Ask questions about the Developer Portal/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Developer Experience email' })).toBeInTheDocument();
    expect(
      screen.getByText(/Email the team for questions that are not suitable for Slack/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'GitHub Discussions' })).toBeInTheDocument();
    expect(screen.getByText(/Raise questions, ideas, and feedback/i)).toBeInTheDocument();
  });

  it('renders copy-only contact details without a link', () => {
    render(<ContactPage />);

    const heading = screen.getByRole('heading', {
      name: 'Developer Experience email',
    });

    const section = heading.closest('section');

    expect(section).toBeInTheDocument();

    expect(within(section as HTMLElement).getByText('Email:')).toBeInTheDocument();
    expect(
      within(section as HTMLElement).getByText('developer-experience@justice.gov.uk'),
    ).toBeInTheDocument();

    expect(
      within(section as HTMLElement).queryByRole('link', {
        name: 'developer-experience@justice.gov.uk',
      }),
    ).not.toBeInTheDocument();
  });

  it('applies contact option modifier classes', () => {
    const { container } = render(<ContactPage />);

    expect(container.querySelector('.app-phase-card--community')).toBeInTheDocument();
    expect(container.querySelector('.app-phase-card--support')).toBeInTheDocument();
  });

  it('renders a default card class when no modifier is provided', () => {
    render(<ContactPage />);

    const heading = screen.getByRole('heading', {
      name: 'GitHub Discussions',
    });

    const section = heading.closest('section');

    expect(section).toHaveClass('app-phase-card');
    expect(section).not.toHaveClass('app-phase-card--');
  });

  it('renders visually hidden new tab text for contact options', () => {
    render(<ContactPage />);

    expect(screen.getAllByText('(opens in a new tab)')).toHaveLength(3);
  });
});
