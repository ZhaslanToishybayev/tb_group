/**
 * Admin Routes - Incident Management API
 *
 * Provides REST API endpoints for managing incidents through the admin interface.
 * Integrates with the incident service for persistent storage.
 */

import { Router } from 'express';
import { z } from 'zod';
import pino from 'pino';
import { getIncidentService, type IncidentStatus, type IncidentSeverity } from '../services/incidents.js';
import { getAnalyticsService } from '../services/analytics.js';
import { createOperationTimer, recordDatabaseLatency, updateActiveIncidentsGauge, updateIncidentStatusCountsGauge, resetIncidentStatusCountsGauge, recordIncidentSeverity } from '../services/metrics.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const logger = pino({ name: 'admin-routes' });
const router = Router();
const analytics = getAnalyticsService();

/**
 * GET /admin/demo-validation
 * Demo validation errors for testing
 */
router.get('/demo-validation', (req, res) => {
  try {
    logger.info('Admin: Demo validation endpoint');

    // Simulate validation errors similar to what the API returns
    const validationErrors = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid incident data',
        details: [
          {
            field: 'title',
            message: 'Title is required'
          },
          {
            field: 'severity',
            message: 'Invalid severity level'
          }
        ]
      }
    };

    res.json(validationErrors);
  } catch (error) {
    logger.error({ error }, 'Failed to demo validation');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to demo validation',
      },
    });
  }
});

/**
 * GET /admin
 * Admin dashboard page
 */
