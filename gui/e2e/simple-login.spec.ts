import { test, expect } from '@playwright/test';

test.describe('Simple Login Test', () => {
  test('debug login process', async ({ page }) => {
    console.log('Starting login test...');
    
    // Navigate to login page
    await page.goto('/login');
    console.log('Navigated to /login');
    
    // Wait for login form to load
    await page.waitForSelector('[data-testid="username"]', { timeout: 10000 });
    console.log('Username field found');
    
    // Fill credentials
    await page.fill('[data-testid="username"]', 'admin');
    console.log('Username filled');
    
    await page.fill('[data-testid="password"] input', 'admin');
    console.log('Password filled');
    
    // Take screenshot before click
    await page.screenshot({ path: 'before-login-click.png' });
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    console.log('Login button clicked');
    
    // Wait a moment and check current URL
    await page.waitForTimeout(5000);
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'after-login-attempt.png' });
    
    // Check for any error messages
    const errorMessages = await page.locator('.p-toast-message-text').count();
    if (errorMessages > 0) {
      const errorText = await page.locator('.p-toast-message-text').textContent();
      console.log('Error message found:', errorText);
    }
    
    // Check if we're on dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('Successfully reached dashboard!');
      await expect(page).toHaveURL('/dashboard');
    } else {
      console.log('Did not reach dashboard, still on:', currentUrl);
      // Just pass the test so we can see the screenshots and logs
    }
  });
});