'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import { isCookieConsentAccepted } from '@/lib/cookieConsent';
import { isPostHogConfigured } from '@/lib/posthogStatus';

const FEEDBACK_EVENT_NAME = 'page_feedback_submitted';
const FEEDBACK_FOLLOW_UP_CLICK_EVENT_NAME = 'page_feedback_follow_up_clicked';
const FEEDBACK_FOLLOW_UP_SURVEY_ID = '019f472e-a344-0000-cbf6-6eff337d815b';

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const canUsePostHog = () => {
    return (
      typeof window !== 'undefined' &&
      isPostHogConfigured() &&
      isCookieConsentAccepted() &&
      (window as any).__posthog_initialized
    );
  };

  const handleFeedback = (value: 'yes' | 'no') => {
    const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';

    setFeedback(value);

    if (canUsePostHog()) {
      posthog.capture(FEEDBACK_EVENT_NAME, {
        feedback_value: value,
        page_path: pagePath,
      });
    }
  };

  const handleFollowUpClick = () => {
    if (!canUsePostHog()) {
      return;
    }

    posthog.capture(FEEDBACK_FOLLOW_UP_CLICK_EVENT_NAME, {
      page_path: window.location.pathname,
      survey_id: FEEDBACK_FOLLOW_UP_SURVEY_ID,
    });
  };

  return (
    <div className="app-feedback">
      {feedback === null ? (
        <>
          <p className="govuk-body govuk-!-font-weight-bold">Was this page useful?</p>
          <div className="app-feedback__buttons">
            <button
              type="button"
              className="app-feedback__button"
              onClick={() => handleFeedback('yes')}
            >
              Yes
            </button>
            <button
              type="button"
              className="app-feedback__button"
              onClick={() => handleFeedback('no')}
            >
              No
            </button>
          </div>
        </>
      ) : (
        <p className="govuk-body">
          Thanks for your feedback.{' '}
          <a
            className="govuk-link"
            href="/feedback"
            onClick={handleFollowUpClick}
          >
            Tell us more about your experience
          </a>
        </p>
      )}
    </div>
  );
}
