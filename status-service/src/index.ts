/**
 * TB Group Status Service
 *
 * Main entry point for the status service application.
 * This service provides incident tracking and status page functionality.
 */

// Export services
export { IncidentService, getIncidentService, closeIncidentService } from './services/incidents.js';

// Export types
export type {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  CreateIncidentInput,
} from './services/incidents.js';

// Export routes
export { default as adminRoutes } from './routes/admin.js';

// Export server
export { default as createServer } from './server.js';
