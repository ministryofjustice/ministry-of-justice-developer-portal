# PostHog Integration

This document describes the current PostHog integration in the Ministry of Justice Developer Portal, where each part lives in the codebase, and what each function or component does.

It is intended as a maintenance reference rather than a change log.

## Integration overview

The portal integrates PostHog in five layers:

1. Runtime configuration
2. Cookie consent gating
3. PostHog client bootstrap
4. Feature-specific event capture
5. Test and traffic-generation support

The integration is deliberately consent-first:

- PostHog is not initialized until analytics cookies are accepted.
- Pageview and pageleave events are sent manually rather than relying on PostHog automatic pageview capture.
- Surveys are only started after consent.
- Error and feedback capture are gated in the UI code.

## File map

### Application bootstrap

- `src/app/layout.tsx`
- `src/app/layoutShell.tsx`

### Runtime config and integration guards

- `src/lib/runtimeConfig.ts`
- `src/lib/posthogStatus.ts`
- `public/runtime-config.template.js`

### Consent management

- `src/lib/cookieConsent.ts`
- `src/components/CookieConsentBanner.tsx`
- `src/components/CookiePreferences.tsx`
- `src/app/cookie-policy/page.tsx`

### PostHog components

- `src/components/posthog/PostHogProvider.tsx`
- `src/components/posthog/PostHogPageview.tsx`
- `src/components/posthog/PostHogSurvey.tsx`

### Other PostHog event capture

- `src/components/FeedbackWidget.tsx`
- `src/components/ErrorBoundary.tsx`

### Verification and diagnostics

- `scripts/generate-posthog-traffic.mjs`
- `tests/unit/components/PostHogPageview.test.tsx`
- `tests/unit/components/PostHogProvider.test.tsx`
- `tests/unit/components/PostHogSurvey.test.tsx`
- `tests/unit/components/FeedbackWidget.test.tsx`
- `tests/unit/components/ErrorBoundary.test.tsx`
- `tests/unit/lib/cookieConsent.test.ts`
- `tests/e2e/site-actions.spec.ts`

## 1. App bootstrap

### `src/app/layout.tsx`

This is the root wiring point for the integration.

It does three important things:

1. Loads `runtime-config.js` into the page.
2. Wraps the app in `PostHogProvider`.
3. Mounts the pageview and survey components inside a `Suspense` boundary.

Current structure:

- `PostHogProvider`
  - makes the PostHog client available to React code
- `PostHogPageview`
  - sends manual `$pageview` and `$pageleave` events
- `PostHogSurvey`
  - runs the inactivity survey workflow
- `ErrorBoundary`
  - captures React render errors with explicit gating

This is the integration entry point for the browser runtime.

### `src/app/layoutShell.tsx`

This file mounts `CookieConsentBanner` near the top of the rendered page shell.

That matters because consent must be available before PostHog is allowed to initialize. The shell ensures the banner appears on first visit regardless of which page a user lands on.

## 2. Runtime configuration

### `public/runtime-config.template.js`

This file defines the browser-side runtime configuration object:

```js
window.__RUNTIME_CONFIG__ = {
  NEXT_PUBLIC_POSTHOG_KEY: '${NEXT_PUBLIC_POSTHOG_KEY}',
  NEXT_PUBLIC_POSTHOG_HOST: '${NEXT_PUBLIC_POSTHOG_HOST}',
};
```

It exists so the deployed environment can inject PostHog settings at container startup rather than requiring a rebuild.

### `src/lib/runtimeConfig.ts`

This module is the source of truth for reading public runtime config.

#### `type PublicRuntimeConfig`

Defines the two PostHog-facing public settings:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

#### `normalize(value)`

Purpose:

- Accepts unknown input.
- Returns a trimmed string when valid.
- Returns `undefined` for empty or non-string values.

This avoids treating blank strings as valid config.

#### `readWindowConfig()`

Purpose:

- Reads `window.__RUNTIME_CONFIG__` in the browser.
- Returns normalized values.
- Returns `{}` during SSR or any non-browser execution.

#### `getPublicRuntimeConfig()`

Purpose:

- Merges runtime config from `window.__RUNTIME_CONFIG__` with build-time `process.env` fallbacks.
- Prefers the runtime-injected values when present.

This function is used by the PostHog integration so all browser-side consumers read config consistently.

### `src/lib/posthogStatus.ts`

This file contains the integration readiness check.

#### `isPostHogConfigured()`

Purpose:

