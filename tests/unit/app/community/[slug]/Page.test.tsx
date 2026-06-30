import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('@/../content/community/community.json', () => ({
  default: {
    title: 'Community',
    summary:
      'Connect with the cross-government developer community through Slack, events, blogs, and open source.',
    items: [
      {
        slug: 'developer-slack',
        title: 'Developer Slack',
        category: 'chat',
        description:
          'Join the Ministry of Justice Digital & Technology Slack workspace and the main developer support channels.',
        owner: 'Developer Experience',
        status: 'live',
        tags: ['community', 'slack', 'support'],
        primaryLinks: [],
        sections: [
          {
            heading: 'Key channels',
            body: 'Use the workspace to ask questions, discover what other teams are building, and find the right platform owners more quickly.',
            bullets: [
              '#developers for general engineering discussion',
              '#cloud-platform for platform support',
              '#modernisation-platform for infrastructure questions',
              '#security for secure delivery guidance',
            ],
          },
          {
            heading: 'When to use it',
            bullets: [
              'To ask for early delivery advice',
              'To find service owners and specialist communities',
              'To share useful patterns and learn from other teams',
            ],
          },
        ],
      },
      {
        slug: 'open-source',
        title: 'Open Source',
        category: 'code',
        description:
          'Browse Ministry of Justice open source projects and contribute in the open where appropriate.',
        owner: 'Operations Engineering',
        status: 'live',
        tags: ['github', 'open-source', 'community'],
        primaryLinks: [
          {
            label: 'Browse MoJ repositories',
            href: 'https://github.com/ministryofjustice',
            external: true,
          },
        ],
        sections: [
          {
            heading: 'What you will find',
            body: 'The GitHub organisation includes platform tooling, reusable libraries, service code, and examples of working in the open.',
            bullets: [
              'Reference implementations',
              'Shared engineering tooling',
              'Contribution histories and issue discussions',
            ],
          },
          {
            heading: 'How to use it',
            bullets: [
              'Look for existing patterns before building something new',
              'Open issues or pull requests where contribution is appropriate',
              'Use repository READMEs to understand ownership and setup',
            ],
          },
        ],
      },
      {
        slug: 'events-and-meetups',
        title: 'Events and Meetups',
        category: 'events',
        description:
          'Regular tech talks, show-and-tells, and cross-government meetups for sharing practice.',
        owner: 'Developer Experience',
        status: 'live',
        eventDate: '2026-05-14T13:00:00Z',
        endDate: '2026-05-14T15:00:00Z',
        location: '102 Petty France, London and online',
        isRecurring: true,
        tags: ['events', 'community', 'learning'],
        primaryLinks: [
          {
            label: 'Register interest',
            href: 'https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues',
            external: true,
          },
        ],
        sections: [
          {
            heading: 'What to expect',
            bullets: [
              'Engineering show-and-tells',
              'Platform and architecture talks',
              'Cross-government meetups and networking',
            ],
          },
          {
            heading: 'Why it matters',
            body: 'Events help teams compare approaches, reduce duplicate effort, and build stronger cross-team relationships.',
          },
          {
            heading: 'Attendance',
            bullets: [
              'Open to engineering, design, delivery, and platform teams',
              'Join in person or remotely where available',
              'Share talk ideas and topics with Developer Experience',
            ],
          },
        ],
      },
    ],
  },
}));

vi.mock('@/lib/date', () => ({
  formatEventDateTime: (date: string) => `Formatted ${date}`,
}));

vi.mock('@/lib/categoryLabels', () => ({
  getCommunityCategoryLabel: (category: string) => `Category: ${category}`,
}));

import CommunityDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/community/[slug]/page';

