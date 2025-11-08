# Prometheus Gauge Implementation - Incident Status Counts

## Overview

This document describes the implementation of a Prometheus gauge for tracking incident status counts with proper label handling and zero-value management.

## Implementation Details

### 1. New Gauge: Incident Status Counts

**Metric Name**: `status_service_incident_status_counts`

**Type**: Gauge

**Purpose**: Track the number of incidents in each status category (investigating, identified, monitoring, resolved)

**Labels**:
- `status` - The incident status (investigating, identified, monitoring, resolved)

### 2. Key Functions

#### `updateIncidentStatusCountsGauge(statusCounts)`

Updates the gauge with counts for each incident status.

**Parameters**:
```typescript
{
  investigating: number;
  identified: number;
  monitoring: number;
  resolved: number;
}
```

**Example**:
```typescript
const statusCounts = {
  investigating: 2,
  identified: 1,
  monitoring: 3,
  resolved: 4,
};

updateIncidentStatusCountsGauge(statusCounts);
```

**Prometheus Output**:
```
# HELP status_service_incident_status_counts Number of incidents by status
# TYPE status_service_incident_status_counts gauge
status_service_incident_status_counts{status="investigating"} 2
status_service_incident_status_counts{status="identified"} 1
status_service_incident_status_counts{status="monitoring"} 3
status_service_incident_status_counts{status="resolved"} 4
```

#### `resetIncidentStatusCountsGauge()`

Resets all incident status counts to zero. This is crucial for ensuring that labels are properly zeroed when incidents are cleared, preventing stale data in Prometheus.

**Example**:
```typescript
// When clearing all incidents
await service.clear();
resetIncidentStatusCountsGauge();
```

**Prometheus Output**:
```
status_service_incident_status_counts{status="investigating"} 0
status_service_incident_status_counts{status="identified"} 0
status_service_incident_status_counts{status="monitoring"} 0
status_service_incident_status_counts{status="resolved"} 0
```

## Integration Points

### 1. Admin Routes

The gauge is updated in the admin routes when retrieving incident statistics:

**Location**: `src/routes/admin.ts:372`

```typescript
// Update incident status counts gauge with labels for each status
updateIncidentStatusCountsGauge(stats.byStatus);
```

This ensures that whenever incidents are listed or stats are retrieved, the Prometheus gauge is updated with the current counts.

### 2. Clear Incidents

When all incidents are cleared, the gauge is reset to ensure all labels are zeroed:

**Location**: `src/routes/admin.ts:921`

```typescript
// Reset incident status counts gauge to zero (ensures all labels are properly zeroed)
resetIncidentStatusCountsGauge();
```

This is critical because Prometheus gauges don't automatically remove label combinations when values reach zero. Without explicit zeroing, old label values would persist in the metrics output.

## Benefits

### 1. Granular Status Monitoring

Instead of just tracking active incidents, this gauge provides detailed breakdown by status:

- **Investigating**: Incidents being actively investigated
- **Identified**: Incidents where the root cause is identified
- **Monitoring**: Incidents being monitored after resolution
- **Resolved**: Fully resolved incidents

### 2. Prometheus Best Practices

The implementation follows Prometheus best practices:

- **Label Stability**: All possible status labels are always present
- **Zero Values**: Explicitly set to zero when appropriate
- **No Stale Data**: Reset function prevents old data from persisting

### 3. Monitoring and Alerting

This gauge enables more sophisticated monitoring:

```promql
# Total incidents by status
status_service_incident_status_counts

# Active incidents (non-resolved)
status_service_incident_status_counts{status!="resolved"}

# Incident resolution rate
rate(status_service_incident_status_counts{status="resolved"}[5m])

# Status transition trends
rate(status_service_incident_status_counts[5m])
```

## Example Usage

### Querying the Gauge

```bash
# Get current counts for all statuses
curl http://localhost:3000/metrics | grep status_service_incident_status_counts

# Get only active incidents
curl http://localhost:3000/metrics | grep status_service_incident_status_counts | grep -v resolved
```

### Prometheus Queries

```promql
# Total incidents by status
status_service_incident_status_counts

# Incidents by status as a percentage
(status_service_incident_status_counts / ignoring(status) group_left sum(status_service_incident_status_counts)) * 100

# Alert if too many critical incidents
ALERT HighCriticalIncidents
  IF status_service_incident_status_counts{status="investigating"} > 5
  FOR 5m
  LABELS { severity="warning" }
  ANNOTATIONS {
    summary = "High number of critical incidents",
    description = "There are {{ $value }} critical incidents under investigation",
  }
```

## Testing

### Unit Tests

The implementation includes comprehensive tests:

**Test File**: `tests/metrics.test.ts`

