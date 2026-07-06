'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { isCookieConsentAccepted, onCookieConsentChange } from '@/lib/cookieConsent'

export function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
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

    const cleanup = onCookieConsentChange((value) => {
      if (value === 'accepted') {
        const attemptCapture = () => {
          const win = window as any
          if (win.__posthog_initialized) {
            capturePageview()
          } else {
            setTimeout(attemptCapture, 50)
          }
        }

        attemptCapture()
      }
    })

    return cleanup
  }, [pathname, searchParams])

  return null
}