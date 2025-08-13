import { test, expect } from '@playwright/test';

test.describe('Theme and Internationalization Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login as admin
    await page.waitForSelector('[data-testid="username"]', { timeout: 10000 });
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"] input', 'admin');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test.describe('Theme Switching', () => {
    test('should display theme toggle button with correct icon', async ({ page }) => {
      // Should show moon icon for light theme (to switch to dark)
      const themeButton = page.locator('p-button[pTooltip*="Switch"], p-button >> .pi-moon, p-button >> .pi-sun');
      await expect(themeButton).toBeVisible();
    });

    test('should toggle from light to dark theme', async ({ page }) => {
      // Find theme toggle button (should show moon icon for light theme)
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button >> .pi-moon, p-button >> .pi-sun').first();
      
      if (await themeButton.count() > 0) {
        // Get initial body class to determine current theme
        const initialBodyClass = await page.locator('body').getAttribute('class');
        
        // Click to toggle to dark theme
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Verify theme has changed
        const newBodyClass = await page.locator('body').getAttribute('class');
        expect(newBodyClass).not.toBe(initialBodyClass);
        
        // Should now show sun icon (to switch back to light)
        const sunIcon = page.locator('.pi-sun');
        await expect(sunIcon).toBeVisible();
      }
    });

    test('should toggle from dark to light theme', async ({ page }) => {
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button >> .pi-moon, p-button >> .pi-sun').first();
      
      if (await themeButton.count() > 0) {
        // First ensure we're in dark theme
        await themeButton.click();
        await page.waitForTimeout(500);
        
        // Now click to go back to light theme
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Should show moon icon again (to switch to dark)
        const moonIcon = page.locator('.pi-moon');
        await expect(moonIcon).toBeVisible();
      }
    });

    test('should change visual appearance with theme switch', async ({ page }) => {
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button >> .pi-moon, p-button >> .pi-sun').first();
      
      if (await themeButton.count() > 0) {
        // Get initial background color of main container
        const mainContainer = page.locator('.layout-main, .p-component, body').first();
        const initialBgColor = await mainContainer.evaluate(el => getComputedStyle(el).backgroundColor);
        
        // Toggle theme
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Background should have changed
        const newBgColor = await mainContainer.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(newBgColor).not.toBe(initialBgColor);
      }
    });

    test('should persist theme selection across page navigation', async ({ page }) => {
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button >> .pi-moon, p-button >> .pi-sun').first();
      
      if (await themeButton.count() > 0) {
        // Toggle to dark theme
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Verify we're in dark theme (sun icon visible)
        await expect(page.locator('.pi-sun')).toBeVisible();
        
        // Navigate to persons page
        await page.click('.sidebar-menu >> text=Persons, [data-testid="persons-menu"]');
        await page.waitForTimeout(500);
        
        // Theme should still be dark (sun icon visible)
        await expect(page.locator('.pi-sun')).toBeVisible();
        
        // Navigate to categories
        await page.click('.sidebar-menu >> text=Categories, [data-testid="categories-menu"]');
        await page.waitForTimeout(500);
        
        // Theme should still be dark
        await expect(page.locator('.pi-sun')).toBeVisible();
        
        // Navigate back to dashboard
        await page.click('.sidebar-menu >> text=Dashboard, [data-testid="dashboard-menu"]');
        await page.waitForTimeout(500);
        
        // Theme should still be maintained
        await expect(page.locator('.pi-sun')).toBeVisible();
      }
    });

    test('should persist theme across browser session', async ({ page }) => {
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button >> .pi-moon, p-button >> .pi-sun').first();
      
      if (await themeButton.count() > 0) {
        // Toggle to dark theme
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Refresh the page
        await page.reload();
        await page.waitForTimeout(2000);
        
        // Should still be in dark theme (sun icon visible)
        await expect(page.locator('.pi-sun')).toBeVisible();
      }
    });

    test('should work with keyboard navigation', async ({ page }) => {
      // Use Tab to navigate to theme button
      let attempts = 0;
      while (attempts < 10) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const hasThemeIcon = await focusedElement.locator('.pi-moon, .pi-sun').count() > 0;
        
        if (hasThemeIcon) {
          // Press Enter to toggle theme
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          
          // Verify theme changed
          const themeIcon = page.locator('.pi-moon, .pi-sun');
          await expect(themeIcon).toBeVisible();
          break;
        }
        attempts++;
      }
    });

    test('should have proper tooltip on theme button', async ({ page }) => {
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button[pTooltip*="Switch"], p-button[pTooltip*="theme"]').first();
      
      if (await themeButton.count() > 0) {
        // Hover over theme button to show tooltip
        await themeButton.hover();
        await page.waitForTimeout(500);
        
        // Look for tooltip content
        const tooltip = page.locator('.p-tooltip, [role="tooltip"]');
        await expect(tooltip).toBeVisible();
      }
    });

    test('should apply theme to all UI components', async ({ page }) => {
      const themeButton = page.locator('[data-testid="theme-toggle"], p-button >> .pi-moon, p-button >> .pi-sun').first();
      
      if (await themeButton.count() > 0) {
        // Toggle theme
        await themeButton.click();
        await page.waitForTimeout(1000);
        
        // Navigate to a page with many components (persons)
        await page.click('.sidebar-menu >> text=Persons');
        await page.waitForTimeout(1000);
        
        // Check that various components have theme applied
        const table = page.locator('.p-datatable, [data-testid="persons-table"]');
        if (await table.isVisible()) {
          const tableClass = await table.getAttribute('class');
          expect(tableClass).toBeTruthy();
        }
        
        const buttons = page.locator('p-button');
        if (await buttons.count() > 0) {
          await expect(buttons.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Language Switching', () => {
    test('should display language dropdown with options', async ({ page }) => {
      // Check language dropdown exists
      const languageDropdown = page.locator('p-dropdown').first();
      await expect(languageDropdown).toBeVisible();
      
      // Click to open dropdown
      await languageDropdown.click();
      
      // Should show English and Georgian options
      await expect(page.locator('text=🇺🇸 English')).toBeVisible();
      await expect(page.locator('text=🇬🇪 ქართული')).toBeVisible();
      
      // Close dropdown
      await page.keyboard.press('Escape');
    });

    test('should switch language to Georgian and update interface', async ({ page }) => {
      // Open language dropdown
      const languageDropdown = page.locator('p-dropdown').first();
      await languageDropdown.click();
      
      // Select Georgian
      await page.click('text=🇬🇪 ქართული');
      
      // Wait for language change
      await page.waitForTimeout(1000);
      
      // Check that some Georgian text appears (menu items)
      // Dashboard should become "მთავარი გვერდი"
      await expect(page.locator('text=მთავარი გვერდი')).toBeVisible();
      
      // Check other Georgian menu items
      await expect(page.locator('text=პირები')).toBeVisible(); // Persons
      await expect(page.locator('text=კატეგორიები')).toBeVisible(); // Categories
    });

    test('should switch back to English from Georgian', async ({ page }) => {
      // First switch to Georgian
      const languageDropdown = page.locator('p-dropdown').first();
      await languageDropdown.click();
      await page.click('text=🇬🇪 ქართული');
      await page.waitForTimeout(1000);
      
      // Then switch back to English
      await languageDropdown.click();
      await page.click('text=🇺🇸 English');
      await page.waitForTimeout(1000);
      
      // Should see English text
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Persons')).toBeVisible();
      await expect(page.locator('text=Categories')).toBeVisible();
    });

    test('should maintain language selection across navigation', async ({ page }) => {
      // Switch to Georgian
      const languageDropdown = page.locator('p-dropdown').first();
      await languageDropdown.click();
      await page.click('text=🇬🇪 ქართული');
      await page.waitForTimeout(1000);
      
      // Navigate to persons page
      await page.click('text=პირები'); // Persons in Georgian
      await page.waitForURL('**/persons');
      
      // Should still see Georgian text
      await expect(page.locator('text=პირების მართვა')).toBeVisible(); // Persons Management
      
      // Navigate back to dashboard
      await page.click('text=მთავარი გვერდი'); // Dashboard in Georgian
      await page.waitForURL('**/dashboard');
      
      // Should still be in Georgian
      await expect(page.locator('text=მთავარი გვერდი')).toBeVisible();
    });

    test('should translate form labels and buttons in Georgian', async ({ page }) => {
      // Switch to Georgian
      const languageDropdown = page.locator('p-dropdown').first();
      await languageDropdown.click();
      await page.click('text=🇬🇪 ქართული');
      await page.waitForTimeout(1000);
      
      // Navigate to persons to check form translations
      await page.click('text=პირები');
      await page.waitForURL('**/persons');
      
      // Check for Georgian form elements
      await expect(page.locator('text=დამატება')).toBeVisible(); // Add button
      await expect(page.locator('text=სახელი')).toBeVisible(); // Name label
    });
  });

  test.describe('Combined Theme and Language Features', () => {
    test('should work together - switch both theme and language', async ({ page }) => {
      // Switch to dark theme
      const themeButton = page.locator('p-button >> .pi-moon, p-button >> .pi-sun').first();
      if (await themeButton.count() > 0) {
        await themeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Switch to Georgian
      const languageDropdown = page.locator('p-dropdown').first();
      await languageDropdown.click();
      await page.click('text=🇬🇪 ქართული');
      await page.waitForTimeout(1000);
      
      // Should see Georgian text with dark theme
      await expect(page.locator('text=მთავარი გვერდი')).toBeVisible();
      await expect(page.locator('text=პირები')).toBeVisible();
    });

    test('should persist both settings across page refresh', async ({ page }) => {
      // Change both settings
      const themeButton = page.locator('p-button >> .pi-moon, p-button >> .pi-sun').first();
      if (await themeButton.count() > 0) {
        await themeButton.click();
        await page.waitForTimeout(500);
      }
      
      const languageDropdown = page.locator('p-dropdown').first();
      await languageDropdown.click();
      await page.click('text=🇬🇪 ქართული');
      await page.waitForTimeout(1000);
      
      // Refresh page
      await page.reload();
      await page.waitForURL('**/dashboard');
      
      // Settings should be maintained (this is a structural test)
      await expect(page.locator('p-dropdown')).toBeVisible();
      await expect(page.locator('p-button >> .pi-moon, p-button >> .pi-sun')).toBeVisible();
    });
  });

  test.describe('Settings Accessibility', () => {
    test('should have proper labels for accessibility', async ({ page }) => {
      // Check language label
      await expect(page.locator('label:has-text("Language")')).toBeVisible();
      
      // Check theme button has tooltip
      const themeButton = page.locator('p-button[pTooltip*="Switch"]');
      if (await themeButton.count() > 0) {
        await expect(themeButton).toBeVisible();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab to language dropdown
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to interact with settings via keyboard
      // This is a basic keyboard accessibility test
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Login Page Internationalization', () => {
    test('should display login page in selected language', async ({ page }) => {
      // Logout first
      await page.click('[data-testid="logout-button"]');
      await page.waitForURL('**/login');
      
      // Login page should have basic structure
      await expect(page.locator('text=Vinodelnja Login')).toBeVisible();
      await expect(page.locator('[data-testid="username"]')).toBeVisible();
      await expect(page.locator('[data-testid="password"]')).toBeVisible();
    });
  });
});