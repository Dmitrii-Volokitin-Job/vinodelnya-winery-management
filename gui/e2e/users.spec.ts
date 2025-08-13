import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to users page', async ({ page }) => {
    await page.click('text=Users');
    await expect(page).toHaveURL('/users');
    await expect(page.locator('text=User Management')).toBeVisible();
  });

  test('should display users list', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('should open add user dialog', async ({ page }) => {
    await page.goto('/users');
    await page.click('[data-testid="add-user-button"]');
    await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/users');
    await page.click('[data-testid="add-user-button"]');
    
    await page.fill('[data-testid="user-username"]', 'testuser_e2e');
    await page.fill('[data-testid="user-password"]', 'testpass123');
    await page.selectOption('[data-testid="user-role"]', 'USER');
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.locator('text=testuser_e2e')).toBeVisible();
  });

  test('should edit existing user', async ({ page }) => {
    await page.goto('/users');
    await page.click('[data-testid="edit-user-button"]:nth-child(1)');
    
    await page.fill('[data-testid="user-username"]', 'edited_user_e2e');
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.locator('text=edited_user_e2e')).toBeVisible();
  });

  test('should activate/deactivate user', async ({ page }) => {
    await page.goto('/users');
    await page.click('[data-testid="toggle-user-status-button"]:first-child');
    await page.click('[data-testid="confirm-action-button"]');
    
    await expect(page.locator('text=User status updated')).toBeVisible();
  });

  // Enhanced filtering tests for users (Admin Only)
  test.describe('Users Advanced Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/users');
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    });

    test('should filter users by role', async ({ page }) => {
      // Test role-based filtering
      await page.click('[data-testid="role-filter"]');
      await page.waitForTimeout(300);
      
      // Select ADMIN role
      const adminOption = page.locator('text=ADMIN, [data-testid="admin-role"]');
      if (await adminOption.isVisible()) {
        await adminOption.click();
        await page.waitForTimeout(500);
        
        // Verify all shown users have ADMIN role
        const roleColumns = page.locator('.role-badge, .p-tag, td:nth-child(3)');
        const roleCount = await roleColumns.count();
        
        if (roleCount > 0) {
          for (let i = 0; i < roleCount; i++) {
            const role = await roleColumns.nth(i).textContent();
            expect(role?.toUpperCase()).toContain('ADMIN');
          }
        }
      }
    });

    test('should filter users by USER role', async ({ page }) => {
      // Test filtering by USER role
      await page.click('[data-testid="role-filter"]');
      await page.waitForTimeout(300);
      
      // Select USER role
      const userOption = page.locator('text=USER, [data-testid="user-role"]');
      if (await userOption.isVisible()) {
        await userOption.click();
        await page.waitForTimeout(500);
        
        // Verify all shown users have USER role
        const roleColumns = page.locator('.role-badge, .p-tag, td:nth-child(3)');
        const roleCount = await roleColumns.count();
        
        if (roleCount > 0) {
          for (let i = 0; i < roleCount; i++) {
            const role = await roleColumns.nth(i).textContent();
            expect(role?.toUpperCase()).toContain('USER');
          }
        }
      }
    });

    test('should filter users by active status', async ({ page }) => {
      // Test active status filtering
      await page.click('[data-testid="user-status-filter"]');
      await page.waitForTimeout(300);
      
      // Select Active Users
      const activeOption = page.locator('text=Active Users, text=Active, [data-testid="active-users"]');
      if (await activeOption.isVisible()) {
        await activeOption.click();
        await page.waitForTimeout(500);
        
        // Verify all shown users are active
        const statusIndicators = page.locator('.user-status-indicator, .status-badge, .p-tag-success');
        const statusCount = await statusIndicators.count();
        
        if (statusCount > 0) {
          for (let i = 0; i < statusCount; i++) {
            const statusClass = await statusIndicators.nth(i).getAttribute('class');
            expect(statusClass).toContain('active');
          }
        }
      }
    });

    test('should filter users by inactive status', async ({ page }) => {
      // Test inactive status filtering
      await page.click('[data-testid="user-status-filter"]');
      await page.waitForTimeout(300);
      
      // Select Inactive Users
      const inactiveOption = page.locator('text=Inactive Users, text=Inactive, [data-testid="inactive-users"]');
      if (await inactiveOption.isVisible()) {
        await inactiveOption.click();
        await page.waitForTimeout(500);
        
        // Verify all shown users are inactive
        const statusIndicators = page.locator('.user-status-indicator, .status-badge, .p-tag-danger');
        const statusCount = await statusIndicators.count();
        
        if (statusCount > 0) {
          for (let i = 0; i < statusCount; i++) {
            const statusClass = await statusIndicators.nth(i).getAttribute('class');
            expect(statusClass).toContain('inactive');
          }
        }
      }
    });

    test('should search users by username', async ({ page }) => {
      // Test username search functionality
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('admin');
        await page.waitForTimeout(500);
        
        // Verify username filtering
        const usernameColumns = page.locator('td:nth-child(2), td:has-text("admin")');
        const usernameCount = await usernameColumns.count();
        
        if (usernameCount > 0) {
          for (let i = 0; i < usernameCount; i++) {
            const username = await usernameColumns.nth(i).textContent();
            expect(username?.toLowerCase()).toContain('admin');
          }
        }
      }
    });

    test('should search users by partial username', async ({ page }) => {
      // Test partial username search
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('user');
        await page.waitForTimeout(500);
        
        // Verify partial username filtering
        const usernameColumns = page.locator('td:nth-child(2)');
        const usernameCount = await usernameColumns.count();
        
        if (usernameCount > 0) {
          for (let i = 0; i < usernameCount; i++) {
            const username = await usernameColumns.nth(i).textContent();
            expect(username?.toLowerCase()).toContain('user');
          }
        }
      }
    });

    test('should combine role and status filters', async ({ page }) => {
      // Apply role filter first
      await page.click('[data-testid="role-filter"]');
      const adminOption = page.locator('text=ADMIN');
      if (await adminOption.isVisible()) {
        await adminOption.click();
      }
      await page.waitForTimeout(300);
      
      // Then apply status filter
      await page.click('[data-testid="user-status-filter"]');
      const activeOption = page.locator('text=Active');
      if (await activeOption.isVisible()) {
        await activeOption.click();
      }
      await page.waitForTimeout(500);
      
      // Verify both filters are applied
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        // Check that results match both criteria
        const roleColumns = page.locator('.role-badge, td:nth-child(3)');
        const statusIndicators = page.locator('.user-status-indicator, .status-badge');
        
        if (await roleColumns.count() > 0) {
          const role = await roleColumns.first().textContent();
          expect(role?.toUpperCase()).toContain('ADMIN');
        }
        
        if (await statusIndicators.count() > 0) {
          const statusClass = await statusIndicators.first().getAttribute('class');
          expect(statusClass).toContain('active');
        }
      }
    });

    test('should combine username search with role filter', async ({ page }) => {
      // Apply username search first
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
      }
      
      // Then apply role filter
      await page.click('[data-testid="role-filter"]');
      const userOption = page.locator('text=USER');
      if (await userOption.isVisible()) {
        await userOption.click();
      }
      await page.waitForTimeout(500);
      
      // Verify combined filtering works
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 0) {
        // Check name contains "test" and role is USER
        const usernameColumns = page.locator('td:nth-child(2)');
        const roleColumns = page.locator('.role-badge, td:nth-child(3)');
        
        for (let i = 0; i < rowCount; i++) {
          const username = await usernameColumns.nth(i).textContent();
          expect(username?.toLowerCase()).toContain('test');
          
          if (i < await roleColumns.count()) {
            const role = await roleColumns.nth(i).textContent();
            expect(role?.toUpperCase()).toContain('USER');
          }
        }
      }
    });

    test('should clear all user filters', async ({ page }) => {
      // Apply some filters first
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('admin');
        await page.waitForTimeout(500);
      }
      
      const filteredRowCount = await page.locator('tbody tr').count();
      
      // Clear filters
      const clearButton = page.locator('[data-testid="clear-filters-button"], p-button[label="Clear"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);
        
        // Verify search input is cleared
        if (await searchInput.isVisible()) {
          const searchValue = await searchInput.inputValue();
          expect(searchValue).toBe('');
        }
        
        // Verify all users are shown again
        const allRowCount = await page.locator('tbody tr').count();
        expect(allRowCount).toBeGreaterThanOrEqual(filteredRowCount);
      }
    });

    test('should handle pagination with user filters', async ({ page }) => {
      // Apply a filter that might span multiple pages
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('user');
        await page.waitForTimeout(500);
      }
      
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
          if (await searchInput.isVisible()) {
            const searchValue = await searchInput.inputValue();
            expect(searchValue).toBe('user');
          }
          
          // Verify filtered results on second page
          const visibleRows = page.locator('tbody tr:visible');
          const rowCount = await visibleRows.count();
          
          if (rowCount > 0) {
            const firstUsernameCell = visibleRows.nth(0).locator('td:nth-child(2)');
            const firstName = await firstUsernameCell.textContent();
            expect(firstName?.toLowerCase()).toContain('user');
          }
        }
      }
    });

    test('should sort filtered users by username', async ({ page }) => {
      // Apply a filter first
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
      }
      
      // Click on Username column header to sort
      const usernameHeader = page.locator('th:has-text("Username"), th:has-text("User")');
      if (await usernameHeader.isVisible()) {
        await usernameHeader.click();
        await page.waitForTimeout(500);
        
        // Verify sorting works with filtered data
        const visibleRows = page.locator('tbody tr:visible');
        const rowCount = await visibleRows.count();
        
        if (rowCount > 1) {
          const firstUsernameCell = visibleRows.nth(0).locator('td:nth-child(2)');
          const secondUsernameCell = visibleRows.nth(1).locator('td:nth-child(2)');
          
          const firstName = await firstUsernameCell.textContent();
          const secondName = await secondUsernameCell.textContent();
          
          // Verify alphabetical order (ascending)
          if (firstName && secondName) {
            expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
          }
        }
      }
    });

    test('should sort filtered users by role', async ({ page }) => {
      // Apply a broad filter first
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('e');
        await page.waitForTimeout(500);
      }
      
      // Click on Role column header to sort
      const roleHeader = page.locator('th:has-text("Role")');
      if (await roleHeader.isVisible()) {
        await roleHeader.click();
        await page.waitForTimeout(500);
        
        // Verify role column sorting
        const visibleRows = page.locator('tbody tr:visible');
        const rowCount = await visibleRows.count();
        
        if (rowCount > 1) {
          const firstRoleCell = visibleRows.nth(0).locator('td:nth-child(3), .role-badge');
          const secondRoleCell = visibleRows.nth(1).locator('td:nth-child(3), .role-badge');
          
          const firstRole = await firstRoleCell.textContent();
          const secondRole = await secondRoleCell.textContent();
          
          if (firstRole && secondRole) {
            expect(firstRole.localeCompare(secondRole)).toBeLessThanOrEqual(0);
          }
        }
      }
    });

    test('should handle empty user filter results', async ({ page }) => {
      // Search for something that definitely doesn't exist
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('nonexistentuser123456789');
        await page.waitForTimeout(500);
        
        // Verify no data message is shown
        const noDataMessage = page.locator('text=No users found');
        await expect(noDataMessage).toBeVisible();
        
        // Verify table is empty
        const dataRows = page.locator('tbody tr');
        const rowCount = await dataRows.count();
        expect(rowCount).toBe(0);
      }
    });

    test('should maintain filter state when editing users', async ({ page }) => {
      // Apply a filter
      const searchInput = page.locator('[data-testid="username-search"], .p-input-icon-left input[type="text"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('admin');
        await page.waitForTimeout(500);
      }
      
      // Get the first visible row and try to edit it
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      if (rowCount > 0) {
        // Click edit button on first row
        const editButton = page.locator('[data-testid="edit-user-button"]').first();
        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForTimeout(300);
          
          // Cancel the edit dialog
          const cancelButton = page.locator('[data-testid="cancel-button"], .p-button-secondary');
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
          
          // Verify filter is still applied
          await page.waitForTimeout(300);
          if (await searchInput.isVisible()) {
            const searchValue = await searchInput.inputValue();
            expect(searchValue).toBe('admin');
          }
        }
      }
    });
  });
});