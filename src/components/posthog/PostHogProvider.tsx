'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { isCookieConsentAccepted, onCookieConsentChange } from '@/lib/cookieConsent'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initPosthog = () => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_exceptions: true,
      })

      const win = window as any
      win.__posthog_initialized = true
      setInitialized(true)
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