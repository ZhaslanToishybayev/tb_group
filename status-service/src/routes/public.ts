/**
 * Public Routes - Status Page View
 *
 * Provides public endpoints for viewing incident status on the public status page.
 * These routes load real data from the incident service and render it in views.
 */

import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import pino from 'pino';
import { getIncidentService } from '../services/incidents.js';
import { getAnalyticsService } from '../services/analytics.js';

const logger = pino({ name: 'public-routes' });
const router = Router();
const analytics = getAnalyticsService();

// Set up Pug template path
const __filename = fileURLToPath(import.meta.url)!;
const __dirname = path.dirname(__filename)!;
const viewsPath = path.join(__dirname, '../views');

/**
 * GET /
 * Public status page - shows current incidents and system status
 */
router.get('/', async (req, res) => {
  try {
    logger.info('Public: Loading status page');

    const service = getIncidentService();
    const incidents = service.list();
    const stats = service.getStats();

    // Determine overall system status based on active incidents
    const activeIncidents = incidents.filter(i => i.status !== 'resolved');
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'critical');

    let systemStatus = 'operational';
    if (criticalIncidents.length > 0) {
      systemStatus = 'major_outage';
    } else if (activeIncidents.length > 0) {
      systemStatus = 'partial_outage';
    }

    // Format incidents for display
    const formattedIncidents = incidents.map(incident => ({
      id: incident.id!,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      severity: incident.severity,
      created_at: incident.created_at,
      updated_at: incident.updated_at,
      resolved_at: incident.resolved_at,
      // Calculate duration if not resolved
      duration: incident.resolved_at
        ? calculateDuration(incident.created_at!, incident.resolved_at)
        : calculateDuration(incident.created_at!, new Date().toISOString()),
    }));

    logger.info({
      incidentCount: incidents.length,
      activeIncidents: activeIncidents.length,
      systemStatus
    }, 'Public status page data loaded');

    // Track analytics event for public status page view
    try {
      analytics.trackPublicStatusView();
      logger.debug('Analytics tracked for public status page view');
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      logger.warn({ error: analyticsError }, 'Analytics tracking failed for status page view');
    }

    // Track view for each incident
    try {
      for (const incident of incidents) {
        if (incident.id !== undefined) {
          analytics.trackIncidentView(incident.id);
        }
      }
    } catch (analyticsError) {
      logger.warn({ error: analyticsError }, 'Analytics tracking failed for incident views');
    }

    // Render the status page with real data using Pug template
    try {
      const templatePath = path.join(viewsPath, 'index.pug');
      const compiledTemplate = pug.compileFile(templatePath);
      const html = compiledTemplate({
        systemStatus,
        statusLabel: getStatusLabel(systemStatus),
        stats: {
          total: stats.total,
          active: activeIncidents.length,
          highPriority: criticalIncidents.length + activeIncidents.filter(i => i.severity === 'high').length,
        },
        incidents: formattedIncidents.map(i => ({
          ...i,
          title: escapeHtml(i.title),
          description: escapeHtml(i.description),
        })),
        formatDate,
        formatStatus,
      });
      res.status(200).send(html);
    } catch (renderErr) {
      logger.error({ err: renderErr }, 'Failed to render Pug template');
      res.status(500).send('<h1>Internal Server Error</h1><p>Failed to render status page</p>');
    }

  } catch (error) {
    logger.error({ error }, 'Failed to load public status page');

    res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Status - Error</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa; }
        .error { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        h1 { color: #dc3545; }
    </style>
</head>
<body>
    <div class="error">
        <h1>⚠️ Unable to Load Status</h1>
        <p>We're temporarily unable to retrieve system status information.</p>
        <p>Please try refreshing the page in a few moments.</p>
    </div>
</body>
</html>
    `);
  }
});

/**
 * GET /api/incidents
 * Public API endpoint for incident data (JSON)
 */
router.get('/api/incidents', async (req, res) => {
  try {
    logger.info('Public API: Loading incidents');

    const service = getIncidentService();
    const incidents = service.list();

    res.json({
      success: true,
      data: {
        incidents,
        stats: service.getStats(),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to load incidents for public API');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve incidents',
      },
    });
  }
});

/**
 * GET /api/status
 * Public API endpoint for current system status
 */
router.get('/api/status', async (req, res) => {
  try {
    logger.info('Public API: Loading system status');

    const service = getIncidentService();
    const incidents = service.list();
    const stats = service.getStats();

    // Calculate system status
    const activeIncidents = incidents.filter(i => i.status !== 'resolved');
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'critical');

    let systemStatus = 'operational';
    if (criticalIncidents.length > 0) {
      systemStatus = 'major_outage';
    } else if (activeIncidents.length > 0) {
      systemStatus = 'partial_outage';
    }

    res.json({
      success: true,
      data: {
        status: systemStatus,
        label: getStatusLabel(systemStatus),
        activeIncidents: activeIncidents.length,
        totalIncidents: stats.total,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to load system status for public API');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve system status',
      },
    });
  }
});

// Helper functions

function calculateDuration(start: string, end: string): string {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

function getStatusLabel(status: string): string {
  const labels = {
    operational: '✅ All Systems Operational',
    partial_outage: '⚠️ Partial Service Disruption',
    major_outage: '🔴 Major Service Outage',
  };
  return labels[status as keyof typeof labels] || 'Unknown Status';
}

function formatStatus(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export default router;
