/**
 * Seed Script - Populate database with sample incidents
 *
 * This script creates sample incidents for development and testing.
 * Run with: npm run dev:seed
 */

import { getIncidentService } from '../services/incidents.js';

async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding incident database...\n');

  const service = getIncidentService();

  // Clear existing data
  console.log('Clearing existing incidents...');
  const clearResult = await service.clear();
  console.log(`✅ Cleared ${clearResult.deleted} existing incidents`);

  // Sample incidents
  const sampleIncidents = [
    {
      title: 'API Performance Degradation',
      description: 'Increased latency observed on the main API endpoints. Response times have increased from 200ms to 800ms over the last hour.',
      status: 'investigating' as const,
      severity: 'high' as const,
    },
    {
      title: 'Database Connection Pool Exhaustion',
      description: 'The database connection pool reached maximum capacity, causing timeout errors for new requests.',
      status: 'identified' as const,
      severity: 'critical' as const,
    },
    {
      title: 'CDN Cache Miss Rate Spike',
      description: 'Cache miss rate increased to 45% due to cache invalidation issue. Impact on page load times.',
      status: 'monitoring' as const,
      severity: 'medium' as const,
    },
    {
      title: 'Email Delivery Delays',
      description: 'Transactional emails are being delivered with a 15-minute delay. User notifications affected.',
      status: 'resolved' as const,
      severity: 'low' as const,
    },
    {
      title: 'Payment Gateway Timeout',
      description: 'Intermittent timeouts when processing payments through Stripe. Approximately 2% of transactions failing.',
      status: 'investigating' as const,
      severity: 'critical' as const,
    },
    {
      title: 'Search Service Slow Response',
      description: 'Search functionality experiencing slow response times. Users report 5-10 second delays for search results.',
      status: 'monitoring' as const,
      severity: 'high' as const,
    },
  ];

  // Create incidents
  console.log('\nCreating sample incidents...\n');
  for (const incidentData of sampleIncidents) {
    const incident = await service.create(incidentData);
    console.log(`✅ Created incident #${incident.id}: ${incident.title}`);
  }

  // Display statistics
  const stats = await service.getStats();
  console.log('\n📊 Database Statistics:');
  console.log(`Total incidents: ${stats.total}`);
  console.log('\nBy Status:');
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log('\nBy Severity:');
  Object.entries(stats.bySeverity).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}`);
  });

  // List all incidents
  const incidents = await service.list();
  console.log('\n📋 All Incidents:');
  incidents.forEach((incident) => {
    console.log(`  #${incident.id} [${incident.severity.toUpperCase()}] ${incident.status.toUpperCase()}`);
    console.log(`     ${incident.title}`);
    console.log(`     Created: ${incident.created_at}`);
    if (incident.resolved_at) {
      console.log(`     Resolved: ${incident.resolved_at}`);
    }
    console.log('');
  });

  console.log('✨ Database seeded successfully!');
  console.log('\n💡 Tip: Start the server with: npm run dev');
}

// Run the seed script
seedDatabase().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
