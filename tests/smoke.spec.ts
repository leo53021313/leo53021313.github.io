import { test, expect } from '@playwright/test';

test('home renders 3 project cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCount(3);
});

test('language toggle switches zh-TW <-> en', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  await page.reload();
  await expect(html).not.toHaveAttribute('data-theme', before!);
});
