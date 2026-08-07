import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@tests/unit/mocks/AllMocks';
import posthog from 'posthog-js';
import FeedbackPage from '@/app/feedback/page';

vi.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    capture: vi.fn(),
  },
}));

describe('Feedback page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback form', () => {
    // when the user is on the feedback page
    render(<FeedbackPage />);

    // then the feedback form is displayed
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please provide any general feedback you have about this site. Your feedback helps us improve the service.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeInTheDocument();
  });

  it('renders warning message when PostHog is not configured', () => {
    // given PostHog is not configured
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    // when the user is on the feedback page
    render(<FeedbackPage />);

    // then the warning message is displayed
    expect(
      screen.getByText(
        'Feedback is unavailable because PostHog is not configured in this environment.',
      ),
    ).toBeInTheDocument();
  });

  it('renders warning message when cookies are not accepted', () => {
    // given cookies are not accepted
    document.cookie = 'moj_cookie_consent=rejected';

    // when the user is on the feedback page
    render(<FeedbackPage />);

    // then the warning message is displayed
    expect(
      screen.getByText('You need to accept analytics cookies before feedback can be submitted.'),
    ).toBeInTheDocument();
  });

  it('renders chatbot button', () => {
    // when the user is on the feedback page
    render(<FeedbackPage />);

    // then the chatbot button is displayed
    expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
  });

  it('allows users to submit feedback when cookies are accepted and PostHog is configured', async () => {
    // given cookies are accepted and PostHog is configured
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';

    render(<FeedbackPage />);

    // when the user types feedback into the textarea
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);

    // then the submit button is enabled
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  it('disables submit button when feedback textarea is empty', () => {
    // given cookies are accepted and PostHog is configured
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';

    render(<FeedbackPage />);

    // when the user has not typed any feedback into the textarea
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(feedbackTextarea).toHaveValue('');

    // then the submit button is disabled
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    expect(submitButton).toBeDisabled();
  });

  it('warning message is removed once cookies are accepted', async () => {
    // given cookies are not accepted and the warning message is displayed
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=rejected';
    render(<FeedbackPage />);
    expect(
      screen.getByText('You need to accept analytics cookies before feedback can be submitted.'),
    ).toBeInTheDocument();

    // when the user accepts cookies
    document.cookie = 'moj_cookie_consent=accepted';
    act(() => {
      window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: 'accepted' }));
    });

    // then the warning message is removed
    await waitFor(() => {
      expect(
        screen.queryByText(
          'You need to accept analytics cookies before feedback can be submitted.',
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('calls posthog API when feedback is submitted', async () => {
    const captureMock = vi.mocked(posthog.capture);

    // given cookies are accepted and PostHog is configured and initialised
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';
    (window as any).__posthog_initialized = true;

    render(<FeedbackPage />);

    // when the user types feedback into the textarea and submits the form
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    // then the posthog API is called with the correct parameters
    expect(captureMock).toHaveBeenCalledWith('survey sent', {
      $survey_response: feedbackText,
      $survey_id: '019fd742-f2ec-0000-8f8d-4c89390a17f5',
      $source: 'feedback-page',
    });
  });

  it('displays error message when feedback is submitted without cookies accepted', async () => {
    const captureMock = vi.mocked(posthog.capture);

    // given cookies are not accepted
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=rejected';

    render(<FeedbackPage />);

    // when the user types feedback into the textarea and submits the form
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);

    submitButton.removeAttribute('disabled');

    await user.click(submitButton);

    // then the error message is displayed and the feedback is not submitted
    expect(
      await screen.findByText('Please accept analytics cookies before submitting feedback.'),
    ).toBeInTheDocument();
    expect(captureMock).not.toHaveBeenCalled();
  });

  it('displays error message when feedback is submitted without PostHog configured', async () => {
    // given PostHog is not configured
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    document.cookie = 'moj_cookie_consent=accepted';

    render(<FeedbackPage />);

    // when the user types feedback into the textarea and submits the form
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);
    submitButton.removeAttribute('disabled');

    await user.click(submitButton);

    // then the error message is displayed
    expect(
      await screen.findByText(
        'Feedback could not be submitted because PostHog is not configured in this environment.',
      ),
    ).toBeInTheDocument();
  });

  it('displays error message when feedback is submitted without PostHog initialized', async () => {
    // given PostHog is configured but not initialised
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';
    (window as any).__posthog_initialized = false;

    render(<FeedbackPage />);

    // when the user types feedback into the textarea and submits the form
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);
    submitButton.removeAttribute('disabled');

    await user.click(submitButton);

    // then the error message is displayed
    expect(
      await screen.findByText('Analytics is still starting. Please try again in a moment.'),
    ).toBeInTheDocument();
  });

  it('displays error message when feedback is submitted without any text', async () => {
    // given cookies are accepted and PostHog is configured and initialised
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';
    (window as any).__posthog_initialized = true;

    render(<FeedbackPage />);

    // when the user submits the form without typing any feedback
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });

    submitButton.removeAttribute('disabled');

    await user.click(submitButton);

    // then the error message is displayed
    expect(await screen.findByText('Please enter feedback before submitting.')).toBeInTheDocument();
  });

  it('resets textarea after successful submission', async () => {
    const captureMock = vi.mocked(posthog.capture);

    // given cookies are accepted and PostHog is configured and initialised
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';
    (window as any).__posthog_initialized = true;

    render(<FeedbackPage />);

    // when the user types feedback into the textarea and submits the form
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    expect(captureMock).toHaveBeenCalledWith('survey sent', {
      $survey_response: feedbackText,
      $survey_id: '019fd742-f2ec-0000-8f8d-4c89390a17f5',
      $source: 'feedback-page',
    });

    // then the textarea is reset to empty
    await waitFor(() => {
      expect(feedbackTextarea).toHaveValue('');
    });
  });

  test('it displays a success message after successful submission', async () => {
    const captureMock = vi.mocked(posthog.capture);

    // given cookies are accepted and PostHog is configured and initialised
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
    document.cookie = 'moj_cookie_consent=accepted';
    (window as any).__posthog_initialized = true;

    render(<FeedbackPage />);

    // when the user types feedback into the textarea and submits the form
    const user = userEvent.setup();
    const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    const feedbackText = 'This is a test feedback message.';

    await user.type(feedbackTextarea, feedbackText);
    expect(screen.getByRole('textbox')).toHaveValue(feedbackText);

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    expect(captureMock).toHaveBeenCalledWith('survey sent', {
      $survey_response: feedbackText,
      $survey_id: '019fd742-f2ec-0000-8f8d-4c89390a17f5',
      $source: 'feedback-page',
    });

    // then the success message is displayed
    await waitFor(() => {
      expect(
        screen.getByText('Thank you for your feedback. It has been submitted.'),
      ).toBeInTheDocument();
    });
  });
});
