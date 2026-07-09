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
  --survey-chance <0..1>   Chance a session triggers the inactivity survey (default: 0.15)
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

const SURVEY_INACTIVITY_MS = 65_000 // matches PostHogSurvey's 60s timer + margin

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(list) {
  return list[randomInt(0, list.length - 1)]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
    const goIdleForSurvey = Math.random() < config.surveyChance

    for (let i = 0; i < numPages; i += 1) {
      if (goIdleForSurvey && i === Math.floor(numPages / 2)) {
        // Sit still long enough to trigger PostHogSurvey's inactivity timer.
        await sleep(SURVEY_INACTIVITY_MS)
        stats.survey = true
      } else {
        // Mimic a real reader: small mouse movements, then a pause.
        await page.mouse.move(randomInt(0, 800), randomInt(0, 600)).catch(() => {})
        await sleep(randomInt(config.minDwellMs, config.maxDwellMs))
      }

      const route = randomItem(ROUTES)
      await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
      stats.pageviews += 1

      await waitForPageviewCount(page, 1, 10_000).catch(() => {
        stats.errors.push(`Missing tracked pageview after navigating to ${route}`)
      })

      const routeTracked = await page.evaluate(() => (window.__posthog_pageview_count ?? 0) > 0)
      if (routeTracked) stats.trackedPageviews += 1
    }

    if (config.flushMs > 0) {
      await sleep(config.flushMs)
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

  const baseUrl = config.url.endsWith('/') ? config.url : `${config.url}/`
  const sessionIndices = Array.from({ length: config.sessions }, (_, i) => i)

  console.log(`Target:          ${baseUrl}`)
  console.log(`Sessions:        ${config.sessions} (concurrency ${config.concurrency})`)
  console.log(`Pages/session:   ${config.minPages}-${config.maxPages}`)
  console.log(`Dwell time:      ${config.minDwellMs}-${config.maxDwellMs}ms`)
  console.log(`Survey chance:   ${Math.round(config.surveyChance * 100)}%`)
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
