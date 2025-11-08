import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../src/app';

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/tbgroup_test';

// Create test Prisma client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
});

// Test user credentials
export const TEST_ADMIN = {
  email: 'test@example.com',
  password: 'testPassword123!',
  name: 'Test Admin',
};

// Authentication helpers
export const authenticateTestAdmin = async () => {
  // Create test admin user
  const hashedPassword = await import('argon2').then(argon2 => 
    argon2.hash(TEST_ADMIN.password)
  );

  const admin = await testPrisma.adminUser.upsert({
    where: { email: TEST_ADMIN.email },
    update: { password: hashedPassword },
    create: {
      email: TEST_ADMIN.email,
      password: hashedPassword,
      name: TEST_ADMIN.name,
    },
  });

  // Login to get tokens
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.data.tokens.accessToken).toBeDefined();

  return {
    admin,
    tokens: loginResponse.body.data.tokens,
  };
};

// Database cleanup helpers
export const cleanupDatabase = async () => {
  // Delete in order of dependencies
  await testPrisma.analyticsEvent.deleteMany();
  await testPrisma.pageView.deleteMany();
  await testPrisma.emailNotificationLog.deleteMany();
  await testPrisma.leadLog.deleteMany();
  await testPrisma.contactRequest.deleteMany();
  await testPrisma.review.deleteMany();
  await testPrisma.mediaAsset.deleteMany();
  await testPrisma.case.deleteMany();
  await testPrisma.banner.deleteMany();
  await testPrisma.service.deleteMany();
  await testPrisma.refreshToken.deleteMany();
  await testPrisma.adminUser.deleteMany();
};

// Sample data generators
export const createTestService = async (overrides = {}) => {
  return testPrisma.service.create({
    data: {
      slug: `test-service-${Date.now()}`,
      title: 'Test Service',
      summary: 'Test service summary',
      description: { en: 'Test description', ru: 'Тестовое описание' },
      heroImageUrl: 'https://example.com/image.jpg',
      iconUrl: 'https://example.com/icon.jpg',
      order: 0,
      ...overrides,
    },
  });
};

export const createTestCase = async (serviceId?: string, overrides = {}) => {
  return testPrisma.case.create({
    data: {
      slug: `test-case-${Date.now()}`,
      projectTitle: 'Test Project',
      clientName: 'Test Client',
      summary: 'Test case summary',
      category: 'WEB_DEVELOPMENT',
      serviceId,
      published: true,
      ...overrides,
    },
  });
};

export const createTestReview = async (overrides = {}) => {
  return testPrisma.review.create({
    data: {
      authorName: 'Test Author',
      company: 'Test Company',
      content: 'Great service!',
      rating: 5,
      reviewType: 'TEXT',
      isPublished: true,
      isFeatured: false,
      ...overrides,
    },
  });
};

export const createTestContactRequest = async (overrides = {}) => {
  return testPrisma.contactRequest.create({
    data: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      message: 'Test message',
      serviceInterest: 'WEB_DEVELOPMENT',
      status: 'NEW',
      ...overrides,
    },
  });
};

// API response helpers
export const expectSuccessResponse = (response: any, expectedData?: any) => {
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('data');
  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

export const expectErrorResponse = (response: any, expectedStatus: number, expectedError?: string) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('error');
  if (expectedError) {
    expect(response.body.error.message).toContain(expectedError);
  }
};

// Common test setups
export const setupTestApp = async () => {
  // Ensure database is clean before tests
  await cleanupDatabase();
  
  // Create authenticated admin
  const { admin, tokens } = await authenticateTestAdmin();
  
  return { admin, tokens };
};

// Performance test helpers
export const measureResponseTime = async (requestFn: () => Promise<any>) => {
  const start = Date.now();
  const response = await requestFn();
  const duration = Date.now() - start;
  
  return { response, duration };
};

export const expectReasonableResponseTime = (duration: number, maxMs: number = 2000) => {
  expect(duration).toBeLessThan(maxMs);
};

// Validation test helpers
export const expectValidationError = async (requestFn: () => Promise<any>, field: string) => {
  const response = await requestFn();
  expect(response.status).toBe(400);
  expect(response.body.error.message).toContain(field);
};

// Integration test helpers
export const createCompleteTestScenario = async () => {
  // Create service
  const service = await createTestService();
  
  // Create case for service
  const case_ = await createTestCase(service.id);
  
  // Create review
  const review = await createTestReview();
  
  // Create media assets
  const media1 = await testPrisma.mediaAsset.create({
    data: {
      filename: 'test-image-1.jpg',
      originalName: 'Test Image 1',
      mimeType: 'image/jpeg',
      size: 1024,
      url: 'https://example.com/test1.jpg',
      type: 'image',
    },
  });
  
  const media2 = await testPrisma.mediaAsset.create({
    data: {
      filename: 'test-image-2.jpg',
      originalName: 'Test Image 2',
      mimeType: 'image/jpeg',
      size: 2048,
      url: 'https://example.com/test2.jpg',
      type: 'image',
    },
  });
  
  // Link media to case
  await testPrisma.case.update({
    where: { id: case_.id },
    data: {
      media: {
        connect: [{ id: media1.id }, { id: media2.id }],
      },
    },
  });
  
  return {
    service,
    case: case_,
    review,
    media: [media1, media2],
  };
};