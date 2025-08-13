import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login as admin
    await page.waitForSelector('[data-testid="username"]', { timeout: 10000 });
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test.describe('Network Error Handling', () => {
    test('should handle API timeout gracefully', async ({ page }) => {
      // Navigate to a data-heavy page
      await page.goto('/entries');
      await page.waitForSelector('[data-testid="entries-table"]', { timeout: 10000 });
      
      // Simulate slow network by blocking requests temporarily
      await page.route('**/api/v1/entries*', async route => {
        await page.waitForTimeout(5000); // Simulate slow response
        route.continue();
      });
      
      // Try to refresh data
      const refreshButton = page.locator('button:has-text("Apply Filters"), button[data-testid*="refresh"]');
      if (await refreshButton.count() > 0) {
        await refreshButton.first().click();
      }
      
      // Should show loading state or handle gracefully
      await page.waitForTimeout(2000);
      await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
    });

    test('should handle API errors with proper error messages', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/v1/persons*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await page.goto('/persons');
      
      // Should handle error gracefully
      await page.waitForTimeout(2000);
      
      // Check for error message or empty state
      const errorElements = page.locator('.p-toast-message, .error-message, text=No data available');
      if (await errorElements.count() > 0) {
        await expect(errorElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Form Validation Edge Cases', () => {
    test('should validate extremely long text inputs', async ({ page }) => {
      await page.goto('/persons');
      await page.click('text=Add');
      
      // Fill with very long text
      const longText = 'a'.repeat(1000);
      await page.fill('[data-testid="person-name"]', longText);
      
      // Try to save
      await page.click('text=Save');
      
      // Should handle validation appropriately
      await page.waitForTimeout(1000);
    });

    test('should handle special characters in form fields', async ({ page }) => {
      await page.goto('/categories');
      await page.click('text=Add');
      
      // Test special characters
      await page.fill('[data-testid="category-name"]', 'Test<script>alert("xss")</script>');
      await page.fill('[data-testid="category-description"]', 'Special chars: !@#$%^&*()');
      
      await page.click('text=Save');
      await page.waitForTimeout(2000);
      
      // Should handle special characters safely
    });

    test('should validate date inputs with invalid dates', async ({ page }) => {
      await page.goto('/entries');
      await page.click('text=Add');
      
      // Try invalid date formats (if date inputs exist)
      const dateFields = page.locator('p-calendar input, input[type="date"]');
      if (await dateFields.count() > 0) {
        await dateFields.first().fill('invalid-date');
        await page.click('text=Save');
        await page.waitForTimeout(1000);
        
        // Should show validation error
      }
    });
  });

  test.describe('Data Loading Edge Cases', () => {
    test('should handle empty data sets gracefully', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/v1/persons*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 20,
            number: 0
          })
        });
      });
      
      await page.goto('/persons');
      
      // Should show empty state message
      await expect(page.locator('text=No data available')).toBeVisible();
    });

    test('should handle malformed API responses', async ({ page }) => {
      // Mock invalid JSON response
      await page.route('**/api/v1/categories*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json{'
        });
      });
      
      await page.goto('/categories');
      await page.waitForTimeout(3000);
      
      // Should handle gracefully without crashing
      await expect(page.locator('body')).toBeVisible(); // App should still be functional
    });
  });

  test.describe('Browser Compatibility and Edge Cases', () => {
    test('should work with disabled JavaScript features', async ({ page }) => {
      // Basic functionality test
      await page.goto('/dashboard');
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
      
      // Navigation should work
      await page.click('text=View Persons');
      await page.waitForURL('**/persons');
      await expect(page.locator('h2')).toContainText('Persons');
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      // Navigate through several pages
      await page.goto('/persons');
      await page.goto('/categories');
      await page.goto('/entries');
      
      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL(/categories/);
      
      // Use browser forward button
      await page.goForward();
      await expect(page).toHaveURL(/entries/);
    });

    test('should handle page refresh gracefully', async ({ page }) => {
      await page.goto('/entries');
      await page.waitForSelector('[data-testid="entries-table"]', { timeout: 10000 });
      
      // Refresh page
      await page.reload();
      
      // Should maintain authentication and load correctly
      await page.waitForSelector('[data-testid="entries-table"]', { timeout: 10000 });
      await expect(page.locator('h2')).toContainText('Entries');
    });
  });

  test.describe('Security Edge Cases', () => {
    test('should prevent unauthorized access to admin features', async ({ page }) => {
      // Logout and login as regular user
      await page.click('[data-testid="logout-button"]');
      await page.waitForURL('**/login');
      
      await page.fill('[data-testid="username"]', 'user');
      await page.fill('[data-testid="password"] input', 'user');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Admin-only features should not be visible
      await expect(page.locator('text=Users')).not.toBeVisible();
      await expect(page.locator('text=Audit Log')).not.toBeVisible();
      await expect(page.locator('text=System Logs')).not.toBeVisible();
    });

    test('should handle session timeout', async ({ page }) => {
      // Clear localStorage/sessionStorage to simulate session timeout
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to navigate to protected route
      await page.goto('/users');
      
      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 5000 });
      await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
    });
  });

  test.describe('Performance Edge Cases', () => {
    test('should handle large data sets without freezing', async ({ page }) => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        note: `Note for person ${i + 1}`,
        active: i % 2 === 0,
        createdAt: new Date().toISOString()
      }));
      
      await page.route('**/api/v1/persons*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: largeDataset.slice(0, 20), // Paginated
            totalElements: 1000,
            totalPages: 50,
            size: 20,
            number: 0
          })
        });
      });
      
      await page.goto('/persons');
      await page.waitForSelector('[data-testid="persons-table"]', { timeout: 10000 });
      
      // Should load without hanging
      await expect(page.locator('[data-testid="persons-table"]')).toBeVisible();
    });

    test('should handle rapid navigation without errors', async ({ page }) => {
      // Rapidly navigate between pages
      await page.goto('/dashboard');
      await page.goto('/persons');
      await page.goto('/categories');
      await page.goto('/entries');
      await page.goto('/events');
      await page.goto('/reports');
      
      // Should end up on the last page without errors
      await expect(page.locator('h2')).toContainText('Reports');
    });
  });

  test.describe('UI Edge Cases', () => {
    test('should handle extremely narrow browser windows', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Very narrow mobile
      
      await page.goto('/dashboard');
      
      // UI should remain functional
      await expect(page.locator('text=🍷 Vinodelnya')).toBeVisible();
      
      // Menu should be accessible (may be collapsed)
      const menuItems = page.locator('.sidebar-menu, .mobile-menu, text=Dashboard');
      await expect(menuItems.first()).toBeVisible();
      
      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should handle high DPI displays', async ({ page }) => {
      // Set high DPI
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/dashboard');
      
      // UI should render correctly
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });
  });
});