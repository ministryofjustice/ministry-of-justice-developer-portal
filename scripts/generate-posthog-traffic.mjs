#!/usr/bin/env node
/**
 * scripts/generate-posthog-traffic.mjs
 *
 * Drives a headless (or headed) browser through the deployed Developer Portal
 * to generate real, consented PostHog traffic — pageviews, and occasionally
 * the inactivity survey — so there's data to look at in the PostHog project.
 *
 * Usage:
 *   node scripts/generate-posthog-traffic.mjs --url https://your-env.example.com [options]
 *
 * Options:
 *   --url <url>              Base URL to generate traffic against (required)
 *   --sessions <n>           Total number of simulated visitors (default: 10)
 *   --concurrency <n>        How many sessions run at once (default: 3)
 *   --min-pages <n>          Fewest pages a visitor looks at (default: 3)
 *   --max-pages <n>          Most pages a visitor looks at (default: 7)
 *   --min-dwell-ms <n>       Shortest pause between pages, ms (default: 2000)
 *   --max-dwell-ms <n>       Longest pause between pages, ms (default: 6000)
 *   --survey-chance <0..1>   Chance a session goes idle to trigger the
 *                            60s-inactivity survey (default: 0.15)
 *   --min-idle-ms <n>        Minimum idle duration for inactivity survey,
 *                            in ms (default: 60000)
 *   --max-idle-ms <n>        Maximum idle duration for inactivity survey,
 *                            in ms (default: 90000)
 *   --feedback-prefix <txt>  Prefix for automated survey feedback text
 *                            (default: "Automated test script feedback")
 *   --flush-ms <n>           Extra wait before closing each session so queued
 *                            analytics can be sent (default: 2000)
 *   --headed                 Show the browser (default: headless)
 *   --no-stealth             Disable automation-mitigation tweaks (enabled by
 *                            default)
 *   --dry-run                Print the planned sessions without launching a
 *                            browser or making any requests
 *   --help                   Show this help
 *
 * Examples:
 *   node scripts/generate-posthog-traffic.mjs --url https://dev.developer-portal.example --sessions 20 --concurrency 5
 *   node scripts/generate-posthog-traffic.mjs --url https://dev.developer-portal.example --dry-run
 *
 * Prerequisite: Playwright browsers must be installed once per machine:
 *   npx playwright install chromium
 */

import { chromium } from '@playwright/test'

