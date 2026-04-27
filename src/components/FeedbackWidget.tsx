'use client';

import { useState } from 'react';

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handleFeedback = (value: 'yes' | 'no') => {
    setFeedback(value);
    // In production, send to analytics backend
    console.log(`Page feedback: ${value}`, { page: typeof window !== 'undefined' ? window.location.pathname : '' });
  };

  return (
    <div className="app-feedback">
      {feedback === null ? (
        <>
          <p className="govuk-body govuk-!-font-weight-bold">Was this page useful?</p>
          <div className="app-feedback__buttons">
            <button
              className="app-feedback__button"
              onClick={() => handleFeedback('yes')}
            >
              Yes
            </button>
            <button
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
          <a className="govuk-link" href="/feedback">
            Tell us more about your experience
          </a>
        </p>
      )}
    </div>
  );
}
