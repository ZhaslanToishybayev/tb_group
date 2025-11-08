# TB Group - Docker Observability Stack

This guide explains how to set up and use the Prometheus and Grafana observability stack for monitoring TB Group applications.

## 📋 Overview

The observability stack includes:

- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Pre-configured Dashboards** - Ready-to-use monitoring dashboards

## 🚀 Quick Start

### Starting Observability Stack

To start the observability stack along with the main application:

```bash
# Start with observability profile
docker-compose --profile observability up -d

# Or explicitly specify services
docker-compose --profile observability up -d prometheus grafana
```

### Accessing Services

After starting the observability stack:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (username: `admin`, password: `admin`)

### Stopping Observability Stack

```bash
# Stop only observability services
docker-compose --profile observability down

# Stop all services
docker-compose down
```

## 📊 Configuration Files

### Prometheus Configuration

**Location**: `observability/prometheus.yml`

The configuration scrapes metrics from:
- TB Group API (port 4000)
- TB Group Web (port 3000)
- TB Group Admin (port 3000)
- TB Group Status Service (port 3000)
- Prometheus itself (self-monitoring)

**Key Settings**:
- Scrape interval: 15 seconds
- Evaluation interval: 15 seconds
- Metrics timeout: 10 seconds

### Grafana Provisioning

**Datasources**: `observability/grafana/provisioning/datasources/datasources.yml`
- Prometheus as default datasource
- Configured to connect to Prometheus container

**Dashboards**: `observability/grafana/provisioning/dashboards/dashboard.yml`
- Auto-loads dashboards from JSON files
- Organizes dashboards in folders

## 📈 Dashboards

### 1. TB Group - System Overview

**File**: `observability/grafana/dashboards/tb-group-overview.json`

**Panels**:
- System Status (up/down for all services)
- Active Incidents (from status service)
- Incident Status Distribution (pie chart)
- Request Rate (RPS) across services
- Response Time (P95 latency)
- Error Rate percentage
- Database Operation Latency
- Admin Operations Rate

**Usage**:
- Navigate to Grafana → Dashboards → TB Group → System Overview
- Time range: Last 1 hour (default)
- Auto-refresh: 30 seconds

### 2. Prometheus - Stats

**File**: `observability/grafana/dashboards/prometheus-stats.json`

**Panels**:
- Prometheus uptime
- Total samples ingested
- Targets up status
- Ingestion rate (samples/sec)
- Memory usage
- CPU usage percentage
- Series count
- Scrape duration

**Usage**:
- Navigate to Grafana → Dashboards → Prometheus → Stats
- Monitor Prometheus health and performance

## 🔍 Querying Metrics

### Prometheus Queries

Access Prometheus at http://localhost:9090

#### System Status
```promql
# Check if all services are up
up{job=~"tb-group-.*"}

# Check specific service
up{job="tb-group-api"}
```

#### Incident Metrics
```promql
# Active incidents count
status_service_active_incidents

# Incident status breakdown
status_service_incident_status_counts

# Specific status count
status_service_incident_status_counts{status="investigating"}
```

#### Request Metrics
```promql
# Request rate per service
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Response time (P95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Database Metrics
```promql
# Database operation latency
rate(status_service_admin_database_operation_latency_seconds_sum[5m]) / rate(status_service_admin_database_operation_latency_seconds_count[5m])
```

### Grafana Queries

Access Grafana at http://localhost:3001

Navigate to Dashboards and select:
- **TB Group** folder → System Overview
- **Prometheus** folder → Stats

## ⚙️ Advanced Configuration

### Adding Custom Metrics

1. **Expose metrics in your application**:
   ```javascript
   // Example: Express.js with prom-client
   import client from 'prom-client';

   const httpRequestsTotal = new client.Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status'],
   });
   ```

2. **Update Prometheus config**:
   Edit `observability/prometheus.yml`:
   ```yaml
   scrape_configs:
     - job_name: 'your-service'
       static_configs:
         - targets: ['your-service:port']
       scrape_interval: 15s
   ```

3. **Restart observability stack**:
   ```bash
   docker-compose --profile observability restart prometheus
   ```

### Creating Custom Dashboards

1. **Build in Grafana**:
   - Navigate to Dashboards → New Dashboard
   - Add panels with queries
   - Save to appropriate folder

2. **Export dashboard**:
   - Dashboard Settings → JSON Model
   - Copy JSON to `observability/grafana/dashboards/`

3. **Dashboard will auto-load** on next Grafana restart

### Alerting Setup

#### Prometheus Alertmanager (Optional)

1. **Install Alertmanager**:
   ```yaml
   # Add to docker-compose.yml
   alertmanager:
     image: prom/alertmanager:latest
     container_name: tbgroup-alertmanager
     profiles:
       - observability
     volumes:
       - ./observability/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
     ports:
       - '9093:9093'
     networks:
       - tbgroup-network
   ```

2. **Create alert rules**:
   ```yaml
   # observability/rules.yml
   groups:
     - name: tb-group-alerts
       rules:
         - alert: ServiceDown
           expr: up{job=~"tb-group-.*"} == 0
           for: 1m
           labels:
             severity: critical
           annotations:
             summary: "TB Group service is down"
   ```

3. **Update Prometheus config**:
   ```yaml
   alerting:
     alertmanagers:
       - static_configs:
           - targets:
               - alertmanager:9093
   ```

## 🔒 Security

### Production Considerations

1. **Change default Grafana credentials**:
   ```yaml
   # docker-compose.yml
   environment:
     - GF_SECURITY_ADMIN_PASSWORD=your-secure-password
   ```

2. **Enable HTTPS** (recommended for production):
   ```yaml
   # Use reverse proxy (nginx/traefik)
   # or enable TLS in Grafana/Prometheus
   ```

3. **Network isolation**:
   Services are on `tbgroup-network` which is isolated from host by default

4. **Firewall rules**:
   Only expose necessary ports:
   - Prometheus: 9090 (optional, can be internal)
   - Grafana: 3001 (or use reverse proxy)

### Data Persistence

**Volumes**:
- `grafana_data` - Grafana dashboard data and settings
- Prometheus data is in-memory (restart clears data)
  - Add volume mount for persistence:
    ```yaml
    volumes:
      - prometheus_data:/prometheus
    ```

## 🐛 Troubleshooting

### Common Issues

#### 1. Services Not Showing Metrics

**Symptoms**: Prometheus shows targets as down

**Solutions**:
```bash
# Check if services are running
docker-compose ps

