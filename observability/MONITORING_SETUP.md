# TB Group Monitoring Stack Setup

## Overview

The TB Group monitoring stack provides comprehensive observability for the entire infrastructure and applications using:

- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Alertmanager** - Alert routing and notifications
- **Jaeger** - Distributed tracing
- **Loki** - Log aggregation
- **Node Exporter** - System metrics

## Quick Start

### Deploy Monitoring Stack

```bash
./scripts/deploy-monitoring.sh
```

This script will:
1. Deploy kube-prometheus-stack (Prometheus + Grafana + Alertmanager)
2. Configure Prometheus scrape configs
3. Set up Alertmanager routing
4. Deploy Jaeger for tracing
5. Deploy Loki for logs

### Access Dashboards

```bash
# Grafana
kubectl port-forward -n monitoring svc/tbgroup-monitoring-grafana 3000:80
# Access at: http://localhost:3000 (admin/admin)

# Prometheus
kubectl port-forward -n monitoring svc/tbgroup-monitoring-prometheus 9090:9090
# Access at: http://localhost:9090

# Alertmanager
kubectl port-forward -n monitoring svc/tbgroup-monitoring-alertmanager 9093:9093
# Access at: http://localhost:9093

# Jaeger
kubectl port-forward -n monitoring svc/jaeger-query 16686:16686
# Access at: http://localhost:16686
```

## Dashboards

### 1. TB Group Overview Dashboard

**Path**: `/var/lib/grafana/dashboards/tbgroup-overview.json`

**Panels**:
- Request Rate (RPS)
- Error Rate (%)
- Response Time (P95, P99)
- Active Users
- CPU Usage by Service
- Memory Usage by Service
- Pod Status Summary
- Database Connections

**Metrics Sources**:
- Prometheus (metrics)
- Loki (logs)

### 2. Application Performance Dashboard

**Path**: `/var/lib/grafana/dashboards/app-performance.json`

**Panels**:
- Request Rate (by endpoint)
- Response Time Distribution
- Error Rate (by status code)
- Database Query Performance
- Cache Hit Rate
- External API Calls

### 3. Infrastructure Dashboard

**Path**: `/var/lib/grafana/dashboards/infrastructure.json`

**Panels**:
- Node CPU Usage
- Node Memory Usage
- Pod CPU Usage
- Pod Memory Usage
- Network I/O
- Disk I/O
- Persistent Volume Usage

### 4. Kubernetes Dashboard

**Path**: `/var/lib/grafana/dashboards/kubernetes.json`

**Panels**:
- Cluster Health
- Node Status
- Pod Status
- Resource Requests vs Limits
- Horizontal Pod Autoscaler
- Service Endpoints

## Alert Rules

### Critical Alerts

1. **Service Down**
   - Trigger: Service unavailable for 1 minute
   - Notification: Email + Slack

2. **High Error Rate**
   - Trigger: >5% errors for 2 minutes
   - Notification: Email + Slack

3. **Pod Crash Looping**
   - Trigger: >3 restarts in 10 minutes
   - Notification: Email + Slack

4. **Database Down**
   - Trigger: Database unavailable for 1 minute
   - Notification: Email + PagerDuty

### Warning Alerts

1. **High Latency**
   - Trigger: P95 latency > 500ms for 3 minutes
   - Notification: Email

2. **High Memory Usage**
   - Trigger: >85% memory for 2 minutes
   - Notification: Email

3. **High CPU Usage**
   - Trigger: >80% CPU for 2 minutes
   - Notification: Email

4. **High Disk Usage**
   - Trigger: <10% disk space for 5 minutes
   - Notification: Email

5. **Pod Not Ready**
   - Trigger: Pod not ready for 5 minutes
   - Notification: Email

## Alertmanager Configuration

### Receivers

1. **Critical Alerts**
   - Email: admin@tbgroup.kz, devops@tbgroup.kz
   - Slack: #alerts channel

2. **Warning Alerts**
   - Email: admin@tbgroup.kz

3. **Webhook**
   - URL: http://webhook:8080/alerts

### Routing

- Severity: critical → critical-alerts receiver
- Severity: warning → warning-alerts receiver
- All alerts → web.hook receiver

## Metrics Collection

### Prometheus Scrape Config

The following services are monitored:

1. **Kubernetes Components**
   - kube-apiserver
   - kube-controller-manager
   - kube-scheduler
   - etcd

2. **Node Exporter**
   - CPU, memory, disk, network metrics

3. **Application Services**
   - tbgroup-api
   - tbgroup-web
   - tbgroup-admin

4. **Infrastructure**
   - Prometheus itself
   - Grafana
   - Alertmanager

### Custom Metrics

For application-specific metrics, expose `/metrics` endpoint:

