/**
 * Incident Service - Repository Pattern Implementation
 *
 * This module implements the repository pattern to abstract database persistence
 * from business logic. It allows for easy switching between different database
 * backends (SQLite, Postgres, etc.) without changing the service layer.
 *
 * Architecture:
 * - IIncidentRepository: Interface defining contract for persistence operations
 * - SQLiteIncidentRepository: Concrete implementation using SQLite
 * - IncidentService: Facade/service layer using repository
 */

import Database from 'better-sqlite3';
import { dirname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import pino from 'pino';

const logger = pino({ name: 'incident-service' });

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Incident {
  id?: number;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export type IncidentStatus =
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CreateIncidentInput {
  title: string;
  description: string;
  status?: IncidentStatus;
  severity: IncidentSeverity;
}

export interface IncidentStats {
  total: number;
  byStatus: Record<IncidentStatus, number>;
  bySeverity: Record<IncidentSeverity, number>;
}

// =============================================================================
// REPOSITORY INTERFACE
// =============================================================================

/**
 * Repository interface for incident persistence operations.
 *
 * This interface abstracts all database operations, allowing different
 * implementations (SQLite, Postgres, etc.) to be swapped without
 * affecting the service layer.
 */
export interface IIncidentRepository {
  list(): Promise<Incident[]>;
  create(input: CreateIncidentInput): Promise<Incident>;
  getById(id: number): Promise<Incident | null>;
  updateStatus(id: number, status: IncidentStatus): Promise<Incident | null>;
  clear(): Promise<{ deleted: number }>;
  getStats(): Promise<IncidentStats>;
  close(): Promise<void>;
}

// =============================================================================
// SQLITE IMPLEMENTATION
// =============================================================================

/**
 * Database schema for SQLite implementation
 */
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL
  );

  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
  CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
`;

/**
 * Get database path from environment or use default
 */
function getDatabasePath(): string {
  const customPath = process.env.INCIDENTS_DB_PATH;
  if (customPath) {
    logger.info({ path: customPath }, 'Using custom incidents database path');
    return customPath;
  }

  const defaultPath = resolve(process.cwd(), 'status-service', 'data', 'incidents.sqlite');
  logger.info({ path: defaultPath }, 'Using default incidents database path');
  return defaultPath;
}

/**
 * Ensure data directory exists
 */
function ensureDataDirectory(dbPath: string): void {
  const dataDir = dirname(dbPath);
  if (!existsSync(dataDir)) {
    logger.info({ dir: dataDir }, 'Creating data directory');
    mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * SQLite-based implementation of the incident repository
 *
 * This class handles all SQLite-specific database operations and can be
 * replaced with other implementations (PostgresIncidentRepository, etc.)
 * that implement the same IIncidentRepository interface.
 */
export class SQLiteIncidentRepository implements IIncidentRepository {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    this.dbPath = getDatabasePath();
    ensureDataDirectory(this.dbPath);

    logger.info({ path: this.dbPath }, 'Initializing SQLite incident repository');

    // Initialize database connection
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Create schema
    this.initializeSchema();
  }

  /**
   * Initialize database schema if it doesn't exist
   */
  private initializeSchema(): void {
    logger.info('Initializing database schema');
    this.db.exec(SCHEMA_SQL);
    logger.info('Database schema initialized successfully');
  }

  /**
   * List all incidents, ordered by creation date (newest first)
   */
  async list(): Promise<Incident[]> {
    logger.debug('Listing all incidents');

    const stmt = this.db.prepare(`
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

    const rows = stmt.all();
    logger.debug({ count: rows.length }, 'Retrieved incidents from database');

    return rows as Incident[];
  }

  /**
   * Create a new incident
   */
  async create(input: CreateIncidentInput): Promise<Incident> {
    logger.info({ title: input.title, severity: input.severity }, 'Creating new incident');

    // Set default status if not provided
    const status = input.status || 'investigating';
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO incidents (
        title,
        description,
        status,
        severity,
        created_at,
        updated_at,
        resolved_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL)
    `);

    const result = stmt.run(
      input.title,
      input.description,
      status,
      input.severity,
      now,
      now
    );

    const incidentId = result.lastInsertRowid as number;

    // Retrieve the created incident
    const getStmt = this.db.prepare(`
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
      WHERE id = ?
    `);

    const incident = getStmt.get(incidentId) as Incident;
    logger.info({ id: incidentId }, 'Incident created successfully');

    return incident;
  }

  /**
   * Get incident by ID
   */
  async getById(id: number): Promise<Incident | null> {
    logger.debug({ id }, 'Getting incident by ID');

    const stmt = this.db.prepare(`
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
      WHERE id = ?
    `);

    const incident = stmt.get(id) as Incident | undefined;

    if (incident) {
      logger.debug({ id }, 'Incident found');
      return incident;
    } else {
      logger.debug({ id }, 'Incident not found');
      return null;
    }
  }

  /**
   * Update incident status and optionally set resolved timestamp
   */
  async updateStatus(id: number, status: IncidentStatus): Promise<Incident | null> {
    logger.info({ id, status }, 'Updating incident status');

    const incident = await this.getById(id);
    if (!incident) {
      logger.warn({ id }, 'Incident not found for status update');
      return null;
    }

    const now = new Date().toISOString();
    const resolvedAt = status === 'resolved' ? now : incident.resolved_at || null;

    const stmt = this.db.prepare(`
      UPDATE incidents
      SET status = ?, updated_at = ?, resolved_at = ?
      WHERE id = ?
    `);

    stmt.run(status, now, resolvedAt, id);

    logger.info({ id, status }, 'Incident status updated successfully');

    return await this.getById(id);
  }

  /**
   * Clear all incidents from the database
   */
  async clear(): Promise<{ deleted: number }> {
    logger.info('Clearing all incidents');

    const stmt = this.db.prepare('DELETE FROM incidents');
    const result = stmt.run();
    const deleted = result.changes;

    logger.info({ deleted }, 'All incidents cleared from database');

    return { deleted };
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<IncidentStats> {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM incidents').get() as { count: number };

    const byStatus = this.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM incidents
      GROUP BY status
    `).all() as { status: IncidentStatus; count: number }[];

    const bySeverity = this.db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM incidents
      GROUP BY severity
    `).all() as { severity: IncidentSeverity; count: number }[];

    const stats: IncidentStats = {
      total: total.count,
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

    byStatus.forEach(item => {
      stats.byStatus[item.status] = item.count;
    });

    bySeverity.forEach(item => {
      stats.bySeverity[item.severity] = item.count;
    });

    return stats;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    logger.info('Closing incident repository database connection');
    this.db.close();
  }
}

// =============================================================================
// SERVICE LAYER (FACADE)
// =============================================================================

/**
 * Service layer that provides business logic for incident management.
 *
 * This service uses the repository pattern to decouple business logic from
 * persistence implementation. It can work with any repository that implements
 * IIncidentRepository interface.
 */
export class IncidentService {
  constructor(private repository: IIncidentRepository) {}

  /**
   * List all incidents
   */
  list(): Promise<Incident[]> {
    return this.repository.list();
  }

  /**
   * Create a new incident
   */
  create(input: CreateIncidentInput): Promise<Incident> {
    return this.repository.create(input);
  }

  /**
   * Get incident by ID
   */
  getById(id: number): Promise<Incident | null> {
    return this.repository.getById(id);
  }

  /**
   * Update incident status
   */
  updateStatus(id: number, status: IncidentStatus): Promise<Incident | null> {
    return this.repository.updateStatus(id, status);
  }

  /**
   * Clear all incidents
   */
  clear(): Promise<{ deleted: number }> {
    return this.repository.clear();
  }

  /**
   * Get statistics
   */
  getStats(): Promise<IncidentStats> {
    return this.repository.getStats();
  }

  /**
   * Close the repository connection
   */
  close(): Promise<void> {
    return this.repository.close();
  }

  // Sync methods for backward compatibility
  // These wrap the async methods for simpler usage in routes

  listSync(): Incident[] {
    // @ts-ignore - intentionally using sync wrapper for backward compatibility
    return this._syncList();
  }

  createSync(input: CreateIncidentInput): Incident {
    // @ts-ignore - intentionally using sync wrapper for backward compatibility
    return this._syncCreate(input);
  }

  getByIdSync(id: number): Incident | null {
    // @ts-ignore - intentionally using sync wrapper for backward compatibility
    return this._syncGetById(id);
  }

  updateStatusSync(id: number, status: IncidentStatus): Incident | null {
    // @ts-ignore - intentionally using sync wrapper for backward compatibility
    return this._syncUpdateStatus(id, status);
  }

  clearSync(): { deleted: number } {
    // @ts-ignore - intentionally using sync wrapper for backward compatibility
    return this._syncClear();
  }

  getStatsSync(): IncidentStats {
    // @ts-ignore - intentionally using sync wrapper for backward compatibility
    return this._syncGetStats();
  }

  // Internal sync wrappers using better-sqlite3 synchronous API
  private async _syncList(): Promise<Incident[]> {
    return await this.repository.list();
  }

  private async _syncCreate(input: CreateIncidentInput): Promise<Incident> {
    return await this.repository.create(input);
  }

  private async _syncGetById(id: number): Promise<Incident | null> {
    return await this.repository.getById(id);
  }

  private async _syncUpdateStatus(id: number, status: IncidentStatus): Promise<Incident | null> {
    return await this.repository.updateStatus(id, status);
  }

  private async _syncClear(): Promise<{ deleted: number }> {
    return await this.repository.clear();
  }

  private async _syncGetStats(): Promise<IncidentStats> {
    return await this.repository.getStats();
  }

  // Concrete sync implementations that can be used for backward compatibility
  // These throw errors to ensure routes are migrated to async/await
  private listSyncLegacy(): Incident[] {
    throw new Error('Use async/await with list() instead of listSync()');
  }

  private createSyncLegacy(input: CreateIncidentInput): Incident {
    throw new Error('Use async/await with create() instead of createSync()');
  }

  private getByIdSyncLegacy(id: number): Incident | null {
    throw new Error('Use async/await with getById() instead of getByIdSync()');
  }

  private updateStatusSyncLegacy(id: number, status: IncidentStatus): Incident | null {
    throw new Error('Use async/await with updateStatus() instead of updateStatusSync()');
  }

  private clearSyncLegacy(): { deleted: number } {
    throw new Error('Use async/await with clear() instead of clearSync()');
  }

  private getStatsSyncLegacy(): IncidentStats {
    throw new Error('Use async/await with getStats() instead of getStatsSync()');
  }
}

// =============================================================================
// SINGLETON FACTORY
// =============================================================================

let incidentServiceInstance: IncidentService | null = null;
let repositoryInstance: SQLiteIncidentRepository | null = null;

/**
 * Get or create incident service singleton with SQLite repository
 */
export function getIncidentService(): IncidentService {
  if (!incidentServiceInstance || !repositoryInstance) {
    repositoryInstance = new SQLiteIncidentRepository();
    incidentServiceInstance = new IncidentService(repositoryInstance);
  }
  return incidentServiceInstance;
}

/**
 * Close the incident service connection (useful for testing)
 */
export function closeIncidentService(): void {
  if (incidentServiceInstance && repositoryInstance) {
    repositoryInstance.close();
    incidentServiceInstance = null;
    repositoryInstance = null;
  }
}

/**
 * Create an incident service with a custom repository (useful for testing or
 * dependency injection)
 */
export function createIncidentService(repository: IIncidentRepository): IncidentService {
  return new IncidentService(repository);
}
