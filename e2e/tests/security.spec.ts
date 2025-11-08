import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should not expose sensitive information', async ({ page }) => {
    await page.goto('/');

    // Check for exposed environment variables
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('process.env');
    expect(bodyText).not.toContain('API_KEY');
    expect(bodyText).not.toContain('SECRET');

    // Check for exposed source maps in production
    if (process.env.NODE_ENV === 'production') {
      const response = await page.goto('/static/js/main.js');
      const jsContent = await response?.textContent();
      expect(jsContent).not.toContain('sourceMappingURL');
    }
  });

  test('should have proper CSP headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    // Should have security headers
    expect(headers?.['x-frame-options']).toBeTruthy();
    expect(headers?.['x-content-type-options']).toBeTruthy();
    expect(headers?.['x-xss-protection']).toBeTruthy();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/contact');

    // Try to submit empty form
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Обязательное поле')).toBeVisible();

    // Try to submit with invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Некорректный email')).toBeVisible();
  });

  test('should protect against XSS', async ({ page }) => {
    await page.goto('/contact');

    const xssPayload = '<script>alert("xss")</script>';
    await page.fill('input[name="name"]', xssPayload);
    await page.fill('input[name="message"]', xssPayload);

    await page.click('button[type="submit"]');

    // Should not execute the script
    const dialogs: string[] = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.message());
      dialog.dismiss();
    });

    await page.waitForTimeout(1000);
    expect(dialogs).not.toContain('xss');
  });

  test('should handle rate limiting', async ({ page }) => {
    // Make many requests quickly
    const requests = [];
    for (let i = 0; i < 150; i++) {
      const response = await page.goto('/');
      requests.push(response?.status());
    }

    // Some requests should be rate limited (429)
    const rateLimitedRequests = requests.filter(status => status === 429);
    expect(rateLimitedRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Data Protection Tests', () => {
  test('should not expose user data in responses', async ({ page }) => {
    await page.goto('/cases');

    // Should only show public case information
    const caseCards = page.locator('[data-testid="case-card"]');
    const cardCount = await caseCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = caseCards.nth(i);
      const text = await card.textContent();

      // Should not contain sensitive information
      expect(text).not.toContain('password');
      expect(text).not.toContain('token');
      expect(text).not.toContain('secret');
    }
  });

  test('should sanitize user inputs in forms', async ({ page }) => {
    await page.goto('/contact');

    const maliciousInput = '<img src=x onerror=alert("xss")>';
    await page.fill('input[name="name"]', maliciousInput);
    await page.fill('textarea[name="message"]', maliciousInput);

    await page.click('button[type="submit"]');

    // Should sanitize the input
    await expect(page.locator('text=Спасибо')).toBeVisible();

    // Navigate back and check if script was sanitized
    await page.goto('/contact');
    const inputs = await page.locator('input[name="name"]').inputValue();
    expect(inputs).not.toContain('<script>');
  });
});

test.describe('SSL and HTTPS Tests', () => {
  test('should redirect HTTP to HTTPS in production', async ({ browser }) => {
    // Only test in production environment
    if (process.env.NODE_ENV !== 'production') {
      test.skip();
    }

    const context = await browser.newContext({
      ignoreHTTPSErrors: false,
    });

    const page = await context.newPage();
    const response = await page.goto('http://localhost:3000');

    // Should redirect to HTTPS
    expect(response?.url()).toStartWith('https://');
  });
});