**Test Cases**:
1. `updateIncidentStatusCountsGauge` - Updates with labels
2. `updateIncidentStatusCountsGauge` - Updates each status correctly
3. `updateIncidentStatusCountsGauge` - Handles zero counts
4. `resetIncidentStatusCountsGauge` - Resets all counts to zero
5. `resetIncidentStatusCountsGauge` - Ensures labels are properly zeroed
6. Integration test - Complete admin workflow with status counts

**Run Tests**:
```bash
cd status-service
npm test -- metrics.test.ts
```

### Expected Test Output

```
✓ tests/metrics.test.ts (16 tests)

Test Files  1 passed (1)
Tests       16 passed (16)
```

## Configuration

### No Additional Configuration Required

The gauge is automatically:
- Registered with the Prometheus registry
- Updated when incidents are listed
- Reset when incidents are cleared
- Exposed via the `/metrics` endpoint

## Prometheus Exposition Format

### Sample Output

```
# HELP status_service_incident_status_counts Number of incidents by status
# TYPE status_service_incident_status_counts gauge
status_service_incident_status_counts{status="investigating"} 2
status_service_incident_status_counts{status="identified"} 1
status_service_incident_status_counts{status="monitoring"} 3
status_service_incident_status_counts{status="resolved"} 4
```

### Metric Help Text

```
HELP: Number of incidents by status
TYPE: gauge
```

## Comparison with Active Incidents Gauge

| Feature | Active Incidents Gauge | Status Counts Gauge |
|---------|------------------------|---------------------|
| Metric Name | `status_service_active_incidents` | `status_service_incident_status_counts` |
| Type | Simple Gauge | Gauge with labels |
| Labels | None | `status` |
| Values | Single number | Multiple (one per status) |
| Use Case | Quick active incident count | Detailed status breakdown |

## Best Practices Demonstrated

### 1. Label Management

Always update all possible label values:
```typescript
// ✅ Good - updates all labels
incidentStatusCountsGauge.labels('investigating').set(2);
incidentStatusCountsGauge.labels('identified').set(1);
incidentStatusCountsGauge.labels('monitoring').set(3);
incidentStatusCountsGauge.labels('resolved').set(4);
```

### 2. Zero Handling

Explicitly set to zero when clearing:
```typescript
// ✅ Good - explicit zeroing
resetIncidentStatusCountsGauge();
```

### 3. Consistent Updates

Update gauge whenever stats are retrieved:
```typescript
// ✅ Good - always up-to-date
const stats = await service.getStats();
updateIncidentStatusCountsGauge(stats.byStatus);
```

## Troubleshooting

### Issue: Stale Label Values

**Symptom**: Old status labels persisting after incidents are cleared

**Solution**: Call `resetIncidentStatusCountsGauge()` after clearing incidents

### Issue: Missing Labels

**Symptom**: Some status labels not appearing in metrics

**Solution**: Ensure all four statuses are always updated (even if zero)

### Issue: Inconsistent Values

**Symptom**: Gauge doesn't match actual incident counts

**Solution**: Verify `stats.byStatus` is being passed correctly to `updateIncidentStatusCountsGauge()`

## Performance Considerations

### Minimal Overhead

- Gauge updates are fast (< 1ms)
- No database queries (uses existing stats)
- Minimal memory footprint

### Scalability

- Works efficiently with thousands of incidents
- Constant-time label updates
- No accumulation of old data

## Future Enhancements

### Potential Improvements

1. **Time-Series Tracking**: Add timestamps to understand when counts change
2. **Status Duration Metrics**: Track how long incidents stay in each status
3. **Transition Rate**: Count status transitions per time period
4. **Severity Breakdown**: Combine status and severity for 2D analysis

### Example Enhancement

```typescript
// Future: Track status transition rates
const statusTransitionCounter = new client.Counter({
  name: 'status_service_status_transitions_total',
  help: 'Total number of status transitions',
  labelNames: ['from_status', 'to_status'],
});
```

## References

- [Prometheus Gauge Documentation](https://prometheus.io/docs/concepts/metric_types/#gauge)
- [Prometheus Exposition Format](https://prometheus.io/docs/instrumenting/exposition_formats/)
- [Prom-Client Documentation](https://github.com/siimon/prom-client)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)

## Summary

The incident status counts gauge provides:

✅ Detailed breakdown of incidents by status
✅ Proper label management with zero-value handling
✅ Integration with admin routes for automatic updates
✅ Comprehensive test coverage
✅ Prometheus best practices compliance
✅ Clear documentation and examples

This implementation ensures accurate, reliable metrics for monitoring incident status distributions and enables sophisticated alerting and analysis in Prometheus.
