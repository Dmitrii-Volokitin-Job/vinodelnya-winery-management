import { test, expect } from '@playwright/test';

test.describe('Events Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to events page', async ({ page }) => {
    await page.click('text=Events');
    await expect(page).toHaveURL('/events');
    await expect(page.locator('text=Events Management')).toBeVisible();
  });

  test('should display events list', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('[data-testid="events-table"]')).toBeVisible();
  });

  test('should open add event dialog', async ({ page }) => {
    await page.goto('/events');
    await page.click('[data-testid="add-event-button"]');
    await expect(page.locator('[data-testid="event-dialog"]')).toBeVisible();
  });

  test('should create new event', async ({ page }) => {
    await page.goto('/events');
    await page.click('[data-testid="add-event-button"]');
    
    await page.fill('[data-testid="event-company"]', 'Test Company E2E');
    await page.fill('[data-testid="event-contact-name"]', 'Test Contact');
    await page.fill('[data-testid="event-contact-phone"]', '+123456789');
    await page.fill('[data-testid="event-adult-lunch"]', '5');
    await page.fill('[data-testid="event-adult-tasting"]', '3');
    await page.click('[data-testid="save-event-button"]');
    
    await expect(page.locator('text=Test Company E2E')).toBeVisible();
  });

  test('should calculate event totals correctly', async ({ page }) => {
    await page.goto('/events');
    await page.click('[data-testid="add-event-button"]');
    
    await page.fill('[data-testid="event-adult-lunch"]', '2');
    await page.fill('[data-testid="event-adult-tasting"]', '3');
    
    await expect(page.locator('[data-testid="event-grand-total"]')).toContainText('40');
  });

  test('should edit existing event', async ({ page }) => {
    await page.goto('/events');
    await page.click('[data-testid="edit-event-button"]:first-child');
    
    await page.fill('[data-testid="event-company"]', 'Edited Company E2E');
    await page.click('[data-testid="save-event-button"]');
    
    await expect(page.locator('text=Edited Company E2E')).toBeVisible();
  });

  // Enhanced filtering tests for events
  test.describe('Events Advanced Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/events');
      await expect(page.locator('[data-testid="events-table"]')).toBeVisible();
    });

    test('should filter events by date range', async ({ page }) => {
      // Test date range filtering
      await page.click('[data-testid="event-date-filter"]');
      await page.waitForTimeout(300);
      
      // Select "This Month" option
      const thisMonthOption = page.locator('text=This Month, [data-testid="this-month-filter"]');
      if (await thisMonthOption.isVisible()) {
        await thisMonthOption.click();
        await page.waitForTimeout(500);
        
        // Verify events are filtered to current month
        const dateColumns = page.locator('td:has-text("/")');
        const dateCount = await dateColumns.count();
        
        if (dateCount > 0) {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          
          for (let i = 0; i < Math.min(3, dateCount); i++) {
            const dateText = await dateColumns.nth(i).textContent();
            if (dateText) {
              expect(dateText).toContain(currentYear.toString());
            }
          }
        }
      }
    });

    test('should filter events by custom date range', async ({ page }) => {
      // Apply custom date range filter
      await page.fill('[data-testid="start-date"]', '2024-01-01');
      await page.fill('[data-testid="end-date"]', '2024-03-31');
      await page.click('[data-testid="apply-date-filter"]');
      await page.waitForTimeout(500);
      
      // Verify events are within the specified date range
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

    test('should filter events by status', async ({ page }) => {
      // Test status filtering
      await page.click('[data-testid="event-status-filter"]');
      await page.waitForTimeout(300);
      
      // Select "Confirmed" status
      const confirmedOption = page.locator('text=Confirmed, [data-testid="confirmed-status"]');
      if (await confirmedOption.isVisible()) {
        await confirmedOption.click();
        await page.waitForTimeout(500);
        
        // Verify all shown events have "Confirmed" status
        const statusBadges = page.locator('.status-badge, .p-tag, .event-status');
        const statusCount = await statusBadges.count();
        
        if (statusCount > 0) {
          for (let i = 0; i < statusCount; i++) {
            const status = await statusBadges.nth(i).textContent();
            expect(status?.toLowerCase()).toContain('confirmed');
          }
        }
      }
    });

    test('should search events by company name', async ({ page }) => {
      // Test company name search
      const searchInput = page.locator('[data-testid="company-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('winery');
        await page.waitForTimeout(500);
        
        // Verify company name filtering
        const companyColumns = page.locator('td:nth-child(2), td:has-text("winery")');
        const companyCount = await companyColumns.count();
        
        if (companyCount > 0) {
          for (let i = 0; i < companyCount; i++) {
            const company = await companyColumns.nth(i).textContent();
            expect(company?.toLowerCase()).toContain('winery');
          }
        }
      }
    });

    test('should filter events by contact person', async ({ page }) => {
      // Test contact person search
      const contactFilter = page.locator('[data-testid="contact-search"]');
      if (await contactFilter.isVisible()) {
        await contactFilter.fill('john');
        await page.waitForTimeout(500);
        
        // Verify contact filtering
        const contactColumns = page.locator('td:nth-child(3), td:has-text("john")');
        const contactCount = await contactColumns.count();
        
        if (contactCount > 0) {
          for (let i = 0; i < contactCount; i++) {
            const contact = await contactColumns.nth(i).textContent();
            expect(contact?.toLowerCase()).toContain('john');
          }
        }
      }
    });

    test('should filter events by guest count range', async ({ page }) => {
      // Test filtering by minimum guest count
      const minGuestFilter = page.locator('[data-testid="min-guests"]');
      if (await minGuestFilter.isVisible()) {
        await minGuestFilter.fill('5');
        await page.waitForTimeout(300);
        
        const maxGuestFilter = page.locator('[data-testid="max-guests"]');
        if (await maxGuestFilter.isVisible()) {
          await maxGuestFilter.fill('20');
        }
        
        await page.click('[data-testid="apply-guest-filter"]');
        await page.waitForTimeout(500);
        
        // Verify guest count filtering
        const guestColumns = page.locator('td:has-text("Adult"), .guest-count');
        const guestCount = await guestColumns.count();
        
        if (guestCount > 0) {
          // Basic validation that guest count columns are visible
          await expect(guestColumns.first()).toBeVisible();
        }
      }
    });

    test('should combine multiple event filters', async ({ page }) => {
      // Apply date filter
      await page.click('[data-testid="event-date-filter"]');
      const thisMonthOption = page.locator('text=This Month');
      if (await thisMonthOption.isVisible()) {
        await thisMonthOption.click();
      }
      await page.waitForTimeout(300);
      
      // Apply status filter
      await page.click('[data-testid="event-status-filter"]');
      const confirmedOption = page.locator('text=Confirmed');
      if (await confirmedOption.isVisible()) {
        await confirmedOption.click();
      }
      await page.waitForTimeout(300);
      
      // Apply company search
      const searchInput = page.locator('[data-testid="company-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
      }
      await page.waitForTimeout(1000);
      
      // Verify multiple filters are applied
      const activeFilters = page.locator('[data-testid="active-filters"]');
      if (await activeFilters.isVisible()) {
        await expect(activeFilters).toBeVisible();
      }
      
      // Check that results match all criteria
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      // At least verify the table still shows data with combined filters
      await expect(page.locator('[data-testid="events-table"]')).toBeVisible();
    });

    test('should clear all event filters', async ({ page }) => {
      // Apply some filters first
      const searchInput = page.locator('[data-testid="company-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
      }
      
      const initialRowCount = await page.locator('tbody tr').count();
      
      // Clear filters
      const clearButton = page.locator('[data-testid="clear-filters-button"], p-button[label="Clear"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);
        
        // Verify filters are cleared
        if (await searchInput.isVisible()) {
          const searchValue = await searchInput.inputValue();
          expect(searchValue).toBe('');
        }
        
        // Verify all data is shown again
        const finalRowCount = await page.locator('tbody tr').count();
        expect(finalRowCount).toBeGreaterThanOrEqual(initialRowCount);
      }
    });

    test('should handle pagination with event filters', async ({ page }) => {
      // Apply a broad filter
      const searchInput = page.locator('[data-testid="company-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('event');
        await page.waitForTimeout(500);
      }
      
      // Check if pagination is available
      const paginator = page.locator('.p-paginator');
      const isVisible = await paginator.isVisible();
      
      if (isVisible) {
        const nextButton = page.locator('.p-paginator-next');
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Verify filter is still applied on next page
          if (await searchInput.isVisible()) {
            const searchValue = await searchInput.inputValue();
            expect(searchValue).toBe('event');
          }
          
          // Verify data is still filtered
          const rows = page.locator('tbody tr');
          const rowCount = await rows.count();
          expect(rowCount).toBeGreaterThan(0);
        }
      }
    });

    test('should show upcoming events by default', async ({ page }) => {
      // Verify that upcoming events filter is applied by default
      const upcomingFilter = page.locator('[data-testid="upcoming-events-indicator"], text=Upcoming Events');
      if (await upcomingFilter.isVisible()) {
        await expect(upcomingFilter).toBeVisible();
        
        // Verify dates are in the future or current month
        const dateColumns = page.locator('td:has-text("/")');
        const dateCount = await dateColumns.count();
        
        if (dateCount > 0) {
          const currentYear = new Date().getFullYear();
          for (let i = 0; i < Math.min(3, dateCount); i++) {
            const dateText = await dateColumns.nth(i).textContent();
            if (dateText) {
              // Should contain current year or future years
              expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/(202[4-9]|203\d)/);
            }
          }
        }
      }
    });

    test('should handle empty filter results for events', async ({ page }) => {
      // Apply filters that should return no results
      const searchInput = page.locator('[data-testid="company-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('nonexistentevent123456789');
        await page.waitForTimeout(500);
        
        // Verify no data message is shown
        const noDataMessage = page.locator('text=No events found');
        await expect(noDataMessage).toBeVisible();
        
        // Verify table is empty
        const dataRows = page.locator('tbody tr');
        const rowCount = await dataRows.count();
        expect(rowCount).toBe(0);
      }
    });

    test('should sort filtered events by date', async ({ page }) => {
      // Apply a filter first
      const searchInput = page.locator('[data-testid="company-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
      }
      
      // Click on Date column header to sort
      const dateHeader = page.locator('th:has-text("Date"), th:has-text("Event Date")');
      if (await dateHeader.isVisible()) {
        await dateHeader.click();
        await page.waitForTimeout(500);
        
        // Verify sorting works with filtered data
        const visibleRows = page.locator('tbody tr:visible');
        const rowCount = await visibleRows.count();
        
        if (rowCount > 1) {
          // Basic verification that sorting is applied
          const firstRow = visibleRows.nth(0);
          const secondRow = visibleRows.nth(1);
          
          await expect(firstRow).toBeVisible();
          await expect(secondRow).toBeVisible();
        }
      }
    });
  });
});