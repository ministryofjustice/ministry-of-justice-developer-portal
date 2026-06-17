import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReviewBadge } from '@/components/templateRender/ReviewBadge';

describe('ReviewBadge', () => {
  it('renders ok status label and class', () => {
    render(<ReviewBadge status="ok" />);

    const badge = screen.getByText('✓ Up to date');

    expect(badge).toHaveClass('app-review-badge');
    expect(badge).toHaveClass('app-review-badge--ok');
  });

  it('renders warning status label and class', () => {
    render(<ReviewBadge status="warning" />);

    const badge = screen.getByText('⚠ Review soon');

    expect(badge).toHaveClass('app-review-badge');
    expect(badge).toHaveClass('app-review-badge--warning');
  });

  it('renders overdue status label and class', () => {
    render(<ReviewBadge status="overdue" />);

    const badge = screen.getByText('✗ Review overdue');

    expect(badge).toHaveClass('app-review-badge');
    expect(badge).toHaveClass('app-review-badge--overdue');
  });
});