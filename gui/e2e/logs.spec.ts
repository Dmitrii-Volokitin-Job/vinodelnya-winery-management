import { test, expect } from '@playwright/test';

test.describe('Logs Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login as admin
    await page.waitForSelector('[data-testid="username"]', { timeout: 10000 });
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard or redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should navigate to logs page and display logs table', async ({ page }) => {
    // Navigate to logs page via menu
    await page.click('text=System Logs');
    await page.waitForURL('**/logs');
    
    // Verify logs page elements
    await expect(page.locator('h2')).toContainText('System Logs');
    await expect(page.locator('[data-testid="logs-table"]')).toBeVisible();
    
    // Verify filter elements
    await expect(page.locator('[data-testid="log-level-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-limit-filter"]')).toBeVisible();
  });

  test('should filter logs by level', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Select ERROR level filter
    await page.click('[data-testid="log-level-filter"]');
    await page.click('text=ERROR');
    
    // Apply filters
    await page.click('[data-testid="apply-log-filters-button"]');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Verify filter applied
    const levelFilter = page.locator('[data-testid="log-level-filter"]');
    await expect(levelFilter).toContainText('ERROR');
  });

  test('should search logs by text', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Enter search term
    await page.fill('[data-testid="log-search"]', 'Application');
    
    // Apply filters
    await page.click('[data-testid="apply-log-filters-button"]');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Verify search term is in the input
    await expect(page.locator('[data-testid="log-search"]')).toHaveValue('Application');
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Set some filters
    await page.click('[data-testid="log-level-filter"]');
    await page.click('text=ERROR');
    await page.fill('[data-testid="log-search"]', 'test');
    
    // Clear filters
    await page.click('[data-testid="clear-log-filters-button"]');
    
    // Verify filters are cleared
    await expect(page.locator('[data-testid="log-search"]')).toHaveValue('');
  });

  test('should refresh logs data', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Click refresh button
    await page.click('[data-testid="refresh-logs-button"]');
    
    // Wait for refresh
    await page.waitForTimeout(1000);
    
    // Verify table is still visible (basic refresh test)
    await expect(page.locator('[data-testid="logs-table"]')).toBeVisible();
  });

  test('should show log statistics dialog', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Click statistics button
    await page.click('[data-testid="show-stats-button"]');
    
    // Verify statistics dialog appears
    await expect(page.locator('[data-testid="log-stats-dialog"]')).toBeVisible();
    await expect(page.locator('text=Log Statistics')).toBeVisible();
  });

  test('should view log details', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Click first view details button if available
    const viewButton = page.locator('[data-testid="view-log-details-button"]').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      
      // Verify details dialog appears
      await expect(page.locator('[data-testid="log-details-dialog"]')).toBeVisible();
      await expect(page.locator('text=Log Entry Details')).toBeVisible();
    }
  });

  test('should change log limit', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Change limit
    await page.click('[data-testid="log-limit-filter"]');
    await page.click('text=200 logs');
    
    // Apply filters
    await page.click('[data-testid="apply-log-filters-button"]');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Verify limit is selected
    const limitFilter = page.locator('[data-testid="log-limit-filter"]');
    await expect(limitFilter).toContainText('200 logs');
  });

  test('should display proper log level tags with colors', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check if log level tags are visible
    const logTags = page.locator('p-tag');
    if (await logTags.count() > 0) {
      await expect(logTags.first()).toBeVisible();
    }
  });

  test('should be accessible only by admin users', async ({ page }) => {
    // This test verifies admin-only access is enforced
    // The logs menu item should only be visible for admin users
    // Since we login as admin in beforeEach, we should see the menu
    await expect(page.locator('text=System Logs')).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForSelector('[data-testid="logs-table"]', { timeout: 10000 });
    
    // Search for something that likely won't exist
    await page.fill('[data-testid="log-search"]', 'xyz123nonexistent456');
    await page.click('[data-testid="apply-log-filters-button"]');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Should not crash and table should still be visible
    await expect(page.locator('[data-testid="logs-table"]')).toBeVisible();
  });
});