```javascript
// Example: Express.js
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route.path, status_code: res.statusCode });
  });
  next();
});
```

## Log Aggregation

### Loki Configuration

**Retention**: 30 days
**Storage**: PVC (20Gi)

### Log Queries

```logql
# Search for errors in API service
{job="tbgroup-api"} |= "error"

# Search for slow queries
{job="postgres"} |= "slow"

# Recent errors
{job=~"tbgroup-.*"} |= "error" | logfmt | rate

# Memory warnings
{job=~"tbgroup-.*"} |=
"warning" |~ "memory"
```

## Tracing

### Jaeger Configuration

**Storage**: Elasticsearch
**Retention**: 7 days

### Trace Collection

Instrument your application with OpenTelemetry:

```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://jaeger-collector:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

## Grafana Plugins

Installed plugins:
- grafana-clock-panel
- grafana-simple-json-datasource

## SLO and SLI

### Service Level Objectives

- **Availability**: 99.9% (43 minutes downtime/month)
- **Latency**: P95 < 500ms
- **Error Rate**: < 1%

### Service Level Indicators

- Uptime: `up == 1`
- Latency: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- Error Rate: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`

## Health Checks

### Kubernetes Health

```bash
# Check cluster health
kubectl get nodes
kubectl get pods -A

# Check system pods
kubectl get pods -n kube-system
kubectl get pods -n monitoring
```

### Application Health

```bash
# Check application pods
kubectl get pods -n tbgroup

# Check service endpoints
kubectl get endpoints -n tbgroup
```

### Database Health

```bash
# Check database status
kubectl exec -it <postgres-pod> -n monitoring -- psql -U postgres -c "SELECT 1;"
```

## Troubleshooting

### Prometheus Not Scraping Targets

1. Check service discovery:
   ```bash
   kubectl get endpoints -n tbgroup
   ```

2. Check Prometheus targets:
   - Navigate to Prometheus UI → Status → Targets

3. Check RBAC permissions:
   ```bash
   kubectl auth can-i get pods -n tbgroup --as=system:serviceaccount:monitoring:prometheus
   ```

### No Grafana Dashboards

1. Check dashboard provider:
   ```bash
   kubectl get configmaps -n monitoring | grep dashboards
   ```

2. Check Grafana logs:
   ```bash
   kubectl logs -n monitoring deployment/tbgroup-monitoring-grafana
   ```

### Alerts Not Firing

1. Check alert rules:
   ```bash
   kubectl get prometheusrules -n monitoring
   ```

2. Check Alertmanager status:
   - Navigate to Alertmanager UI → Status

3. Check alert configuration:
   ```bash
   kubectl get configmaps -n monitoring | grep alertmanager
   ```

## Cost Optimization

### Monitoring Costs (Monthly)

- Prometheus PVC (50Gi): ~$5
- Grafana PVC (10Gi): ~$1
- Loki PVC (20Gi): ~$2
- Jaeger Elasticsearch: ~$10
- **Total**: ~$18/month

### Cost Reduction Tips

1. **Reduce Retention**: Lower retention from 30d to 7d
2. **Lower Scrape Interval**: Increase from 15s to 30s
3. **Delete Unused Dashboards**: Remove default dashboards
4. **Use External Storage**: S3 for Prometheus instead of PVC

## Security

### RBAC

All monitoring components have minimal required permissions:

- `prometheus-server`: read access to all namespaces
- `grafana`: read-only access
- `alertmanager`: read access to configmaps

### Secrets

- Grafana admin password: stored in Kubernetes secret
- Alertmanager SMTP credentials: stored in Kubernetes secret
- Database credentials: stored in AWS Secrets Manager

## Maintenance

### Updating Dashboards

1. Make changes to dashboard JSON
2. Apply ConfigMap:
   ```bash
   kubectl create configmap tbgroup-dashboards \
     --from-file=tbgroup-overview.json \
     -n monitoring --dry-run -o yaml | kubectl apply -f -
   ```
3. Restart Grafana:
   ```bash
   kubectl rollout restart deployment/tbgroup-monitoring-grafana -n monitoring
   ```

### Updating Alert Rules

1. Make changes to `alert_rules.yml`
2. Apply ConfigMap:
   ```bash
   kubectl create configmap tbgroup-prometheus-config \
     --from-file=alert_rules.yml=observability/prometheus/alert_rules.yml \
     -n monitoring --dry-run -o yaml | kubectl apply -f -
   ```
3. Reload Prometheus:
   ```bash
   kubectl delete pods -n monitoring -l app=prometheus
   ```

## Support

For issues with the monitoring stack:

1. Check component logs
2. Review Prometheus/Alertmanager status pages
3. Check GitHub issues: https://github.com/ZhaslanToishybayev/tb_group/issues
4. Contact: admin@tbgroup.kz