- Returns `true` when `NEXT_PUBLIC_POSTHOG_KEY` is available.
- Returns `false` when PostHog should be treated as unavailable.

Why it exists:

- Consent alone is not enough.
- The app should not attempt to initialize or use PostHog if the public key is missing.

This helper is used by the provider, pageview, survey, and feedback logic.

## 3. Cookie consent layer

### `src/lib/cookieConsent.ts`

This module controls analytics consent state.

#### `type CookieConsentValue = 'accepted' | 'rejected'`

Defines the only two persisted analytics states.

#### `getCookieConsent()`

Purpose:

- Reads the `moj_cookie_consent` cookie.
- Returns `accepted`, `rejected`, or `null`.

Behavior:

- Safe on the server.
- Ignores invalid cookie values.

#### `setCookieConsent(value)`

Purpose:

- Writes the `moj_cookie_consent` cookie for one year.
- Applies `path=/` and `SameSite=Lax`.
- Adds `Secure` when the site is served over HTTPS.
- Dispatches a `cookieConsentChange` custom event.

This event is how already-mounted components react to late acceptance.

#### `isCookieConsentAccepted()`

Purpose:

- Convenience helper returning `true` when the stored value is `accepted`.

#### `isCookieConsentRejected()`

Purpose:

- Convenience helper returning `true` when the stored value is `rejected`.

#### `onCookieConsentChange(callback)`

Purpose:

- Subscribes to the custom `cookieConsentChange` event.
- Calls the supplied callback with the new consent value.
- Returns an unsubscribe function.

This function is the bridge between user choice and PostHog startup.

### `src/components/CookieConsentBanner.tsx`

This is the first-visit consent UI.

#### `CookieConsentBanner()`

Purpose:

- Reads the current consent state after mount.
- Renders nothing if consent is already known.
- Renders accept/reject controls when no decision exists.

Internal actions:

- `acceptCookies()`
  - stores `accepted`
  - updates local UI state
- `rejectCookies()`
  - stores `rejected`
  - updates local UI state

Analytics relevance:

- This component does not call PostHog directly.
- It enables the rest of the integration by setting the consent cookie and firing the consent-change event.

### `src/components/CookiePreferences.tsx`

This is the consent-management UI used on the cookie policy page.

#### `CookiePreferences()`

Purpose:

- Shows the current consent state.
- Lets the user change analytics preference after first visit.
- Displays a confirmation message after saving.

#### `updateConsent(value)`

Purpose:

- Writes the new value via `setCookieConsent()`.
- Updates local UI state.
- Triggers the same integration behavior as the banner because the same consent event fires.

### `src/app/cookie-policy/page.tsx`

This page documents what analytics cookies do and mounts `CookiePreferences` so the user can review or change consent.

It is not a PostHog event source, but it is part of the integration contract because it explains the tracking model and exposes the settings UI.

## 4. PostHog client bootstrap

### `src/components/posthog/PostHogProvider.tsx`

This component initializes the PostHog browser client.

#### `PostHogProvider({ children })`

Purpose:

- Wraps the React tree with `posthog-js/react` provider support.
- Initializes PostHog only when consent is accepted.
- Handles both immediate and delayed consent.

#### Internal state: `initialized`

Purpose:

- Prevents repeated initialization attempts.

#### `initPosthog()`

Purpose:

- Short-circuits cleanly when PostHog is not configured.
- Reads runtime config via `getPublicRuntimeConfig()`.
- Calls `posthog.init()` with the current deployment values.

Current options:

- `api_host: runtimeConfig.NEXT_PUBLIC_POSTHOG_HOST`
- `person_profiles: 'identified_only'`
- `capture_pageview: false`
- `capture_exceptions: false`

Why these options matter:

- `capture_pageview: false`
  - pageviews are emitted manually by `PostHogPageview`
- `capture_exceptions: false`
  - exceptions are captured explicitly in `ErrorBoundary`
- `person_profiles: 'identified_only'`
  - avoids creating person profiles for anonymous visitors by default

#### Runtime flag: `window.__posthog_initialized`

Set after successful `posthog.init()`.

Purpose:

- Gives other components a simple way to check whether PostHog is ready.
- Used by pageview logic, feedback capture, tests, and the traffic generator.

#### Consent-change handling

The provider subscribes with `onCookieConsentChange()` so a user who accepts cookies after page load still gets a PostHog client initialized without a refresh.

## 5. Page analytics

### `src/components/posthog/PostHogPageview.tsx`

