import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page, username = 'admin', password = 'admin') {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', username);
  await page.fill('[data-testid="password"] input', password);
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
}

test.describe('Comprehensive CRUD Operations', () => {
  
  test.describe('Persons CRUD', () => {
    test('should perform complete CRUD cycle for persons', async ({ page }) => {
      await login(page);
      
      // Navigate to persons
      await page.click('text=Persons');
      await expect(page).toHaveURL('/persons');
      
      // CREATE - Add new person
      await page.click('[data-testid="add-person-button"]');
      await expect(page.locator('[data-testid="person-dialog"]')).toBeVisible();
      
      await page.fill('[data-testid="person-name"]', 'Test Person CRUD');
      await page.fill('[data-testid="person-note"]', 'Created via E2E test');
      await page.click('[data-testid="save-person-button"]');
      
      // Verify creation
      await expect(page.locator('text=Test Person CRUD')).toBeVisible({ timeout: 10000 });
      
      // READ - Verify person appears in list
      await expect(page.locator('[data-testid="persons-table"]')).toContainText('Test Person CRUD');
      
      // UPDATE - Edit the person
      await page.locator('[data-testid="edit-person-button"]').first().click();
      await page.fill('[data-testid="person-name"]', 'Updated Person CRUD');
      await page.fill('[data-testid="person-note"]', 'Updated via E2E test');
      await page.click('[data-testid="save-person-button"]');
      
      // Verify update
      await expect(page.locator('text=Updated Person CRUD')).toBeVisible({ timeout: 10000 });
      
      // DELETE - Remove the person
      await page.locator('[data-testid="delete-person-button"]').first().click();
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify deletion
      await expect(page.locator('text=Updated Person CRUD')).not.toBeVisible({ timeout: 10000 });
    });
  });
  
  test.describe('Categories CRUD', () => {
    test('should perform complete CRUD cycle for categories', async ({ page }) => {
      await login(page);
      
      // Navigate to categories
      await page.click('text=Categories');
      await expect(page).toHaveURL('/categories');
      
      // CREATE - Add new category
      await page.click('[data-testid="add-category-button"]');
      await expect(page.locator('[data-testid="category-dialog"]')).toBeVisible();
      
      await page.fill('[data-testid="category-name"]', 'Test Category CRUD');
      await page.fill('[data-testid="category-description"]', 'Created via E2E test');
      await page.click('[data-testid="save-category-button"]');
      
      // Verify creation
      await expect(page.locator('text=Test Category CRUD')).toBeVisible({ timeout: 10000 });
      
      // READ - Verify category appears in list
      await expect(page.locator('[data-testid="categories-table"]')).toContainText('Test Category CRUD');
      
      // UPDATE - Edit the category
      await page.locator('[data-testid="edit-category-button"]').first().click();
      await page.fill('[data-testid="category-name"]', 'Updated Category CRUD');
      await page.fill('[data-testid="category-description"]', 'Updated via E2E test');
      await page.click('[data-testid="save-category-button"]');
      
      // Verify update
      await expect(page.locator('text=Updated Category CRUD')).toBeVisible({ timeout: 10000 });
      
      // DELETE - Remove the category
      await page.locator('[data-testid="delete-category-button"]').first().click();
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify deletion
      await expect(page.locator('text=Updated Category CRUD')).not.toBeVisible({ timeout: 10000 });
    });
  });
  
  test.describe('Events CRUD', () => {
    test('should perform complete CRUD cycle for events', async ({ page }) => {
      await login(page);
      
      // Navigate to events
      await page.click('text=Events');
      await expect(page).toHaveURL('/events');
      
      // CREATE - Add new event
      await page.click('[data-testid="add-event-button"]');
      await expect(page.locator('[data-testid="event-dialog"]')).toBeVisible();
      
      await page.fill('[data-testid="event-company"]', 'Test Company CRUD');
      await page.fill('[data-testid="event-contact-name"]', 'Test Contact');
      await page.fill('[data-testid="event-contact-phone"]', '+123456789');
      await page.fill('[data-testid="event-adult-lunch"]', '5');
      await page.fill('[data-testid="event-adult-tasting"]', '3');
      await page.click('[data-testid="save-event-button"]');
      
      // Verify creation
      await expect(page.locator('text=Test Company CRUD')).toBeVisible({ timeout: 10000 });
      
      // READ - Verify event appears in list
      await expect(page.locator('[data-testid="events-table"]')).toContainText('Test Company CRUD');
      
      // UPDATE - Edit the event
      await page.locator('[data-testid="edit-event-button"]').first().click();
      await page.fill('[data-testid="event-company"]', 'Updated Company CRUD');
      await page.fill('[data-testid="event-contact-name"]', 'Updated Contact');
      await page.click('[data-testid="save-event-button"]');
      
      // Verify update
      await expect(page.locator('text=Updated Company CRUD')).toBeVisible({ timeout: 10000 });
      
      // DELETE - Remove the event (if delete functionality exists)
      const deleteButton = page.locator('[data-testid="delete-event-button"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.click('[data-testid="confirm-delete-button"]');
        await expect(page.locator('text=Updated Company CRUD')).not.toBeVisible({ timeout: 10000 });
      }
    });
  });
  
  test.describe('Users CRUD', () => {
    test('should perform complete CRUD cycle for users', async ({ page }) => {
      await login(page);
      
      // Navigate to users
      await page.click('text=Users');
      await expect(page).toHaveURL('/users');
      
      // CREATE - Add new user
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();
      
      await page.fill('[data-testid="user-username"]', 'testuser_crud');
      await page.fill('[data-testid="user-password"] input', 'testpass123');
      await page.click('[data-testid="user-role"]');
      await page.click('text=User');
      await page.click('[data-testid="save-user-button"]');
      
      // Verify creation
      await expect(page.locator('text=testuser_crud')).toBeVisible({ timeout: 10000 });
      
      // READ - Verify user appears in list
      await expect(page.locator('[data-testid="users-table"]')).toContainText('testuser_crud');
      
      // UPDATE - Edit the user
      await page.locator('[data-testid="edit-user-button"]').first().click();
      await page.fill('[data-testid="user-username"]', 'updated_user_crud');
      await page.click('[data-testid="save-user-button"]');
      
      // Verify update
      await expect(page.locator('text=updated_user_crud')).toBeVisible({ timeout: 10000 });
      
      // TOGGLE STATUS - Deactivate/Activate user
      await page.locator('[data-testid="toggle-user-status-button"]').first().click();
      await page.click('[data-testid="confirm-action-button"]');
      await expect(page.locator('text=updated successfully')).toBeVisible({ timeout: 10000 });
    });
  });
  
  test.describe('Entries CRUD', () => {
    test('should perform complete CRUD cycle for entries', async ({ page }) => {
      await login(page);
      
      // Navigate to entries
      await page.click('text=Entries');
      await expect(page).toHaveURL('/entries');
      
      // CREATE - Add new entry
      await page.click('[data-testid="add-entry-button"]');
      await expect(page.locator('[data-testid="entry-dialog"]')).toBeVisible();
      
      await page.fill('[data-testid="entry-description"]', 'Test Entry CRUD');
      await page.fill('[data-testid="entry-amount-paid"]', '100.50');
      
      // Select person and category if dropdowns exist
      const personDropdown = page.locator('[data-testid="entry-person"]');
      if (await personDropdown.isVisible()) {
        await personDropdown.click();
        await page.locator('.p-dropdown-item').first().click();
      }
      
      const categoryDropdown = page.locator('[data-testid="entry-category"]');
      if (await categoryDropdown.isVisible()) {
        await categoryDropdown.click();
        await page.locator('.p-dropdown-item').first().click();
      }
      
      await page.click('[data-testid="save-entry-button"]');
      
      // Verify creation
      await expect(page.locator('text=Test Entry CRUD')).toBeVisible({ timeout: 10000 });
      
      // READ - Verify entry appears in list
      await expect(page.locator('[data-testid="entries-table"]')).toContainText('Test Entry CRUD');
      
      // UPDATE - Edit the entry
      await page.locator('[data-testid="edit-entry-button"]').first().click();
      await page.fill('[data-testid="entry-description"]', 'Updated Entry CRUD');
      await page.fill('[data-testid="entry-amount-paid"]', '200.75');
      await page.click('[data-testid="save-entry-button"]');
      
      // Verify update
      await expect(page.locator('text=Updated Entry CRUD')).toBeVisible({ timeout: 10000 });
      
      // DELETE - Remove the entry (if delete functionality exists)
      const deleteButton = page.locator('[data-testid="delete-entry-button"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.click('[data-testid="confirm-delete-button"]');
        await expect(page.locator('text=Updated Entry CRUD')).not.toBeVisible({ timeout: 10000 });
      }
    });
  });
});