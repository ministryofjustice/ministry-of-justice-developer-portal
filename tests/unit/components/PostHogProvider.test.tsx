import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import posthog from 'posthog-js'
import * as cookieConsent from '@/lib/cookieConsent'
import { PostHogProvider } from '@/components/posthog/PostHogProvider'

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
  },
}))

vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/lib/cookieConsent', () => ({
  isCookieConsentAccepted: vi.fn(),
  onCookieConsentChange: vi.fn(() => () => undefined),
}))

describe('PostHogProvider', () => {
  const mockedCookieConsent = vi.mocked(cookieConsent, true)
  const mockedPosthog = vi.mocked(posthog, true)

  beforeEach(() => {
    vi.clearAllMocks()
    delete (window as any).__posthog_initialized
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://posthog.test'
  })

  it('initializes PostHog when consent is already accepted', async () => {
    mockedCookieConsent.isCookieConsentAccepted.mockReturnValue(true)

    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    )

    await waitFor(() => {
      expect(mockedPosthog.init).toHaveBeenCalledWith('test-key', {
        api_host: 'https://posthog.test',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_exceptions: true,
      })
    })

    expect((window as any).__posthog_initialized).toBe(true)
  })

  it('does not initialize PostHog when consent is not accepted', async () => {
    mockedCookieConsent.isCookieConsentAccepted.mockReturnValue(false)

    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    )

    await waitFor(() => {
      expect(mockedPosthog.init).not.toHaveBeenCalled()
    })

    expect((window as any).__posthog_initialized).not.toBe(true)
  })

  it('skips initialization when the PostHog token is missing', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    mockedCookieConsent.isCookieConsentAccepted.mockReturnValue(true)

    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    )

    await waitFor(() => {
      expect(mockedPosthog.init).not.toHaveBeenCalled()
    })

    expect((window as any).__posthog_initialized).not.toBe(true)
  })
})
