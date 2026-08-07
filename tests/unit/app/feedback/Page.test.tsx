import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@tests/unit/mocks/AllMocks';
import posthog from 'posthog-js';
import FeedbackPage from '@/app/feedback/page';

vi.mock('posthog-js', () => ({
    __esModule: true,
    default: {
        capture: vi.fn(),
    }
}));

describe('Feedback page', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
        document.cookie = 'moj_cookie_consent=; path=/; max-age=0';
        delete (window as any).__posthog_initialized;
    });

    it('renders feedback form', () => {
        render(<FeedbackPage />);

        expect(screen.getByText('Feedback')).toBeInTheDocument();
        expect(screen.getByText('Please provide any general feedback you have about this site. Your feedback helps us improve the service.')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeInTheDocument();
    });

    it('renders warning message when PostHog is not configured', () => {
        render(<FeedbackPage />);

        expect(screen.getByText('Feedback is unavailable because PostHog is not configured in this environment.')).toBeInTheDocument();
    });

    it('renders warning message when cookies are not accepted', () => {
        render(<FeedbackPage />);

        expect(screen.getByText('You need to accept analytics cookies before feedback can be submitted.')).toBeInTheDocument();
    });

    it('renders chatbot button', () => {
        render(<FeedbackPage />);

        expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
    });

    it('allows users to submit feedback when cookies are accepted and PostHog is configured', async () => {
        process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
        document.cookie = 'moj_cookie_consent=accepted';

        render(<FeedbackPage />);

        const user = userEvent.setup();
        const feedbackTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
        const feedbackText = 'This is a test feedback message.';

        await user.type(feedbackTextarea, feedbackText);
        expect(screen.getByRole('textbox')).toHaveValue(feedbackText);

        await waitFor(() => {
            expect(submitButton).toBeEnabled();
        });
    });

    it('disables submit button when feedback textarea is empty', () => {
        process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
        document.cookie = 'moj_cookie_consent=accepted';

        render(<FeedbackPage />);

        const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
        expect(submitButton).toBeDisabled();
    });

    it('warning message is not displayed once cookies are accepted', async () => {
        process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
        document.cookie = 'moj_cookie_consent=rejected';

        render(<FeedbackPage />);

        expect(screen.getByText('You need to accept analytics cookies before feedback can be submitted.')).toBeInTheDocument();

        document.cookie = 'moj_cookie_consent=accepted';
        act(() => {
            window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: 'accepted' }));
        });

        await waitFor(() => {
            expect(screen.queryByText('You need to accept analytics cookies before feedback can be submitted.')).not.toBeInTheDocument();
        });
    });

    it('calls posthog API when feedback is submitted', async () => {
        const captureMock = vi.mocked(posthog.capture);

        process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key';
        document.cookie = 'moj_cookie_consent=accepted';
        (window as any).__posthog_initialized = true;

        render(<FeedbackPage />);

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
            $response_text: feedbackText,
            $survey_id: '019fd742-f2ec-0000-8f8d-4c89390a17f5',
            $source: 'feedback-page',
        });
    });
});