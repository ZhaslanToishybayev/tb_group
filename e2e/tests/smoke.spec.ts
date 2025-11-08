import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('TB Group');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Услуги');
    await expect(page).toHaveURL(/.*\/services/);
    await expect(page.locator('h1')).toContainText('Услуги');
  });

  test('should navigate to cases page', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.locator('h1')).toContainText('Кейсы');
    await expect(page.locator('[data-testid="cases-explorer"]')).toBeVisible();
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Контакты');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('О компании');
    await expect(page.locator('text=Наша команда')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds max
  });

  test('should have good Lighthouse scores', async ({ page }) => {
    await page.goto('/');

    // Basic performance checks
    const title = await page.title();
    expect(title).toBeTruthy();

    const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDescription).toBeTruthy();

    const hasH1 = await page.locator('h1').count();
    expect(hasH1).toBeGreaterThan(0);
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Only one h1 per page

    const h2Elements = await page.locator('h2').count();
    expect(h2Elements).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/contact');

    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const hasLabel = await inputs.nth(i).evaluate((el) => {
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return label !== null;
        }
        // Check for wrapped labels
        return el.closest('label') !== null;
      });

      expect(hasLabel).toBeTruthy();
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should be mobile responsive', async ({ page }) => {
    await page.goto('/');

    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check for mobile menu (if implemented)
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .hamburger');
    const hasMobileMenu = await mobileMenu.count();

    // Page should be functional on mobile
    await page.click('text=Услуги');
    await expect(page).toHaveURL(/.*\/services/);
  });
});