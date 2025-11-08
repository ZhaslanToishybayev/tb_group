/**
 * Postgres Incident Repository
 *
 * This is an example implementation of IIncidentRepository using PostgreSQL.
 * It demonstrates how to switch from SQLite to Postgres without changing the
 * service layer.
 *
 * To use this implementation:
 *
 * 1. Install required dependencies:
 *    npm install pg
 *
 * 2. Update getIncidentService() in incidents.ts to use PostgresIncidentRepository
 *
 * 3. Set DATABASE_URL environment variable
 */

import { Pool } from 'pg';
import pino from 'pino';
import {
  IIncidentRepository,
  Incident,
  IncidentStatus,
  IncidentSeverity,
  CreateIncidentInput,
  IncidentStats,
} from '../services/incidents.js';

const logger = pino({ name: 'postgres-repository' });

/**
 * PostgreSQL implementation of the incident repository
 */
export class PostgresIncidentRepository implements IIncidentRepository {
  private pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    logger.info('Initializing PostgreSQL incident repository');

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Initialize schema
    this.initializeSchema().catch(err => {
      logger.error({ err }, 'Failed to initialize database schema');
      throw err;
    });
  }

  /**
   * Initialize database schema if it doesn't exist
   */
  private async initializeSchema(): Promise<void> {
    logger.info('Initializing PostgreSQL database schema');

    const schemaSQL = `
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('investigating', 'identified', 'monitoring', 'resolved')),
        severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE NULL
      );

      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
      CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
    `;

    await this.pool.query(schemaSQL);
    logger.info('PostgreSQL database schema initialized successfully');
  }

  /**
   * List all incidents, ordered by creation date (newest first)
   */
  async list(): Promise<Incident[]> {
    logger.debug('Listing all incidents');

    const result = await this.pool.query(`
      SELECT
        id,
        title,
        description,
        status,
        severity,
        created_at,
        updated_at,
        resolved_at
      FROM incidents
      ORDER BY created_at DESC
    `);

    logger.debug({ count: result.rows.length }, 'Retrieved incidents from PostgreSQL');

    return result.rows as Incident[];
  }

  /**
   * Create a new incident
   */
  async create(input: CreateIncidentInput): Promise<Incident> {
    logger.info({ title: input.title, severity: input.severity }, 'Creating new incident');

    // Set default status if not provided
    const status = input.status || 'investigating';
    const now = new Date().toISOString();

    const result = await this.pool.query(`
      INSERT INTO incidents (
        title,
        description,
        status,
        severity,
        created_at,
        updated_at,
        resolved_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NULL)
      RETURNING
        id,
        title,
        description,
        status,
        severity,
        created_at,
        updated_at,
        resolved_at
    `, [
      input.title,
      input.description,
      status,
      input.severity,
      now,
      now,
    ]);

    const incident = result.rows[0];
    logger.info({ id: incident.id }, 'Incident created successfully in PostgreSQL');

    return incident as Incident;
  }

  /**
   * Get incident by ID
   */
  async getById(id: number): Promise<Incident | null> {
    logger.debug({ id }, 'Getting incident by ID');

    const result = await this.pool.query(`
      SELECT
        id,
        title,
        description,
        status,
        severity,
        created_at,
        updated_at,
        resolved_at
      FROM incidents
      WHERE id = $1
    `, [id]);

    if (result.rows.length > 0) {
      logger.debug({ id }, 'Incident found in PostgreSQL');
      return result.rows[0] as Incident;
    } else {
      logger.debug({ id }, 'Incident not found in PostgreSQL');
      return null;
    }
  }

  /**
   * Update incident status and optionally set resolved timestamp
   */
  async updateStatus(id: number, status: IncidentStatus): Promise<Incident | null> {
    logger.info({ id, status }, 'Updating incident status in PostgreSQL');

    const incident = await this.getById(id);
    if (!incident) {
      logger.warn({ id }, 'Incident not found for status update');
      return null;
    }

    const now = new Date().toISOString();
    const resolvedAt = status === 'resolved' ? now : incident.resolved_at || null;

    await this.pool.query(`
      UPDATE incidents
      SET status = $1, updated_at = $2, resolved_at = $3
      WHERE id = $4
    `, [status, now, resolvedAt, id]);

    logger.info({ id, status }, 'Incident status updated successfully in PostgreSQL');

    return await this.getById(id);
  }

  /**
   * Clear all incidents from the database
   */
  async clear(): Promise<{ deleted: number }> {
    logger.info('Clearing all incidents from PostgreSQL');

    const result = await this.pool.query('DELETE FROM incidents');

    const deleted = result.rowCount || 0;

    logger.info({ deleted }, 'All incidents cleared from PostgreSQL');

    return { deleted };
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<IncidentStats> {
    const totalResult = await this.pool.query('SELECT COUNT(*) as count FROM incidents');
    const total = parseInt(totalResult.rows[0].count, 10);

    const byStatusResult = await this.pool.query(`
      SELECT status, COUNT(*) as count
      FROM incidents
      GROUP BY status
    `);

    const bySeverityResult = await this.pool.query(`
      SELECT severity, COUNT(*) as count
      FROM incidents
      GROUP BY severity
    `);

    const stats: IncidentStats = {
      total,
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
    };

    byStatusResult.rows.forEach((row: any) => {
      stats.byStatus[row.status as IncidentStatus] = parseInt(row.count, 10);
    });

    bySeverityResult.rows.forEach((row: any) => {
      stats.bySeverity[row.severity as IncidentSeverity] = parseInt(row.count, 10);
    });

    return stats;
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    logger.info('Closing PostgreSQL connection pool');
    await this.pool.end();
  }
}

/**
 * Example usage with dependency injection:
 *
 * import { PostgresIncidentRepository } from './repositories/postgres-incident-repository.js';
 * import { createIncidentService } from './services/incidents.js';
 *
 * const postgresRepo = new PostgresIncidentRepository();
 * const incidentService = createIncidentService(postgresRepo);
 *
 * // Now use the service normally - it works with any IIncidentRepository implementation
 * const incidents = await incidentService.list();
 */
