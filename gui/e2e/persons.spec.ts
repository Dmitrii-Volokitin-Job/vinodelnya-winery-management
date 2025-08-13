import { test, expect } from '@playwright/test';

test.describe('Persons Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to persons page', async ({ page }) => {
    await page.click('text=Persons');
    await expect(page).toHaveURL('/persons');
    await expect(page.locator('text=Persons Management')).toBeVisible();
  });

  test('should display persons list', async ({ page }) => {
    await page.goto('/persons');
    await expect(page.locator('[data-testid="persons-table"]')).toBeVisible();
  });

  test('should open add person dialog', async ({ page }) => {
    await page.goto('/persons');
    await page.click('[data-testid="add-person-button"]');
    await expect(page.locator('[data-testid="person-dialog"]')).toBeVisible();
  });

  test('should create new person', async ({ page }) => {
    await page.goto('/persons');
    await page.click('[data-testid="add-person-button"]');
    
    await page.fill('[data-testid="person-name"]', 'Test Person E2E');
    await page.fill('[data-testid="person-note"]', 'E2E Test Note');
    await page.click('[data-testid="save-person-button"]');
    
    await expect(page.locator('text=Test Person E2E')).toBeVisible();
  });

  test('should edit existing person', async ({ page }) => {
    await page.goto('/persons');
    await page.click('[data-testid="edit-person-button"]:first-child');
    
    await page.fill('[data-testid="person-name"]', 'Edited Person E2E');
    await page.click('[data-testid="save-person-button"]');
    
    await expect(page.locator('text=Edited Person E2E')).toBeVisible();
  });

  test('should delete person', async ({ page }) => {
    await page.goto('/persons');
    await page.click('[data-testid="delete-person-button"]:first-child');
    await page.click('[data-testid="confirm-delete-button"]');
    
    await expect(page.locator('text=Person deleted successfully')).toBeVisible();
  });

  // Enhanced filtering tests
  test.describe('Persons Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/persons');
      await expect(page.locator('[data-testid="persons-table"]')).toBeVisible();
    });

    test('should filter persons using global search', async ({ page }) => {
      // Test the global search functionality with PrimeNG table
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('John');
      await page.waitForTimeout(500);
      
      // Verify filtering works
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 0) {
        // Check that all visible rows contain "John" in name column
        for (let i = 0; i < rowCount; i++) {
          const nameCell = visibleRows.nth(i).locator('td:nth-child(2)');
          const name = await nameCell.textContent();
          expect(name?.toLowerCase()).toContain('john');
        }
      }
    });

    test('should clear filters using clear button', async ({ page }) => {
      // Apply a filter first
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Clear filters using PrimeNG clear button
      const clearButton = page.locator('p-button[label="Clear"]');
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // Verify search input is cleared
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('');
      
      // Verify all data is shown again
      const allRows = page.locator('tbody tr');
      const rowCount = await allRows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should handle pagination with filters', async ({ page }) => {
      // Apply filter that might span multiple pages
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('person');
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
          expect(searchValue).toBe('person');
          
          // Verify filtered results on second page
          const visibleRows = page.locator('tbody tr:visible');
          const rowCount = await visibleRows.count();
          
          if (rowCount > 0) {
            const firstNameCell = visibleRows.nth(0).locator('td:nth-child(2)');
            const firstName = await firstNameCell.textContent();
            expect(firstName?.toLowerCase()).toContain('person');
          }
        }
      }
    });

    test('should sort filtered results', async ({ page }) => {
      // Apply a filter first
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Click on Name column header to sort
      const nameHeader = page.locator('th:has-text("Name")');
      await nameHeader.click();
      await page.waitForTimeout(500);
      
      // Verify sorting works with filtered data
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 1) {
        const firstNameCell = visibleRows.nth(0).locator('td:nth-child(2)');
        const secondNameCell = visibleRows.nth(1).locator('td:nth-child(2)');
        
        const firstName = await firstNameCell.textContent();
        const secondName = await secondNameCell.textContent();
        
        // Verify alphabetical order (ascending)
        if (firstName && secondName) {
          expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
        }
      }
    });

    test('should handle special characters in search', async ({ page }) => {
      // Test search with special characters
      const searchInput = page.locator('.p-input-icon-left input[type="text"]');
      
      const specialSearchTerms = ['test-person', 'test_person', 'test.person', 'test person'];
      
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
      await searchInput.fill('nonexistentperson123456789');
      await page.waitForTimeout(500);
      
      // Verify no data message is shown
      const noDataMessage = page.locator('text=No persons found');
      await expect(noDataMessage).toBeVisible();
      
      // Verify table is empty
      const dataRows = page.locator('tbody tr');
      const rowCount = await dataRows.count();
      expect(rowCount).toBe(0);
    });
  });
});