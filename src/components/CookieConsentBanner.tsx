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
        Essential cookies are always used. Analytics cookies are optional and only used if you accept them.
        If accepted, we use PostHog to collect anonymous usage data such as page views, browser/device details, and survey interactions.
        We do not collect personal identity data unless you choose to provide it.
      </p>
      <p className="govuk-body govuk-!-margin-top-2">
        Read our <a href="/cookie-policy" className="govuk-link">cookie policy</a> for more information and to manage your cookie settings.
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
