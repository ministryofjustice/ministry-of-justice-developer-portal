'use client';

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ChatBot } from "@/components/ChatBot";
import { FormEvent, useEffect, useMemo, useState } from 'react';
import posthog from 'posthog-js';
import { isCookieConsentAccepted, onCookieConsentChange } from '@/lib/cookieConsent';
import { isPostHogConfigured } from '@/lib/posthogStatus';

const SURVEY_ID = '019fd742-f2ec-0000-8f8d-4c89390a17f5';

export default function FeedbackPage() {
    const [textAreaValue, setTextareaValue] = useState('');
    const [hasConsent, setHasConsent] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const postHogConfigured = isPostHogConfigured();

    useEffect(() => {
        setHasConsent(isCookieConsentAccepted());

        const cleanup = onCookieConsentChange((value) => {
            setHasConsent(value === 'accepted');
        });

        return cleanup;
    }, []);

    const canSubmit = useMemo(() => {
        return hasConsent && postHogConfigured && textAreaValue.trim().length > 0;
    }, [hasConsent, textAreaValue, postHogConfigured]);

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextareaValue(event.target.value);
        if (errorMessage) {
            setErrorMessage(null);
        }
        if (statusMessage) {
            setStatusMessage(null);
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const feedback = textAreaValue.trim();

        if (!feedback) {
            setErrorMessage('Please enter feedback before submitting.');
            return;
        }

        if (!hasConsent) {
            setErrorMessage('Please accept analytics cookies before submitting feedback.');
            return;
        }

        if (!isPostHogConfigured()) {
            setErrorMessage('Feedback is unavailable because PostHog is not configured in this environment.');
            return;
        }

        const win = window as any;
        if (!win.__posthog_initialized) {
            setErrorMessage('Analytics is still starting. Please try again in a moment.');
            return;
        }

        posthog.capture('survey sent', {
            $survey_id: SURVEY_ID,
            $response_text: feedback,
            $source: 'feedback-page',
        });

        setTextareaValue('');
        setErrorMessage(null);
        setStatusMessage('Thanks for your feedback. It has been submitted.');
    };

    return (
        <div className="govuk-width-container">
            <Breadcrumbs items={[{ label: 'Feedback' }]} />

            <h1 className="govuk-heading-l">Feedback</h1>

            {!hasConsent && (
                <div className="govuk-warning-text" role="status" aria-live="polite">
                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong className="govuk-warning-text__text">
                        <span className="govuk-visually-hidden">Warning</span>
                        You need to accept analytics cookies before feedback can be submitted.
                    </strong>
                </div>
            )}

            {!postHogConfigured && (
                <div className="govuk-warning-text" role="status" aria-live="polite">
                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong className="govuk-warning-text__text">
                        <span className="govuk-visually-hidden">Warning</span>
                        Feedback is unavailable because PostHog is not configured in this environment.
                    </strong>
                </div>
            )}

            <form onSubmit={submit}>
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-label--m" htmlFor="feedback-textarea">
                        Share your feedback
                    </label>
                    <div id="feedback-textarea-hint" className="govuk-hint">
                        Please provide any general feedback you have about this site. Your feedback helps us improve the service.
                    </div>
                    <textarea
                        className="govuk-textarea"
                        id="feedback-textarea"
                        name="feedback"
                        rows={5}
                        aria-describedby="feedback-textarea-hint feedback-textarea-error"
                        value={textAreaValue}
                        onChange={handleTextAreaChange}
                    ></textarea>

                    {errorMessage && (
                        <p id="feedback-textarea-error" className="govuk-error-message" role="alert">
                            <span className="govuk-visually-hidden">Error:</span> {errorMessage}
                        </p>
                    )}

                    {statusMessage && (
                        <p className="govuk-body" role="status" aria-live="polite">
                            {statusMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="govuk-button"
                        data-module="govuk-button"
                        disabled={!canSubmit}
                        aria-disabled={!canSubmit}
                    >
                        Submit feedback
                    </button>
                </div>
            </form>

            <ChatBot />
        </div>
    );
}