// ---------------------------------------------------------------------------
// CLI parsing (no extra dependencies, matches the rest of this project)
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {
    url: process.env.TRAFFIC_TARGET_URL ?? null,
    sessions: 10,
    concurrency: 3,
    minPages: 3,
    maxPages: 7,
    minDwellMs: 2000,
    maxDwellMs: 6000,
    surveyChance: 0.15,
    minIdleMs: 60_000,
    maxIdleMs: 90_000,
    feedbackPrefix: 'Automated test script feedback',
    flushMs: 2000,
    headless: true,
    stealth: true,
    dryRun: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[++i]
    switch (arg) {
      case '--url': args.url = next(); break
      case '--sessions': args.sessions = Number(next()); break
      case '--concurrency': args.concurrency = Number(next()); break
      case '--min-pages': args.minPages = Number(next()); break
      case '--max-pages': args.maxPages = Number(next()); break
      case '--min-dwell-ms': args.minDwellMs = Number(next()); break
      case '--max-dwell-ms': args.maxDwellMs = Number(next()); break
      case '--survey-chance': args.surveyChance = Number(next()); break
      case '--min-idle-ms': args.minIdleMs = Number(next()); break
      case '--max-idle-ms': args.maxIdleMs = Number(next()); break
      case '--feedback-prefix': args.feedbackPrefix = next(); break
      case '--flush-ms': args.flushMs = Number(next()); break
      case '--headed': args.headless = false; break
      case '--no-stealth': args.stealth = false; break
      case '--dry-run': args.dryRun = true; break
      case '--help': args.help = true; break
      default:
        console.warn(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function printHelp() {
  console.log(`
Generate real PostHog traffic against a deployed Developer Portal environment.

Usage:
  node scripts/generate-posthog-traffic.mjs --url <url> [options]

Options:
  --url <url>              Base URL to generate traffic against (required)
  --sessions <n>           Total number of simulated visitors (default: 10)
  --concurrency <n>        How many sessions run at once (default: 3)
  --min-pages <n>          Fewest pages a visitor looks at (default: 3)
  --max-pages <n>          Most pages a visitor looks at (default: 7)
  --min-dwell-ms <n>       Shortest pause between pages, ms (default: 2000)
  --max-dwell-ms <n>       Longest pause between pages, ms (default: 6000)
  --survey-chance <0..1>   Per-page chance to go idle and trigger inactivity survey (default: 0.15)
  --min-idle-ms <n>        Minimum idle duration for inactivity survey, in ms (default: 60000)
  --max-idle-ms <n>        Maximum idle duration for inactivity survey, in ms (default: 90000)
  --feedback-prefix <txt>  Prefix for automated survey feedback text (default: "Automated test script feedback")
  --flush-ms <n>           Extra wait before closing each session to flush analytics (default: 2000)
  --headed                 Show the browser instead of running headless
  --no-stealth             Disable automation-mitigation tweaks (enabled by default)
  --dry-run                Print the planned sessions, make no requests
  --help                   Show this help
`)
}

// ---------------------------------------------------------------------------
// Site model — kept in sync with tests/e2e/site-actions.spec.ts
// ---------------------------------------------------------------------------

const ROUTES = [
  '/',
  '/products',
  '/guidelines',
  '/docs',
  '/community',
  '/contact-us',
  '/cookie-policy',
]

const SURVEY_MIN_INACTIVITY_MS = 60_000

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(list) {
  return list[randomInt(0, list.length - 1)]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sleepWithSurveySuppression(page, totalMs, intervalMs = 500) {
  let dismissedCount = 0
  let elapsedMs = 0

  while (elapsedMs < totalMs) {
    const chunkMs = Math.min(intervalMs, totalMs - elapsedMs)
    await sleep(chunkMs)
    elapsedMs += chunkMs

    if (await dismissUnwantedFeedbackSurvey(page)) {
      dismissedCount += 1
    }
  }

  return dismissedCount
}

async function waitForPageviewCount(page, minimumCount, timeoutMs) {
  await page.waitForFunction(
    (expected) => {
      const win = window
      return (win.__posthog_pageview_count ?? 0) >= expected
    },
    minimumCount,
    { timeout: timeoutMs },
  )
}

const HELP_SURVEY_TITLE_PATTERN = /Do you need help with anything on this page\??/i
const UNWANTED_SURVEY_TITLE_PATTERN = /Thanks for your feedback, let us know/i

function buildAutomatedFeedbackMessage(sessionIndex, feedbackPrefix) {
  const timestamp = new Date().toISOString()
  const prefix = typeof feedbackPrefix === 'string' && feedbackPrefix.trim().length > 0
    ? feedbackPrefix.trim()
    : 'Automated test script feedback'
  return `${prefix} | ${timestamp} | session ${sessionIndex + 1}`
}

async function maybeSubmitFeedbackPopup(page, sessionIndex, feedbackPrefix) {
  const surveyContexts = [page, ...page.frames()]
  let surveyContext = null
  let surveyTitleLocator = null

  // Target only the specific help survey to avoid filling unrelated dialogs.
  for (const context of surveyContexts) {
    const titleLocator = context.getByText(HELP_SURVEY_TITLE_PATTERN).first()
    const titleVisible = await titleLocator.isVisible().catch(() => false)
    if (titleVisible) {
      surveyContext = context
      surveyTitleLocator = titleLocator
      break
    }
  }

  if (!surveyContext || !surveyTitleLocator) {
    return false
  }

  const popupLocator = surveyContext
    .locator('[role="dialog"], [id*="posthog-survey"], [class*="posthog-survey"], [class*="ph-survey"]')
    .filter({ has: surveyContext.getByText(HELP_SURVEY_TITLE_PATTERN).first() })
    .first()

  let popupScope = popupLocator
  const hasPopup = await popupScope.isVisible().catch(() => false)
  if (!hasPopup) {
    // Fallback to the nearest container around the matched title, not the whole page.
    popupScope = surveyTitleLocator.locator('xpath=ancestor::*[self::div or self::section or self::form][1]').first()
    const hasFallbackScope = await popupScope.isVisible().catch(() => false)
    if (!hasFallbackScope) {
      return false
    }
  }

  const preferredStartButton = popupScope.getByRole('button', {
    name: /yes|i need help|help with this page/i,
  }).first()
  const hasPreferredStartButton = await preferredStartButton.isVisible().catch(() => false)
  if (hasPreferredStartButton) {
    await preferredStartButton.click().catch(() => {})
  } else {
    const preferredStartRadio = popupScope.getByRole('radio', {
      name: /yes|i need help|help with this page/i,
    }).first()
    const hasPreferredStartRadio = await preferredStartRadio.isVisible().catch(() => false)
    if (hasPreferredStartRadio) {
      await preferredStartRadio.check().catch(() => {})
    } else {
      const preferredStartActionFallback = popupScope
        .locator('button, [role="button"], label, [role="radio"]')
        .filter({ hasText: /yes|i need help|help with this page/i })
        .first()
      const hasPreferredStartActionFallback = await preferredStartActionFallback.isVisible().catch(() => false)
      if (hasPreferredStartActionFallback) {
        await preferredStartActionFallback.click().catch(() => {})
      }
    }
  }

  const feedbackMessage = buildAutomatedFeedbackMessage(sessionIndex, feedbackPrefix)

  // Some survey variants render the text input only after selecting an option.
  await popupScope
    .locator('textarea, input[type="text"], input:not([type]), [contenteditable="true"]')
    .first()
    .waitFor({ state: 'visible', timeout: 8_000 })
    .catch(() => {})

  const textInput = popupScope
    .locator('textarea, input[type="text"], input:not([type]), [contenteditable="true"]')
    .first()
  const hasVisibleTextInput = await textInput.isVisible().catch(() => false)

  if (!hasVisibleTextInput) {
    return false
  }

  await textInput.click().catch(() => {})
  await textInput.fill(feedbackMessage).catch(() => {})

  const submitButton = popupScope.getByRole('button', {
    name: /submit|send|done|next|continue|share|finish/i,
  }).first()
  const hasSubmitButton = await submitButton.isVisible().catch(() => false)

  if (hasSubmitButton) {
    await submitButton.click().catch(() => {})
  } else {
    const fallbackSubmitButton = popupScope
      .locator('button, [role="button"]')
      .filter({ hasText: /submit|send|done|next|continue|share|finish/i })
      .first()
    const hasFallbackSubmitButton = await fallbackSubmitButton.isVisible().catch(() => false)
    if (hasFallbackSubmitButton) {
      await fallbackSubmitButton.click().catch(() => {})
    } else {
      await textInput.press('Enter').catch(() => {})
    }
  }

  return true
}

async function dismissUnwantedFeedbackSurvey(page) {
  const surveyContexts = [page, ...page.frames()]

  for (const context of surveyContexts) {
    const unwantedTitle = context.getByText(UNWANTED_SURVEY_TITLE_PATTERN).first()
    const isVisible = await unwantedTitle.isVisible().catch(() => false)
    if (!isVisible) continue

    const surveyScope = context
      .locator('[role="dialog"], [id*="posthog-survey"], [class*="posthog-survey"], [class*="ph-survey"]')
      .filter({ has: unwantedTitle })
      .first()

    const scopedVisible = await surveyScope.isVisible().catch(() => false)
    const scope = scopedVisible ? surveyScope : unwantedTitle.locator('xpath=ancestor::*[self::div or self::section][1]').first()

    const closeButton = scope
      .locator('button, [role="button"]')
      .filter({ hasText: /^x$/i })
      .first()
    const closeVisible = await closeButton.isVisible().catch(() => false)

    if (closeVisible) {
      await closeButton.click().catch(() => {})
      return true
    }

    const labelledCloseButton = scope.getByRole('button', { name: /close|dismiss/i }).first()
    const labelledCloseVisible = await labelledCloseButton.isVisible().catch(() => false)
    if (labelledCloseVisible) {
      await labelledCloseButton.click().catch(() => {})
      return true
    }

    await page.keyboard.press('Escape').catch(() => {})
    return true
  }

  return false
}

async function waitForHelpSurveyToAppear(page, timeoutMs) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const surveyContexts = [page, ...page.frames()]
    for (const context of surveyContexts) {
      const titleVisible = await context.getByText(HELP_SURVEY_TITLE_PATTERN).first().isVisible().catch(() => false)
      if (titleVisible) {
        return true
      }
    }
    await sleep(250)
  }

  return false
}

// ---------------------------------------------------------------------------
// A single simulated visitor
// ---------------------------------------------------------------------------

async function runSession(browser, baseUrl, sessionIndex, config) {
  const stats = {
    sessionIndex,
    pageviews: 0,
    survey: false,
    errors: [],
    posthogConfigured: false,
    posthogHost: null,
    posthogInit: false,
    trackedPageviews: 0,
    posthogFlagPosts: 0,
    posthogEventPosts: 0,
    posthogRecordingPosts: 0,
    posthogEvent2xx: 0,
    posthogRecording2xx: 0,
    feedbackSubmissions: 0,
    unwantedFeedbackDismissed: 0,
  }
  // Fresh context per session == fresh cookies == a distinct PostHog anonymous user.
  const context = await browser.newContext(
    config.stealth
      ? {
        userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
      : {},
  )

  context.on('request', (request) => {
    const url = request.url()
    if (request.method() !== 'POST') return
    if (!url.includes('posthog')) return

    try {
      const { pathname } = new URL(url)
      if (pathname === '/flags/' || pathname === '/decide/' || pathname === '/i/v0/flags/') {
        stats.posthogFlagPosts += 1
      } else if (pathname === '/e/' || pathname === '/i/v0/e/') {
        stats.posthogEventPosts += 1
      } else if (pathname === '/s/' || pathname === '/i/v0/s/') {
        stats.posthogRecordingPosts += 1
      }
    } catch {
      // Ignore malformed URLs in diagnostics-only path parsing.
    }
  })

  context.on('response', (response) => {
    const url = response.url()
    if (!url.includes('posthog')) return

    try {
      const { pathname } = new URL(url)
      const status = response.status()
      if (status < 200 || status >= 300) return
      if (pathname === '/e/' || pathname === '/i/v0/e/') {
        stats.posthogEvent2xx += 1
      } else if (pathname === '/s/' || pathname === '/i/v0/s/') {
        stats.posthogRecording2xx += 1
      }
    } catch {
      // Ignore malformed URLs in diagnostics-only path parsing.
    }
  })

  await context.addInitScript(() => {
    // Ensure analytics is enabled before app scripts run.
    Object.defineProperty(navigator, 'webdriver', {
      configurable: true,
      get: () => undefined,
    })
    document.cookie = 'moj_cookie_consent=accepted; path=/; max-age=31536000; samesite=lax'
  })
  const page = await context.newPage()

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    if (await dismissUnwantedFeedbackSurvey(page)) {
      stats.unwantedFeedbackDismissed += 1
    }

    const runtimeConfig = await page.evaluate(() => {
      const win = window
      const cfg = win.__RUNTIME_CONFIG__ ?? {}
      return {
        key: typeof cfg.NEXT_PUBLIC_POSTHOG_KEY === 'string' ? cfg.NEXT_PUBLIC_POSTHOG_KEY.trim() : '',
        host: typeof cfg.NEXT_PUBLIC_POSTHOG_HOST === 'string' ? cfg.NEXT_PUBLIC_POSTHOG_HOST.trim() : '',
      }
    })

    stats.posthogConfigured = Boolean(runtimeConfig.key)
    stats.posthogHost = runtimeConfig.host || null

    await page.waitForFunction(() => window.__posthog_initialized === true, {
      timeout: 10_000,
    })
    stats.posthogInit = true

    await waitForPageviewCount(page, 1, 10_000).catch(() => {
      stats.errors.push('PostHog initialized but no $pageview observed on first page within 10s')
    })

    const firstPageTracked = await page.evaluate(() => (window.__posthog_pageview_count ?? 0) > 0)
    if (firstPageTracked) stats.trackedPageviews += 1

    stats.pageviews += 1

    const numPages = randomInt(config.minPages, config.maxPages)
    let surveyIdleAttempted = false

    for (let i = 0; i < numPages; i += 1) {
      const shouldIdleForSurvey = !surveyIdleAttempted && Math.random() < config.surveyChance

      if (shouldIdleForSurvey) {
        if (await dismissUnwantedFeedbackSurvey(page)) {
          stats.unwantedFeedbackDismissed += 1
        }

        // Stay still for 60s+ to trigger the inactivity survey.
        const idleDurationMs = randomInt(config.minIdleMs, config.maxIdleMs)
        stats.unwantedFeedbackDismissed += await sleepWithSurveySuppression(page, idleDurationMs)
        surveyIdleAttempted = true

        const surveyAppeared = await waitForHelpSurveyToAppear(page, 12_000)
        stats.survey = surveyAppeared
        if (!surveyAppeared) {
          stats.errors.push('Help survey did not appear after idle period')
        }

        // If the survey popup contains a free-text response, submit a deterministic message.
        const submittedFeedback = surveyAppeared
          ? await maybeSubmitFeedbackPopup(page, sessionIndex, config.feedbackPrefix)
          : false
        if (submittedFeedback) {
          stats.feedbackSubmissions += 1
        }
      } else {
        // Mimic a real reader: small mouse movements, then a pause.
        await page.mouse.move(randomInt(0, 800), randomInt(0, 600)).catch(() => {})
        const dwellMs = randomInt(config.minDwellMs, config.maxDwellMs)
        stats.unwantedFeedbackDismissed += await sleepWithSurveySuppression(page, dwellMs)
      }

      const route = randomItem(ROUTES)
      await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
      if (await dismissUnwantedFeedbackSurvey(page)) {
        stats.unwantedFeedbackDismissed += 1
      }
      stats.pageviews += 1

      await waitForPageviewCount(page, 1, 10_000).catch(() => {
        stats.errors.push(`Missing tracked pageview after navigating to ${route}`)
      })

      const routeTracked = await page.evaluate(() => (window.__posthog_pageview_count ?? 0) > 0)
      if (routeTracked) stats.trackedPageviews += 1
    }

    if (config.flushMs > 0) {
      stats.unwantedFeedbackDismissed += await sleepWithSurveySuppression(page, config.flushMs)
    }
  } catch (error) {
    const runtimeHints = []
    if (!stats.posthogConfigured) runtimeHints.push('NEXT_PUBLIC_POSTHOG_KEY is missing in __RUNTIME_CONFIG__')
    if (!stats.posthogHost) runtimeHints.push('NEXT_PUBLIC_POSTHOG_HOST is missing in __RUNTIME_CONFIG__')
    const suffix = runtimeHints.length > 0 ? ` (${runtimeHints.join('; ')})` : ''
    stats.errors.push(`${error instanceof Error ? error.message : String(error)}${suffix}`)
  } finally {
    await context.close().catch(() => {})
  }

  return stats
}

// ---------------------------------------------------------------------------
// Bounded concurrency runner
// ---------------------------------------------------------------------------

async function runWithConcurrency(items, limit, worker) {
  const results = []
  let cursor = 0

  async function next() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, next)
  await Promise.all(runners)
  return results
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const config = parseArgs(process.argv.slice(2))

  if (config.help) {
    printHelp()
    return
  }

  if (!config.url) {
    console.error('Error: --url is required (or set TRAFFIC_TARGET_URL).\n')
    printHelp()
    process.exitCode = 1
    return
  }

  if (config.minIdleMs < SURVEY_MIN_INACTIVITY_MS) {
    console.warn(`min-idle-ms ${config.minIdleMs}ms is below 60s; clamping to ${SURVEY_MIN_INACTIVITY_MS}ms.`)
    config.minIdleMs = SURVEY_MIN_INACTIVITY_MS
  }

  if (config.maxIdleMs < config.minIdleMs) {
    console.warn(`max-idle-ms ${config.maxIdleMs}ms is below min-idle-ms ${config.minIdleMs}ms; using min-idle-ms value.`)
    config.maxIdleMs = config.minIdleMs
  }

  const baseUrl = config.url.endsWith('/') ? config.url : `${config.url}/`
  const sessionIndices = Array.from({ length: config.sessions }, (_, i) => i)

  console.log(`Target:          ${baseUrl}`)
  console.log(`Sessions:        ${config.sessions} (concurrency ${config.concurrency})`)
  console.log(`Pages/session:   ${config.minPages}-${config.maxPages}`)
  console.log(`Dwell time:      ${config.minDwellMs}-${config.maxDwellMs}ms`)
  console.log(`Survey chance:   ${Math.round(config.surveyChance * 100)}% per page`)
  console.log(`Idle duration:   ${config.minIdleMs}-${config.maxIdleMs}ms`)
  console.log(`Feedback prefix: ${config.feedbackPrefix}`)
  console.log(`Flush delay:     ${config.flushMs}ms`)
  console.log(`Stealth mode:    ${config.stealth ? 'on' : 'off'}`)
  console.log(`Mode:            ${config.dryRun ? 'dry run (no browser, no requests)' : config.headless ? 'headless' : 'headed'}`)
  console.log()

  if (config.dryRun) {
    console.log('Dry run — no browser will be launched. Planned routes pool:')
    console.log(ROUTES.join(', '))
    return
  }

  const startedAt = Date.now()
  const browser = await chromium.launch({
    headless: config.headless,
    args: config.stealth ? ['--disable-blink-features=AutomationControlled'] : [],
  })

  let results
  try {
    results = await runWithConcurrency(sessionIndices, config.concurrency, (index) =>
      runSession(browser, baseUrl, index, config),
    )
  } finally {
    await browser.close()
  }

  const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1)
  const totalPageviews = results.reduce((sum, r) => sum + r.pageviews, 0)
  const totalTrackedPageviews = results.reduce((sum, r) => sum + r.trackedPageviews, 0)
  const totalPosthogFlagPosts = results.reduce((sum, r) => sum + r.posthogFlagPosts, 0)
  const totalPosthogEventPosts = results.reduce((sum, r) => sum + r.posthogEventPosts, 0)
  const totalPosthogRecordingPosts = results.reduce((sum, r) => sum + r.posthogRecordingPosts, 0)
  const totalPosthogEvent2xx = results.reduce((sum, r) => sum + r.posthogEvent2xx, 0)
  const totalPosthogRecording2xx = results.reduce((sum, r) => sum + r.posthogRecording2xx, 0)
  const totalFeedbackSubmissions = results.reduce((sum, r) => sum + r.feedbackSubmissions, 0)
  const totalUnwantedFeedbackDismissed = results.reduce((sum, r) => sum + r.unwantedFeedbackDismissed, 0)
  const surveysTriggered = results.filter((r) => r.survey).length
  const sessionsWithErrors = results.filter((r) => r.errors.length > 0)
  const sessionsWithPostHogConfigured = results.filter((r) => r.posthogConfigured).length
  const sessionsWithPostHogInit = results.filter((r) => r.posthogInit).length

  console.log('\n--- Summary ---')
  console.log(`Duration:            ${durationSeconds}s`)
  console.log(`Sessions completed:  ${results.length}`)
  console.log(`Total pageviews:     ${totalPageviews}`)
  console.log(`Tracked pageviews:   ${totalTrackedPageviews}`)
  console.log(`PostHog flags POSTs: ${totalPosthogFlagPosts}`)
  console.log(`PostHog event POSTs: ${totalPosthogEventPosts} (${totalPosthogEvent2xx} HTTP 2xx)`)
  console.log(`PostHog record POSTs:${totalPosthogRecordingPosts} (${totalPosthogRecording2xx} HTTP 2xx)`)
  console.log(`Surveys triggered:   ${surveysTriggered}`)
  console.log(`Feedback submitted:  ${totalFeedbackSubmissions}`)
  console.log(`Unwanted dismissed:  ${totalUnwantedFeedbackDismissed}`)
  console.log(`PostHog configured:  ${sessionsWithPostHogConfigured}/${results.length}`)
  console.log(`PostHog initialized: ${sessionsWithPostHogInit}/${results.length}`)
  console.log(`Sessions with errors: ${sessionsWithErrors.length}`)

  const hostsSeen = Array.from(new Set(results.map((r) => r.posthogHost).filter(Boolean)))
  if (hostsSeen.length > 0) {
    console.log(`PostHog host(s):     ${hostsSeen.join(', ')}`)
  }

  if (totalPosthogEventPosts === 0) {
    console.log('\nWarning: No PostHog event ingest POSTs were observed in this run.')
    if (config.headless) {
      console.log('Try again with --headed and a longer flush delay, for example: --headed --flush-ms 7000')
    } else {
      console.log('Try again with a longer flush delay, for example: --flush-ms 7000')
    }
  }

  if (sessionsWithErrors.length > 0) {
    console.log('\nErrors:')
    for (const session of sessionsWithErrors) {
      console.log(`  session ${session.sessionIndex}: ${session.errors.join('; ')}`)
    }
  }

  console.log('\nCheck the PostHog project for this environment — pageviews should appear within a few seconds.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