This file owns manual pageview and pageleave capture.

#### `PostHogPageview()`

Purpose:

- Watches route and query changes using Next navigation hooks.
- Sends `$pageview` after consent and initialization.
- Sends `$pageleave` during cleanup when the effect is torn down.

#### Constants

- `MAX_INIT_WAIT_ATTEMPTS = 40`
- `INIT_WAIT_INTERVAL_MS = 50`

Purpose:

- Bound the retry loop while waiting for `PostHogProvider` to finish initialization.
- Limit the wait window to roughly two seconds.

#### `currentUrl()`

Purpose:

- Builds the current absolute URL from `window.origin`, pathname, and query string.

#### `capturePageview()`

Purpose:

- Sends `posthog.capture('$pageview', { $current_url: url })`.
- Updates browser-side diagnostics:
  - `window.__posthog_pageview_count`
  - `window.__posthog_last_pageview`

Gates:

- pathname must exist
- consent must be accepted
- `window.__posthog_initialized` must be true

#### `capturePageleave()`

Purpose:

- Sends `posthog.capture('$pageleave', { $current_url: currentUrl() })`.

When it runs:

- On cleanup of the route effect, which means route changes and unmounts.

Gates:

- pathname must exist
- consent must be accepted
- `window.__posthog_initialized` must be true

#### `attemptCapture()`

Purpose:

- Waits for provider initialization when consent is already accepted but PostHog is not yet ready.
- Retries on a short timer.
- Stops after the bounded attempt count.

#### Consent-change handling

If a user accepts analytics after initial render, the component listens for that change and retries pageview capture.

#### Runtime diagnostics used outside this component

- `window.__posthog_initialized`
- `window.__posthog_pageview_count`
- `window.__posthog_last_pageview`

These are used by:

- unit tests
- end-to-end tests
- the traffic generator script

## 6. Survey integration

### `src/components/posthog/PostHogSurvey.tsx`

This file owns the inactivity-driven survey flow.

#### `PostHogSurvey()`

Purpose:

- Starts survey behavior only when PostHog is configured.
- Waits for analytics consent before activating.
- Shows a specific PostHog survey after a period of inactivity.

#### Internal constants

- `SURVEY_ID = '019f2899-14e8-0000-62d5-a37cff764a99'`
- `INACTIVITY_MS = 60 * 1000`

#### `removeListeners()`

Purpose:

- Removes all inactivity-reset event listeners.

#### `resetTimer()`

Purpose:

- Clears the existing timer.
- Starts a fresh inactivity timer unless the survey has already been shown.

#### `showSurvey()`

Purpose:

- Ensures the survey is shown only once.
- Calls:

```ts
posthog.displaySurvey(SURVEY_ID, {
  ignoreConditions: true,
  ignoreDelay: true,
})
```

Meaning:

- The application controls the survey timing itself.
- PostHog’s own built-in survey delay/condition checks are bypassed for this workflow.

#### `addListeners()`

Purpose:

- Registers activity listeners for:
  - `mousemove`
  - `keydown`
  - `mousedown`
  - `touchstart`
  - `scroll`

#### `startSurveyWorkflow()`

Purpose:

- Starts the inactivity tracking logic.
- Uses `posthog.onSurveysLoaded()` when available so the survey runtime is ready before listeners are armed.

#### Consent-change handling

Like the provider and pageview component, this subscribes to `onCookieConsentChange()` so survey behavior starts without a reload if the user accepts later.

## 7. Feedback event capture

### `src/components/FeedbackWidget.tsx`

This component captures explicit feedback interactions.

#### Constants

- `FEEDBACK_EVENT_NAME = 'page_feedback_submitted'`
- `FEEDBACK_FOLLOW_UP_CLICK_EVENT_NAME = 'page_feedback_follow_up_clicked'`
- `FEEDBACK_FOLLOW_UP_SURVEY_ID = '019f472e-a344-0000-cbf6-6eff337d815b'`

#### `FeedbackWidget()`

Purpose:

- Captures whether a page was useful.
- Captures clicks into the follow-up feedback flow.

#### `canUsePostHog()`

Purpose:

- Centralizes the widget’s runtime gating.

Conditions required:

- browser environment
- PostHog configured
- consent accepted
- `window.__posthog_initialized`

#### `handleFeedback(value)`

Purpose:

- Stores the current local feedback choice.
- Emits:

```ts
posthog.capture('page_feedback_submitted', {
  feedback_value: value,
  page_path: pagePath,
})
```

