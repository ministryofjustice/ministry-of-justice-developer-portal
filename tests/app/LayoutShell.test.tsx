import { render, screen } from '@testing-library/react';
import '@tests/mocks/AllMocks';
import { LayoutShell } from '@/app/layoutShell';

describe('LayoutShell', () => {
  it('renders layout structure', () => {
    render(
      <LayoutShell>
        <div data-testid="content">Hello</div>
      </LayoutShell>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('phase-banner')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children inside main', () => {
    render(
      <LayoutShell>
        <div data-testid="content">Hello</div>
      </LayoutShell>,
    );

    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('content'));
  });

  it('includes skip link for accessibility', () => {
    render(
      <LayoutShell>
        <div />
      </LayoutShell>,
    );

    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#main-content',
    );
  });

  it('has main landmark with correct id', () => {
    render(
      <LayoutShell>
        <div />
      </LayoutShell>,
    );

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });
});
