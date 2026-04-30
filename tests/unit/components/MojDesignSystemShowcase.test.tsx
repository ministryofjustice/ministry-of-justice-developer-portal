import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MojDesignSystemShowcase } from '@/components/MojDesignSystemShowcase';

describe('MojDesignSystemShowcase', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the showcase content', () => {
    render(<MojDesignSystemShowcase />);

    expect(
      screen.getByText(/This system is maintained by the Design Standards Office/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Design principles' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Foundations' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Core components' }),
    ).toBeInTheDocument();
  });

  it('renders fade targets used by the decorative animation', () => {
    const { container } = render(<MojDesignSystemShowcase />);

    expect(container.querySelectorAll('[data-moj-fade-target]')).toHaveLength(2);
    expect(container.querySelector('[data-moj-fade-target="disclaimer"]')).toBeInTheDocument();
    expect(container.querySelector('[data-moj-fade-target="principles"]')).toBeInTheDocument();
  });

  it('applies pulse class to a fade target when motion is allowed', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const { container } = render(<MojDesignSystemShowcase />);

    expect(container.querySelector('.moj-fade-pulse')).toBeInTheDocument();

    randomSpy.mockRestore();
  });

  it('does not apply pulse class when reduced motion is enabled', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<MojDesignSystemShowcase />);

    expect(container.querySelector('.moj-fade-pulse')).not.toBeInTheDocument();
  });

  it('clears scheduled timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = render(<MojDesignSystemShowcase />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});