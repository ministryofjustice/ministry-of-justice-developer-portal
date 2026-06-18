import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('@/components/MojDesignSystemShowcase', () => ({
  MojDesignSystemShowcase: () => <div data-testid="moj-design-system-showcase" />,
}));

import MojDesignSystemPage, { metadata } from '@/app/products/moj-design-system/system/page';

describe('MojDesignSystemPage', () => {
  it('exports page metadata', () => {
    expect(metadata).toEqual({
      title: 'Ministry of Justice Design System',
    });
  });

  it('renders the page title', () => {
    render(<MojDesignSystemPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Ministry of Justice Design System',
      }),
    ).toBeInTheDocument();
  });

  it('renders the intro text', () => {
    render(<MojDesignSystemPage />);

    expect(
      screen.getByText(/The unified pattern library for enchanted public services/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Every component here has survived a containment breach drill/i),
    ).toBeInTheDocument();
  });

  it('adds the fade target attribute to the intro text', () => {
    render(<MojDesignSystemPage />);

    expect(
      screen.getByText(/The unified pattern library for enchanted public services/i),
    ).toHaveAttribute('data-moj-fade-target', 'intro');
  });

  it('renders the breadcrumbs', () => {
    render(<MojDesignSystemPage />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders the design system showcase', () => {
    render(<MojDesignSystemPage />);

    expect(screen.getByTestId('moj-design-system-showcase')).toBeInTheDocument();
  });
});
