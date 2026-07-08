'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { isCookieConsentAccepted, onCookieConsentChange } from '@/lib/cookieConsent'
import { isPostHogConfigured } from '@/lib/posthogStatus'
// This component is client-side only because it uses state and effects to manage cookie consent, this captures pageviews and sends them to PostHog when the user has accepted cookies. It also listens for changes in cookie consent and captures a pageview if the user accepts cookies after initially rejecting them.

// Upper bound on how long we'll wait for PostHogProvider to finish init before
// giving up. 50ms * 40 = 2s, which is generous for a client-side posthog.init() call.
const MAX_INIT_WAIT_ATTEMPTS = 40
const INIT_WAIT_INTERVAL_MS = 50

export function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isPostHogConfigured()) return

    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const capturePageview = () => {
      if (!pathname || !isCookieConsentAccepted()) return
      let url = window.origin + pathname
      if (searchParams.toString()) url += `?${searchParams.toString()}`
      posthog.capture('$pageview', { $current_url: url })

      const win = window as any
      win.__posthog_pageview_count = (win.__posthog_pageview_count ?? 0) + 1
      win.__posthog_last_pageview = url
    }

    capturePageview()

    const cleanupConsentListener = onCookieConsentChange((value) => {
      if (value !== 'accepted') return

      let attempts = 0
      const attemptCapture = () => {
        if (cancelled) return
        const win = window as any
        if (win.__posthog_initialized) {
          capturePageview()
          return
        }
        attempts += 1
        if (attempts >= MAX_INIT_WAIT_ATTEMPTS) return
        retryTimer = setTimeout(attemptCapture, INIT_WAIT_INTERVAL_MS)
      }

      attemptCapture()
    })

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      cleanupConsentListener()
    }
  }, [pathname, searchParams])

  return null
}