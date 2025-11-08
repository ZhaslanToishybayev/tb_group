import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { 
  testPrisma, 
  authenticateTestAdmin, 
  createTestService,
  expectSuccessResponse,
  expectErrorResponse,
  measureResponseTime,
  expectReasonableResponseTime
} from './setup';

describe('Services API', () => {
  let tokens: any;
  let testService: any;

  beforeAll(async () => {
    const result = await authenticateTestAdmin();
    tokens = result.tokens;
  });

  beforeEach(async () => {
    // Clean up services before each test
    await testPrisma.service.deleteMany();
  });

  describe('GET /api/services', () => {
    it('should return empty services list', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app).get('/api/services')
      );

      expectSuccessResponse(response, { services: [] });
      expectReasonableResponseTime(duration, 1000);
    });

    it('should return services list with test data', async () => {
      // Create test services
      await createTestService({ title: 'Service 1', order: 1 });
      await createTestService({ title: 'Service 2', order: 2 });

      const { response, duration } = await measureResponseTime(() =>
        request(app).get('/api/services')
      );

      expectSuccessResponse(response);
      expect(response.body.data.services).toHaveLength(2);
      expectReasonableResponseTime(duration, 1000);
    });

    it('should include cases and media when requested', async () => {
      const service = await createTestService({ title: 'Service with Cases' });
      
      // Create associated cases
      await testPrisma.case.create({
        data: {
          slug: 'test-case',
          projectTitle: 'Test Project',
          clientName: 'Test Client',
          summary: 'Test summary',
          category: 'WEB_DEVELOPMENT',
          serviceId: service.id,
          published: true,
        },
      });

      const { response, duration } = await measureResponseTime(() =>
        request(app).get('/api/services?include=cases,media')
      );

      expectSuccessResponse(response);
      expect(response.body.data.services[0]).toHaveProperty('cases');
      expect(response.body.data.services[0].cases).toHaveLength(1);
      expectReasonableResponseTime(duration, 1500);
    });
  });

  describe('GET /api/services/:slug', () => {
    beforeEach(async () => {
      testService = await createTestService({ 
        slug: 'test-service-slug',
        title: 'Test Service Detail'
      });
    });

    it('should return service by slug', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app).get(`/api/services/${testService.slug}`)
      );

      expectSuccessResponse(response);
      expect(response.body.data.service).toHaveProperty('title', 'Test Service Detail');
      expectReasonableResponseTime(duration, 1000);
    });

    it('should return 404 for non-existent service', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app).get('/api/services/non-existent-slug')
      );

      expectErrorResponse(response, 404);
      expectReasonableResponseTime(duration, 1000);
    });

    it('should include related data when requested', async () => {
      // Create related cases
      await testPrisma.case.createMany({
        data: [
          {
            slug: 'case-1',
            projectTitle: 'Project 1',
            clientName: 'Client 1',
            summary: 'Summary 1',
            category: 'WEB_DEVELOPMENT',
            serviceId: testService.id,
            published: true,
          },
          {
            slug: 'case-2',
            projectTitle: 'Project 2',
            clientName: 'Client 2',
            summary: 'Summary 2',
            category: 'MOBILE_DEVELOPMENT',
            serviceId: testService.id,
            published: true,
          },
        ],
      });

      const { response, duration } = await measureResponseTime(() =>
        request(app).get(`/api/services/${testService.slug}?include=cases,banners`)
      );

      expectSuccessResponse(response);
      expect(response.body.data.service).toHaveProperty('cases');
      expect(response.body.data.service.cases).toHaveLength(2);
      expectReasonableResponseTime(duration, 1500);
    });
  });

  describe('POST /api/services', () => {
    it('should create new service with authentication', async () => {
      const serviceData = {
        slug: 'new-service',
        title: 'New Service',
        summary: 'New service summary',
        description: { en: 'Description', ru: 'Описание' },
        heroImageUrl: 'https://example.com/hero.jpg',
        iconUrl: 'https://example.com/icon.jpg',
        order: 1,
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
          .send(serviceData)
      );

      expectSuccessResponse(response);
      expect(response.body.data.service).toMatchObject(serviceData);
      expectReasonableResponseTime(duration, 2000);
    });

    it('should reject unauthenticated request', async () => {
      const serviceData = {
        slug: 'unauthorized-service',
        title: 'Unauthorized Service',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/services')
          .send(serviceData)
      );

      expectErrorResponse(response, 401, 'Unauthorized');
      expectReasonableResponseTime(duration, 1000);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        summary: 'Service without title',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
          .send(invalidData)
      );

      expectErrorResponse(response, 400);
      expectReasonableResponseTime(duration, 1000);
    });

    it('should enforce unique slug', async () => {
      const serviceData = {
        slug: testService.slug, // Same slug as existing service
        title: 'Duplicate Slug Service',
        summary: 'Service with duplicate slug',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
          .send(serviceData)
      );

      expectErrorResponse(response, 409, 'already exists');
      expectReasonableResponseTime(duration, 1500);
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update existing service', async () => {
      const updateData = {
        title: 'Updated Service Title',
        summary: 'Updated summary',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .put(`/api/services/${testService.id}`)
          .set('Authorization', `Bearer ${tokens.accessToken}`)
          .send(updateData)
      );

      expectSuccessResponse(response);
      expect(response.body.data.service).toMatchObject(updateData);
      expectReasonableResponseTime(duration, 2000);
    });

    it('should reject update for non-existent service', async () => {
      const updateData = { title: 'Updated Title' };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .put('/api/services/non-existent-id')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
          .send(updateData)
      );

      expectErrorResponse(response, 404);
      expectReasonableResponseTime(duration, 1000);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete existing service', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .delete(`/api/services/${testService.id}`)
          .set('Authorization', `Bearer ${tokens.accessToken}`)
      );

      expectSuccessResponse(response);
      expectReasonableResponseTime(duration, 1500);

      // Verify service is deleted
      const deletedService = await testPrisma.service.findUnique({
        where: { id: testService.id },
      });
      expect(deletedService).toBeNull();
    });

    it('should reject deletion for non-existent service', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .delete('/api/services/non-existent-id')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
      );

      expectErrorResponse(response, 404);
      expectReasonableResponseTime(duration, 1000);
    });
  });

  describe('Performance Tests', () => {
    beforeEach(async () => {
      // Create many services for performance testing
      await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          createTestService({
            slug: `perf-service-${i}`,
            title: `Performance Service ${i}`,
            order: i,
          })
        )
      );
    });

    it('should handle large service list efficiently', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app).get('/api/services')
      );

      expectSuccessResponse(response);
      expect(response.body.data.services).toHaveLength(50);
      expectReasonableResponseTime(duration, 3000);
    });

    it('should paginate results efficiently', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app).get('/api/services?page=1&limit=10')
      );

      expectSuccessResponse(response);
      expect(response.body.data.services).toHaveLength(10);
      expect(response.body.data.pagination).toBeDefined();
      expectReasonableResponseTime(duration, 2000);
    });
  });
});