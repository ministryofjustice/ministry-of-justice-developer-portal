import { PhaseBanner } from '@/components/PhaseBanner';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PhaseBanner', () => {
  it('renders alpha phase tag', () => {
    render(<PhaseBanner />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('renders service message', () => {
    render(<PhaseBanner />);

    expect(screen.getByText(/This is a new service/i)).toBeInTheDocument();

    expect(screen.getByText(/will help us to improve it/i)).toBeInTheDocument();
  });

  it('renders feedback link', () => {
    render(<PhaseBanner />);

    const link = screen.getByRole('link', {
      name: 'feedback',
    });

    expect(link).toHaveAttribute('href', '/feedback');
  });
});
