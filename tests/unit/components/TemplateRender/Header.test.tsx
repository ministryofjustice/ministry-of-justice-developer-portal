import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from '@/components/templateRender/Header';

describe('Header', () => {
  it('renders the header landmark labelled by the title', () => {
    render(<Header title="Service standard" />);

    const header = screen.getByRole('banner');

    expect(header).toHaveAttribute('aria-labelledby', 'template-header-title');
    expect(screen.getByRole('heading', { name: 'Service standard' })).toHaveAttribute(
      'id',
      'template-header-title',
    );
  });

  it('renders the summary when provided', () => {
    render(<Header title="Service standard" summary="Useful guidance for teams." />);

    expect(screen.getByText('Useful guidance for teams.')).toBeInTheDocument();
  });

  it('renders kicker, category tag and status via TagRow', () => {
    render(
      <Header
        title="Service standard"
        kicker="Guidance"
        categoryTag="Platform"
        status="live"
      />,
    );

    expect(screen.getByText('Guidance')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders owner when provided', () => {
    render(<Header title="Service standard" owner="#cloud-platform" />);

    expect(screen.getByText('Owner:')).toBeInTheDocument();
    expect(screen.getByText('#cloud-platform')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <Header
        title="Service standard"
        actions={<a href="/start">Start now</a>}
      />,
    );

    expect(screen.getByRole('link', { name: 'Start now' })).toHaveAttribute('href', '/start');
  });

  it('does not render owner/actions container when neither owner nor actions are provided', () => {
    const { container } = render(<Header title="Service standard" />);

    expect(container.querySelector('.govuk-\\!-margin-bottom-3')).not.toBeInTheDocument();
  });
});