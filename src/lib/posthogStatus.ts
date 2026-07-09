// Improving the safety and re-usability of the posthog integration.
// Single source of truth for "is PostHog actually configured in this environment".
// PostHogProvider, PostHogPageview and PostHogSurvey all need this check 
// consent alone isn't enough, since PostHog is never initialised when the public
// key env var is missing.
export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)
}
