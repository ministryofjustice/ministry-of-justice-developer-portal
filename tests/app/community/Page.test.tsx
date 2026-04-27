import { render, screen } from '@testing-library/react';
import '@tests/mocks/reusableUiMocks';
import CommunityPage from '@/app/community/page';

vi.mock('@/components/templateRender/Callout', () => ({
  Callout: ({ title, children }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock('@/components/templateRender/PageIntro', () => ({
  PageIntro: ({ title, summary }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{summary}</p>
    </div>
  ),
}));

vi.mock('@/lib/categoryLabels', () => ({
  getCommunityCategoryLabel: (cat: string) => `label-${cat}`,
}));

vi.mock('@/lib/date', () => ({
  formatEventDateTime: (date: string) => `formatted-${date}`,
}));

vi.mock('../../../content/community/community.json', () => ({
  default: {
    title: 'Community Title',
    summary: 'Community Summary',
    items: [
      {
        slug: 'item-1',
        title: 'Item One',
        description: 'Desc one',
        category: 'events',
        eventDate: '2025-01-01',
      },
      {
        slug: 'item-2',
        title: 'Item Two',
        description: 'Desc two',
        category: 'general',
      },
    ],
    supportingSections: [
      {
        title: 'Resources',
        links: [{ href: 'https://example.com', label: 'Example' }],
      },
    ],
    contribution: {
      title: 'Contribute',
      summary: 'Help us out',
      actions: ['Do this', 'Do that'],
    },
  },
}));

describe('CommunityPage', () => {
  it('renders intro content', () => {
    render(<CommunityPage />);

    expect(screen.getByText('Community Title')).toBeInTheDocument();
    expect(screen.getByText('Community Summary')).toBeInTheDocument();
  });

  it('renders community items', () => {
    render(<CommunityPage />);

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('Desc one')).toBeInTheDocument();
  });

  it('renders category labels', () => {
    render(<CommunityPage />);

    expect(screen.getByText('label-events')).toBeInTheDocument();
    expect(screen.getByText('label-general')).toBeInTheDocument();
  });

  it('renders event date when present', () => {
    render(<CommunityPage />);

    expect(screen.getByText(/Next event:/)).toBeInTheDocument();
    expect(screen.getByText('formatted-2025-01-01')).toBeInTheDocument();
  });

  it('does not render event date when absent', () => {
    render(<CommunityPage />);

    const events = screen.getAllByText(/Next event:/);
    expect(events.length).toBe(1);
  });

  it('renders supporting sections and links', () => {
    render(<CommunityPage />);

    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });

  it('renders contribution callout', () => {
    render(<CommunityPage />);

    expect(screen.getByText('Contribute')).toBeInTheDocument();
    expect(screen.getByText('Help us out')).toBeInTheDocument();
    expect(screen.getByText('Do this')).toBeInTheDocument();
  });

  it('renders chatbot and breadcrumbs', () => {
    render(<CommunityPage />);

    expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders correct links', () => {
    render(<CommunityPage />);

    const link = screen.getByRole('link', { name: 'Item One' });

    expect(link).toHaveAttribute('href', '/community/item-1');
  });
});
