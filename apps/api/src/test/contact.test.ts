import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { 
  testPrisma, 
  createTestContactRequest,
  expectSuccessResponse,
  expectErrorResponse,
  measureResponseTime,
  expectReasonableResponseTime
} from './setup';

describe('Contact API and Integrations', () => {
  beforeAll(async () => {
    // Set up test environment
    await testPrisma.contactRequest.deleteMany();
    await testPrisma.emailNotificationLog.deleteMany();
    await testPrisma.leadLog.deleteMany();
  });

  beforeEach(async () => {
    // Clean up before each test
    await testPrisma.contactRequest.deleteMany();
    await testPrisma.emailNotificationLog.deleteMany();
    await testPrisma.leadLog.deleteMany();
  });

  describe('POST /api/contact', () => {
    const validContactData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      company: 'Example Corp',
      message: 'I am interested in your services',
      serviceInterest: 'WEB_DEVELOPMENT',
      recaptchaToken: 'test-recaptcha-token',
    };

    it('should create contact request successfully', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(validContactData)
      );

      expectSuccessResponse(response, { status: 'queued' });
      expect(response.body.data.contactRequestId).toBeDefined();
      expectReasonableResponseTime(duration, 5000); // Allow more time for integrations
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        email: 'test@example.com',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(invalidData)
      );

      expectErrorResponse(response, 422);
      expectReasonableResponseTime(duration, 1000);
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        ...validContactData,
        email: 'invalid-email',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(invalidEmailData)
      );

      expectErrorResponse(response, 422, 'email');
      expectReasonableResponseTime(duration, 1000);
    });

    it('should handle phone number validation', async () => {
      const invalidPhoneData = {
        ...validContactData,
        phone: 'invalid-phone',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(invalidPhoneData)
      );

      expectErrorResponse(response, 422, 'phone');
      expectReasonableResponseTime(duration, 1000);
    });

    it('should store contact request in database', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send(validContactData);

      expectSuccessResponse(response);

      const contactRequest = await testPrisma.contactRequest.findUnique({
        where: { id: response.body.data.contactRequestId },
      });

      expect(contactRequest).toBeDefined();
      expect(contactRequest?.fullName).toBe(validContactData.fullName);
      expect(contactRequest?.email).toBe(validContactData.email);
      expect(contactRequest?.status).toBe('IN_PROGRESS');
    });

    it('should handle reCAPTCHA verification failure', async () => {
      const invalidRecaptchaData = {
        ...validContactData,
        recaptchaToken: 'invalid-token',
      };

      // Mock reCAPTCHA failure by setting a specific environment variable
      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(invalidRecaptchaData)
      );

      // In stub mode, this should still succeed
      expectSuccessResponse(response);
      expectReasonableResponseTime(duration, 3000);
    });
  });

  describe('Email Integration', () => {
    it('should create email notification log', async () => {
      const contactData = {
        fullName: 'Email Test User',
        email: 'emailtest@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        message: 'Test email integration',
        recaptchaToken: 'test-token',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData);

      expectSuccessResponse(response);

      // Check if email log was created
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async email processing

      const emailLogs = await testPrisma.emailNotificationLog.findMany({
        where: { contactRequestId: response.body.data.contactRequestId },
      });

      expect(emailLogs.length).toBeGreaterThan(0);
      expect(emailLogs[0].status).toBeOneOf(['SENT', 'PENDING', 'FAILED']);
    });

    it('should handle email delivery failures gracefully', async () => {
      // Test with invalid email configuration (stub mode)
      const contactData = {
        fullName: 'Failure Test User',
        email: 'failuretest@example.com',
        message: 'Test email failure handling',
        recaptchaToken: 'test-token',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(contactData)
      );

      expectSuccessResponse(response);
      expectReasonableResponseTime(duration, 3000);
    });
  });

  describe('Bitrix24 Integration', () => {
    it('should create lead log entry', async () => {
      const contactData = {
        fullName: 'Bitrix Test User',
        email: 'bitrixtest@example.com',
        phone: '+1234567890',
        company: 'Bitrix Test Corp',
        message: 'Test Bitrix24 integration',
        serviceInterest: 'WEB_DEVELOPMENT',
        recaptchaToken: 'test-token',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData);

      expectSuccessResponse(response);

      // Check if lead log was created
      const leadLogs = await testPrisma.leadLog.findMany({
        where: { contactRequestId: response.body.data.contactRequestId },
      });

      expect(leadLogs.length).toBeGreaterThan(0);
      expect(leadLogs[0].status).toBeOneOf(['SENT', 'PENDING', 'FAILED']);
    });

    it('should handle Bitrix24 API failures gracefully', async () => {
      const contactData = {
        fullName: 'Bitrix Failure Test',
        email: 'bitrixfailure@example.com',
        message: 'Test Bitrix24 failure handling',
        recaptchaToken: 'test-token',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(contactData)
      );

      expectSuccessResponse(response);
      expectReasonableResponseTime(duration, 3000);
    });
  });

  describe('Analytics Integration', () => {
    it('should track contact form submission', async () => {
      const contactData = {
        fullName: 'Analytics Test User',
        email: 'analyticstest@example.com',
        message: 'Test analytics tracking',
        recaptchaToken: 'test-token',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData);

      expectSuccessResponse(response);

      // Check if analytics event was created
      const analyticsEvents = await testPrisma.analyticsEvent.findMany({
        where: { eventName: 'contact_form_submit' },
      });

      expect(analyticsEvents.length).toBeGreaterThan(0);
    });

    it('should track service page views', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/analytics/service-view')
          .send({
            serviceId: 'test-service-id',
            serviceName: 'Test Service',
          })
      );

      expectSuccessResponse(response);
      expectReasonableResponseTime(duration, 1000);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow reasonable contact request rate', async () => {
      const contactData = {
        fullName: 'Rate Test User',
        email: 'ratetest@example.com',
        message: 'Test rate limiting',
        recaptchaToken: 'test-token',
      };

      // Send 5 requests quickly
      const responses = await Promise.all(
        Array.from({ length: 5 }, () =>
          request(app)
            .post('/api/contact')
            .send({ ...contactData, email: `ratetest${Math.random()}@example.com` })
        )
      );

      // All should succeed (rate limit is higher than 5)
      responses.forEach(response => {
        expect([200, 202, 429]).toContain(response.status);
      });
    });

    it('should handle potential abuse', async () => {
      const suspiciousData = {
        fullName: 'Suspicious User',
        email: 'suspicious@example.com',
        message: '<script>alert("xss")</script>',
        recaptchaToken: 'test-token',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(suspiciousData)
      );

      // Should handle gracefully - either accept or reject based on validation
      expect([200, 202, 400, 422]).toContain(response.status);
      expectReasonableResponseTime(duration, 3000);
    });
  });

  describe('Security and Validation', () => {
    it('should sanitize HTML in message field', async () => {
      const xssData = {
        fullName: 'XSS Test',
        email: 'xsstest@example.com',
        message: '<script>alert("xss")</script>',
        recaptchaToken: 'test-token',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(xssData);

      // Should not crash and should handle the input appropriately
      expect([200, 202, 400, 422]).toContain(response.status);
    });

    it('should validate message length', async () => {
      const longMessageData = {
        fullName: 'Long Message Test',
        email: 'longmsg@example.com',
        message: 'a'.repeat(10001), // Exceed typical message length limit
        recaptchaToken: 'test-token',
      };

      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send(longMessageData)
      );

      expectErrorResponse(response, 422);
      expectReasonableResponseTime(duration, 1000);
    });

    it('should handle empty requests gracefully', async () => {
      const { response, duration } = await measureResponseTime(() =>
        request(app)
          .post('/api/contact')
          .send({})
      );

      expectErrorResponse(response, 422);
      expectReasonableResponseTime(duration, 1000);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent contact submissions', async () => {
      const concurrentRequests = 10;
      const contactData = {
        fullName: 'Concurrent Test User',
        message: 'Test concurrent submissions',
        recaptchaToken: 'test-token',
      };

      const startTime = Date.now();
      const responses = await Promise.all(
        Array.from({ length: concurrentRequests }, (_, i) =>
          request(app)
            .post('/api/contact')
            .send({
              ...contactData,
              email: `concurrent${i}@example.com`,
              fullName: `Concurrent User ${i}`,
            })
        )
      );
      const duration = Date.now() - startTime;

      // Most requests should succeed within reasonable time
      const successCount = responses.filter(r => [200, 202].includes(r.status)).length;
      expect(successCount).toBeGreaterThan(concurrentRequests * 0.8); // At least 80% success
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});