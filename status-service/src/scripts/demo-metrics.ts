/**
 * Demo script for Prometheus metrics
 *
 * This script demonstrates how the metrics service tracks admin incident
 * processing latency and database operations.
 */

import {
  recordProcessingLatency,
  recordDatabaseLatency,
  updateActiveIncidentsGauge,
  updateIncidentStatusCountsGauge,
  resetIncidentStatusCountsGauge,
  recordIncidentSeverity,
  getMetrics,
  createOperationTimer,
} from '../services/metrics.js';

async function demo() {
  console.log('🚀 Prometheus Metrics Demo\n');
  console.log('='.repeat(60));

  // Simulate admin operations
  console.log('\n📊 Simulating admin operations...\n');

  // Create incidents with different severities
  console.log('1. Creating incidents with different severities...');
  recordIncidentSeverity('low');
  recordIncidentSeverity('medium');
  recordIncidentSeverity('high');
  recordIncidentSeverity('critical');

  // Simulate database operations with latency
  console.log('\n2. Recording database operation latencies...');
  recordDatabaseLatency('insert', 'incidents', 0.015);
  recordDatabaseLatency('select', 'incidents', 0.008);
  recordDatabaseLatency('update', 'incidents', 0.012);
  recordDatabaseLatency('delete', 'incidents', 0.020);

  // Simulate admin operations with latency
  console.log('\n3. Recording admin operation latencies...');
  recordProcessingLatency('create', 'success', 0.045);
  recordProcessingLatency('list', 'success', 0.032);
  recordProcessingLatency('update', 'success', 0.038);
  recordProcessingLatency('status_change', 'success', 0.041);
  recordProcessingLatency('get', 'success', 0.012);
  recordProcessingLatency('stats', 'success', 0.008);
  recordProcessingLatency('clear', 'success', 0.067);

  // Simulate an error
  console.log('\n4. Simulating an error...');
  recordProcessingLatency('create', 'error', 0.052);

  // Update active incidents gauge
  console.log('\n5. Updating active incidents gauge...');
  updateActiveIncidentsGauge(3);

  // Update incident status counts with labels
  console.log('\n6. Updating incident status counts with labels...');
  const statusCounts = {
    investigating: 2,
    identified: 1,
    monitoring: 3,
    resolved: 4,
  };
  updateIncidentStatusCountsGauge(statusCounts);
  console.log('   ✓ Status counts updated:');
  console.log('     - investigating:', statusCounts.investigating);
  console.log('     - identified:', statusCounts.identified);
  console.log('     - monitoring:', statusCounts.monitoring);
  console.log('     - resolved:', statusCounts.resolved);

  // Demonstrate reset functionality
  console.log('\n7. Resetting incident status counts to zero...');
  resetIncidentStatusCountsGauge();
  console.log('   ✓ All status counts reset to 0');

  // Demonstrate OperationTimer
  console.log('\n8. Demonstrating OperationTimer...');
  const timer = createOperationTimer('demo_operation');
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate 50ms work
  const latency = timer.end('success');
  console.log(`   ✓ Demo operation completed in ${latency.toFixed(3)}s`);

  // Get and display metrics
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 Prometheus Metrics Output:\n');
  console.log('-'.repeat(60));

  const metrics = await getMetrics();
  console.log(metrics);

  console.log('-'.repeat(60));
  console.log('\n✨ Demo completed!');
  console.log('\nYou can also view metrics at: http://localhost:3000/metrics');
  console.log('='.repeat(60));
}

// Run the demo
demo().catch(error => {
  console.error('Error running demo:', error);
  process.exit(1);
});