describe('CommunityDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates static params for each community item', () => {
    expect(generateStaticParams()).toEqual([
      { slug: 'developer-slack' },
      { slug: 'open-source' },
      { slug: 'events-and-meetups' },
    ]);
  });

  it('generates metadata for a matching community item', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    ).resolves.toEqual({
      title: 'Developer Slack',
    });
  });

  it('returns empty metadata for a missing community item', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'missing-item' }),
      }),
    ).resolves.toEqual({});
  });

  it('renders the page title and summary', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Developer Slack' })).toBeInTheDocument();

    expect(
      screen.getByText(/Join the Ministry of Justice Digital & Technology Slack workspace/i),
    ).toBeInTheDocument();
  });

  it('renders the breadcrumbs', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders the category tag', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByText('Category: chat')).toBeInTheDocument();
  });

  it('renders the status and owner details', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    const statusHeader = screen.getByRole('rowheader', { name: 'Status' });
    const statusRow = statusHeader.closest('tr');

    expect(statusRow).not.toBeNull();
    expect(within(statusRow as HTMLElement).getByText(/live/i)).toBeInTheDocument();

    const ownerHeader = screen.getByRole('rowheader', { name: 'Owner' });
    const ownerRow = ownerHeader.closest('tr');

    expect(ownerRow).not.toBeNull();
    expect(within(ownerRow as HTMLElement).getByText('Developer Experience')).toBeInTheDocument();
  });

  it('renders tags', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('community')).toBeInTheDocument();
    expect(screen.getByText('slack')).toBeInTheDocument();
    expect(screen.getByText('support')).toBeInTheDocument();
  });

  it('renders sections with body content and bullets', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Key channels' })).toBeInTheDocument();

    expect(screen.getByText(/Use the workspace to ask questions/i)).toBeInTheDocument();

    expect(screen.getByText('#developers for general engineering discussion')).toBeInTheDocument();
    expect(screen.getByText('#cloud-platform for platform support')).toBeInTheDocument();
  });

  it('renders sections without body content', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'When to use it' })).toBeInTheDocument();

    expect(screen.getByText('To ask for early delivery advice')).toBeInTheDocument();
    expect(
      screen.getByText('To find service owners and specialist communities'),
    ).toBeInTheDocument();
  });

  it('renders external action links', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'open-source' }),
      }),
    );

    const link = screen.getByRole('link', {
      name: 'Browse MoJ repositories',
    });

    expect(link).toHaveAttribute('href', 'https://github.com/ministryofjustice');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders event details when present', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'events-and-meetups' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Events and Meetups' })).toBeInTheDocument();

    expect(screen.getByRole('rowheader', { name: 'Starts' })).toBeInTheDocument();
    expect(screen.getByText('formatted-2026-05-14T13:00:00Z')).toBeInTheDocument();

    expect(screen.getByRole('rowheader', { name: 'Ends' })).toBeInTheDocument();
    expect(screen.getByText('formatted-2026-05-14T15:00:00Z')).toBeInTheDocument();

    expect(screen.getByRole('rowheader', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getByText('102 Petty France, London and online')).toBeInTheDocument();
  });

  it('renders recurring schedule details when the item is recurring', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'events-and-meetups' }),
      }),
    );

    const scheduleHeader = screen.getByRole('rowheader', { name: 'Schedule' });
    const scheduleRow = scheduleHeader.closest('tr');

    expect(scheduleHeader).toBeInTheDocument();
    expect(scheduleRow).not.toBeNull();

    expect(within(scheduleRow as HTMLElement).getByText('Recurring series')).toBeInTheDocument();
  });

  it('does not render event-specific table rows when they are not present', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.queryByRole('rowheader', { name: 'Starts' })).not.toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Ends' })).not.toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Location' })).not.toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Schedule' })).not.toBeInTheDocument();

    expect(screen.queryByText('Recurring series')).not.toBeInTheDocument();
  });

  it('renders event sections', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'events-and-meetups' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'What to expect' })).toBeInTheDocument();
    expect(screen.getByText('Engineering show-and-tells')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Why it matters' })).toBeInTheDocument();
    expect(screen.getByText(/Events help teams compare approaches/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Attendance' })).toBeInTheDocument();
    expect(
      screen.getByText('Open to engineering, design, delivery, and platform teams'),
    ).toBeInTheDocument();
  });

  it('renders the feedback widget', async () => {
    render(
      await CommunityDetailPage({
        params: Promise.resolve({ slug: 'developer-slack' }),
      }),
    );

    expect(screen.getByTestId('feedback-widget')).toBeInTheDocument();
  });
});
