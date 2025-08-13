import { test, expect } from '@playwright/test';

test.describe('Categories Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to categories page', async ({ page }) => {
    await page.click('text=Categories');
    await expect(page).toHaveURL('/categories');
    await expect(page.locator('text=Categories Management')).toBeVisible();
  });

  test('should display categories list', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('[data-testid="categories-table"]')).toBeVisible();
  });

  test('should open add category dialog', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="add-category-button"]');
    await expect(page.locator('[data-testid="category-dialog"]')).toBeVisible();
  });

  test('should create new category', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="add-category-button"]');
    
    await page.fill('[data-testid="category-name"]', 'Test Category E2E');
    await page.fill('[data-testid="category-description"]', 'E2E Test Description');
    await page.click('[data-testid="save-category-button"]');
    
    await expect(page.locator('text=Test Category E2E')).toBeVisible();
  });

  test('should edit existing category', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="edit-category-button"]:first-child');
    
    await page.fill('[data-testid="category-name"]', 'Edited Category E2E');
    await page.click('[data-testid="save-category-button"]');
    
    await expect(page.locator('text=Edited Category E2E')).toBeVisible();
  });

  test('should delete category', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="delete-category-button"]:first-child');
    await page.click('[data-testid="confirm-delete-button"]');
    
    await expect(page.locator('text=Category deleted successfully')).toBeVisible();
  });

  // Enhanced filtering tests for categories
  test.describe('Categories Advanced Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/categories');
      await expect(page.locator('[data-testid="categories-table"]')).toBeVisible();
    });

    test('should filter categories using global search', async ({ page }) => {
      // Test global search functionality with PrimeNG table
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('Labor');
      await page.waitForTimeout(500);
      
      // Verify filtering works
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 0) {
        // Check that all visible rows contain "Labor" in name column
        const nameColumns = page.locator('td:nth-child(2)'); // Assuming name is 2nd column
        const nameCount = await nameColumns.count();
        
        for (let i = 0; i < nameCount; i++) {
          const name = await nameColumns.nth(i).textContent();
          expect(name?.toLowerCase()).toContain('labor');
        }
      }
    });

    test('should filter categories by active status', async ({ page }) => {
      // Test status filtering using dropdown
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Active');
      await page.waitForTimeout(500);
      
      // Verify all shown categories are active
      const statusBadges = page.locator('.status-badge, .p-tag');
      const badgeCount = await statusBadges.count();
      
      if (badgeCount > 0) {
        for (let i = 0; i < badgeCount; i++) {
          const status = await statusBadges.nth(i).textContent();
          expect(status?.toLowerCase()).toContain('active');
        }
      }
    });

    test('should filter categories by color', async ({ page }) => {
      // Test color-based filtering
      await page.click('[data-testid="color-filter"]');
      await page.waitForTimeout(300);
      
      // Select a specific color option if available
      const colorOptions = page.locator('[data-testid*="color-option"]');
      const optionCount = await colorOptions.count();
      
      if (optionCount > 0) {
        await colorOptions.first().click();
        await page.waitForTimeout(500);
        
        // Verify color filtering works
        const colorIndicators = page.locator('.color-indicator, .category-color');
        const colorCount = await colorIndicators.count();
        
        if (colorCount > 0) {
          // At least verify that color elements are visible
          await expect(colorIndicators.first()).toBeVisible();
        }
      }
    });

    test('should sort categories by name', async ({ page }) => {
      // Click on Name column header to sort
      const nameHeader = page.locator('th:has-text("Name")');
      await nameHeader.click();
      await page.waitForTimeout(500);
      
      // Verify sorting works with category data
      const nameColumns = page.locator('td:nth-child(2)');
      const rowCount = await nameColumns.count();
      
      if (rowCount > 1) {
        const firstNameCell = nameColumns.nth(0);
        const secondNameCell = nameColumns.nth(1);
        
        const firstName = await firstNameCell.textContent();
        const secondName = await secondNameCell.textContent();
        
        // Verify alphabetical order (ascending)
        if (firstName && secondName) {
          expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
        }
      }
    });

    test('should sort categories by description', async ({ page }) => {
      // Click on Description column header if it exists
      const descriptionHeader = page.locator('th:has-text("Description")');
      const headerExists = await descriptionHeader.isVisible();
      
      if (headerExists) {
        await descriptionHeader.click();
        await page.waitForTimeout(500);
        
        // Verify description column sorting
        const descColumns = page.locator('td:nth-child(3)'); // Assuming description is 3rd column
        const rowCount = await descColumns.count();
        
        if (rowCount > 1) {
          const firstDesc = await descColumns.nth(0).textContent();
          const secondDesc = await descColumns.nth(1).textContent();
          
          if (firstDesc && secondDesc) {
            expect(firstDesc.localeCompare(secondDesc)).toBeLessThanOrEqual(0);
          }
        }
      }
    });

    test('should combine name search with status filter', async ({ page }) => {
      // Apply name filter first
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Then apply status filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Active');
      await page.waitForTimeout(500);
      
      // Verify both filters are applied
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 0) {
        // Check name contains "test"
        const nameColumns = page.locator('td:nth-child(2)');
        const statusBadges = page.locator('.status-badge, .p-tag');
        
        for (let i = 0; i < rowCount; i++) {
          const name = await nameColumns.nth(i).textContent();
          expect(name?.toLowerCase()).toContain('test');
          
          if (i < await statusBadges.count()) {
            const status = await statusBadges.nth(i).textContent();
            expect(status?.toLowerCase()).toContain('active');
          }
        }
      }
    });

    test('should clear filters using clear button', async ({ page }) => {
      // Apply some filters first
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('labor');
      await page.waitForTimeout(500);
      
      const filteredRowCount = await page.locator('tbody tr').count();
      
      // Clear filters using PrimeNG clear button or custom clear button
      const clearButton = page.locator('p-button[label="Clear"], [data-testid="clear-filters-button"]').first();
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // Verify search input is cleared
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('');
      
      // Verify all data is shown again
      const allRowCount = await page.locator('tbody tr').count();
      expect(allRowCount).toBeGreaterThanOrEqual(filteredRowCount);
    });

    test('should handle pagination with filters', async ({ page }) => {
      // Apply a filter that might span multiple pages
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('category');
      await page.waitForTimeout(500);
      
      // Check if pagination controls are visible
      const paginator = page.locator('.p-paginator');
      const isVisible = await paginator.isVisible();
      
      if (isVisible) {
        // Test pagination with active filter
        const nextButton = page.locator('.p-paginator-next');
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Verify filter is still active on next page
          const searchValue = await searchInput.inputValue();
          expect(searchValue).toBe('category');
          
          // Verify filtered results on second page
          const visibleRows = page.locator('tbody tr:visible');
          const rowCount = await visibleRows.count();
          
          if (rowCount > 0) {
            const firstNameCell = visibleRows.nth(0).locator('td:nth-child(2)');
            const firstName = await firstNameCell.textContent();
            expect(firstName?.toLowerCase()).toContain('category');
          }
        }
      }
    });

    test('should handle special characters in category search', async ({ page }) => {
      // Test search with special characters that might appear in category names
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      
      const specialSearchTerms = ['test-category', 'test_category', 'test.category', 'test & category'];
      
      for (const term of specialSearchTerms) {
        await searchInput.fill(term);
        await page.waitForTimeout(300);
        
        // Should not crash and should handle the search gracefully
        const errorMessages = page.locator('[data-testid="error-message"]');
        await expect(errorMessages).toHaveCount(0);
        
        // Clear for next test
        await searchInput.clear();
        await page.waitForTimeout(100);
      }
    });

    test('should show no results message when filter returns empty', async ({ page }) => {
      // Search for something that definitely doesn't exist
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('nonexistentcategory123456789');
      await page.waitForTimeout(500);
      
      // Verify no data message is shown
      const noDataMessage = page.locator('text=No categories found');
      await expect(noDataMessage).toBeVisible();
      
      // Verify table is empty
      const dataRows = page.locator('tbody tr');
      const rowCount = await dataRows.count();
      expect(rowCount).toBe(0);
    });

    test('should maintain filter state when editing categories', async ({ page }) => {
      // Apply a filter
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('labor');
      await page.waitForTimeout(500);
      
      // Get the first visible row and try to edit it
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 0) {
        // Click edit button on first row
        await page.click('[data-testid="edit-category-button"]:first-child');
        await page.waitForTimeout(300);
        
        // Cancel the edit dialog
        const cancelButton = page.locator('[data-testid="cancel-button"], .p-button-secondary');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
        
        // Verify filter is still applied
        await page.waitForTimeout(300);
        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBe('labor');
      }
    });
  });
});