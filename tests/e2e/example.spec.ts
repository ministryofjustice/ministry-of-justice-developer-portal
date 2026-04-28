import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Ministry of Justice Developer' })).toBeVisible();
});

test('has no accessibility issues', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