#### `handleFollowUpClick()`

Purpose:

- Emits:

```ts
posthog.capture('page_feedback_follow_up_clicked', {
  page_path: window.location.pathname,
  survey_id: FEEDBACK_FOLLOW_UP_SURVEY_ID,
})
```

This links the follow-up path back to the survey flow in analytics.

## 8. Error capture

### `src/components/ErrorBoundary.tsx`

This is the React error boundary used around the layout shell.

#### `ErrorBoundary`

Purpose:

- Prevents an uncaught render error from breaking the entire visible tree.
- Sends exception data to PostHog when allowed.

#### `getDerivedStateFromError()`

Purpose:

- Switches the component into fallback mode.

#### `componentDidCatch(error, info)`

Purpose:

- Calls:

```ts
posthog.captureException(error, {
  component_stack: info.componentStack,
})
```

Gate:

- only runs when cookie consent is accepted

Note:

- This file currently checks consent but does not call `isPostHogConfigured()` explicitly.
- In practice, it is mounted inside the provider tree, and exception capture is intentionally handled here rather than via automatic `capture_exceptions` in `posthog.init()`.

## 9. Test and diagnostics support

### `scripts/generate-posthog-traffic.mjs`

This script is not part of the production integration, but it exists to validate that the deployed integration is working.

Purpose:

- simulate consented traffic
- generate pageviews
- exercise route navigation
- exercise survey workflows
- inspect PostHog transport behavior

Important implementation details:

- Pre-seeds `moj_cookie_consent=accepted` in the Playwright browser context.
- Waits for `window.__posthog_initialized`.
- Waits for `window.__posthog_pageview_count` changes.
- Tracks PostHog request counts for:
  - flags/decide
  - events
  - recordings
- Supports wire-level debugging of `/e/` requests with:
  - content type
  - content encoding
  - content length
  - first payload bytes in hex

This script is the main operational diagnostic tool for live environments.

### Unit and end-to-end tests

The test suite covers the integration from several angles:

- unit tests for consent helpers
- unit tests for provider, pageview, survey, feedback, and error boundary behavior
- end-to-end tests that verify analytics is blocked before consent and enabled after acceptance

These tests matter because the integration behavior depends on browser-only conditions and on user choice timing.

## 10. Runtime behavior summary

This is the normal control flow in the browser:

1. `layout.tsx` loads `runtime-config.js`.
2. `LayoutShell` renders `CookieConsentBanner`.
3. If consent is rejected or unset:
   - PostHog does not initialize.
   - no pageview events are sent.
   - no survey workflow starts.
4. If consent is accepted:
   - `PostHogProvider` calls `posthog.init()`.
   - `window.__posthog_initialized` is set.
   - `PostHogPageview` sends `$pageview`.
   - later route cleanup sends `$pageleave`.
   - `PostHogSurvey` arms inactivity listeners.
   - feedback and error capture become available.

## 11. Current PostHog events captured by the app

### Automatic by explicit app code

- `$pageview`
- `$pageleave`
- `page_feedback_submitted`
- `page_feedback_follow_up_clicked`

### PostHog API usage beyond `capture()`

- `posthog.init(...)`
- `posthog.displaySurvey(...)`
- `posthog.captureException(...)`
- `posthog.onSurveysLoaded(...)` when available

## 12. Operational notes

- The integration depends on runtime-injected `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
- Manual pageview capture is intentional because consent and initialization timing are controlled by the app.
- Exception capture is manual because `capture_exceptions` is disabled in provider config.
- The traffic generator is reliable for transport-level validation but not a definitive source of truth for event-name parsing on the wire.
- The best source of truth for whether `$pageleave` is arriving in PostHog is the PostHog project itself.

## 13. Quick reference

### Where PostHog is initialized

- `src/components/posthog/PostHogProvider.tsx`

### Where pageview and pageleave are sent

- `src/components/posthog/PostHogPageview.tsx`

### Where surveys are triggered

- `src/components/posthog/PostHogSurvey.tsx`

### Where feedback events are sent

- `src/components/FeedbackWidget.tsx`

### Where exceptions are captured

- `src/components/ErrorBoundary.tsx`

### Where consent is stored and broadcast

- `src/lib/cookieConsent.ts`

### Where PostHog config is read

- `src/lib/runtimeConfig.ts`
- `public/runtime-config.template.js`

### Where live integration diagnostics are run

- `scripts/generate-posthog-traffic.mjs`
</attachment>