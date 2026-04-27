import { FeedbackWidget } from '@/components/FeedbackWidget';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { afterEach, describe, expect, it, vi } from 'vitest';

//TODO: Refactor when feedback is implemented - current implementation tests are reference only.

describe('FeedbackWidget', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks whether the page was useful', () => {
    render(<FeedbackWidget />);

    expect(screen.getByText('Was this page useful?')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('thanks the user after they click Yes', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(screen.getByText(/Thanks for your feedback/i)).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Tell us more about your experience',
      }),
    ).toHaveAttribute('href', '/feedback');

    expect(consoleSpy).toHaveBeenCalledWith('Page feedback: yes', {
      page: window.location.pathname,
    });
  });

  it('thanks the user after they click No', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(screen.getByText(/Thanks for your feedback/i)).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith('Page feedback: no', {
      page: window.location.pathname,
    });
  });
});
