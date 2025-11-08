import { test, expect, request } from '@playwright/test';

const API_BASE_URL = 'http://localhost:4000/api';

test.describe('API Tests', () => {
  test('should have working API health check', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const response = await context.get('/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.ok).toBe(true);
  });

  test('should return services list', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const response = await context.get('/services');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data.services)).toBe(true);
  });

  test('should return cases list', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const response = await context.get('/cases');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data.cases)).toBe(true);
  });

  test('should return reviews list', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const response = await context.get('/reviews?isPublished=true');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should return banners', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const response = await context.get('/banners');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data.banners)).toBe(true);
  });

  test('should handle contact form submission', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      message: 'This is a test message',
    };

    const response = await context.post('/contact', {
      data: contactData,
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data.message).toContain('Спасибо');
  });

  test('should validate required fields', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const invalidData = {
      name: '', // Empty name
      email: 'invalid-email',
      message: '',
    };

    const response = await context.post('/contact', {
      data: invalidData,
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  test('should handle CORS properly', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: {
        'Origin': 'http://localhost:3000',
      },
    });

    const response = await context.get('/services');
    expect(response.status()).toBe(200);

    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).toBeTruthy();
  });
});

test.describe('API Performance Tests', () => {
  test('API responses should be fast', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const endpoints = [
      '/services',
      '/cases',
      '/reviews?isPublished=true',
      '/banners',
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await context.get(endpoint);
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(1000); // 1 second max
    }
  });
});

test.describe('API Cache Tests', () => {
  test('should include cache headers', async () => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
    });

    const response = await context.get('/services');
    expect(response.status()).toBe(200);

    const headers = response.headers();
    // Should have some cache-related headers
    expect(
      headers['x-cache'] || headers['cache-control'] || headers['etag']
    ).toBeTruthy();
  });
});