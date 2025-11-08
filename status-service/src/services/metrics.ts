/**
 * Metrics Service - Prometheus Metrics
 *
 * Provides Prometheus metrics for monitoring admin incident processing latency.
 * Tracks performance metrics for all admin operations including create, update,
 * status changes, and list operations.
 */

import client from 'prom-client';

// Register default metrics (process metrics, garbage collection, etc.)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Create custom histograms for admin incident processing latency
const processingLatencyHistogram = new client.Histogram({
  name: 'status_service_admin_processing_latency_seconds',
  help: 'Latency of admin incident processing operations in seconds',
  labelNames: ['operation', 'status'] as const,
  // Define custom buckets for latency measurements
  // From 0.001s (1ms) to 10s
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Create a histogram for database operation latency
const databaseLatencyHistogram = new client.Histogram({
  name: 'status_service_admin_database_operation_latency_seconds',
  help: 'Latency of database operations in seconds',
  labelNames: ['operation', 'table'] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

// Create a counter for total admin operations
const operationCounter = new client.Counter({
  name: 'status_service_admin_operations_total',
  help: 'Total number of admin operations',
  labelNames: ['operation', 'status'] as const,
});

// Create a gauge for active incidents
const activeIncidentsGauge = new client.Gauge({
  name: 'status_service_active_incidents',
  help: 'Number of active (non-resolved) incidents',
});

// Create a gauge for incident status counts with labels
const incidentStatusCountsGauge = new client.Gauge({
  name: 'status_service_incident_status_counts',
  help: 'Number of incidents by status',
  labelNames: ['status'] as const,
});

// Create a histogram for incident severity distribution
const severityHistogram = new client.Histogram({
  name: 'status_service_incident_severity',
  help: 'Distribution of incident severities',
  labelNames: ['severity'] as const,
  // Use custom buckets for severity (discrete values)
  buckets: [0.5, 1.5, 2.5, 3.5], // low=1, medium=2, high=3, critical=4
});

// Register all custom metrics
register.registerMetric(processingLatencyHistogram);
register.registerMetric(databaseLatencyHistogram);
register.registerMetric(operationCounter);
register.registerMetric(activeIncidentsGauge);
register.registerMetric(incidentStatusCountsGauge);
register.registerMetric(severityHistogram);

/**
 * Record processing latency for an admin operation
 */
export function recordProcessingLatency(
  operation: 'create' | 'update' | 'status_change' | 'list' | 'get' | 'delete' | 'stats' | 'clear',
  status: 'success' | 'error',
  latencySeconds: number
): void {
  processingLatencyHistogram.labels(operation, status).observe(latencySeconds);
  operationCounter.labels(operation, status).inc();
}

/**
 * Record database operation latency
 */
export function recordDatabaseLatency(
  operation: 'insert' | 'select' | 'update' | 'delete',
  table: string,
  latencySeconds: number
): void {
  databaseLatencyHistogram.labels(operation, table).observe(latencySeconds);
}

/**
 * Update active incidents gauge
 */
export function updateActiveIncidentsGauge(count: number): void {
  activeIncidentsGauge.set(count);
}

/**
 * Update incident status counts gauge with proper label handling
 * Ensures all status labels are properly zeroed when incidents are cleared
 */
export function updateIncidentStatusCountsGauge(statusCounts: {
  investigating: number;
  identified: number;
  monitoring: number;
  resolved: number;
}): void {
  // Update each status count with its label
  incidentStatusCountsGauge.labels('investigating').set(statusCounts.investigating);
  incidentStatusCountsGauge.labels('identified').set(statusCounts.identified);
  incidentStatusCountsGauge.labels('monitoring').set(statusCounts.monitoring);
  incidentStatusCountsGauge.labels('resolved').set(statusCounts.resolved);
}

/**
 * Reset all incident status counts to zero
 * Used when clearing all incidents to ensure no stale data
 */
export function resetIncidentStatusCountsGauge(): void {
  // Set all status counts to zero
  incidentStatusCountsGauge.labels('investigating').set(0);
  incidentStatusCountsGauge.labels('identified').set(0);
  incidentStatusCountsGauge.labels('monitoring').set(0);
  incidentStatusCountsGauge.labels('resolved').set(0);
}

/**
 * Record incident severity
 */
export function recordIncidentSeverity(severity: 'low' | 'medium' | 'high' | 'critical'): void {
  const severityValue = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  }[severity];

  severityHistogram.labels(severity).observe(severityValue);
}

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

/**
 * Get metrics in JSON format for debugging
 */
export async function getMetricsJSON(): Promise<any> {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
}

/**
 * Middleware to automatically record request latency
 */
export function createLatencyMiddleware(operation: string) {
  const startTime = process.hrtime.bigint();

  return () => {
    const endTime = process.hrtime.bigint();
    const latencySeconds = Number(endTime - startTime) / 1e9;
    return latencySeconds;
  };
}

/**
 * Utility class for timing operations
 */
export class OperationTimer {
  private startTime: bigint;

  constructor(private operation: string) {
    this.startTime = process.hrtime.bigint();
  }

  /**
   * End the timer and record the latency
   */
  public end(status: 'success' | 'error'): number {
    const endTime = process.hrtime.bigint();
    const latencySeconds = Number(endTime - this.startTime) / 1e9;

    recordProcessingLatency(
      this.operation as any,
      status,
      latencySeconds
    );

    return latencySeconds;
  }

  /**
   * Get elapsed time without recording
   */
  public getElapsedSeconds(): number {
    const endTime = process.hrtime.bigint();
    return Number(endTime - this.startTime) / 1e9;
  }
}

/**
 * Create a new operation timer
 */
export function createOperationTimer(operation: string): OperationTimer {
  return new OperationTimer(operation);
}

export default {
  recordProcessingLatency,
  recordDatabaseLatency,
  updateActiveIncidentsGauge,
  updateIncidentStatusCountsGauge,
  resetIncidentStatusCountsGauge,
  recordIncidentSeverity,
  getMetrics,
  getMetricsJSON,
  createLatencyMiddleware,
  createOperationTimer,
  register,
};

// Also export register as a named export for direct imports
export { register };
