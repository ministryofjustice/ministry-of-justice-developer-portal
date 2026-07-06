import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
// This test suite verifies the functionality of the CookieConsentBanner component, including rendering, accepting and rejecting analytics cookies, and hiding the banner after user interaction. It ensures that users can manage their cookie consent preferences effectively.
describe('CookieConsentBanner', () => {
  beforeEach(() => {
    document.cookie = 'moj_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('renders a cookie consent banner with actions', () => {
    render(<CookieConsentBanner />)

    expect(screen.getByTestId('cookie-consent-banner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accept analytics cookies/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject analytics cookies/i })).toBeInTheDocument()
  })

  it('accepts analytics cookies and hides the banner', async () => {
    const user = userEvent.setup()
    render(<CookieConsentBanner />)

    await user.click(screen.getByRole('button', { name: /accept analytics cookies/i }))

    expect(document.cookie).toContain('moj_cookie_consent=accepted')
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument()
  })

  it('rejects analytics cookies and hides the banner', async () => {
    const user = userEvent.setup()
    render(<CookieConsentBanner />)

    await user.click(screen.getByRole('button', { name: /reject analytics cookies/i }))

    expect(document.cookie).toContain('moj_cookie_consent=rejected')
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument()
  })
})
