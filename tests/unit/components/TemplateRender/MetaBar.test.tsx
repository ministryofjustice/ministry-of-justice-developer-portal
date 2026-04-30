import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetaBar } from '@/components/templateRender/MetaBar';

describe('MetaBar', () => {
  it('renders visible meta items', () => {
    render(
      <MetaBar
        items={[
          { label: 'Owner', value: '#team' },
          { label: 'Status', value: 'Live' },
        ]}
      />,
    );

    expect(screen.getByText('Owner:')).toBeInTheDocument();
    expect(screen.getByText('#team')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('does not render items with null, undefined or false values', () => {
    render(
      <MetaBar
        items={[
          { label: 'Owner', value: null },
          { label: 'Date', value: undefined },
          { label: 'Published', value: false },
          { label: 'Status', value: 'Live' },
        ]}
      />,
    );

    expect(screen.queryByText('Owner:')).not.toBeInTheDocument();
    expect(screen.queryByText('Date:')).not.toBeInTheDocument();
    expect(screen.queryByText('Published:')).not.toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
  });

  it('renders nothing when no items are visible', () => {
    const { container } = render(
      <MetaBar
        items={[
          { label: 'Owner', value: null },
          { label: 'Date', value: undefined },
          { label: 'Published', value: false },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('uses default className', () => {
    const { container } = render(<MetaBar items={[{ label: 'Owner', value: '#team' }]} />);

    expect(container.firstChild).toHaveClass('app-doc-meta');
  });

  it('uses custom className when provided', () => {
    const { container } = render(
      <MetaBar className="custom-meta" items={[{ label: 'Owner', value: '#team' }]} />,
    );

    expect(container.firstChild).toHaveClass('custom-meta');
  });

  it('renders React node values', () => {
    render(<MetaBar items={[{ label: 'Source', value: <a href="/source">View source</a> }]} />);

    expect(screen.getByRole('link', { name: 'View source' })).toHaveAttribute('href', '/source');
  });
});