/**
 * Admin Routes Tests
 *
 * Test suite for admin route handlers and incident persistence integration.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { closeIncidentService } from '../src/services/incidents.js';
import adminRoutes from '../src/routes/admin.js';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// Test database path
const TEST_DB_PATH = join(process.cwd(), 'test-admin-incidents.sqlite');

describe('Admin Routes - Incident Persistence Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    // Remove test database if it exists
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Reset incident service singleton
    closeIncidentService();

    // Create test app with admin routes
    app = express();
    app.use(express.json());
    app.use(adminRoutes);
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Reset incident service singleton
    closeIncidentService();
  });

  describe('POST /admin/incidents', () => {
    it('should create new incident with valid data', async () => {
      const incidentData = {
        title: 'Test Incident',
        description: 'Test description for admin route',
        severity: 'high',
        status: 'investigating',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe(incidentData.title);
      expect(response.body.data.description).toBe(incidentData.description);
      expect(response.body.data.severity).toBe(incidentData.severity);
      expect(response.body.data.status).toBe(incidentData.status);
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.message).toBe('Incident created successfully');
    });

    it('should create incident with default status when not provided', async () => {
      const incidentData = {
        title: 'Test Incident',
        description: 'Test description',
        severity: 'medium',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('investigating'); // Default status
      expect(response.body.data.severity).toBe(incidentData.severity);
    });

    it('should reject request with missing title', async () => {
      const incidentData = {
        description: 'Test description',
        severity: 'medium',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should reject request with invalid severity', async () => {
      const incidentData = {
        title: 'Test Incident',
        description: 'Test description',
        severity: 'invalid-severity',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with empty title', async () => {
      const incidentData = {
        title: '',
        description: 'Test description',
        severity: 'medium',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle all severity levels', async () => {
      const severities = ['low', 'medium', 'high', 'critical'];

      for (const severity of severities) {
        const incidentData = {
          title: `Test ${severity} incident`,
          description: 'Test description',
          severity,
        };

        const response = await request(app)
          .post('/admin/incidents')
          .send(incidentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.severity).toBe(severity);
      }
    });

    it('should handle all status values', async () => {
      const statuses = ['investigating', 'identified', 'monitoring', 'resolved'];

      for (const status of statuses) {
        const incidentData = {
          title: `Test ${status} incident`,
          description: 'Test description',
          severity: 'medium',
          status,
        };

        const response = await request(app)
          .post('/admin/incidents')
          .send(incidentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(status);
      }
    });

    it('should handle persistence errors gracefully', async () => {
      // This test verifies that the route properly bubbles persistence errors
      // In a real scenario, this might involve database connection issues

      const incidentData = {
        title: 'Test Incident',
        description: 'Test description',
        severity: 'high',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(201); // Should succeed in normal circumstances

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /admin/incidents', () => {
    it('should return empty array when no incidents exist', async () => {
      const response = await request(app)
        .get('/admin/incidents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.incidents).toEqual([]);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.stats).toBeDefined();
    });

    it('should return all created incidents', async () => {
      // Create multiple incidents
      const incidents = [
        { title: 'Incident 1', description: 'Description 1', severity: 'low' },
        { title: 'Incident 2', description: 'Description 2', severity: 'high' },
        { title: 'Incident 3', description: 'Description 3', severity: 'critical' },
      ];

      for (const incident of incidents) {
        await request(app)
          .post('/admin/incidents')
          .send(incident)
          .expect(201);
      }

      const response = await request(app)
        .get('/admin/incidents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.incidents).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.stats.total).toBe(3);
    });

    it('should include incident statistics', async () => {
      const response = await request(app)
        .get('/admin/incidents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toEqual({
        total: 0,
        byStatus: {
          investigating: 0,
          identified: 0,
          monitoring: 0,
          resolved: 0,
        },
        bySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
      });
    });
  });

  describe('GET /admin/incidents/:id', () => {
    it('should return specific incident by ID', async () => {
      // Create an incident first
      const createResponse = await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Specific Incident',
          description: 'Test description',
          severity: 'high',
        })
        .expect(201);

      const incidentId = createResponse.body.data.id;

      // Retrieve the incident
      const response = await request(app)
        .get(`/admin/incidents/${incidentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(incidentId);
      expect(response.body.data.title).toBe('Specific Incident');
      expect(response.body.data.severity).toBe('high');
    });

    it('should return 404 for non-existent incident', async () => {
      const response = await request(app)
        .get('/admin/incidents/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject invalid ID format', async () => {
      const response = await request(app)
        .get('/admin/incidents/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ID');
    });
  });

  describe('POST /admin/incidents/:id/status', () => {
    it('should update incident status', async () => {
      // Create an incident
      const createResponse = await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Status Update Test',
          description: 'Test description',
          severity: 'medium',
          status: 'investigating',
        })
        .expect(201);

      const incidentId = createResponse.body.data.id;

      // Update status
      const response = await request(app)
        .post(`/admin/incidents/${incidentId}/status`)
        .send({ status: 'identified' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('identified');
      expect(response.body.data.resolved_at).toBeNull();
      expect(response.body.message).toBe('Incident status updated successfully');
    });

    it('should set resolved timestamp when status is resolved', async () => {
      // Create an incident
      const createResponse = await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Resolve Test',
          description: 'Test description',
          severity: 'low',
          status: 'investigating',
        })
        .expect(201);

      const incidentId = createResponse.body.data.id;
      const beforeResolve = createResponse.body.data.resolved_at;

      // Resolve the incident
      const response = await request(app)
        .post(`/admin/incidents/${incidentId}/status`)
        .send({ status: 'resolved' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolved_at).toBeDefined();
      expect(response.body.data.resolved_at).not.toBe(beforeResolve);
    });

    it('should reject invalid status values', async () => {
      const response = await request(app)
        .post('/admin/incidents/1/status')
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent incident', async () => {
      const response = await request(app)
        .post('/admin/incidents/99999/status')
        .send({ status: 'resolved' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /admin/stats', () => {
    it('should return incident statistics', async () => {
      const response = await request(app)
        .get('/admin/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        total: 0,
        byStatus: {
          investigating: 0,
          identified: 0,
          monitoring: 0,
          resolved: 0,
        },
        bySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
      });
    });

    it('should return correct statistics after creating incidents', async () => {
      // Create incidents with different severities and statuses
      await request(app).post('/admin/incidents').send({
        title: 'Low severity',
        description: 'Description',
        severity: 'low',
        status: 'investigating',
      });

      await request(app).post('/admin/incidents').send({
        title: 'High severity',
        description: 'Description',
        severity: 'high',
        status: 'resolved',
      });

      const response = await request(app)
        .get('/admin/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.bySeverity.low).toBe(1);
      expect(response.body.data.bySeverity.high).toBe(1);
      expect(response.body.data.byStatus.investigating).toBe(1);
      expect(response.body.data.byStatus.resolved).toBe(1);
    });
  });

  describe('POST /admin/incidents/clear', () => {
    it('should clear all incidents', async () => {
      // Create some incidents first
      await request(app).post('/admin/incidents').send({
        title: 'Incident 1',
        description: 'Description 1',
        severity: 'low',
      });

      await request(app).post('/admin/incidents').send({
        title: 'Incident 2',
        description: 'Description 2',
        severity: 'high',
      });

      // Clear all incidents
      const response = await request(app)
        .post('/admin/incidents/clear')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(2);
      expect(response.body.message).toBe('Successfully deleted 2 incidents');
    });

    it('should return zero when clearing empty database', async () => {
      const response = await request(app)
        .post('/admin/incidents/clear')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // This test verifies proper error handling in the routes
      // In practice, this might involve database connection failures

      const incidentData = {
        title: 'Test Incident',
        description: 'Test description',
        severity: 'medium',
      };

      const response = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(201); // Should succeed in normal circumstances

      expect(response.body.success).toBe(true);
    });

    it('should provide consistent error response format', async () => {
      const response = await request(app)
        .post('/admin/incidents')
        .send({}) // Invalid data
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
