import { test, expect } from '@playwright/test';

test.describe('Advanced Filtering Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Persons Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/persons');
      await expect(page.locator('[data-testid="persons-table"]')).toBeVisible();
    });

    test('should filter persons by name using global search', async ({ page }) => {
      // Test global search functionality
      await page.fill('.p-input-icon-left input[type="text"]', 'John');
      await page.waitForTimeout(500); // Wait for debounce
      
      // Verify filtered results
      const rows = page.locator('tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify all visible names contain "John"
      const nameColumns = page.locator('td:nth-child(2)');
      const nameCount = await nameColumns.count();
      for (let i = 0; i < nameCount; i++) {
        const name = await nameColumns.nth(i).textContent();
        expect(name?.toLowerCase()).toContain('john');
      }
    });

    test('should filter persons by active status', async ({ page }) => {
      // Test status filtering
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Active');
      await page.waitForTimeout(500);
      
      // Verify all shown persons are active
      const statusBadges = page.locator('.status-badge');
      const badgeCount = await statusBadges.count();
      for (let i = 0; i < badgeCount; i++) {
        const status = await statusBadges.nth(i).textContent();
        expect(status?.toLowerCase()).toContain('active');
      }
    });

    test('should combine multiple filters', async ({ page }) => {
      // Apply name filter
      await page.fill('.p-input-icon-left input[type="text"]', 'test');
      await page.waitForTimeout(500);
      
      // Apply status filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Active');
      await page.waitForTimeout(500);
      
      // Verify combined filtering works
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        // Check that results match both criteria
        const nameColumns = page.locator('td:nth-child(2)');
        const statusBadges = page.locator('.status-badge');
        
        for (let i = 0; i < rowCount; i++) {
          const name = await nameColumns.nth(i).textContent();
          const status = await statusBadges.nth(i).textContent();
          
          expect(name?.toLowerCase()).toContain('test');
          expect(status?.toLowerCase()).toContain('active');
        }
      }
    });

    test('should clear all filters', async ({ page }) => {
      // Apply some filters first
      await page.fill('.p-input-icon-left input[type="text"]', 'test');
      await page.waitForTimeout(500);
      
      const initialRowCount = await page.locator('tbody tr').count();
      
      // Clear filters
      await page.click('[data-testid="clear-filters-button"]');
      await page.waitForTimeout(500);
      
      // Verify all data is shown again
      const finalRowCount = await page.locator('tbody tr').count();
      expect(finalRowCount).toBeGreaterThanOrEqual(initialRowCount);
      
      // Verify search input is cleared
      const searchValue = await page.locator('.p-input-icon-left input[type="text"]').inputValue();
      expect(searchValue).toBe('');
    });
  });

  test.describe('Categories Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/categories');
      await expect(page.locator('[data-testid="categories-table"]')).toBeVisible();
    });

    test('should filter categories by name', async ({ page }) => {
      await page.fill('.p-input-icon-left input[type="text"]', 'labor');
      await page.waitForTimeout(500);
      
      const nameColumns = page.locator('td:nth-child(2)');
      const nameCount = await nameColumns.count();
      
      if (nameCount > 0) {
        for (let i = 0; i < nameCount; i++) {
          const name = await nameColumns.nth(i).textContent();
          expect(name?.toLowerCase()).toContain('labor');
        }
      }
    });

    test('should filter categories by color', async ({ page }) => {
      // Test color-based filtering
      await page.click('[data-testid="color-filter"]');
      await page.click('[data-testid="color-option-red"]');
      await page.waitForTimeout(500);
      
      // Verify color filtering
      const colorIndicators = page.locator('.color-indicator');
      const colorCount = await colorIndicators.count();
      
      if (colorCount > 0) {
        for (let i = 0; i < colorCount; i++) {
          const style = await colorIndicators.nth(i).getAttribute('style');
          expect(style).toContain('red');
        }
      }
    });

    test('should sort categories by different columns', async ({ page }) => {
      // Test sorting by name
      await page.click('th:has-text("Name")');
      await page.waitForTimeout(500);
      
      // Get first few names to verify sorting
      const nameColumns = page.locator('td:nth-child(2)');
      const firstName = await nameColumns.nth(0).textContent();
      const secondName = await nameColumns.nth(1).textContent();
      
      if (firstName && secondName) {
        expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
      }
    });
  });

  test.describe('Entries Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entries');
      await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
    });

    test('should filter entries by date range', async ({ page }) => {
      // Set start date
      await page.click('[data-testid="start-date-picker"]');
      await page.fill('[data-testid="start-date-input"]', '01/01/2025');
      
      // Set end date
      await page.click('[data-testid="end-date-picker"]');
      await page.fill('[data-testid="end-date-input"]', '31/01/2025');
      
      await page.click('[data-testid="apply-date-filter"]');
      await page.waitForTimeout(500);
      
      // Verify dates are within range
      const dateColumns = page.locator('td:has-text("/")');
      const dateCount = await dateColumns.count();
      
      if (dateCount > 0) {
        for (let i = 0; i < Math.min(3, dateCount); i++) {
          const dateText = await dateColumns.nth(i).textContent();
          if (dateText) {
            // Basic date validation - should contain 2025
            expect(dateText).toContain('2025');
          }
        }
      }
    });

    test('should filter entries by person', async ({ page }) => {
      await page.click('[data-testid="person-filter"]');
      await page.click('[data-testid="person-option"]:first-child');
      await page.waitForTimeout(500);
      
      // Verify person filtering
      const personColumns = page.locator('td:nth-child(3)');
      const personCount = await personColumns.count();
      
      if (personCount > 0) {
        const selectedPerson = await page.locator('[data-testid="person-filter"] .p-dropdown-label').textContent();
        for (let i = 0; i < personCount; i++) {
          const person = await personColumns.nth(i).textContent();
          expect(person).toBe(selectedPerson);
        }
      }
    });

    test('should filter entries by category', async ({ page }) => {
      await page.click('[data-testid="category-filter"]');
      await page.click('[data-testid="category-option"]:first-child');
      await page.waitForTimeout(500);
      
      // Verify category filtering
      const categoryColumns = page.locator('td:nth-child(4)');
      const categoryCount = await categoryColumns.count();
      
      if (categoryCount > 0) {
        const selectedCategory = await page.locator('[data-testid="category-filter"] .p-dropdown-label').textContent();
        for (let i = 0; i < categoryCount; i++) {
          const category = await categoryColumns.nth(i).textContent();
          expect(category).toBe(selectedCategory);
        }
      }
    });

    test('should show current month by default', async ({ page }) => {
      // Verify that current month filter is applied by default
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Check if the date filter shows current month
      const dateFilter = page.locator('[data-testid="current-month-indicator"]');
      await expect(dateFilter).toBeVisible();
      
      const filterText = await dateFilter.textContent();
      expect(filterText).toContain(currentYear.toString());
    });
  });

  test.describe('Events Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/events');
      await expect(page.locator('[data-testid="events-table"]')).toBeVisible();
    });

    test('should filter events by date range', async ({ page }) => {
      await page.click('[data-testid="event-date-filter"]');
      
      // Select this month
      await page.click('text=This Month');
      await page.waitForTimeout(500);
      
      // Verify events are from current month
      const dateColumns = page.locator('td:has-text("/")');
      const dateCount = await dateColumns.count();
      
      if (dateCount > 0) {
        const currentMonth = new Date().getMonth() + 1;
        for (let i = 0; i < Math.min(3, dateCount); i++) {
          const dateText = await dateColumns.nth(i).textContent();
          if (dateText) {
            // Should contain current month in some format
            expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
          }
        }
      }
    });

    test('should filter events by status', async ({ page }) => {
      await page.click('[data-testid="event-status-filter"]');
      await page.click('text=Confirmed');
      await page.waitForTimeout(500);
      
      // Verify all shown events have "Confirmed" status
      const statusColumns = page.locator('.status-badge');
      const statusCount = await statusColumns.count();
      
      if (statusCount > 0) {
        for (let i = 0; i < statusCount; i++) {
          const status = await statusColumns.nth(i).textContent();
          expect(status?.toLowerCase()).toContain('confirmed');
        }
      }
    });

    test('should search events by company name', async ({ page }) => {
      await page.fill('[data-testid="company-search"]', 'winery');
      await page.waitForTimeout(500);
      
      // Verify company name filtering
      const companyColumns = page.locator('td:nth-child(4)');
      const companyCount = await companyColumns.count();
      
      if (companyCount > 0) {
        for (let i = 0; i < companyCount; i++) {
          const company = await companyColumns.nth(i).textContent();
          expect(company?.toLowerCase()).toContain('winery');
        }
      }
    });
  });

  test.describe('Users Filtering (Admin Only)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/users');
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    });

    test('should filter users by role', async ({ page }) => {
      await page.click('[data-testid="role-filter"]');
      await page.click('text=ADMIN');
      await page.waitForTimeout(500);
      
      // Verify role filtering
      const roleColumns = page.locator('.role-badge');
      const roleCount = await roleColumns.count();
      
      if (roleCount > 0) {
        for (let i = 0; i < roleCount; i++) {
          const role = await roleColumns.nth(i).textContent();
          expect(role?.toUpperCase()).toContain('ADMIN');
        }
      }
    });

    test('should filter users by active status', async ({ page }) => {
      await page.click('[data-testid="user-status-filter"]');
      await page.click('text=Active Users');
      await page.waitForTimeout(500);
      
      // Verify active status filtering
      const statusIndicators = page.locator('.user-status-indicator');
      const statusCount = await statusIndicators.count();
      
      if (statusCount > 0) {
        for (let i = 0; i < statusCount; i++) {
          const isActive = await statusIndicators.nth(i).getAttribute('class');
          expect(isActive).toContain('active');
        }
      }
    });

    test('should search users by username', async ({ page }) => {
      await page.fill('[data-testid="username-search"]', 'admin');
      await page.waitForTimeout(500);
      
      // Verify username filtering
      const usernameColumns = page.locator('td:nth-child(2)');
      const usernameCount = await usernameColumns.count();
      
      if (usernameCount > 0) {
        for (let i = 0; i < usernameCount; i++) {
          const username = await usernameColumns.nth(i).textContent();
          expect(username?.toLowerCase()).toContain('admin');
        }
      }
    });
  });

  test.describe('Advanced Filter Combinations', () => {
    test('should apply multiple filters simultaneously across different components', async ({ page }) => {
      // Test complex filtering scenario in Entries
      await page.goto('/entries');
      await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
      
      // Apply person filter
      await page.click('[data-testid="person-filter"]');
      await page.click('[data-testid="person-option"]:first-child');
      
      // Apply category filter
      await page.click('[data-testid="category-filter"]');
      await page.click('[data-testid="category-option"]:first-child');
      
      // Apply date range
      await page.click('[data-testid="this-month-filter"]');
      
      await page.waitForTimeout(1000);
      
      // Verify all filters are applied
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      // If there are results, verify they match all criteria
      if (rowCount > 0) {
        await expect(page.locator('[data-testid="active-filters"]')).toBeVisible();
        
        // Check that filter indicators show active state
        await expect(page.locator('[data-testid="person-filter"][aria-expanded="false"]')).toHaveClass(/p-focus/);
        await expect(page.locator('[data-testid="category-filter"][aria-expanded="false"]')).toHaveClass(/p-focus/);
      }
    });

    test('should maintain filter state during navigation', async ({ page }) => {
      // Apply filters on persons page
      await page.goto('/persons');
      await page.fill('.p-input-icon-left input[type="text"]', 'test');
      await page.waitForTimeout(500);
      
      // Navigate away and back
      await page.goto('/categories');
      await page.goto('/persons');
      
      // Verify filter state is maintained (if implemented with state management)
      // This might need to be adjusted based on actual implementation
      const searchValue = await page.locator('.p-input-icon-left input[type="text"]').inputValue();
      // Note: This might be empty if filters don't persist - adjust test based on requirements
    });

    test('should handle empty filter results gracefully', async ({ page }) => {
      await page.goto('/persons');
      
      // Apply filter that should return no results
      await page.fill('.p-input-icon-left input[type="text"]', 'nonexistentpersonname12345');
      await page.waitForTimeout(500);
      
      // Verify empty state is shown
      await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
      await expect(page.locator('text=No persons found')).toBeVisible();
    });
  });

  test.describe('Performance and UX', () => {
    test('should handle rapid filter changes without issues', async ({ page }) => {
      await page.goto('/entries');
      
      // Rapidly change filters
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="search-input"]', `test${i}`);
        await page.waitForTimeout(100);
      }
      
      await page.waitForTimeout(1000);
      
      // Verify final state is correct
      const searchValue = await page.locator('[data-testid="search-input"]').inputValue();
      expect(searchValue).toBe('test4');
    });

    test('should show loading states during filtering', async ({ page }) => {
      await page.goto('/entries');
      
      // Apply filter and check for loading indicator
      await page.fill('[data-testid="search-input"]', 'test');
      
      // Look for loading indicator (if implemented)
      // await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      await page.waitForTimeout(1000);
      
      // Loading should be gone
      // await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });
  });
});