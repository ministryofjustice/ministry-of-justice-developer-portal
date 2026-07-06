import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import posthog from 'posthog-js'
import { PostHogPageview } from '@/components/posthog/PostHogPageview'

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
    mockedPosthog.capture.mockClear()
    mockUsePathname.mockReturnValue('/test-page')
    mockUseSearchParams.mockReturnValue({
      toString: () => 'utm_source=unit-test',
    })
    Object.defineProperty(window, 'origin', {
      value: 'http://localhost',
      configurable: true,
    })
  })

  it('captures a pageview when consent is already accepted', async () => {
    document.cookie = 'moj_cookie_consent=accepted'

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

    render(<PostHogPageview />)

    await waitFor(() => {
      expect(mockedPosthog.capture).not.toHaveBeenCalled()
    })
  })

  it('captures a pageview after consent is accepted later', async () => {
    document.cookie = 'moj_cookie_consent=rejected'
    window.__posthog_initialized = true

    render(<PostHogPageview />)

    document.cookie = 'moj_cookie_consent=accepted'
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: 'accepted' }))

    await waitFor(() => {
      expect(mockedPosthog.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: 'http://localhost/test-page?utm_source=unit-test',
      })
    })
  })
})
