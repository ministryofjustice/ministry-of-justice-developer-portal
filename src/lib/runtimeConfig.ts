type PublicRuntimeConfig = {
  NEXT_PUBLIC_POSTHOG_KEY?: string
  NEXT_PUBLIC_POSTHOG_HOST?: string
}

function normalize(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readWindowConfig(): PublicRuntimeConfig {
  if (typeof window === 'undefined') return {}

  const win = window as Window & {
    __RUNTIME_CONFIG__?: Record<string, unknown>
  }

  return {
    NEXT_PUBLIC_POSTHOG_KEY: normalize(win.__RUNTIME_CONFIG__?.NEXT_PUBLIC_POSTHOG_KEY),
    NEXT_PUBLIC_POSTHOG_HOST: normalize(win.__RUNTIME_CONFIG__?.NEXT_PUBLIC_POSTHOG_HOST),
  }
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  const fromWindow = readWindowConfig()

  return {
    NEXT_PUBLIC_POSTHOG_KEY:
      fromWindow.NEXT_PUBLIC_POSTHOG_KEY ?? normalize(process.env.NEXT_PUBLIC_POSTHOG_KEY),
    NEXT_PUBLIC_POSTHOG_HOST:
      fromWindow.NEXT_PUBLIC_POSTHOG_HOST ?? normalize(process.env.NEXT_PUBLIC_POSTHOG_HOST),
  }
}
