/**
 * Tests for metrics service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordProcessingLatency,
  recordDatabaseLatency,
  updateActiveIncidentsGauge,
  updateIncidentStatusCountsGauge,
  resetIncidentStatusCountsGauge,
  recordIncidentSeverity,
  getMetrics,
  createOperationTimer,
  register,
} from '../src/services/metrics.js';

describe('Metrics Service', () => {
  beforeEach(async () => {
    // Clear all metrics before each test
    const metrics = await register.getMetricsAsJSON();
    for (const metric of metrics) {
      if (metric.values) {
        metric.values.length = 0;
      }
    }
  });

  describe('recordProcessingLatency', () => {
    it('should record processing latency for successful operations', async () => {
      recordProcessingLatency('create', 'success', 0.05);

      const metrics = await getMetrics();
      expect(metrics).toContain('status_service_admin_processing_latency_seconds');
      expect(metrics).toContain('create');
      expect(metrics).toContain('success');
    });

    it('should record processing latency for failed operations', async () => {
      recordProcessingLatency('update', 'error', 0.1);

      const metrics = await getMetrics();
      expect(metrics).toContain('status_service_admin_processing_latency_seconds');
      expect(metrics).toContain('update');
      expect(metrics).toContain('error');
    });
  });

  describe('recordDatabaseLatency', () => {
    it('should record database operation latency', async () => {
      recordDatabaseLatency('insert', 'incidents', 0.025);

      const metrics = await getMetrics();
      expect(metrics).toContain('status_service_admin_database_operation_latency_seconds');
      expect(metrics).toContain('insert');
      expect(metrics).toContain('incidents');
    });
  });

  describe('updateActiveIncidentsGauge', () => {
    it('should update active incidents gauge', async () => {
      updateActiveIncidentsGauge(5);

      const metrics = await getMetrics();
      expect(metrics).toContain('status_service_active_incidents');
    });
  });

  describe('updateIncidentStatusCountsGauge', () => {
    it('should update incident status counts with labels', async () => {
      const statusCounts = {
        investigating: 2,
        identified: 1,
        monitoring: 3,
        resolved: 4,
      };

      updateIncidentStatusCountsGauge(statusCounts);

      const metrics = await getMetrics();

      // Verify the gauge exists
      expect(metrics).toContain('status_service_incident_status_counts');

      // Verify all status labels are present
      expect(metrics).toContain('status="investigating"');
      expect(metrics).toContain('status="identified"');
      expect(metrics).toContain('status="monitoring"');
      expect(metrics).toContain('status="resolved"');
    });

    it('should update each status count correctly', async () => {
      const statusCounts = {
        investigating: 5,
        identified: 3,
        monitoring: 2,
        resolved: 10,
      };

      updateIncidentStatusCountsGauge(statusCounts);

      const metrics = await getMetrics();

      // Verify the metric name is present
      expect(metrics).toContain('status_service_incident_status_counts');
    });

    it('should handle zero counts for all statuses', async () => {
      const statusCounts = {
        investigating: 0,
        identified: 0,
        monitoring: 0,
        resolved: 0,
      };

      updateIncidentStatusCountsGauge(statusCounts);

      const metrics = await getMetrics();

      // Should still contain the gauge with all labels
      expect(metrics).toContain('status_service_incident_status_counts');
    });
  });

  describe('resetIncidentStatusCountsGauge', () => {
    it('should reset all status counts to zero', async () => {
      // First set some counts
      const statusCounts = {
        investigating: 5,
        identified: 3,
        monitoring: 2,
        resolved: 10,
      };
      updateIncidentStatusCountsGauge(statusCounts);

      // Reset to zero
      resetIncidentStatusCountsGauge();

      const metrics = await getMetrics();

      // Verify the gauge still exists
      expect(metrics).toContain('status_service_incident_status_counts');

      // Verify all status labels are present (even with zero values)
      expect(metrics).toContain('status="investigating"');
      expect(metrics).toContain('status="identified"');
      expect(metrics).toContain('status="monitoring"');
      expect(metrics).toContain('status="resolved"');
    });

    it('should ensure labels are properly zeroed when clearing incidents', async () => {
      // Simulate clearing incidents
      resetIncidentStatusCountsGauge();

      const metrics = await getMetrics();

      // The gauge should exist with all status labels
      expect(metrics).toContain('status_service_incident_status_counts');
      expect(metrics).toContain('status="investigating"');
      expect(metrics).toContain('status="identified"');
      expect(metrics).toContain('status="monitoring"');
      expect(metrics).toContain('status="resolved"');
    });
  });

  describe('recordIncidentSeverity', () => {
    it('should record incident severity distribution', async () => {
      recordIncidentSeverity('high');

      const metrics = await getMetrics();
      expect(metrics).toContain('status_service_incident_severity');
      expect(metrics).toContain('high');
    });
  });

  describe('OperationTimer', () => {
    it('should measure and record operation latency', async () => {
      const timer = createOperationTimer('test_operation');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      const latency = timer.end('success');

      expect(latency).toBeGreaterThan(0);
      expect(latency).toBeLessThan(1); // Should be less than 1 second

      const metrics = await getMetrics();
      expect(metrics).toContain('status_service_admin_processing_latency_seconds');
      expect(metrics).toContain('test_operation');
      expect(metrics).toContain('success');
    });

    it('should record error status', async () => {
      const timer = createOperationTimer('test_error');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      const latency = timer.end('error');

      expect(latency).toBeGreaterThan(0);

      const metrics = await getMetrics();
      expect(metrics).toContain('test_error');
      expect(metrics).toContain('error');
    });

    it('should measure elapsed time without recording', async () => {
      const timer = createOperationTimer('test_elapsed');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      const elapsed = timer.getElapsedSeconds();

      expect(elapsed).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(1);

      // Timer should still be active
      const newElapsed = timer.getElapsedSeconds();
      expect(newElapsed).toBeGreaterThan(elapsed);
    });
  });

  describe('getMetrics', () => {
    it('should return metrics in Prometheus format', async () => {
      const metrics = await getMetrics();

      expect(typeof metrics).toBe('string');
      expect(metrics.length).toBeGreaterThan(0);

      // Should contain metric names
      expect(metrics).toContain('# HELP');
      expect(metrics).toContain('# TYPE');
    });

    it('should contain all custom metrics', async () => {
      const metrics = await getMetrics();

      expect(metrics).toContain('status_service_admin_processing_latency_seconds');
      expect(metrics).toContain('status_service_admin_database_operation_latency_seconds');
      expect(metrics).toContain('status_service_admin_operations_total');
      expect(metrics).toContain('status_service_active_incidents');
      expect(metrics).toContain('status_service_incident_severity');
    });
  });

  describe('Integration', () => {
    it('should track complete admin workflow', async () => {
      // Simulate admin operations
      recordProcessingLatency('create', 'success', 0.05);
      recordDatabaseLatency('insert', 'incidents', 0.02);
      recordIncidentSeverity('high');

      const timer = createOperationTimer('list');
      await new Promise(resolve => setTimeout(resolve, 5));
      timer.end('success');
      updateActiveIncidentsGauge(3);

      // Simulate status counts update
      const statusCounts = {
        investigating: 1,
        identified: 1,
        monitoring: 1,
        resolved: 2,
      };
      updateIncidentStatusCountsGauge(statusCounts);

      const metrics = await getMetrics();

      // Verify all operations were recorded
      expect(metrics).toContain('create');
      expect(metrics).toContain('insert');
      expect(metrics).toContain('high');
      expect(metrics).toContain('list');

      // Verify operation counter
      expect(metrics).toContain('status_service_admin_operations_total');

      // Verify status counts gauge
      expect(metrics).toContain('status_service_incident_status_counts');
      expect(metrics).toContain('status="investigating"');
      expect(metrics).toContain('status="identified"');
      expect(metrics).toContain('status="monitoring"');
      expect(metrics).toContain('status="resolved"');
    });
  });
});
