/**
 * Analytics Tracking Service
 *
 * Provides observability tracking for incident management operations.
 * Tracks incident creation, status transitions, and other key events
 * for audit and monitoring purposes.
 */

import pino from 'pino';

export type AnalyticsEventType =
  | 'incident.create'
  | 'incident.update'
  | 'incident.status_change'
  | 'incident.delete'
  | 'incident.view'
  | 'admin.login'
  | 'admin.logout'
  | 'public.status_view';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: Date;
  incidentId?: number;
  severity?: IncidentSeverity;
  fromStatus?: IncidentStatus;
  toStatus?: IncidentStatus;
  adminId?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface StatusTransition {
  incidentId: number;
  fromStatus: IncidentStatus | null;
  toStatus: IncidentStatus;
  timestamp: Date;
  adminId?: string;
}

export class AnalyticsService {
  private logger: pino.Logger;
  private transitions: Map<number, StatusTransition[]>;
  private eventLog: AnalyticsEvent[];

  constructor(logger?: pino.Logger) {
    this.logger = logger || pino({ name: 'analytics-service' });
    this.transitions = new Map();
    this.eventLog = [];

    // Periodic cleanup of old events (keep last 10000 events)
    setInterval(() => this.cleanup(), 24 * 60 * 60 * 1000); // Daily cleanup
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent): void {
    try {
      // Add timestamp if not provided
      if (!event.timestamp) {
        event.timestamp = new Date();
      }

      // Add to event log
      this.eventLog.push(event);

      // Handle special event types
      if (event.type === 'incident.status_change' && event.incidentId && event.toStatus) {
        this.recordStatusTransition(event.incidentId, event.fromStatus || null, event.toStatus, event.adminId);
      }

      // Log the event
      this.logger.info({
        eventType: event.type,
        incidentId: event.incidentId,
        severity: event.severity,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
      }, `Analytics Event: ${event.type}`);

    } catch (error) {
      // Don't throw - analytics should not break the main flow
      this.logger.warn({ error, event }, 'Failed to track analytics event');
    }
  }

  /**
   * Record a status transition for an incident
   */
  private recordStatusTransition(
    incidentId: number,
    fromStatus: IncidentStatus | null,
    toStatus: IncidentStatus,
    adminId?: string
  ): void {
    const transition: StatusTransition = {
      incidentId,
      fromStatus,
      toStatus,
      timestamp: new Date(),
      adminId,
    };

    if (!this.transitions.has(incidentId)) {
      this.transitions.set(incidentId, []);
    }

    this.transitions.get(incidentId)!.push(transition);
  }

  /**
   * Track incident creation
   */
  trackIncidentCreate(incidentId: number, severity: IncidentSeverity, adminId?: string, metadata?: any): void {
    this.track({
      type: 'incident.create',
      incidentId,
      severity,
      adminId,
      metadata,
    });
  }

  /**
   * Track incident update
   */
  trackIncidentUpdate(incidentId: number, adminId?: string, metadata?: any): void {
    this.track({
      type: 'incident.update',
      incidentId,
      adminId,
      metadata,
    });
  }

  /**
   * Track incident status change
   */
  trackIncidentStatusChange(
    incidentId: number,
    fromStatus: IncidentStatus | null,
    toStatus: IncidentStatus,
    adminId?: string
  ): void {
    this.track({
      type: 'incident.status_change',
      incidentId,
      fromStatus,
      toStatus,
      adminId,
    });
  }

  /**
   * Track incident deletion
   */
  trackIncidentDelete(incidentId: number, adminId?: string): void {
    this.track({
      type: 'incident.delete',
      incidentId,
      adminId,
    });
  }

  /**
   * Track incident view
   */
  trackIncidentView(incidentId: number): void {
    this.track({
      type: 'incident.view',
      incidentId,
    });
  }

  /**
   * Track admin login
   */
  trackAdminLogin(adminId: string): void {
    this.track({
      type: 'admin.login',
      adminId,
    });
  }

  /**
   * Track admin logout
   */
  trackAdminLogout(adminId: string): void {
    this.track({
      type: 'admin.logout',
      adminId,
    });
  }

  /**
   * Track public status page view
   */
  trackPublicStatusView(): void {
    this.track({
      type: 'public.status_view',
    });
  }

