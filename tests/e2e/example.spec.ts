import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Ministry of Justice Developer' })).toBeVisible();
});
