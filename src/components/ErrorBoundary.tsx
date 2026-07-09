'use client'
{/* This component is client-side only because it uses state and effects to manage cookie consent */}
import { Component, type ReactNode } from 'react'
import posthog from 'posthog-js'
import { isCookieConsentAccepted } from '@/lib/cookieConsent'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !== 'undefined' && isCookieConsentAccepted()) {
      posthog.captureException(error, {
        component_stack: info.componentStack,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Something went wrong.</p>
    }
    return this.props.children
  }
}