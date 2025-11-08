/**
 * Integration tests for status service
 *
 * Tests the complete flow from admin incident creation to public status display.
 * This covers the "admin create → public list" end-to-end integration.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { closeIncidentService, getIncidentService } from '../src/services/incidents.js';
import adminRoutes from '../src/routes/admin.js';
import publicRoutes from '../src/routes/public.js';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// Test database path
const TEST_DB_PATH = join(process.cwd(), 'test-status-incidents.sqlite');

describe('Status Service - Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Remove test database if it exists
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Reset incident service singleton
    closeIncidentService();

    // Set test database path
    process.env.INCIDENTS_DB_PATH = TEST_DB_PATH;

    // Create test app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Mount public routes first (without prefix)
    app.use('/', publicRoutes);
    // Mount admin routes with /admin prefix
    app.use('/admin', adminRoutes);
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Reset incident service singleton
    closeIncidentService();

    // Remove test database path
    delete process.env.INCIDENTS_DB_PATH;
  });

  describe('Admin Create → Public List Flow', () => {
    it('should create incident via admin and display in public list', async () => {
      // Step 1: Create an incident via admin API
      const createResponse = await request(app)
        .post('/admin/incidents')
        .send({
          title: 'API Performance Degradation',
          description: 'Main API endpoints responding slower than expected',
          severity: 'high',
          status: 'investigating',
        })
        .expect(201);

      // Verify the create response
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data).toBeDefined();
      expect(createResponse.body.data.id).toBeDefined();
      expect(createResponse.body.data.title).toBe('API Performance Degradation');
      expect(createResponse.body.data.description).toBe('Main API endpoints responding slower than expected');
      expect(createResponse.body.data.severity).toBe('high');
      expect(createResponse.body.data.status).toBe('investigating');
      expect(createResponse.body.data.created_at).toBeDefined();

      const incidentId = createResponse.body.data.id;

      // Step 2: Verify incident appears in admin list
      const adminListResponse = await request(app)
        .get('/admin/incidents')
        .expect(200);

      expect(adminListResponse.body.success).toBe(true);
      expect(adminListResponse.body.data.incidents).toBeDefined();
      expect(adminListResponse.body.data.incidents).toHaveLength(1);
      expect(adminListResponse.body.data.incidents[0].id).toBe(incidentId);

      // Step 3: Verify incident appears in public API
      const publicListResponse = await request(app)
        .get('/api/incidents')
        .expect(200);

      expect(publicListResponse.body.success).toBe(true);
      expect(publicListResponse.body.data.incidents).toBeDefined();
      expect(publicListResponse.body.data.incidents).toHaveLength(1);

      const publicIncident = publicListResponse.body.data.incidents[0];
      expect(publicIncident.id).toBe(incidentId);
      expect(publicIncident.title).toBe('API Performance Degradation');
      expect(publicIncident.description).toBe('Main API endpoints responding slower than expected');
      expect(publicIncident.severity).toBe('high');
      expect(publicIncident.status).toBe('investigating');

      // Step 4: Verify system status reflects the incident
      const statusResponse = await request(app)
        .get('/api/status')
        .expect(200);

      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.data).toBeDefined();
      // Since there's a high severity incident, should be partial_outage or major_outage
      expect(['partial_outage', 'major_outage']).toContain(statusResponse.body.data.status);
      expect(statusResponse.body.data.activeIncidents).toBe(1);
      expect(statusResponse.body.data.totalIncidents).toBe(1);
    });

    it('should handle multiple incidents with different severities', async () => {
      // Create multiple incidents
      const incidents = [
        {
          title: 'Minor UI Glitch',
          description: 'Small display issue on mobile',
          severity: 'low',
          status: 'monitoring',
        },
        {
          title: 'Database Connection Pool Exhaustion',
          description: 'Unable to handle all concurrent requests',
          severity: 'critical',
          status: 'investigating',
        },
        {
          title: 'Email Delivery Delayed',
          description: 'Notification emails sent with delay',
          severity: 'medium',
          status: 'identified',
        },
      ];

      // Create all incidents via admin API
      for (const incidentData of incidents) {
        await request(app)
          .post('/admin/incidents')
          .send(incidentData)
          .expect(201);
      }

      // Verify all incidents appear in public list
      const publicListResponse = await request(app)
        .get('/api/incidents')
        .expect(200);

      expect(publicListResponse.body.data.incidents).toHaveLength(3);
      expect(publicListResponse.body.data.stats.total).toBe(3);

      // Verify system status calculation
      const statusResponse = await request(app)
        .get('/api/status')
        .expect(200);

      expect(statusResponse.body.data.totalIncidents).toBe(3);
      expect(statusResponse.body.data.activeIncidents).toBe(3); // All are non-resolved
      // Critical incident should trigger major_outage status
      expect(statusResponse.body.data.status).toBe('major_outage');
    });

    it('should update incident status and reflect in public list', async () => {
      // Step 1: Create an incident
      const createResponse = await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Service Interruption',
          description: 'Users unable to access main features',
          severity: 'high',
          status: 'investigating',
        })
        .expect(201);

      const incidentId = createResponse.body.data.id;

      // Step 2: Update incident status
      const updateResponse = await request(app)
        .post(`/admin/incidents/${incidentId}/status`)
        .send({
          status: 'resolved',
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.status).toBe('resolved');
      expect(updateResponse.body.data.resolved_at).toBeDefined();

      // Step 3: Verify status change in public API
      const publicListResponse = await request(app)
        .get('/api/incidents')
        .expect(200);

      const incident = publicListResponse.body.data.incidents.find(
        (i: any) => i.id === incidentId
      );
      expect(incident).toBeDefined();
      expect(incident.status).toBe('resolved');
      expect(incident.resolved_at).toBeDefined();

      // Step 4: Verify system status updated
      const statusResponse = await request(app)
        .get('/api/status')
        .expect(200);

      expect(statusResponse.body.data.activeIncidents).toBe(0); // No active incidents
      expect(statusResponse.body.data.status).toBe('operational');
    });

    it('should calculate system status correctly based on incidents', async () => {
      // Test operational status (no incidents)
      let statusResponse = await request(app).get('/api/status').expect(200);
      expect(statusResponse.body.data.status).toBe('operational');
      expect(statusResponse.body.data.activeIncidents).toBe(0);

      // Create a low severity incident
      await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Minor Issue',
          description: 'Low priority issue',
          severity: 'low',
          status: 'investigating',
        })
        .expect(201);

      // Should be partial outage due to active incident
      statusResponse = await request(app).get('/api/status').expect(200);
      expect(statusResponse.body.data.status).toBe('partial_outage');
      expect(statusResponse.body.data.activeIncidents).toBe(1);

      // Create a critical incident
      await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Critical Outage',
          description: 'System completely down',
          severity: 'critical',
          status: 'investigating',
        })
        .expect(201);

      // Should be major outage due to critical incident
      statusResponse = await request(app).get('/api/status').expect(200);
      expect(statusResponse.body.data.status).toBe('major_outage');
      expect(statusResponse.body.data.activeIncidents).toBe(2);

      // Resolve the critical incident
      const incidents = await request(app).get('/api/incidents');
      const criticalIncidentId = incidents.body.data.incidents.find(
        (i: any) => i.severity === 'critical'
      ).id;

      await request(app)
        .post(`/admin/incidents/${criticalIncidentId}/status`)
        .send({ status: 'resolved' })
        .expect(200);

      // Should be partial outage (low severity incident still active)
      statusResponse = await request(app).get('/api/status').expect(200);
      expect(statusResponse.body.data.status).toBe('partial_outage');
      expect(statusResponse.body.data.activeIncidents).toBe(1);

      // Resolve all incidents
      const remainingIncidents = await request(app).get('/api/incidents');
      for (const incident of remainingIncidents.body.data.incidents) {
        await request(app)
          .post(`/admin/incidents/${incident.id}/status`)
          .send({ status: 'resolved' })
          .expect(200);
      }

      // Should be operational again
      statusResponse = await request(app).get('/api/status').expect(200);
      expect(statusResponse.body.data.status).toBe('operational');
      expect(statusResponse.body.data.activeIncidents).toBe(0);
    });

    it('should include proper statistics in public API', async () => {
      // Create several incidents
      const incidents = [
        { title: 'Issue 1', description: 'Desc 1', severity: 'low' },
        { title: 'Issue 2', description: 'Desc 2', severity: 'medium' },
        { title: 'Issue 3', description: 'Desc 3', severity: 'high' },
        { title: 'Issue 4', description: 'Desc 4', severity: 'critical', status: 'resolved' },
      ];

      for (const incident of incidents) {
        await request(app)
          .post('/admin/incidents')
          .send(incident)
          .expect(201);
      }

      // Check public API statistics
      const response = await request(app).get('/api/incidents').expect(200);

      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.total).toBe(4);
      // Calculate active from byStatus (all except resolved)
      const active = response.body.data.stats.byStatus.investigating +
        response.body.data.stats.byStatus.identified +
        response.body.data.stats.byStatus.monitoring;
      expect(active).toBe(3); // 3 non-resolved
      // Calculate highPriority from bySeverity
      const highPriority = response.body.data.stats.bySeverity.high +
        response.body.data.stats.bySeverity.critical;
      expect(highPriority).toBe(2);
      expect(response.body.data.lastUpdated).toBeDefined();
    });

    it('should handle clear all incidents via admin', async () => {
      // Create some incidents
      await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test Description',
          severity: 'medium',
        })
        .expect(201);

      await request(app)
        .post('/admin/incidents')
        .send({
          title: 'Another Incident',
          description: 'Another Description',
          severity: 'high',
        })
        .expect(201);

      // Verify incidents exist
      let publicList = await request(app).get('/api/incidents').expect(200);
      expect(publicList.body.data.incidents).toHaveLength(2);

      // Clear all incidents
      await request(app)
        .post('/admin/incidents/clear')
        .expect(200);

      // Verify incidents are gone
      publicList = await request(app).get('/api/incidents').expect(200);
      expect(publicList.body.data.incidents).toHaveLength(0);
      expect(publicList.body.data.stats.total).toBe(0);

      // Verify operational status
      const statusResponse = await request(app).get('/api/status').expect(200);
      expect(statusResponse.body.data.status).toBe('operational');
      expect(statusResponse.body.data.activeIncidents).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all incident data fields across admin and public APIs', async () => {
      const incidentData = {
        title: 'Comprehensive Test Incident',
        description: 'This is a detailed description of the incident with special characters: @#$%',
        severity: 'critical',
        status: 'investigating',
      };

      // Create via admin
      const createResponse = await request(app)
        .post('/admin/incidents')
        .send(incidentData)
        .expect(201);

      const incidentId = createResponse.body.data.id;

      // Get via admin
      const adminIncident = await request(app)
        .get(`/admin/incidents/${incidentId}`)
        .expect(200);

      // Get via public
      const publicIncident = await request(app)
        .get('/api/incidents')
        .expect(200);

      const publicData = publicIncident.body.data.incidents[0];

      // Verify all fields match
      expect(publicData.title).toBe(incidentData.title);
      expect(publicData.description).toBe(incidentData.description);
      expect(publicData.severity).toBe(incidentData.severity);
      expect(publicData.status).toBe(incidentData.status);
      expect(publicData.id).toBe(incidentId);
      expect(publicData.created_at).toBeDefined();
      expect(publicData.updated_at).toBeDefined();

      // Verify timestamps are consistent
      expect(publicData.created_at).toBe(adminIncident.body.data.created_at);
      expect(publicData.updated_at).toBe(adminIncident.body.data.updated_at);
    });
  });

  describe('Error Handling Integration', () => {
    it('should return 404 for non-existent incident in admin API', async () => {
      const response = await request(app)
        .get('/admin/incidents/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle validation errors in admin create flow', async () => {
      const response = await request(app)
        .post('/admin/incidents')
        .send({
          title: '', // Invalid: empty title
          description: 'Test',
          severity: 'invalid-severity', // Invalid severity
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.length).toBeGreaterThan(0);

      // Verify no incident was created in public list
      const publicList = await request(app).get('/api/incidents').expect(200);
      expect(publicList.body.data.incidents).toHaveLength(0);
    });
  });
});