  /**
   * Get all status transitions for an incident
   */
  getIncidentTransitions(incidentId: number): StatusTransition[] {
    return this.transitions.get(incidentId) || [];
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.eventLog];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AnalyticsEventType): AnalyticsEvent[] {
    return this.eventLog.filter(event => event.type === type);
  }

  /**
   * Get events for an incident
   */
  getIncidentEvents(incidentId: number): AnalyticsEvent[] {
    return this.eventLog.filter(event => event.incidentId === incidentId);
  }

  /**
   * Get audit report for an incident
   */
  getIncidentAuditReport(incidentId: number): {
    incidentId: number;
    transitions: StatusTransition[];
    events: AnalyticsEvent[];
    totalDuration?: number;
  } {
    const transitions = this.getIncidentTransitions(incidentId);
    const events = this.getIncidentEvents(incidentId);

    // Calculate total duration if resolved
    const resolvedTransition = transitions.find(t => t.toStatus === 'resolved');
    const createdEvent = events.find(e => e.type === 'incident.create');

    let totalDuration: number | undefined;
    if (resolvedTransition && createdEvent) {
      totalDuration = resolvedTransition.timestamp.getTime() - createdEvent.timestamp.getTime();
    }

    return {
      incidentId,
      transitions,
      events,
      totalDuration,
    };
  }

  /**
   * Get observability statistics
   */
  getObservabilityStats(): {
    totalEvents: number;
    totalIncidents: number;
    totalTransitions: number;
    eventsByType: Record<string, number>;
    statusChangesLast24h: number;
    averageResolutionTime?: number;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count events by type
    const eventsByType: Record<string, number> = {};
    for (const event of this.eventLog) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    // Count status changes in last 24 hours
    const statusChangesLast24h = this.eventLog.filter(
      event => event.type === 'incident.status_change' && event.timestamp >= last24h
    ).length;

    // Calculate average resolution time
    const resolvedTransitions = Array.from(this.transitions.values())
      .flat()
      .filter(t => t.toStatus === 'resolved');

    let averageResolutionTime: number | undefined;
    if (resolvedTransitions.length > 0) {
      const totalDuration = resolvedTransitions.reduce((sum, t) => {
        // Find the created event for this incident
        const incidentEvents = this.getIncidentEvents(t.incidentId);
        const createdEvent = incidentEvents.find(e => e.type === 'incident.create');

        if (createdEvent) {
          return sum + (t.timestamp.getTime() - createdEvent.timestamp.getTime());
        }
        return sum;
      }, 0);

      averageResolutionTime = totalDuration / resolvedTransitions.length;
    }

    return {
      totalEvents: this.eventLog.length,
      totalIncidents: new Set(this.eventLog.filter(e => e.incidentId).map(e => e.incidentId)).size,
      totalTransitions: Array.from(this.transitions.values()).reduce((sum, t) => sum + t.length, 0),
      eventsByType,
      statusChangesLast24h,
      averageResolutionTime,
    };
  }

  /**
   * Export analytics data for external observability tools
   */
  exportObservabilityData(): {
    events: AnalyticsEvent[];
    transitions: Array<{ incidentId: number; transitions: StatusTransition[] }>;
    stats: ReturnType<AnalyticsService['getObservabilityStats']>;
  } {
    const transitionsExport = Array.from(this.transitions.entries()).map(([incidentId, trans]) => ({
      incidentId,
      transitions: trans,
    }));

    return {
      events: this.getEvents(),
      transitions: transitionsExport,
      stats: this.getObservabilityStats(),
    };
  }

  /**
   * Clean up old events to prevent memory issues
   */
  private cleanup(): void {
    const maxEvents = 10000;

    if (this.eventLog.length > maxEvents) {
      const eventsToRemove = this.eventLog.length - maxEvents;
      this.eventLog.splice(0, eventsToRemove);

      this.logger.info({ eventsRemoved: eventsToRemove }, 'Analytics event log cleaned up');
    }

    // Clean up transitions for deleted incidents (optional)
    // In a real implementation, you'd check against the incident database
  }
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
}

export function trackEvent(type: AnalyticsEventType, data: Omit<AnalyticsEvent, 'type' | 'timestamp'>): void {
  getAnalyticsService().track({ type, ...data, timestamp: new Date() });
}
