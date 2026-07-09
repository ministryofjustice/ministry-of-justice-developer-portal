import { FeedbackWidget } from '@/components/FeedbackWidget';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import posthog from 'posthog-js';

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    capture: vi.fn(),
  },
}));

vi.mock('@/lib/posthogStatus', () => ({
  isPostHogConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/cookieConsent', () => ({
  isCookieConsentAccepted: vi.fn(() => true),
}));

describe('FeedbackWidget', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockedPosthog = vi.mocked(posthog, true);

  beforeEach(() => {
    user = userEvent.setup();
    mockedPosthog.capture.mockClear();
    (window as any).__posthog_initialized = true;
  });

  afterEach(() => {
    delete (window as any).__posthog_initialized;
    vi.restoreAllMocks();
  });

  it('asks whether the page was useful', () => {
    render(<FeedbackWidget />);

    expect(screen.getByText('Was this page useful?')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('thanks the user after they click Yes', async () => {
    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(screen.getByText(/Thanks for your feedback/i)).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Tell us more about your experience',
      }),
    ).toHaveAttribute('href', '/feedback');

    expect(mockedPosthog.capture).toHaveBeenCalledWith('page_feedback_submitted', {
      feedback_value: 'yes',
      page_path: window.location.pathname,
    });
  });

  it('thanks the user after they click No', async () => {
    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(screen.getByText(/Thanks for your feedback/i)).toBeInTheDocument();

    expect(mockedPosthog.capture).toHaveBeenCalledWith('page_feedback_submitted', {
      feedback_value: 'no',
      page_path: window.location.pathname,
    });
  });

  it('does not capture feedback when PostHog has not initialized', async () => {
    delete (window as any).__posthog_initialized;

    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(mockedPosthog.capture).not.toHaveBeenCalled();
  });

  it('captures follow-up link clicks for reporting', async () => {
    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(
      screen.getByRole('link', {
        name: 'Tell us more about your experience',
      }),
    );

    expect(mockedPosthog.capture).toHaveBeenCalledWith(
      'page_feedback_follow_up_clicked',
      {
        page_path: window.location.pathname,
        survey_id: '019f472e-a344-0000-cbf6-6eff337d815b',
      },
    );
  });

  it('does not capture follow-up link clicks when PostHog has not initialized', async () => {
    delete (window as any).__posthog_initialized;

    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'No' }));
    await user.click(
      screen.getByRole('link', {
        name: 'Tell us more about your experience',
      }),
    );

    expect(mockedPosthog.capture).not.toHaveBeenCalledWith(
      'page_feedback_follow_up_clicked',
      expect.any(Object),
    );
  });

  it('captures feedback when PostHog initializes after initial render', async () => {
    delete (window as any).__posthog_initialized;

    render(<FeedbackWidget />);

    (window as any).__posthog_initialized = true;
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(mockedPosthog.capture).toHaveBeenCalledWith('page_feedback_submitted', {
      feedback_value: 'yes',
      page_path: window.location.pathname,
    });
  });

  it('captures follow-up click when PostHog initializes after initial render', async () => {
    delete (window as any).__posthog_initialized;

    render(<FeedbackWidget />);

    await user.click(screen.getByRole('button', { name: 'No' }));
    (window as any).__posthog_initialized = true;

    await user.click(
      screen.getByRole('link', {
        name: 'Tell us more about your experience',
      }),
    );

    expect(mockedPosthog.capture).toHaveBeenCalledWith(
      'page_feedback_follow_up_clicked',
      {
        page_path: window.location.pathname,
        survey_id: '019f472e-a344-0000-cbf6-6eff337d815b',
      },
    );
  });
});
