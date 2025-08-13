import { test, expect } from '@playwright/test';

test.describe('Basic Frontend Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
    await expect(page.locator('[data-testid="username"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should show demo credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Demo credentials: admin/admin or user/user')).toBeVisible();
  });
});