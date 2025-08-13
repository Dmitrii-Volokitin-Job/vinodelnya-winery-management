import { test, expect } from '@playwright/test';

test.describe('Entries Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to entries page', async ({ page }) => {
    await page.click('text=Entries');
    await expect(page).toHaveURL('/entries');
    await expect(page.locator('text=Entries Management')).toBeVisible();
  });

  test('should display entries list', async ({ page }) => {
    await page.goto('/entries');
    await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
  });

  test('should show financial summaries', async ({ page }) => {
    await page.goto('/entries');
    await expect(page.locator('text=Page Total')).toBeVisible();
    await expect(page.locator('text=Grand Total')).toBeVisible();
  });

  test('should filter entries by date range', async ({ page }) => {
    await page.goto('/entries');
    
    await page.fill('[data-testid="from-date"]', '2024-01-01');
    await page.fill('[data-testid="to-date"]', '2024-12-31');
    await page.click('[data-testid="apply-filters-button"]');
    
    await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
  });

  test('should open add entry dialog', async ({ page }) => {
    await page.goto('/entries');
    await page.click('[data-testid="add-entry-button"]');
    await expect(page.locator('[data-testid="entry-dialog"]')).toBeVisible();
  });

  test('should create new entry', async ({ page }) => {
    await page.goto('/entries');
    await page.click('[data-testid="add-entry-button"]');
    
    await page.fill('[data-testid="entry-description"]', 'Test Entry E2E');
    await page.fill('[data-testid="entry-amount-paid"]', '100');
    await page.click('[data-testid="save-entry-button"]');
    
    await expect(page.locator('text=Test Entry E2E')).toBeVisible();
  });

  // Enhanced filtering tests for entries
  test.describe('Entries Advanced Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entries');
      await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
    });

    test('should filter by current month by default', async ({ page }) => {
      // Verify current month filter is active by default
      const currentMonthIndicator = page.locator('[data-testid="current-month-filter"]');
      await expect(currentMonthIndicator).toBeVisible();
      
      // Verify entries shown are from current month
      const dateColumns = page.locator('td:has-text("/")');
      const dateCount = await dateColumns.count();
      
      if (dateCount > 0) {
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < Math.min(3, dateCount); i++) {
          const dateText = await dateColumns.nth(i).textContent();
          expect(dateText).toContain(currentYear.toString());
        }
      }
    });

    test('should filter entries by specific date range', async ({ page }) => {
      // Clear current month filter first
      await page.click('[data-testid="clear-date-filter"]');
      await page.waitForTimeout(500);
      
      // Apply custom date range
      await page.fill('[data-testid="from-date"]', '2024-01-01');
      await page.fill('[data-testid="to-date"]', '2024-03-31');
      await page.click('[data-testid="apply-filters-button"]');
      await page.waitForTimeout(500);
      
      // Verify entries are within the specified date range
      const dateColumns = page.locator('td:has-text("/")');
      const dateCount = await dateColumns.count();
      
      if (dateCount > 0) {
        for (let i = 0; i < Math.min(5, dateCount); i++) {
          const dateText = await dateColumns.nth(i).textContent();
          if (dateText) {
            expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/2024/);
          }
        }
      }
    });

    test('should filter entries by person', async ({ page }) => {
      // Open person filter dropdown
      await page.click('[data-testid="person-filter"]');
      await page.waitForTimeout(300);
      
      // Select first available person
      const personOptions = page.locator('[data-testid="person-option"]');
      const optionCount = await personOptions.count();
      
      if (optionCount > 0) {
        await personOptions.first().click();
        await page.waitForTimeout(500);
        
        // Verify all entries are for the selected person
        const selectedPersonName = await page.locator('[data-testid="person-filter"] .p-dropdown-label').textContent();
        const personColumns = page.locator('td:nth-child(3)'); // Assuming person is 3rd column
        const personCount = await personColumns.count();
        
        if (personCount > 0) {
          for (let i = 0; i < personCount; i++) {
            const personName = await personColumns.nth(i).textContent();
            expect(personName).toBe(selectedPersonName);
          }
        }
      }
    });

    test('should filter entries by category', async ({ page }) => {
      // Open category filter dropdown
      await page.click('[data-testid="category-filter"]');
      await page.waitForTimeout(300);
      
      // Select first available category
      const categoryOptions = page.locator('[data-testid="category-option"]');
      const optionCount = await categoryOptions.count();
      
      if (optionCount > 0) {
        await categoryOptions.first().click();
        await page.waitForTimeout(500);
        
        // Verify all entries are for the selected category
        const selectedCategoryName = await page.locator('[data-testid="category-filter"] .p-dropdown-label').textContent();
        const categoryColumns = page.locator('td:nth-child(4)'); // Assuming category is 4th column
        const categoryCount = await categoryColumns.count();
        
        if (categoryCount > 0) {
          for (let i = 0; i < categoryCount; i++) {
            const categoryName = await categoryColumns.nth(i).textContent();
            expect(categoryName).toBe(selectedCategoryName);
          }
        }
      }
    });

    test('should clear all filters', async ({ page }) => {
      // Apply some filters first
      await page.fill('[data-testid="from-date"]', '2024-01-01');
      await page.fill('[data-testid="to-date"]', '2024-06-30');
      await page.click('[data-testid="apply-filters-button"]');
      await page.waitForTimeout(500);
      
      const filteredRowCount = await page.locator('tbody tr').count();
      
      // Clear all filters
      await page.click('[data-testid="clear-all-filters-button"]');
      await page.waitForTimeout(500);
      
      // Verify filters are cleared
      const fromDateValue = await page.locator('[data-testid="from-date"]').inputValue();
      const toDateValue = await page.locator('[data-testid="to-date"]').inputValue();
      
      expect(fromDateValue).toBe('');
      expect(toDateValue).toBe('');
      
      // Verify more data is shown (or at least same amount)
      const allRowCount = await page.locator('tbody tr').count();
      expect(allRowCount).toBeGreaterThanOrEqual(filteredRowCount);
    });

    test('should combine multiple filters', async ({ page }) => {
      // Apply person filter
      await page.click('[data-testid="person-filter"]');
      const personOptions = page.locator('[data-testid="person-option"]');
      if (await personOptions.count() > 0) {
        await personOptions.first().click();
      }
      await page.waitForTimeout(300);
      
      // Apply category filter
      await page.click('[data-testid="category-filter"]');
      const categoryOptions = page.locator('[data-testid="category-option"]');
      if (await categoryOptions.count() > 0) {
        await categoryOptions.first().click();
      }
      await page.waitForTimeout(300);
      
      // Apply date range
      await page.fill('[data-testid="from-date"]', '2024-01-01');
      await page.fill('[data-testid="to-date"]', '2024-12-31');
      await page.click('[data-testid="apply-filters-button"]');
      await page.waitForTimeout(1000);
      
      // Verify multiple filters are applied
      const activeFilters = page.locator('[data-testid="active-filters"]');
      await expect(activeFilters).toBeVisible();
      
      // Check that results match all criteria
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        // At least verify the table still shows data with combined filters
        await expect(page.locator('[data-testid="entries-table"]')).toBeVisible();
      }
    });

    test('should handle pagination with filters', async ({ page }) => {
      // Apply a filter that might span multiple pages
      await page.fill('[data-testid="from-date"]', '2020-01-01');
      await page.fill('[data-testid="to-date"]', '2025-12-31');
      await page.click('[data-testid="apply-filters-button"]');
      await page.waitForTimeout(500);
      
      // Check if pagination is available
      const paginator = page.locator('.p-paginator');
      const isVisible = await paginator.isVisible();
      
      if (isVisible) {
        const nextButton = page.locator('.p-paginator-next');
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Verify filter is still applied on next page
          const fromDateValue = await page.locator('[data-testid="from-date"]').inputValue();
          expect(fromDateValue).toBe('2020-01-01');
          
          // Verify data is still filtered
          const rows = page.locator('tbody tr');
          const rowCount = await rows.count();
          expect(rowCount).toBeGreaterThan(0);
        }
      }
    });

    test('should show financial summaries with filters', async ({ page }) => {
      // Apply a specific date range filter
      await page.fill('[data-testid="from-date"]', '2024-01-01');
      await page.fill('[data-testid="to-date"]', '2024-01-31');
      await page.click('[data-testid="apply-filters-button"]');
      await page.waitForTimeout(500);
      
      // Verify financial summaries are still visible and updated
      await expect(page.locator('text=Page Total')).toBeVisible();
      await expect(page.locator('text=Grand Total')).toBeVisible();
      
      // Verify summaries show some values (not empty)
      const pageTotal = page.locator('[data-testid="page-total-amount"]');
      const grandTotal = page.locator('[data-testid="grand-total-amount"]');
      
      if (await pageTotal.isVisible()) {
        const pageTotalText = await pageTotal.textContent();
        expect(pageTotalText).toMatch(/\d+/); // Should contain numbers
      }
      
      if (await grandTotal.isVisible()) {
        const grandTotalText = await grandTotal.textContent();
        expect(grandTotalText).toMatch(/\d+/); // Should contain numbers
      }
    });

    test('should handle empty filter results', async ({ page }) => {
      // Apply filters that should return no results
      await page.fill('[data-testid="from-date"]', '1990-01-01');
      await page.fill('[data-testid="to-date"]', '1990-12-31');
      await page.click('[data-testid="apply-filters-button"]');
      await page.waitForTimeout(500);
      
      // Verify no data message is shown
      const noDataMessage = page.locator('text=No entries found');
      await expect(noDataMessage).toBeVisible();
      
      // Verify table is empty
      const dataRows = page.locator('tbody tr');
      const rowCount = await dataRows.count();
      expect(rowCount).toBe(0);
      
      // Verify financial summaries show zero
      const pageTotal = page.locator('[data-testid="page-total-amount"]');
      if (await pageTotal.isVisible()) {
        const pageTotalText = await pageTotal.textContent();
        expect(pageTotalText).toMatch(/0|Empty/); // Should show zero or empty
      }
    });
  });
});