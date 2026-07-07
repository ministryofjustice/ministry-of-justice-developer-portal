# PostHog Integration

This document describes the files changed for the PostHog integration, what was added, and why PostHog is a good fit for this project.

## Summary of changes made

### 1. Dependency and configuration
- Added `posthog-js` to `package.json`.
- Updated `package-lock.json` to include the PostHog package tree.
- PostHog is configured via environment variables:
  - `NEXT_PUBLIC_POSTHOG_KEY`
  - `NEXT_PUBLIC_POSTHOG_HOST`

### 2. Application-level instrumentation
- `src/app/layout.tsx`
  - Added `PostHogProvider` to the app root.
  - Added `PostHogPageview` and `PostHogSurvey` components inside the root layout.
  - Preserved the existing layout shell and error boundary structure.

- `src/app/layoutShell.tsx`
  - Added `CookieConsentBanner` to the page shell to ensure analytics consent is requested before PostHog starts.

### 3. Cookie consent handling
- `src/lib/cookieConsent.ts`
  - New utility module for reading, writing, and listening to cookie consent state.
  - Handles the `moj_cookie_consent` cookie and emits a custom browser event when consent changes.
  - Exposes helpers for consent management:
    - `getCookieConsent()`
    - `setCookieConsent()`
    - `isCookieConsentAccepted()`
    - `isCookieConsentRejected()`
    - `onCookieConsentChange()`

- `src/components/CookieConsentBanner.tsx`
  - New component that displays a banner asking users to accept or reject analytics cookies.
  - Only appears until the user chooses a preference.
  - Explains that analytics are optional and that PostHog is used only after acceptance.
  - *NOTE* This needs to be made brand appropriate, and consistent accross the MoJ estate, this is a placeholder

- `src/app/cookie-policy/page.tsx`
  - New cookie policy page describing the analytics approach.
  - Clearly states that analytics are optional and that PostHog only runs after user consent.
  - Explains what is and is not collected by default (*NOTE* This needs to be made brand appropriate, and consistent accross the MoJ estate, this is a placeholder).

### 4. PostHog-specific components
- `src/components/posthog/PostHogProvider.tsx`
  - Wraps the app with PostHog initialization.
  - Initializes PostHog only after analytics consent is accepted.
  - Uses `capture_pageview: false` and `capture_exceptions: true`.
  - Supports delayed acceptance by listening for consent changes.

- `src/components/posthog/PostHogPageview.tsx`
  - Captures pageview events manually after consent.
  - Builds the current URL from `pathname` and search params.
  - Avoids sending analytics if consent has not been granted.
  - Retries capture if consent is accepted after the page is already loaded.

- `src/components/posthog/PostHogSurvey.tsx`
  - Displays PostHog surveys only after analytics consent is accepted.
  - Uses a 60-second inactivity timer to trigger the survey workflow.
  - Ensures surveys are not shown without consent.

### 5. Error telemetry
- `src/components/ErrorBoundary.tsx`
  - New client-side error boundary component.
  - Captures exceptions in PostHog only when analytics consent is accepted.
  - Keeps error reporting under user control.

### 6. Styling
- `styles/globals.scss`
  - Added styles required for the cookie consent banner and new UI elements.

### 7. Tests
- Added unit tests for consent logic and PostHog components:
  - `tests/unit/lib/cookieConsent.test.ts`
  - `tests/unit/components/CookieConsentBanner.test.tsx`
  - `tests/unit/components/ErrorBoundary.test.tsx`
  - `tests/unit/components/PostHogPageview.test.tsx`
  - `tests/unit/components/PostHogProvider.test.tsx`
  - `tests/unit/components/PostHogSurvey.test.tsx`

- Added end-to-end coverage in `tests/e2e/site-actions.spec.ts`:
  - Verifies the cookie banner appears on first visit.
  - Confirms PostHog is blocked until analytics cookies are accepted.
  - Confirms PostHog initializes and sends a request after acceptance.
  - Confirms rejected consent persists across reload.

### 8. Documentation updates
- `README.md`
  - Updated to mention `PostHog Cloud` as the portal's user tracking solution.
  - Added explicit references to PostHog-related tests.

- `CHANGELOG.md`
  - Included the new integration entry in project release notes.

## Why integrate PostHog into this project?

### Understand how the portal is used
PostHog provides analytics for page views, navigation patterns, and feature interactions. This helps the project team understand which content, products, and documentation paths are most valuable.

### Improve content and navigation decisions
User behavior data allows the team to prioritize portal improvements with evidence instead of guesswork. Pageview and survey data can reveal broken workflows, confusing pages, and content gaps.

### Collect user feedback more effectively
The integration supports in-app surveys. This is useful for gathering direct feedback from developers using the portal, especially when the portal is still evolving.

### Respect privacy and consent requirements
The implementation only initializes PostHog after explicit analytics consent. Consent is managed through a banner and cookie policy page, and analytics are blocked until the user opts in.

### Minimise unwanted data collection
PostHog is configured with `person_profiles: 'identified_only'`, and pageviews are only manually captured after consent. The approach avoids automatic telemetry before consent.

### Support error monitoring
The `ErrorBoundary` component logs exceptions conditionally based on consent. This gives visibility into client-side issues while keeping telemetry aligned with user preferences.

### Keep analytics implementation manageable
The integration is isolated in dedicated components and utilities, reducing coupling with application logic. This makes it easier to maintain, audit, and update the analytics behaviour over time.

## Recommended follow-up
- Ensure environment variables are defined securely for production.
- Confirm the cookie policy wording meets legal and privacy requirements.
- Verify that production deployments do not initialize PostHog without user consent.
