import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from '@/components/templateRender/Section';

describe('Section', () => {
  it('renders section heading and content', () => {
    render(
      <Section heading="Overview">
        <p>Some section content</p>
      </Section>,
    );

    expect(
      screen.getByRole('heading', { name: 'Overview' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Some section content'),
    ).toBeInTheDocument();
  });

  it('renders section with aria-label from heading', () => {
    render(
      <Section heading="Overview">
        Content
      </Section>,
    );

    expect(
      screen.getByLabelText('Overview'),
    ).toBeInTheDocument();
  });

  it('uses default section class', () => {
    const { container } = render(
      <Section heading="Overview">
        Content
      </Section>,
    );

    expect(container.querySelector('section')).toHaveClass(
      'govuk-!-margin-bottom-6',
    );
  });

  it('uses default content class', () => {
    const { container } = render(
      <Section heading="Overview">
        Content
      </Section>,
    );

    expect(
      container.querySelector('.app-prose-scope'),
    ).toBeInTheDocument();
  });

  it('uses custom section class when provided', () => {
    const { container } = render(
      <Section
        heading="Overview"
        className="custom-section"
      >
        Content
      </Section>,
    );

    expect(
      container.querySelector('section'),
    ).toHaveClass('custom-section');
  });

  it('uses custom content class when provided', () => {
    const { container } = render(
      <Section
        heading="Overview"
        contentClassName="custom-content"
      >
        Content
      </Section>,
    );

    expect(
      container.querySelector('.custom-content'),
    ).toBeInTheDocument();
  });
});