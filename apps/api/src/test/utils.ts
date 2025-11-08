import { TestServer } from './test-server';
import { DatabaseUtils } from './database-utils';
import { CacheUtils } from './cache-utils';
import { PerformanceMonitor } from './performance-monitor';
import { ValidationUtils } from './validation-utils';

export class TestUtils {
  static testServer: TestServer;
  static dbUtils: DatabaseUtils;
  static cacheUtils: CacheUtils;
  static perfMonitor: PerformanceMonitor;
  static validationUtils: ValidationUtils;

  static async setup() {
    this.testServer = new TestServer();
    this.dbUtils = new DatabaseUtils();
    this.cacheUtils = new CacheUtils();
    this.perfMonitor = new PerformanceMonitor();
    this.validationUtils = new ValidationUtils();

    // Initialize connections
    await this.dbUtils.connect();
    await this.cacheUtils.connect();
  }

  static async teardown() {
    await this.dbUtils.disconnect();
    await this.cacheUtils.disconnect();
  }

  // Mock data generators
  static generateTestService(overrides = {}) {
    return {
      title: `Test Service ${Date.now()}`,
      description: 'Test service description',
      icon: 'test-icon',
      order: Math.floor(Math.random() * 100),
      isPublished: true,
      ...overrides,
    };
  }

  static generateTestCase(overrides = {}) {
    return {
      title: `Test Case ${Date.now()}`,
      description: 'Test case description',
      clientName: 'Test Client',
      challenge: 'Test challenge',
      solution: 'Test solution',
      result: 'Test result',
      isPublished: true,
      ...overrides,
    };
  }

  static generateTestReview(overrides = {}) {
    return {
      authorName: 'Test Author',
      authorTitle: 'CEO',
      company: 'Test Company',
      quote: 'Test review quote',
      rating: Math.floor(Math.random() * 5) + 1,
      isPublished: true,
      ...overrides,
    };
  }

  static generateTestUser(overrides = {}) {
    return {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'admin',
      isActive: true,
      ...overrides,
    };
  }

  // API test helpers
  static async makeAuthenticatedRequest(
    request: any,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    tokens?: any
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    const config: any = {
      headers,
    };

    if (data && method !== 'GET') {
      config.data = data;
    }

    const startTime = Date.now();
    let response;

    try {
      switch (method) {
        case 'GET':
          response = await request(endpoint, config);
          break;
        case 'POST':
          response = await request.post(endpoint, config);
          break;
        case 'PUT':
          response = await request.put(endpoint, config);
          break;
        case 'DELETE':
          response = await request.delete(endpoint, config);
          break;
        case 'PATCH':
          response = await request.patch(endpoint, config);
          break;
      }

      const duration = Date.now() - startTime;

      return {
        response,
        duration,
        status: response.status(),
        data: response.data,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        error,
        duration,
        status: error.response?.status || 500,
        data: error.response?.data,
      };
    }
  }

  // Database helpers
  static async seedDatabase() {
    // Create test data
    const services = [];
    for (let i = 0; i < 3; i++) {
      const service = this.dbUtils.createService(this.generateTestService());
      services.push(service);
    }

    const cases = [];
    for (let i = 0; i < 5; i++) {
      const case_data = this.dbUtils.createCase(this.generateTestCase());
      cases.push(case_data);
    }

    const reviews = [];
    for (let i = 0; i < 4; i++) {
      const review = this.dbUtils.createReview(this.generateTestReview());
      reviews.push(review);
    }

    return {
      services,
      cases,
      reviews,
    };
  }

  static async cleanDatabase() {
    await this.dbUtils.cleanAll();
  }

  // Performance assertions
  static expectReasonableResponseTime(duration: number, maxMs: number = 1000) {
    expect(duration).toBeLessThan(maxMs);
  }

  static expectGoodPerformance(duration: number, excellentMs: number = 500) {
    expect(duration).toBeLessThan(excellentMs);
  }

  // Validation helpers
  static expectValidResponseStructure(data: any, requiredFields: string[]) {
    for (const field of requiredFields) {
      expect(data).toHaveProperty(field);
    }
  }

  static expectPaginatedResponse(data: any) {
    this.expectValidResponseStructure(data, ['items', 'total', 'page', 'limit']);
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.total).toBe('number');
    expect(typeof data.page).toBe('number');
    expect(typeof data.limit).toBe('number');
  }

  static expectErrorResponse(data: any, expectedCode?: string) {
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('code');
    expect(data.error).toHaveProperty('message');

    if (expectedCode) {
      expect(data.error.code).toBe(expectedCode);
    }
  }

  static expectSuccessResponse(data: any, expectedData?: any) {
    expect(data).toHaveProperty('data');
    if (expectedData) {
      for (const [key, value] of Object.entries(expectedData)) {
        expect(data.data).toHaveProperty(key);
        expect(data.data[key]).toEqual(value);
      }
    }
  }
}

// Export utility classes
export { TestServer, DatabaseUtils, CacheUtils, PerformanceMonitor, ValidationUtils };