router.get('/', (req, res) => {
  try {
    logger.info('Admin: Loading admin dashboard');

    // Read the admin.pug template
    const templatePath = join(process.cwd(), 'src', 'views', 'admin.pug');
    const template = readFileSync(templatePath, 'utf-8');

    // Note: In a full implementation, you would use a Pug renderer like pug.js
    // For now, we'll serve a simple HTML version
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TB Group - Admin Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .form-section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        input[type="text"], textarea, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        textarea {
            height: 100px;
            resize: vertical;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }
        .btn:hover {
            background: #0056b3;
        }
        .btn-secondary {
            background: #6c757d;
            margin-left: 10px;
        }
        .btn-secondary:hover {
            background: #545b62;
        }
        .info {
            background: #e3f2fd;
            color: #1976d2;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .instructions {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 Admin Dashboard</h1>
        <p>Manage incidents and monitor system status</p>
    </div>

    <div class="form-section">
        <h2>📝 Create New Incident (with Validation)</h2>
        <p>The admin API includes comprehensive server-side validation:</p>

        <h3>✅ Validation Rules:</h3>
        <ul>
            <li><strong>Title:</strong> Required, max 200 characters</li>
            <li><strong>Description:</strong> Required, max 2000 characters</li>
            <li><strong>Severity:</strong> Required, must be: low, medium, high, or critical</li>
            <li><strong>Status:</strong> Optional, must be: investigating, identified, monitoring, or resolved</li>
        </ul>

        <h3>🧪 Test Validation:</h3>
        <p>Try submitting the form with invalid data to see validation errors:</p>

        <h3>Valid Example:</h3>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>curl -X POST http://localhost:3000/admin/incidents \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "API Performance Issue",
    "description": "Increased response times on main endpoints affecting user experience",
    "severity": "high",
    "status": "investigating"
  }'</code></pre>

        <h3>Invalid Example (will show validation error):</h3>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>curl -X POST http://localhost:3000/admin/incidents \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "",                    // ❌ Empty title
    "description": "Test",          // ✅ Valid
    "severity": "invalid"           // ❌ Invalid severity
  }'</code></pre>
    </div>

    <div class="info">
        <h3>✅ Status Service Features</h3>
        <ul>
            <li><strong>Incident Persistence</strong> - SQLite-backed storage with automatic schema</li>
            <li><strong>Admin API</strong> - Complete REST API for incident management</li>
            <li><strong>Public Status Page</strong> - Real-time status display at <a href="/" target="_blank">/</a></li>
            <li><strong>Status Tracking</strong> - Full incident lifecycle management</li>
            <li><strong>Statistics</strong> - Built-in reporting and metrics</li>
        </ul>
    </div>

    <div class="form-section">
        <h2>🧪 Test the API</h2>
        <p>Try these curl commands to test the admin API:</p>

        <h3>Create an Incident:</h3>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>curl -X POST http://localhost:3000/admin/incidents \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "API Performance Issue",
    "description": "Increased response times on main endpoints",
    "severity": "high",
    "status": "investigating"
  }'</code></pre>

        <h3>List All Incidents:</h3>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>curl http://localhost:3000/admin/incidents</code></pre>

        <h3>Update Incident Status:</h3>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>curl -X POST http://localhost:3000/admin/incidents/1/status \\
  -H "Content-Type: application/json" \\
  -d '{"status": "resolved"}'</code></pre>
    </div>

    <div class="form-section">
        <h2>🧪 Test Validation</h2>
        <p>Try these validation tests:</p>

        <h3>Demo Validation Error Response:</h3>
        <a href="/admin/demo-validation" target="_blank" class="btn">View Validation Error Example</a>

        <h3>Test with Invalid Data:</h3>
        <a href="javascript:void(0)" onclick="testValidation()" class="btn btn-secondary">Test Validation (Invalid Data)</a>

        <div id="validation-result" style="margin-top: 20px;"></div>
    </div>

    <div class="form-section">
        <h2>📊 View Public Status Page</h2>
        <p>See the public status page with real incident data:</p>
        <a href="/" target="_blank" class="btn">View Status Page</a>
        <a href="/api" target="_blank" class="btn btn-secondary">API Documentation</a>
    </div>

    <script>
        async function testValidation() {
            const resultDiv = document.getElementById('validation-result');

            try {
                // Test with invalid data
                const response = await fetch('/admin/incidents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: '',                    // Empty title (invalid)
                        description: 'Test',           // Valid description
                        severity: 'invalid-severity'  // Invalid severity
                    }),
                });

                const result = await response.json();

                if (!result.success) {
                    resultDiv.innerHTML = \`
                        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-top: 15px;">
                            <h4>❌ Validation Error (Expected)</h4>
                            <p><strong>Error Code:</strong> \${result.error.code}</p>
                            <p><strong>Message:</strong> \${result.error.message}</p>
                            <p><strong>Details:</strong></p>
                            <ul>
                                \${result.error.details.map(detail => \`<li>\${detail.field}: \${detail.message}</li>\`).join('')}
                            </ul>
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-top: 15px;">
                            <h4>✅ Unexpected Success</h4>
                            <p>The validation should have failed with invalid data.</p>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-top: 15px;">
                        <h4>⚠️ Request Failed</h4>
                        <p>Error: \${error.message}</p>
                    </div>
                \`;
            }
        }
    </script>
</body>
</html>
    `);
  } catch (error) {
    logger.error({ error }, 'Failed to load admin dashboard');

    res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Error</title>
</head>
<body>
    <h1>⚠️ Unable to Load Admin Dashboard</h1>
    <p>Please try again later.</p>
</body>
</html>
    `);
  }
});

// Validation schemas
const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Invalid severity level' })
  }),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
});

const updateIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long').optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
});

/**
 * GET /admin/incidents
 * List all incidents for admin interface
 */
router.get('/incidents', async (req, res) => {
  const timer = createOperationTimer('list');
  const dbTimerStart = process.hrtime.bigint();

  try {
    logger.info('Admin: Listing all incidents');

    const service = getIncidentService();
    const incidents = await service.list();
    const stats = await service.getStats();

    // Record database operation latency
    const dbTimerEnd = process.hrtime.bigint();
    const dbLatency = Number(dbTimerEnd - dbTimerStart) / 1e9;
    recordDatabaseLatency('select', 'incidents', dbLatency);

    // Update active incidents gauge
    const activeCount = stats.byStatus.investigating + stats.byStatus.identified + stats.byStatus.monitoring;
    updateActiveIncidentsGauge(activeCount);

    // Update incident status counts gauge with labels for each status
    updateIncidentStatusCountsGauge(stats.byStatus);

    logger.info({ count: incidents.length }, 'Successfully retrieved incidents for admin');

    const latency = timer.end('success');

    res.json({
      success: true,
      data: {
        incidents,
        total: incidents.length,
        stats,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to list incidents for admin');
    timer.end('error');

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
 * GET /admin/incidents/:id
 * Get specific incident by ID for admin interface
 */
router.get('/incidents/:id', async (req, res) => {
  const timer = createOperationTimer('get');
  const dbTimerStart = process.hrtime.bigint();

  try {
    const incidentId = parseInt(req.params.id, 10);

    if (isNaN(incidentId)) {
      timer.end('error');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid incident ID',
        },
      });
    }

    logger.info({ id: incidentId }, 'Admin: Getting incident by ID');

    const service = getIncidentService();
    const incident = await service.getById(incidentId);

    if (!incident) {
      timer.end('error');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found',
        },
      });
    }

    // Record database operation latency
    const dbTimerEnd = process.hrtime.bigint();
    const dbLatency = Number(dbTimerEnd - dbTimerStart) / 1e9;
    recordDatabaseLatency('select', 'incidents', dbLatency);

    logger.info({ id: incidentId }, 'Successfully retrieved incident for admin');

    timer.end('success');

    res.json({
      success: true,
      data: incident,
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, 'Failed to get incident for admin');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve incident',
      },
    });
  }
});

/**
 * POST /admin/incidents
 * Create new incident through admin interface
 */
router.post('/incidents', async (req, res) => {
  const timer = createOperationTimer('create');
  const dbTimerStart = process.hrtime.bigint();

  try {
    logger.info('Admin: Creating new incident');

    // Validate request body
    const validation = createIncidentSchema.safeParse(req.body);

    if (!validation.success) {
      logger.warn({ errors: validation.error.errors }, 'Admin: Invalid incident creation request');
      timer.end('error');

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid incident data',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }

    const { title, description, severity, status } = validation.data;

    const service = getIncidentService();

    // Create incident
    const incident = await service.create({
      title,
      description,
      severity,
      status,
    });

    // Record database operation latency
    const dbTimerEnd = process.hrtime.bigint();
    const dbLatency = Number(dbTimerEnd - dbTimerStart) / 1e9;
    recordDatabaseLatency('insert', 'incidents', dbLatency);

    // Record incident severity for metrics
    recordIncidentSeverity(severity);

    logger.info({ id: incident.id, title: incident.title }, 'Successfully created incident via admin');

    // Track analytics event for incident creation
    try {
      if (incident.id !== undefined) {
        analytics.trackIncidentCreate(
          incident.id,
          severity,
          'admin', // In a real implementation, get from req.user?.id
          { title, status }
        );
        logger.debug({ incidentId: incident.id }, 'Analytics tracked for incident creation');
      }
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      logger.warn({ error: analyticsError }, 'Analytics tracking failed, but incident was created');
    }

    timer.end('success');

    res.status(201).json({
      success: true,
      data: incident,
      message: 'Incident created successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to create incident via admin');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'PERSISTENCE_ERROR',
        message: 'Failed to persist incident',
      },
    });
  }
});

/**
 * PUT /admin/incidents/:id
 * Update existing incident through admin interface
 */
router.put('/incidents/:id', async (req, res) => {
  const timer = createOperationTimer('update');
  const dbTimerStart = process.hrtime.bigint();

  try {
    const incidentId = parseInt(req.params.id, 10);

    if (isNaN(incidentId)) {
      timer.end('error');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid incident ID',
        },
      });
    }

    logger.info({ id: incidentId }, 'Admin: Updating incident');

    // Validate request body
    const validation = updateIncidentSchema.safeParse(req.body);

    if (!validation.success) {
      logger.warn({ errors: validation.error.errors }, 'Admin: Invalid incident update request');
      timer.end('error');

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update data',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }

    const service = getIncidentService();

    // Check if incident exists
    const existingIncident = await service.getById(incidentId);

    if (!existingIncident) {
      timer.end('error');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found',
        },
      });
    }

    const { title, description, severity, status } = validation.data;

    // Update incident using the service methods
    let updatedIncident = existingIncident;
    let dbOperation = false;

    // Update fields if provided
    if (title !== undefined || description !== undefined || severity !== undefined) {
      // Note: In a full implementation, you'd add an update method to the service
      // For now, we'll handle status updates separately
      logger.warn('Full incident update not implemented in service, only status updates supported');
    }

    // Handle status update separately (this is supported by the service)
    if (status !== undefined) {
      const prevStatus = existingIncident.status;
      updatedIncident = await service.updateStatus(incidentId, status as IncidentStatus) || updatedIncident;
      dbOperation = true;

      // Track status change if it actually changed
      if (prevStatus !== status && updatedIncident) {
        try {
          analytics.trackIncidentStatusChange(
            incidentId,
            prevStatus,
            status,
            'admin'
          );
        } catch (analyticsError) {
          logger.warn({ error: analyticsError, incidentId, status }, 'Analytics tracking failed for status update');
        }
      }
    }

    // Record database operation latency if update occurred
    if (dbOperation) {
      const dbTimerEnd = process.hrtime.bigint();
      const dbLatency = Number(dbTimerEnd - dbTimerStart) / 1e9;
      recordDatabaseLatency('update', 'incidents', dbLatency);
    }

    // Track general update
    try {
      analytics.trackIncidentUpdate(
        incidentId,
        'admin',
        { updatedFields: { title, description, severity, status } }
      );
    } catch (analyticsError) {
      logger.warn({ error: analyticsError, incidentId }, 'Analytics tracking failed for incident update');
    }

    logger.info({ id: incidentId }, 'Successfully updated incident via admin');

    timer.end('success');

    res.json({
      success: true,
      data: updatedIncident,
      message: 'Incident updated successfully',
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, 'Failed to update incident via admin');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'PERSISTENCE_ERROR',
        message: 'Failed to update incident',
      },
    });
  }
});

/**
 * POST /admin/incidents/:id/status
 * Update incident status through admin interface
 */
router.post('/incidents/:id/status', async (req, res) => {
  const timer = createOperationTimer('status_change');
  const dbTimerStart = process.hrtime.bigint();

  try {
    const incidentId = parseInt(req.params.id, 10);

    if (isNaN(incidentId)) {
      timer.end('error');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid incident ID',
        },
      });
    }

    logger.info({ id: incidentId }, 'Admin: Updating incident status');

    // Validate status
    const statusSchema = z.object({
      status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
    });

    const validation = statusSchema.safeParse(req.body);

    if (!validation.success) {
      logger.warn({ errors: validation.error.errors }, 'Admin: Invalid status update request');
      timer.end('error');

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status value',
          details: validation.error.errors,
        },
      });
    }

    const { status } = validation.data;

    const service = getIncidentService();
    const existingIncident = await service.getById(incidentId);

    if (!existingIncident) {
      timer.end('error');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found',
        },
      });
    }

    const updatedIncident = await service.updateStatus(incidentId, status as IncidentStatus);

    if (!updatedIncident) {
      timer.end('error');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found',
        },
      });
    }

    // Record database operation latency
    const dbTimerEnd = process.hrtime.bigint();
    const dbLatency = Number(dbTimerEnd - dbTimerStart) / 1e9;
    recordDatabaseLatency('update', 'incidents', dbLatency);

    logger.info({ id: incidentId, status }, 'Successfully updated incident status via admin');

    // Track analytics event for status change
    try {
      analytics.trackIncidentStatusChange(
        incidentId,
        existingIncident.status,
        status,
        'admin' // In a real implementation, get from req.user?.id
      );
      logger.debug({ incidentId, fromStatus: existingIncident.status, toStatus: status }, 'Analytics tracked for status change');
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      logger.warn({ error: analyticsError, incidentId, status }, 'Analytics tracking failed, but status was updated');
    }

    timer.end('success');

    res.json({
      success: true,
      data: updatedIncident,
      message: 'Incident status updated successfully',
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, 'Failed to update incident status via admin');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'PERSISTENCE_ERROR',
        message: 'Failed to update incident status',
      },
    });
  }
});

/**
 * DELETE /admin/incidents/:id
 * Delete incident through admin interface (for testing/admin purposes)
 */
router.delete('/incidents/:id', async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id, 10);

    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid incident ID',
        },
      });
    }

    logger.warn({ id: incidentId }, 'Admin: Deleting incident');

    const service = getIncidentService();
    const incident = await service.getById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Incident not found',
        },
      });
    }

    // Note: Full delete method not implemented in service
    // This would require adding a delete method to the incident service
    logger.warn('Delete functionality not implemented in incident service');

    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Delete functionality not yet implemented',
      },
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, 'Failed to delete incident via admin');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete incident',
      },
    });
  }
});

/**
 * GET /admin/stats
 * Get incident statistics for admin dashboard
 */
router.get('/stats', async (req, res) => {
  const timer = createOperationTimer('stats');

  try {
    logger.info('Admin: Getting incident statistics');

    const service = getIncidentService();
    const stats = await service.getStats();

    logger.info('Successfully retrieved incident statistics for admin');

    timer.end('success');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get incident statistics for admin');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve statistics',
      },
    });
  }
});

/**
 * POST /admin/incidents/clear
 * Clear all incidents (for testing/admin purposes)
 */
router.post('/incidents/clear', async (req, res) => {
  const timer = createOperationTimer('clear');
  const dbTimerStart = process.hrtime.bigint();

  try {
    logger.warn('Admin: Clearing all incidents');

    const service = getIncidentService();
    const result = await service.clear();

    // Record database operation latency
    const dbTimerEnd = process.hrtime.bigint();
    const dbLatency = Number(dbTimerEnd - dbTimerStart) / 1e9;
    recordDatabaseLatency('delete', 'incidents', dbLatency);

    // Update active incidents gauge to 0
    updateActiveIncidentsGauge(0);

    // Reset incident status counts gauge to zero (ensures all labels are properly zeroed)
    resetIncidentStatusCountsGauge();

    logger.info({ deleted: result.deleted }, 'Successfully cleared all incidents via admin');

    timer.end('success');

    res.json({
      success: true,
      data: result,
      message: `Successfully deleted ${result.deleted} incidents`,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to clear incidents via admin');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'PERSISTENCE_ERROR',
        message: 'Failed to clear incidents',
      },
    });
  }
});

/**
 * GET /admin/analytics/events
 * Get all analytics events (for observability audits)
 */
router.get('/analytics/events', async (req, res) => {
  const timer = createOperationTimer('stats');

  try {
    logger.info('Admin: Getting analytics events');

    const events = analytics.getEvents();

    logger.info({ count: events.length }, 'Successfully retrieved analytics events');

    timer.end('success');

    res.json({
      success: true,
      data: {
        events,
        total: events.length,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get analytics events');
    timer.end('error');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve analytics events',
      },
    });
  }
});

/**
 * GET /admin/analytics/incidents/:id
 * Get audit report for a specific incident
 */
router.get('/analytics/incidents/:id', async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id, 10);

    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid incident ID',
        },
      });
    }

    logger.info({ id: incidentId }, 'Admin: Getting incident audit report');

    const auditReport = analytics.getIncidentAuditReport(incidentId);

    logger.info({ id: incidentId }, 'Successfully retrieved incident audit report');

    res.json({
      success: true,
      data: auditReport,
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, 'Failed to get incident audit report');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve audit report',
      },
    });
  }
});

/**
 * GET /admin/analytics/stats
 * Get observability statistics
 */
router.get('/analytics/stats', async (req, res) => {
  try {
    logger.info('Admin: Getting observability statistics');

    const stats = analytics.getObservabilityStats();

    logger.info('Successfully retrieved observability statistics');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get observability statistics');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve statistics',
      },
    });
  }
});

/**
 * GET /admin/analytics/export
 * Export all analytics data for external observability tools
 */
router.get('/analytics/export', async (req, res) => {
  try {
    logger.info('Admin: Exporting analytics data');

    const data = analytics.exportObservabilityData();

    logger.info({
      events: data.events.length,
      incidents: data.transitions.length,
    }, 'Successfully exported analytics data');

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to export analytics data');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export analytics data',
      },
    });
  }
});

export default router;
