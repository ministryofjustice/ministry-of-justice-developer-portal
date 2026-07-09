'use client'

import { useEffect, useState } from 'react'
import { getCookieConsent, setCookieConsent, type CookieConsentValue } from '@/lib/cookieConsent'

export function CookiePreferences() {
  const [consent, setConsent] = useState<CookieConsentValue | null | undefined>(undefined)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConsent(getCookieConsent())
  }, [])

  const updateConsent = (value: CookieConsentValue) => {
    setCookieConsent(value)
    setConsent(value)
    setSaved(true)
  }

  if (consent === undefined) {
    return null
  }

  const currentLabel = consent === 'accepted' ? 'You are currently accepting analytics cookies.'
    : consent === 'rejected' ? 'You are currently rejecting analytics cookies.'
    : 'You have not yet made a choice about analytics cookies.'

  return (
    <div data-testid="cookie-preferences" className="govuk-!-margin-top-4 govuk-!-margin-bottom-6">
      <p className="govuk-body" role="status">{currentLabel}</p>
      <div className="cookie-consent-banner__actions">
        <button
          type="button"
          className="govuk-button"
          onClick={() => updateConsent('accepted')}
        >
          Accept analytics cookies
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={() => updateConsent('rejected')}
        >
          Reject analytics cookies
        </button>
      </div>
      {saved && (
        <p className="govuk-body" role="status">Your cookie settings have been saved.</p>
      )}
    </div>
  )
}
