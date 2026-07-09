'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { isCookieConsentAccepted, onCookieConsentChange } from '@/lib/cookieConsent'
import { isPostHogConfigured } from '@/lib/posthogStatus'
import { getPublicRuntimeConfig } from '@/lib/runtimeConfig'
// This component is client-side only because it uses state and effects to manage cookie consent, this initializes PostHog when the user has accepted cookies. It also listens for changes in cookie consent and initializes PostHog if the user accepts cookies after initially rejecting them.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initPosthog = () => {
      if (!isPostHogConfigured()) {
        setInitialized(true)
        return
      }

      const runtimeConfig = getPublicRuntimeConfig()
      const posthogKey = runtimeConfig.NEXT_PUBLIC_POSTHOG_KEY

      if (!posthogKey) {
        setInitialized(true)
        return
      }

      try {
        posthog.init(posthogKey, {
          api_host: runtimeConfig.NEXT_PUBLIC_POSTHOG_HOST,
          person_profiles: 'identified_only',
          capture_pageview: false,
          capture_exceptions: false,
        })

        const win = window as any
        win.__posthog_initialized = true
      } catch (error) {
        console.warn('PostHog failed to initialize; continuing without analytics.', error)
      } finally {
        setInitialized(true)
      }
    }

    if (isCookieConsentAccepted() && !initialized) {
      initPosthog()
    }

    const cleanup = onCookieConsentChange((value) => {
      if (value === 'accepted' && !initialized) {
        initPosthog()
      }
    })

    return cleanup
  }, [initialized])

  return <PHProvider client={posthog}>{children}</PHProvider>
}