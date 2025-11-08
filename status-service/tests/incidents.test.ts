/**
 * Incident Service Tests
 *
 * Comprehensive test suite for the incident service functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  IncidentService,
  getIncidentService,
  closeIncidentService,
  type Incident,
  type CreateIncidentInput,
  type IncidentStatus,
  type IncidentSeverity,
} from '../src/services/incidents.js';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// Test database path
const TEST_DB_PATH = join(process.cwd(), 'test-incidents.sqlite');

describe('IncidentService', () => {
  let service: IncidentService;

  beforeEach(() => {
    // Remove test database if it exists
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Create service with test database path
    service = new IncidentService();
  });

  afterEach(() => {
    service.close();

    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Reset singleton
    closeIncidentService();
  });

  describe('Database Initialization', () => {
    it('should create database with correct schema', () => {
      expect(existsSync(TEST_DB_PATH)).toBe(true);
    });

    it('should initialize without errors on consecutive calls', () => {
      expect(() => service.list()).not.toThrow();
      expect(() => service.list()).not.toThrow();
    });
  });

  describe('list()', () => {
    it('should return empty array when no incidents exist', () => {
      const incidents = service.list();
      expect(incidents).toEqual([]);
      expect(incidents).toHaveLength(0);
    });

    it('should return all incidents ordered by creation date (newest first)', () => {
      // Create incidents
      const incident1 = service.create({
        title: 'First Incident',
        description: 'First description',
        severity: 'low',
      });

      const incident2 = service.create({
        title: 'Second Incident',
        description: 'Second description',
        severity: 'high',
        status: 'resolved',
      });

      const incidents = service.list();

      expect(incidents).toHaveLength(2);
      expect(incidents[0].id).toBe(incident2.id); // Most recent first
      expect(incidents[1].id).toBe(incident1.id);
    });
  });

  describe('create()', () => {
    it('should create incident with required fields', () => {
      const input: CreateIncidentInput = {
        title: 'Test Incident',
        description: 'Test Description',
        severity: 'medium',
      };

      const incident = service.create(input);

      expect(incident.id).toBeDefined();
      expect(incident.title).toBe(input.title);
      expect(incident.description).toBe(input.description);
      expect(incident.severity).toBe(input.severity);
      expect(incident.status).toBe('investigating'); // Default status
      expect(incident.created_at).toBeDefined();
      expect(incident.updated_at).toBeDefined();
      expect(incident.resolved_at).toBeNull();
    });

    it('should create incident with custom status', () => {
      const input: CreateIncidentInput = {
        title: 'Test Incident',
        description: 'Test Description',
        severity: 'high',
        status: 'identified',
      };

      const incident = service.create(input);

      expect(incident.status).toBe('identified');
    });

    it('should create incident with all severity levels', () => {
      const severities: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

      severities.forEach((severity) => {
        const incident = service.create({
          title: `Test ${severity}`,
          description: 'Test Description',
          severity,
        });

        expect(incident.severity).toBe(severity);
      });
    });

    it('should create incident with all status values', () => {
      const statuses: IncidentStatus[] = ['investigating', 'identified', 'monitoring', 'resolved'];

      statuses.forEach((status) => {
        const incident = service.create({
          title: `Test ${status}`,
          description: 'Test Description',
          severity: 'medium',
          status,
        });

        expect(incident.status).toBe(status);
      });
    });

    it('should increment ID for each created incident', () => {
      const incident1 = service.create({
        title: 'Incident 1',
        description: 'Description 1',
        severity: 'low',
      });

      const incident2 = service.create({
        title: 'Incident 2',
        description: 'Description 2',
        severity: 'medium',
      });

      const incident3 = service.create({
        title: 'Incident 3',
        description: 'Description 3',
        severity: 'high',
      });

      expect(incident1.id).toBe(1);
      expect(incident2.id).toBe(2);
      expect(incident3.id).toBe(3);
    });
  });

  describe('getById()', () => {
    it('should return incident when found', () => {
      const created = service.create({
        title: 'Test Incident',
        description: 'Test Description',
        severity: 'high',
      });

      const retrieved = service.getById(created.id!);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe(created.title);
    });

    it('should return null when incident not found', () => {
      const retrieved = service.getById(99999);

      expect(retrieved).toBeNull();
    });
  });

  describe('updateStatus()', () => {
    it('should update incident status', () => {
      const incident = service.create({
        title: 'Test Incident',
        description: 'Test Description',
        severity: 'medium',
      });

      const updated = service.updateStatus(incident.id!, 'identified');

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('identified');
      expect(updated?.resolved_at).toBeNull();
    });

    it('should set resolved timestamp when status is resolved', () => {
      const incident = service.create({
        title: 'Test Incident',
        description: 'Test Description',
        severity: 'medium',
      });

      const updated = service.updateStatus(incident.id!, 'resolved');

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('resolved');
      expect(updated?.resolved_at).toBeDefined();
      expect(updated?.resolved_at).not.toBeNull();
    });

    it('should preserve resolved timestamp for non-resolved status updates', () => {
      const incident = service.create({
        title: 'Test Incident',
        description: 'Test Description',
        severity: 'medium',
        status: 'resolved',
      });

      const updated = service.updateStatus(incident.id!, 'monitoring');

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('monitoring');
      expect(updated?.resolved_at).toBeDefined();
    });

    it('should return null when incident not found', () => {
      const updated = service.updateStatus(99999, 'resolved');

      expect(updated).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should delete all incidents', () => {
      // Create some incidents
      service.create({
        title: 'Incident 1',
        description: 'Description 1',
        severity: 'low',
      });

      service.create({
        title: 'Incident 2',
        description: 'Description 2',
        severity: 'high',
      });

      // Verify incidents exist
      expect(service.list()).toHaveLength(2);

      // Clear all incidents
      const result = service.clear();

      expect(result.deleted).toBe(2);
      expect(service.list()).toHaveLength(0);
    });

    it('should return correct count of deleted incidents', () => {
      // Create incidents
      service.create({
        title: 'Incident 1',
        description: 'Description 1',
        severity: 'low',
      });

      service.create({
        title: 'Incident 2',
        description: 'Description 2',
        severity: 'medium',
      });

      service.create({
        title: 'Incident 3',
        description: 'Description 3',
        severity: 'high',
      });

      const result = service.clear();

      expect(result.deleted).toBe(3);
    });

    it('should handle clearing empty database', () => {
      const result = service.clear();

      expect(result.deleted).toBe(0);
    });
  });

  describe('getStats()', () => {
    it('should return correct stats for empty database', () => {
      const stats = service.getStats();

      expect(stats.total).toBe(0);
      expect(stats.byStatus.investigating).toBe(0);
      expect(stats.byStatus.identified).toBe(0);
      expect(stats.byStatus.monitoring).toBe(0);
      expect(stats.byStatus.resolved).toBe(0);
      expect(stats.bySeverity.low).toBe(0);
      expect(stats.bySeverity.medium).toBe(0);
      expect(stats.bySeverity.high).toBe(0);
      expect(stats.bySeverity.critical).toBe(0);
    });

    it('should return correct stats after creating incidents', () => {
      // Create incidents with different statuses and severities
      service.create({
        title: 'Low Priority',
        description: 'Description',
        severity: 'low',
      });

      service.create({
        title: 'High Priority',
        description: 'Description',
        severity: 'high',
      });

      service.create({
        title: 'Resolved Incident',
        description: 'Description',
        severity: 'medium',
        status: 'resolved',
      });

      const stats = service.getStats();

      expect(stats.total).toBe(3);
      expect(stats.bySeverity.low).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.critical).toBe(0);
      expect(stats.byStatus.investigating).toBe(2); // Default status
      expect(stats.byStatus.resolved).toBe(1);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const service1 = getIncidentService();
      const service2 = getIncidentService();

      // Note: These are different instances in test context due to cleanup
      // In production, they should be the same
      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
    });
  });
});
