import { render, screen } from '@testing-library/react';
import { LayoutShell } from '@/app/layoutShell';

/*This test is set up to demonstrate how the mocks work in this methodology.
The following mocks override the actual components and give us clear returns to assert against (test-ids).
We are doing this because we don't want to test te chatbot/search widget in this space,
we simply are testing that the rendering is appropriate according to what we expect.
The functionality of the components should be tested at the component level */

vi.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock('@/components/Footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock('@/components/PhaseBanner', () => ({
  PhaseBanner: () => <div data-testid="phase-banner" />,
}));

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
