import { test, expect } from '@playwright/test';

test.describe('Audit Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to audit page', async ({ page }) => {
    await page.click('text=Audit Log');
    await expect(page).toHaveURL('/audit');
    await expect(page.locator('text=Audit Log')).toBeVisible();
  });

  test('should display audit log table', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.locator('[data-testid="audit-table"]')).toBeVisible();
  });

  test('should filter by table name', async ({ page }) => {
    await page.goto('/audit');
    
    await page.selectOption('[data-testid="audit-table-filter"]', 'persons');
    await page.click('[data-testid="apply-audit-filters-button"]');
    
    await expect(page.locator('[data-testid="audit-table"]')).toBeVisible();
  });

  test('should filter by date range', async ({ page }) => {
    await page.goto('/audit');
    
    await page.fill('[data-testid="audit-from-date"]', '2024-01-01');
    await page.fill('[data-testid="audit-to-date"]', '2024-12-31');
    await page.click('[data-testid="apply-audit-filters-button"]');
    
    await expect(page.locator('[data-testid="audit-table"]')).toBeVisible();
  });

  test('should view audit details', async ({ page }) => {
    await page.goto('/audit');
    await page.click('[data-testid="view-audit-details-button"]:first-child');
    
    await expect(page.locator('[data-testid="audit-details-dialog"]')).toBeVisible();
    await expect(page.locator('text=Audit Details')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/audit');
    
    await page.selectOption('[data-testid="audit-table-filter"]', 'persons');
    await page.click('[data-testid="clear-audit-filters-button"]');
    
    await expect(page.locator('[data-testid="audit-table-filter"]')).toHaveValue('');
  });
});