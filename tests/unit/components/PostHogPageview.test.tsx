import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import posthog from 'posthog-js'
import { PostHogPageview } from '@/components/posthog/PostHogPageview'

const INIT_WAIT_INTERVAL_MS = 50
const mockUsePathname = vi.fn()
const mockUseSearchParams = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

vi.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    capture: vi.fn(),
  },
}))

describe('PostHogPageview', () => {
  const mockedPosthog = vi.mocked(posthog, true)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    mockedPosthog.capture.mockClear()
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    mockUsePathname.mockReturnValue('/test-page')
    mockUseSearchParams.mockReturnValue({
      toString: () => 'utm_source=unit-test',
    })
    Object.defineProperty(window, 'origin', {
      value: 'http://localhost',
      configurable: true,
    })
    document.cookie = 'moj_cookie_consent='
    delete (window as any).__posthog_initialized
    delete (window as any).__posthog_pageview_count
    delete (window as any).__posthog_last_pageview
  })

  afterEach(() => {
    vi.useRealTimers()
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    delete (window as any).__posthog_initialized
    delete (window as any).__posthog_pageview_count
    delete (window as any).__posthog_last_pageview
  })

  it('captures a pageview when consent is already accepted', async () => {
    document.cookie = 'moj_cookie_consent=accepted'
    ;(window as any).__posthog_initialized = true

    render(<PostHogPageview />)

    await waitFor(() => {
      expect(mockedPosthog.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: 'http://localhost/test-page?utm_source=unit-test',
      })
    })

    expect((window as any).__posthog_pageview_count).toBe(1)
    expect((window as any).__posthog_last_pageview).toBe(
      'http://localhost/test-page?utm_source=unit-test',
    )
  })

  it('does not capture a pageview when consent is rejected', async () => {
    document.cookie = 'moj_cookie_consent=rejected'
    ;(window as any).__posthog_initialized = true

    render(<PostHogPageview />)

    await waitFor(() => {
      expect(mockedPosthog.capture).not.toHaveBeenCalled()
    })
  })

  it('captures a pageview after consent is accepted later', async () => {
    document.cookie = 'moj_cookie_consent=rejected'
    ;(window as any).__posthog_initialized = true

    render(<PostHogPageview />)

    document.cookie = 'moj_cookie_consent=accepted'
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: 'accepted' }))

    await waitFor(() => {
      expect(mockedPosthog.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: 'http://localhost/test-page?utm_source=unit-test',
      })
    })
  })

  it('captures a pageview after refresh when consent is already accepted but PostHog initializes later', () => {
    vi.useFakeTimers()
    document.cookie = 'moj_cookie_consent=accepted'
    delete (window as any).__posthog_initialized

    render(<PostHogPageview />)

    expect(mockedPosthog.capture).not.toHaveBeenCalled()

    ;(window as any).__posthog_initialized = true

    act(() => {
      vi.advanceTimersByTime(INIT_WAIT_INTERVAL_MS)
    })

    expect(mockedPosthog.capture).toHaveBeenCalledWith('$pageview', {
      $current_url: 'http://localhost/test-page?utm_source=unit-test',
    })
  })

  it('never captures a pageview when the PostHog key is missing, even if consent is accepted', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    document.cookie = 'moj_cookie_consent=accepted'
    ;(window as any).__posthog_initialized = true

    render(<PostHogPageview />)

    await waitFor(() => {
      expect(mockedPosthog.capture).not.toHaveBeenCalled()
    })
  })

  it('gives up retrying (rather than polling forever) if PostHog never finishes initializing', () => {
    vi.useFakeTimers()
    document.cookie = 'moj_cookie_consent=rejected'
    delete (window as any).__posthog_initialized

    render(<PostHogPageview />)

    document.cookie = 'moj_cookie_consent=accepted'
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: 'accepted' }))

    act(() => {
      vi.advanceTimersByTime(50 * 100)
    })

    expect(mockedPosthog.capture).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})