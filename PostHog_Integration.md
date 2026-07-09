# PostHog Integration

This document describes the files changed for the PostHog integration.

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
  - **Note:** This needs to be made brand-appropriate and consistent across the MoJ estate; this is currently a placeholder.

- `src/app/cookie-policy/page.tsx`
  - New cookie policy page describing the analytics approach.
  - Clearly states that analytics are optional and that PostHog only runs after user consent.
  - Explains what is and is not collected by default.
  - Renders `CookiePreferences` so users can view and change their current choice on the page itself.
  - Note This needs to be made brand-appropriate and consistent across the MoJ estate, this is currently a placeholder.

- `src/components/CookiePreferences.tsx`
  - New component used on the cookie policy page.
  - Shows the user's current consent choice and lets them accept or reject analytics cookies in place,
    using the same `getCookieConsent()` and `setCookieConsent()` helpers as the banner.

### 4. PostHog-specific components

- `src/lib/posthogStatus.ts`
  - New helper: `isPostHogConfigured()`.
  - Acts as the single source of truth for whether `NEXT_PUBLIC_POSTHOG_KEY` is set.
  - Used by `PostHogProvider`, `PostHogPageview`, and `PostHogSurvey` so they all agree on whether PostHog is actually usable,
    rather than each component making its own assumption .

- `src/components/posthog/PostHogProvider.tsx`
  - Wraps the app with PostHog initialization.
  - Initializes PostHog only after analytics consent is accepted.
  - Uses `capture_pageview: false` and `capture_exceptions: true`.
  - Supports delayed acceptance by listening for consent changes.

- `src/components/posthog/PostHogPageview.tsx`
  - Captures pageview events manually after consent.
  - Builds the current URL from `pathname` and search params.
  - Avoids sending analytics if consent has not been granted or if PostHog has no key configured.
  - Retries capture if consent is accepted after the page is already loaded, up to a bounded number of attempts.

- `src/components/posthog/PostHogSurvey.tsx`
  - Displays PostHog surveys only after analytics consent is accepted.
  - Uses a 60-second inactivity timer to trigger the survey workflow.
  - Ensures surveys are not shown without consent or without a configured PostHog key.

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
  - `tests/unit/components/PostHogPageview.test.tsx` includes regression tests for the missing-key case)
  - `tests/unit/components/PostHogProvider.test.tsx`
  - `tests/unit/components/PostHogSurvey.test.tsx` (includes a regression test for the missing-key case)

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
