import { Callout } from '@/components/templateRender/Callout';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Callout', () => {
  it('renders info callout by default', () => {
    render(
      <Callout>
        Helpful information
      </Callout>,
    );

    expect(screen.getByText('Helpful information')).toBeInTheDocument();
    expect(
      document.querySelector('.govuk-inset-text'),
    ).toBeInTheDocument();
  });

  it('renders info callout title when provided', () => {
    render(
      <Callout title="Did you know">
        Helpful information
      </Callout>,
    );

    expect(
      screen.getByRole('heading', { name: 'Did you know' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Helpful information')).toBeInTheDocument();
  });

  it('does not render heading when info callout has no title', () => {
    render(
      <Callout>
        Helpful information
      </Callout>,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders warning callout', () => {
    render(
      <Callout tone="warning">
        Important warning text
      </Callout>,
    );

    expect(
      document.querySelector('.govuk-warning-text'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Important warning text'),
    ).toBeInTheDocument();
  });

  it('renders warning title inline when provided', () => {
    render(
      <Callout tone="warning" title="Check this">
        before continuing
      </Callout>,
    );

    expect(
      screen.getByText(/Check this before continuing/i),
    ).toBeInTheDocument();
  });

  it('renders assistive warning text for screen readers', () => {
    render(
      <Callout tone="warning">
        Warning content
      </Callout>,
    );

    expect(
      screen.getByText('Warning'),
    ).toHaveClass('govuk-warning-text__assistive');
  });

  it('renders warning icon', () => {
    render(
      <Callout tone="warning">
        Warning content
      </Callout>,
    );

    expect(
      screen.getByText('!'),
    ).toHaveAttribute('aria-hidden', 'true');
  });
});