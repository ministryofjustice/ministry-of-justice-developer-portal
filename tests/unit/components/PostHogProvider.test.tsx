import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import posthog from 'posthog-js'
import { PostHogSurvey } from '@/components/posthog/PostHogSurvey'

vi.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    displaySurvey: vi.fn(),
    onSurveysLoaded: vi.fn(),
  },
}))

describe('PostHogSurvey', () => {
  const mockedPosthog = vi.mocked(posthog, true)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    document.cookie = 'moj_cookie_consent=accepted'
    mockedPosthog.onSurveysLoaded.mockImplementation((callback: () => void) => callback())
  })

  afterEach(() => {
    vi.useRealTimers()
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  })

  it('starts the survey workflow when consent is accepted', async () => {
    const displaySurveySpy = vi.spyOn(mockedPosthog, 'displaySurvey')

    render(<PostHogSurvey />)

    expect(mockedPosthog.onSurveysLoaded).toHaveBeenCalled()

    vi.runAllTimers()

    expect(displaySurveySpy).toHaveBeenCalledWith('019f2899-14e8-0000-62d5-a37cff764a99', {
      ignoreConditions: true,
      ignoreDelay: true,
    })
  })

  it('starts the survey workflow after consent is accepted later', async () => {
    document.cookie = 'moj_cookie_consent=rejected'
    mockedPosthog.onSurveysLoaded.mockImplementation((callback: () => void) => callback())
    const displaySurveySpy = vi.spyOn(mockedPosthog, 'displaySurvey')

    render(<PostHogSurvey />)

    document.cookie = 'moj_cookie_consent=accepted'
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: 'accepted' }))

    vi.runAllTimers()

    expect(displaySurveySpy).toHaveBeenCalled()
  })

  it('never starts the survey workflow when the PostHog key is missing', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    document.cookie = 'moj_cookie_consent=accepted'

    render(<PostHogSurvey />)

    vi.runAllTimers()

    expect(mockedPosthog.onSurveysLoaded).not.toHaveBeenCalled()
    expect(mockedPosthog.displaySurvey).not.toHaveBeenCalled()
  })
})
