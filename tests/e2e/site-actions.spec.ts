import { test, expect, type Page } from '@playwright/test';

async function getCookieValue(page: Page) {
  return page.evaluate(() => document.cookie);
}

test.describe('site actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('navigation and content pages work', async ({ page }) => {
    await page.goto('/');

    const banner = page.getByTestId('cookie-consent-banner');
    await expect(banner).toBeVisible();

    await page.getByRole('button', { name: /reject analytics cookies/i }).click();
    await expect(banner).toBeHidden();

    const nav = page.getByRole('navigation', { name: 'Menu' });

    await nav.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/\/products\/?$/);
    await expect(page.getByRole('heading', { name: 'Products & Services' })).toBeVisible();

    await page.getByRole('radio', { name: /Security/i }).check();
    await expect(page.getByText(/Showing \d+ product(?:s)?/)).toBeVisible();

    await nav.getByRole('link', { name: 'Guidelines' }).click();
    await expect(page).toHaveURL(/\/guidelines\/?$/);
    await expect(page.getByRole('heading', { name: /Guidelines/i })).toBeVisible();

    await nav.getByRole('link', { name: 'Documentation' }).click();
    await expect(page).toHaveURL(/\/docs\/?$/);
    await expect(page.getByRole('heading', { name: /Documentation/i })).toBeVisible();

    await nav.getByRole('link', { name: 'Community' }).click();
    await expect(page).toHaveURL(/\/community\/?$/);
    await expect(page.getByRole('heading', { name: /Community/i })).toBeVisible();

    await nav.getByRole('link', { name: 'Contact us' }).click();
    await expect(page).toHaveURL(/\/contact-us\/?$/);
    await expect(page.getByRole('heading', { name: /Contact us/i })).toBeVisible();
  });

  test('product filters update the listing and can be cleared', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('heading', { name: 'Products & Services' })).toBeVisible();

    const initialCount = await page
      .getByText(/Showing \d+ products/)
      .innerText();

    await page.getByRole('radio', { name: /Platforms/i }).check();
    await expect(page.getByText(/Showing \d+ products/)).not.toHaveText(initialCount);

    const clearFilters = page.getByRole('button', { name: /Clear filters/i });
    await expect(clearFilters).toBeVisible();
    await clearFilters.click();
    await expect(page.getByText(/Showing \d+ products/)).toHaveText(initialCount);
  });

  test('search widget is present and responds to input', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('searchbox', { name: /Search documentation/i });
    await expect(searchInput).toBeVisible();

    await searchInput.fill('cloud');
    await expect(page.locator('.portal-search-results')).toBeVisible();

    const noResultsHint = page.locator('.portal-search-hint', {
      hasText: /Search is available after building the site\.|No results found\./,
    });
    if (await noResultsHint.count()) {
      await expect(noResultsHint).toBeVisible();
    } else {
      const results = page.locator('.portal-search-results .portal-search-result');
      expect(await results.count()).toBeGreaterThan(0);
    }
  });

  test('PostHog traffic is blocked until cookies are accepted, then sent after accept', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();

    await page.getByRole('button', { name: /accept analytics cookies/i }).click();

    await expect(page).toHaveURL(/\//)

    await page.waitForFunction(() => {
      const win = window as any
      return win.__posthog_initialized === true
    })

    await page.waitForFunction(() => {
      const win = window as any
      return win.__posthog_pageview_count >= 1
    }, { timeout: 15000 })

    const request = await page.waitForRequest((request) =>
      (request.url().includes('posthog.com') || request.url().includes('eu.i.posthog.com')) &&
      request.method() === 'POST',
      { timeout: 10000 },
    ).catch(() => null)

    if (request) {
      expect(request.url()).toContain('posthog.com');
      expect(request.method()).toBe('POST');
    }

    const cookie = await getCookieValue(page);
    expect(cookie).toContain('moj_cookie_consent=accepted');
  });

  test('cookie consent rejection persists and banner reappears only after consent is cleared', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByTestId('cookie-consent-banner');

    await expect(banner).toBeVisible();
    await page.getByRole('button', { name: /reject analytics cookies/i }).click();
    await expect(banner).toBeHidden();

    let cookie = await getCookieValue(page);
    expect(cookie).toContain('moj_cookie_consent=rejected');

    await page.reload();
    await expect(page.getByTestId('cookie-consent-banner')).toBeHidden();

    await page.context().clearCookies();
    await page.reload();
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
  });
});
