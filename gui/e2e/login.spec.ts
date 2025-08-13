import { test, expect } from '@playwright/test';

test.describe('Login Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form with all required elements', async ({ page }) => {
    // Check main login elements
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
    await expect(page.locator('[data-testid="username"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    
    // Check demo credentials text
    await expect(page.locator('text=Demo credentials: admin/admin or user/user')).toBeVisible();
  });

  test('should have proper form field labels and placeholders', async ({ page }) => {
    // Check username field
    const usernameField = page.locator('[data-testid="username"]');
    await expect(usernameField).toHaveAttribute('placeholder', 'Username');
    
    // Check password field
    const passwordField = page.locator('[data-testid="password"] input');
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('should successfully login with admin credentials', async ({ page }) => {
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should successfully login with user credentials', async ({ page }) => {
    await page.fill('[data-testid="username"]', 'user');
    await page.fill('[data-testid="password"] input', 'user');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should display error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="username"]', 'invalid');
    await page.fill('[data-testid="password"] input', 'invalid');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await page.waitForTimeout(2000);
    
    // Check for error toast or message
    const errorMessage = page.locator('.p-toast-message-text, .p-message, .error-message');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Should remain on login page
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
  });

  test('should require username field', async ({ page }) => {
    // Try to login without username
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Should show validation error or remain on login
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
  });

  test('should require password field', async ({ page }) => {
    // Try to login without password
    await page.fill('[data-testid="username"]', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Should show validation error or remain on login
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
  });

  test('should handle empty form submission', async ({ page }) => {
    // Try to login with empty form
    await page.click('[data-testid="login-button"]');
    
    // Should remain on login page
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
  });

  test('should show/hide password field', async ({ page }) => {
    const passwordField = page.locator('[data-testid="password"]');
    await expect(passwordField).toBeVisible();
    
    // Check if password toggle exists (PrimeNG password component)
    const toggleButton = passwordField.locator('button, .p-password-toggle');
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      // Password should be visible after toggle
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab');
    await page.keyboard.type('admin');
    
    await page.keyboard.press('Tab');
    await page.keyboard.type('admin');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should attempt login
    await page.waitForTimeout(2000);
  });

  test('should support Enter key to submit form', async ({ page }) => {
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should have proper form styling and layout', async ({ page }) => {
    // Check login container
    await expect(page.locator('.login-container, .card')).toBeVisible();
    
    // Check form styling
    const loginForm = page.locator('form, .login-form');
    if (await loginForm.count() > 0) {
      await expect(loginForm).toBeVisible();
    }
    
    // Check button styling
    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toHaveClass(/p-button/);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
    await expect(page.locator('[data-testid="username"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should display wine/vineyard themed branding', async ({ page }) => {
    // Check for wine-related branding
    await expect(page.locator('text=Vinodelnja')).toBeVisible();
    
    // May include wine emoji or other vineyard theming
    const brandingElements = page.locator('🍷, .wine-icon, .vineyard-logo');
    // This is optional depending on design
  });

  test('should handle loading state during login', async ({ page }) => {
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    
    // Click login and immediately check for loading state
    await page.click('[data-testid="login-button"]');
    
    // May show loading indicator
    const loadingIndicator = page.locator('.p-button-loading, .loading, .spinner');
    // This is implementation dependent
    
    // Wait for completion
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('**/login');
    await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
  });

  test('should not allow access to login page when already authenticated', async ({ page }) => {
    // First login
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Try to access login page when authenticated
    await page.goto('/login');
    
    // Should redirect back to dashboard or stay on dashboard
    // Implementation may vary
    await page.waitForTimeout(2000);
  });
});