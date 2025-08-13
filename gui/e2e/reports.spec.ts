import { test, expect } from '@playwright/test';

test.describe('Reports & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.click('text=Reports');
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('text=Reports & Analytics')).toBeVisible();
  });

  test('should display financial summary', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('[data-testid="financial-summary"]')).toBeVisible();
    await expect(page.locator('text=Financial Summary')).toBeVisible();
  });

  test('should display work summary', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('[data-testid="work-summary"]')).toBeVisible();
    await expect(page.locator('text=Work Summary')).toBeVisible();
  });

  test('should generate report for date range', async ({ page }) => {
    await page.goto('/reports');
    
    await page.fill('[data-testid="report-from-date"]', '2024-01-01');
    await page.fill('[data-testid="report-to-date"]', '2024-12-31');
    await page.click('[data-testid="generate-report-button"]');
    
    await expect(page.locator('[data-testid="report-results"]')).toBeVisible();
  });

  test('should show summary metrics', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.locator('[data-testid="total-paid-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-due-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-hours-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-entries-metric"]')).toBeVisible();
  });

  test('should display detailed data tab with entries', async ({ page }) => {
    await page.goto('/reports');
    
    // Click on Detailed Data tab
    await page.click('text=📋 Detailed Data');
    await expect(page.locator('text=Individual Work Entries')).toBeVisible();
    
    // Click on Work Entries sub-tab
    await page.click('text=📝 Work Entries');
    
    // Check if detailed entries table is visible
    await expect(page.locator('.detailed-table')).toBeVisible();
    await expect(page.locator('text=Total Entries:')).toBeVisible();
    await expect(page.locator('text=Total Hours:')).toBeVisible();
    await expect(page.locator('text=Total Cost:')).toBeVisible();
  });

  test('should display detailed events data', async ({ page }) => {
    await page.goto('/reports');
    
    // Click on Detailed Data tab
    await page.click('text=📋 Detailed Data');
    
    // Click on Event Details sub-tab
    await page.click('text=🍷 Event Details');
    
    await expect(page.locator('text=Individual Events')).toBeVisible();
    await expect(page.locator('text=Total Events:')).toBeVisible();
    await expect(page.locator('text=Total Revenue:')).toBeVisible();
    await expect(page.locator('text=Total Guests:')).toBeVisible();
  });

  test('should allow searching in detailed entries table', async ({ page }) => {
    await page.goto('/reports');
    
    // Navigate to detailed entries
    await page.click('text=📋 Detailed Data');
    await page.click('text=📝 Work Entries');
    
    // Wait for table to load and search for entries
    await page.waitForSelector('.detailed-table');
    const searchInput = page.locator('input[placeholder="Search entries..."]');
    await expect(searchInput).toBeVisible();
    
    // Try searching (this will depend on actual data)
    await searchInput.fill('vineyard');
  });

  test('should show table summary with period totals', async ({ page }) => {
    await page.goto('/reports');
    
    await page.click('text=📋 Detailed Data');
    await page.click('text=📝 Work Entries');
    
    // Check for table summary section
    await expect(page.locator('.table-summary')).toBeVisible();
    await expect(page.locator('text=Period Totals:')).toBeVisible();
  });

  test('should switch between events and work report tabs', async ({ page }) => {
    await page.goto('/reports');
    
    // Should start with events report
    await expect(page.locator('text=🍷 Events Report')).toBeVisible();
    
    // Switch to work report
    await page.click('text=👷 Work Report');
    await expect(page.locator('text=Work Distribution Analysis')).toBeVisible();
    
    // Switch to detailed data
    await page.click('text=📋 Detailed Data');
    await expect(page.locator('text=Individual Work Entries')).toBeVisible();
  });
});