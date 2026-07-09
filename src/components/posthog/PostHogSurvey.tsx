'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { isCookieConsentAccepted, onCookieConsentChange } from '@/lib/cookieConsent'
import { isPostHogConfigured } from '@/lib/posthogStatus'
// This component is client-side only because it uses state and effects to manage cookie consent, this displays a PostHog survey after a period of user inactivity when the user has accepted cookies. It also listens for changes in cookie consent and starts the survey workflow if the user accepts cookies after initially rejecting them.
export function PostHogSurvey() {
  useEffect(() => {
    if (!isPostHogConfigured()) return

    const SURVEY_ID = '019f2899-14e8-0000-62d5-a37cff764a99'
    const INACTIVITY_MS = 60 * 1000
    const eventListenerOptions: AddEventListenerOptions = { passive: true }
    let timer: ReturnType<typeof setTimeout> | null = null
    let surveyShown = false

    const removeListeners = () => {
      if (typeof window === 'undefined') return
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer, eventListenerOptions)
      })
    }

    const resetTimer = () => {
      if (surveyShown) return
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(showSurvey, INACTIVITY_MS)
    }

    const showSurvey = () => {
      if (surveyShown) return
      surveyShown = true
      removeListeners()
      posthog.displaySurvey(SURVEY_ID, {
        ignoreConditions: true,
        ignoreDelay: true,
      } as any)
    }

    const addListeners = () => {
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']
      events.forEach((event) => {
        window.addEventListener(event, resetTimer, eventListenerOptions)
      })
    }

    const startSurveyWorkflow = () => {
      if (typeof window === 'undefined') return
      const posthogAny = posthog as any

      if (typeof posthogAny.onSurveysLoaded === 'function') {
        posthogAny.onSurveysLoaded(() => {
          addListeners()
          resetTimer()
        })
      } else {
        addListeners()
        resetTimer()
      }
    }

    if (isCookieConsentAccepted()) {
      startSurveyWorkflow()
    }

    const cleanupConsentListener = onCookieConsentChange((value) => {
      if (value === 'accepted') {
        startSurveyWorkflow()
      }
    })

    return () => {
      cleanupConsentListener()
      removeListeners()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  return null
}
