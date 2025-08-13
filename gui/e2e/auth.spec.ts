import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Manage winery workers')).toBeVisible();
  });

  test('should login with user credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="username"]', 'user');
    await page.fill('[data-testid="password"] input', 'user');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Manage winery workers')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="username"]', 'invalid');
    await page.fill('[data-testid="password"] input', 'invalid');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/login');
  });
});