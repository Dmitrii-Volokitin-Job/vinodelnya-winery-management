import { test, expect } from '@playwright/test';

test.describe('Dashboard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login as admin
    await page.waitForSelector('[data-testid="username"]', { timeout: 10000 });
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should load dashboard with main navigation cards', async ({ page }) => {
    // Check dashboard header/title
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    
    // Verify main navigation cards are present
    await expect(page.locator('p-card >> text="Persons"')).toBeVisible();
    await expect(page.locator('p-card >> text="Categories"')).toBeVisible();
    await expect(page.locator('p-card >> text="Entries"')).toBeVisible();
    await expect(page.locator('p-card >> text="Events"')).toBeVisible();
    await expect(page.locator('p-card >> text="Reports"')).toBeVisible();
  });

  test('should navigate to persons from dashboard card', async ({ page }) => {
    await page.click('text=View Persons');
    await page.waitForURL('**/persons');
    await expect(page.locator('h2')).toContainText('Persons');
  });

  test('should navigate to categories from dashboard card', async ({ page }) => {
    await page.click('text=View Categories');
    await page.waitForURL('**/categories');
    await expect(page.locator('h2')).toContainText('Categories');
  });

  test('should navigate to entries from dashboard card', async ({ page }) => {
    await page.click('text=View Entries');
    await page.waitForURL('**/entries');
    await expect(page.locator('h2')).toContainText('Entries');
  });

  test('should navigate to events from dashboard card', async ({ page }) => {
    await page.click('text=View Events');
    await page.waitForURL('**/events');
    await expect(page.locator('h2')).toContainText('Events');
  });

  test('should navigate to reports from dashboard card', async ({ page }) => {
    await page.click('text=View Reports');
    await page.waitForURL('**/reports');
    await expect(page.locator('h2')).toContainText('Reports');
  });

  test('should display current user information', async ({ page }) => {
    // Check if user info is displayed (admin user)
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=ADMIN')).toBeVisible();
  });

  test('should show admin-only menu items for admin user', async ({ page }) => {
    // Admin should see Users and Audit Log menu items
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Audit Log')).toBeVisible();
    await expect(page.locator('text=System Logs')).toBeVisible();
  });

  test('should have working logout functionality', async ({ page }) => {
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('**/login');
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
  });

  test('should have responsive grid layout', async ({ page }) => {
    // Check that dashboard cards are displayed in grid
    const cards = page.locator('p-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(5); // At least 5 main feature cards
  });

  test('should display card descriptions', async ({ page }) => {
    // Verify card descriptions are present
    await expect(page.locator('text=Manage winery workers and personnel')).toBeVisible();
    await expect(page.locator('text=Manage expense categories')).toBeVisible();
    await expect(page.locator('text=Track operations and expenses')).toBeVisible();
    await expect(page.locator('text=Manage wine tastings and tours')).toBeVisible();
    await expect(page.locator('text=Generate summaries and analytics')).toBeVisible();
  });

  test('should have proper button styling and labels', async ({ page }) => {
    // Check that all view buttons are present and properly labeled
    await expect(page.locator('button >> text="View Persons"')).toBeVisible();
    await expect(page.locator('button >> text="View Categories"')).toBeVisible();
    await expect(page.locator('button >> text="View Entries"')).toBeVisible();
    await expect(page.locator('button >> text="View Events"')).toBeVisible();
    await expect(page.locator('button >> text="View Reports"')).toBeVisible();
  });

  test('should handle direct dashboard URL access', async ({ page }) => {
    // Direct navigation to dashboard should work when authenticated
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });
});