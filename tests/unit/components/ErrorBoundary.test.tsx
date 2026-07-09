import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import posthog from 'posthog-js'
import * as cookieConsent from '@/lib/cookieConsent'
import { ErrorBoundary } from '@/components/ErrorBoundary'

vi.mock('posthog-js', () => ({
  default: {
    captureException: vi.fn(),
  },
}))

vi.mock('@/lib/cookieConsent', () => ({
  isCookieConsentAccepted: vi.fn(),
}))

describe('ErrorBoundary', () => {
  const mockedConsent = vi.mocked(cookieConsent, true)
  const mockedPosthog = vi.mocked(posthog, true)

  const Bomb = () => {
    throw new Error('boom')
  }

  it('captures the error when consent is accepted', () => {
    mockedConsent.isCookieConsentAccepted.mockReturnValue(true)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(mockedPosthog.captureException).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('does not capture the error when consent is rejected', () => {
    mockedConsent.isCookieConsentAccepted.mockReturnValue(false)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(mockedPosthog.captureException).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