# Check metrics endpoint
curl http://localhost:4000/metrics

# Check Prometheus targets
# Navigate to http://localhost:9090/targets
```

#### 2. Grafana Dashboards Not Loading

**Symptoms**: Empty or error dashboards

**Solutions**:
```bash
# Check Grafana logs
docker-compose logs grafana

# Restart Grafana
docker-compose --profile observability restart grafana

# Check datasource connection
# Grafana → Configuration → Data Sources → Prometheus
```

#### 3. High Memory Usage

**Symptoms**: Grafana or Prometheus using too much memory

**Solutions**:
```bash
# Limit container memory
# docker-compose.yml
services:
  prometheus:
    mem_limit: 1g
  grafana:
    mem_limit: 512m
```

#### 4. Missing Metrics

**Symptoms**: Some metrics not appearing

**Solutions**:
```bash
# Verify metrics are exposed
curl http://localhost:4000/metrics | grep metric_name

# Check Prometheus scrape config
# Navigate to http://localhost:9090/config
```

### Logs

```bash
# View all observability logs
docker-compose --profile observability logs

# View specific service logs
docker-compose logs prometheus
docker-compose logs grafana

# Follow logs in real-time
docker-compose --profile observability logs -f
```

## 📦 Services Architecture

```
┌─────────────────────────────────────────┐
│                 Internet                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            NGINX (Port 80/443)          │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐  ┌─────────────┐
│    Web      │  │   Admin     │
│  (Port 3000)│  │ (Port 3001) │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
                ▼
         ┌─────────────┐
         │     API     │
         │ (Port 4000) │
         └──────┬──────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐    ┌─────────────┐
│   Status    │    │ PostgreSQL  │
│  Service    │    │ (Port 5432) │
└─────────────┘    └─────────────┘

    OBSERVABILITY PROFILE
    (Started separately)

┌─────────────┐    ┌─────────────┐
│ Prometheus  │    │   Grafana   │
│ (Port 9090) │    │ (Port 3001) │
└─────────────┘    └─────────────┘
       │                 │
       └────────┬────────┘
                │
                ▼
         Scrapes all services
         for metrics
```

## 📚 Additional Resources

### Documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Docker Compose Profiles](https://docs.docker.com/compose/profiles/)

### Useful Links
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Prometheus Graph: http://localhost:9090/graph
- Prometheus Targets: http://localhost:9090/targets

### Sample Dashboards
- Import dashboards from [Grafana Labs](https://grafana.com/grafana/dashboards/)
- Search for "Prometheus" or "Node Exporter"

## 🎯 Best Practices

1. **Regular Dashboard Reviews**
   - Check dashboard usage and relevance
   - Update panels based on operational needs
   - Archive unused dashboards

2. **Metric Naming**
   - Use clear, descriptive metric names
   - Follow Prometheus naming conventions
   - Include units in metric names (e.g., `_seconds`, `_bytes`)

3. **Alert Thresholds**
   - Set realistic alert thresholds
   - Avoid alert fatigue
   - Test alert rules

4. **Data Retention**
   - Configure appropriate retention periods
   - Consider remote write for long-term storage
   - Monitor disk usage

5. **Performance**
   - Avoid over-scrapping (keep scrape intervals reasonable)
   - Use recording rules for expensive queries
   - Monitor Prometheus performance

## 🚦 Quick Reference

### Start Observability
```bash
docker-compose --profile observability up -d
```

### Access URLs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### View Logs
```bash
docker-compose logs -f prometheus grafana
```

### Stop Observability
```bash
docker-compose --profile observability down
```

### Check Targets
http://localhost:9090/targets

### Export Dashboard
Grafana → Dashboard Settings → JSON Model → Copy

## ✅ Checklist

After setup, verify:
- [ ] Prometheus is running and targets are up
- [ ] Grafana is accessible with admin/admin
- [ ] Dashboards are loaded
- [ ] Metrics are being collected
- [ ] Alerts are configured (if needed)
- [ ] Default credentials are changed (production)
- [ ] Documentation is shared with team

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review logs: `docker-compose logs`
3. Check Prometheus targets: http://localhost:9090/targets
4. Verify Grafana datasource: Configuration → Data Sources
5. Review application metrics: http://localhost:4000/metrics

---

**Last Updated**: November 1, 2025
**Version**: 1.0.0
