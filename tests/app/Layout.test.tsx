import { render, screen } from '@testing-library/react';
import RootLayout from '../../src/app/layout';

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

describe('RootLayout', () => {
  it('renders layout structure', () => {
    render(
      <RootLayout>
        <div data-testid="content">Hello</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('phase-banner')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children inside main', () => {
    render(
      <RootLayout>
        <div data-testid="content">Hello</div>
      </RootLayout>,
    );

    const main = screen.getByRole('main');

    expect(main).toContainElement(screen.getByTestId('content'));
  });

  it('includes skip link for accessibility', () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    const skipLink = screen.getByText(/skip to main content/i);

    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has main landmark with correct id', () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    const main = screen.getByRole('main');

    expect(main).toHaveAttribute('id', 'main-content');
  });
});
