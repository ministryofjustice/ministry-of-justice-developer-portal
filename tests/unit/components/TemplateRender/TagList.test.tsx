import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TagList } from '@/components/templateRender/TagList';

describe('TagList', () => {
  it('renders nothing when tags array is empty', () => {
    const { container } = render(<TagList tags={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a single tag', () => {
    render(<TagList tags={['Accessibility']} />);

    const tag = screen.getByText('Accessibility');

    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass('govuk-tag');
    expect(tag).toHaveClass('govuk-tag--grey');
  });

  it('renders multiple tags', () => {
    render(
      <TagList
        tags={[
          'Accessibility',
          'Security',
          'Performance',
        ]}
      />,
    );

    expect(screen.getByText('Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();

    expect(
      screen.getAllByText(/Accessibility|Security|Performance/),
    ).toHaveLength(3);
  });

  it('renders each tag as a strong element', () => {
    const { container } = render(
      <TagList tags={['Accessibility', 'Security']} />,
    );

    expect(
      container.querySelectorAll('strong'),
    ).toHaveLength(2);
  });
});