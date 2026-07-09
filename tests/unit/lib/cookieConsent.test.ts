import { beforeEach, describe, expect, it } from 'vitest'
import {
  getCookieConsent,
  isCookieConsentAccepted,
  isCookieConsentRejected,
  onCookieConsentChange,
  setCookieConsent,
} from '@/lib/cookieConsent'

describe('cookieConsent helpers', () => {
  beforeEach(() => {
    document.cookie = 'moj_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('returns null when no consent cookie exists', () => {
    expect(getCookieConsent()).toBeNull()
    expect(isCookieConsentAccepted()).toBe(false)
    expect(isCookieConsentRejected()).toBe(false)
  })

  it('reads accepted consent from the cookie', () => {
    document.cookie = 'moj_cookie_consent=accepted'

    expect(getCookieConsent()).toBe('accepted')
    expect(isCookieConsentAccepted()).toBe(true)
    expect(isCookieConsentRejected()).toBe(false)
  })

  it('reads rejected consent from the cookie', () => {
    document.cookie = 'moj_cookie_consent=rejected'

    expect(getCookieConsent()).toBe('rejected')
    expect(isCookieConsentAccepted()).toBe(false)
    expect(isCookieConsentRejected()).toBe(true)
  })

  it('ignores unsupported cookie values', () => {
    document.cookie = 'moj_cookie_consent=maybe'

    expect(getCookieConsent()).toBeNull()
    expect(isCookieConsentAccepted()).toBe(false)
    expect(isCookieConsentRejected()).toBe(false)
  })

  it('sets consent and emits a change event', () => {
    const callback = vi.fn()
    const cleanup = onCookieConsentChange(callback)

    setCookieConsent('accepted')

    expect(document.cookie).toContain('moj_cookie_consent=accepted')
    expect(callback).toHaveBeenCalledWith('accepted')

    cleanup()
  })
})
