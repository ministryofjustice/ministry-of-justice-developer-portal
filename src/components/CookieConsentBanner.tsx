'use client'
// This component is client-side only because it uses state and effects to manage cookie consent
import { useEffect, useState } from 'react'
import { getCookieConsent, setCookieConsent, type CookieConsentValue } from '@/lib/cookieConsent'

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsentValue | null | undefined>(undefined)

  useEffect(() => {
    setConsent(getCookieConsent())
  }, [])

  const acceptCookies = () => {
    setCookieConsent('accepted')
    setConsent('accepted')
  }

  const rejectCookies = () => {
    setCookieConsent('rejected')
    setConsent('rejected')
  }

  if (consent === undefined || consent !== null) {
    return null
  }

  return (
    <div
      className="cookie-consent-banner govuk-inset-text"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      data-testid="cookie-consent-banner"
    >
      <p className="govuk-body">
        We use cookies to improve and understand this service.
        Essential cookies are always used. Analytics cookies are optional clicking Accept allows us to gather anonymous usage data to improve the service. You can change your cookie settings at any time.
      </p>
      <div className="cookie-consent-banner__actions">
        <button type="button" className="govuk-button" onClick={acceptCookies}>
          Accept analytics cookies
        </button>
        <button type="button" className="govuk-button govuk-button--secondary" onClick={rejectCookies}>
          Reject analytics cookies
        </button>
      </div>
    </div>
  )
}
