# TB Group Backup and Disaster Recovery Guide

## Overview

This document outlines the backup and disaster recovery procedures for the TB Group website infrastructure. We implement a comprehensive strategy to ensure data protection and business continuity.

## Backup Strategy

### Components

1. **PostgreSQL Database**
   - Automated daily backups at 2:00 AM
   - Full database dumps with schema and data
   - Compressed and encrypted storage
   - 30-day retention policy

2. **Application Code**
   - Git repository as source of truth
   - Tagged releases in GitHub
   - Docker images in container registry

3. **Kubernetes Resources**
   - Infrastructure as Code (Terraform)
   - Application manifests (Helm charts)
   - All configs version controlled

4. **Monitoring Data**
   - Prometheus metrics (30-day retention)
   - Grafana dashboards (versioned)
   - Log files (30-day retention)

### Backup Schedule

| Component | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| Database | Daily at 2 AM | 30 days | S3 |
| Code | Continuous (Git) | Permanent | GitHub |
| Configs | On change | Permanent | GitHub |
| Docker Images | On build | Latest 10 versions | GHCR |
| Monitoring | Daily at 3 AM | 7 days | S3 |

## Database Backup

### Manual Backup

```bash
# Create backup
./scripts/backup-database.sh

# Backup will be created at:
# s3://tbgroup-backups/database/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Automated Backup

CronJob runs daily at 2:00 AM:

```bash
# Check cronjob status
kubectl get cronjobs -n tbgroup

# View cronjob logs
kubectl logs -n tbgroup -l app=tbgroup-backup --tail=100
```

### Backup Verification

```bash
# List recent backups
aws s3 ls s3://tbgroup-backups/database/ --region eu-central-1

# Check backup metadata
aws s3 cp s3://tbgroup-backups/database/metadata/<backup_file>.json . --region eu-central-1
cat <backup_file>.json
```

## Database Restore

### Prerequisites

- Access to Kubernetes cluster
- AWS CLI configured
- Backup file name

### Restore Process

```bash
# List available backups
aws s3 ls s3://tbgroup-backups/database/ --region eu-central-1

# Restore from backup
./scripts/restore-database.sh <backup_filename>

# Example:
./scripts/restore-database.sh db_backup_20241110_020000.sql.gz
```

### Point-in-Time Recovery

For point-in-time recovery, use PostgreSQL's WAL archiving:

```bash
# Enable WAL archiving in PostgreSQL
kubectl set env deployment/tbgroup-postgres POSTGRES_WAL_LEVEL=replica

# Restore to specific timestamp
kubectl exec -it <postgres-pod> -- pg_restore \
  --host=<backup_host> \
  --port=5432 \
  --username=postgres \
  --dbname=tbgroup \
  --verbose \
  --clean \
  --if-exists \
  --create \
  --no-owner \
  --role=<role_name> \
  /path/to/backup.sql
```

## Disaster Recovery Scenarios

### Scenario 1: Complete Infrastructure Loss

**Recovery Time Objective (RTO)**: 2 hours
**Recovery Point Objective (RPO)**: 24 hours

**Steps**:
1. Provision new infrastructure using Terraform
2. Deploy Kubernetes cluster
3. Restore database from latest backup
4. Deploy applications using Helm
5. Verify all services are running
6. Update DNS records

**Commands**:
```bash
# 1. Recreate infrastructure
./scripts/deploy-terraform.sh init production
./scripts/deploy-terraform.sh apply production

# 2. Update kubeconfig
aws eks update-kubeconfig --region eu-central-1 --name tbgroup-cluster

# 3. Restore database
./scripts/backup-database.sh
./scripts/restore-database.sh <latest_backup>

# 4. Deploy applications
./scripts/deploy-helm.sh production

# 5. Verify
kubectl get pods -n tbgroup
kubectl get ingress -n tbgroup
```

### Scenario 2: Database Corruption

**RTO**: 30 minutes
**RPO**: 15 minutes

**Steps**:
1. Stop application services
2. Restore database from backup
3. Verify data integrity
4. Restart services

**Commands**:
```bash
# 1. Scale down deployments
kubectl scale deployment/tbgroup-api --replicas=0 -n tbgroup
kubectl scale deployment/tbgroup-web --replicas=0 -n tbgroup

# 2. Restore database
./scripts/restore-database.sh <backup_filename>

# 3. Scale up deployments
kubectl scale deployment/tbgroup-api --replicas=3 -n tbgroup
kubectl scale deployment/tbgroup-web --replicas=3 -n tbgroup
```

### Scenario 3: Kubernetes Node Failure

**RTO**: 5 minutes
**RPO**: 0 (no data loss)

**Steps**:
1. Wait for HPA to reschedule pods
2. If not rescheduled, manually drain and delete node
3. Verify pod distribution

**Commands**:
```bash
# Check pod status
kubectl get pods -n tbgroup -o wide

# Drain failed node
kubectl drain <node-name> --delete-emptydir-data --ignore-daemonsets --force

# Delete node
kubectl delete node <node-name>

# Verify pods rescheduled
kubectl get pods -n tbgroup -o wide
```

### Scenario 4: Application Deployment Failure

**RTO**: 10 minutes
**RPO**: 0 (no data loss)

**Steps**:
1. Rollback to previous version
2. Investigate failure
3. Fix and redeploy

**Commands**:
```bash
# Rollback Helm release
helm rollback tbgroup 1 -n tbgroup

# Or rollback to specific revision
helm rollback tbgroup 2 -n tbgroup

# Check release history
helm history tbgroup -n tbgroup
```

## Backup Monitoring

### Backup Status Check

```bash
# Check if cronjob exists
kubectl get cronjob tbgroup-backup -n tbgroup

# Check last job run
kubectl get jobs -n tbgroup -l app=tbgroup-backup

# Check logs
kubectl logs -n tbgroup -l app=tbgroup-backup --tail=100
```

### S3 Lifecycle Policy

Configure S3 lifecycle to transition backups:

```json
{
  "Rules": [
    {
      "ID": "BackupTransition",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 7,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## Security

### Encryption

1. **At Rest**:
   - S3: Server-side encryption (SSE-S3)
   - Database: Encrypted volumes
   - Secrets: Kubernetes secrets with encryption

2. **In Transit**:
   - TLS 1.3 for all connections
   - SSH for secure shell access
   - VPN for admin access

### Access Control

1. **AWS IAM**:
   - Limited permissions for backup operations
   - IAM roles for service accounts
   - MFA for console access

2. **Kubernetes**:
   - RBAC for backup service account
   - Network policies
   - Pod security policies

### Backup Verification

Monthly restore tests verify backup integrity:

```bash
# Create test environment
kubectl create namespace tbgroup-test

# Restore to test environment
./scripts/restore-database.sh <backup_filename> -n tbgroup-test

# Verify data
# ... validation steps ...

# Clean up test environment
kubectl delete namespace tbgroup-test
```

## Cost Optimization

### Backup Storage Costs

- **S3 Standard**: $0.023/GB/month
- **S3 IA**: $0.0125/GB/month (after 30 days)
- **Glacier**: $0.004/GB/month (after 90 days)

Estimated monthly backup storage:
- Database: 10GB → $0.23
- Monitoring: 5GB → $0.12
- **Total**: ~$0.35/month

### Cost Reduction Tips

1. **Compress Backups**: 70% size reduction
2. **Lifecycle Policies**: Auto-archive old backups
3. **Deduplication**: Use incremental backups
4. **Retention**: Keep daily for 7 days, weekly for 1 month, monthly for 1 year

## Monitoring and Alerts

### Backup Success Alert

```yaml
# Prometheus rule
- alert: BackupFailed
  expr: |
    (
      time() - kube_job_status_last_successful_time{job_name="tbgroup-backup"}
    ) > 86400
  for: 1h
  labels:
    severity: critical
  annotations:
    summary: "Database backup has not run in 24 hours"
    description: "The last successful backup was {{ $value }} seconds ago"
```

### Backup Size Alert

```yaml
# Monitor backup sizes
- alert: BackupSizeAnomaly
  expr: |
    (
      s3_object_size_bytes{bucket="tbgroup-backups"}
      < 5000000000
    )
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Backup size is unusually small"
    description: "Backup size is less than 5GB"
```

## Testing

### Backup Test Schedule

- **Daily**: Automated backup verification
- **Weekly**: Restore to test environment
- **Monthly**: Full DR drill
- **Quarterly**: Complete infrastructure recovery test

### Test Checklist

- [ ] Backup created successfully
- [ ] Backup uploaded to S3
- [ ] Metadata file created
- [ ] Checksum verified
- [ ] Restore to test environment successful
- [ ] Data integrity verified
- [ ] All services operational
- [ ] Monitoring shows green status
- [ ] Alert notifications working

## Emergency Contacts

### Primary Contacts

- **DevOps Lead**: +7-XXX-XXX-XXXX
- **Database Admin**: +7-XXX-XXX-XXXX
- **Infrastructure**: admin@tbgroup.kz

### Escalation

1. **Level 1**: On-call engineer
2. **Level 2**: DevOps team lead
3. **Level 3**: CTO
4. **Level 4**: CEO

## Documentation

All backup and restore procedures are documented in:
- This document
- GitHub wiki
- Runbooks
- Operational SOPs

## Changelog

| Date | Changes | Author |
|------|---------|--------|
| 2024-11-10 | Initial version | TB Group Team |

## References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [Kubernetes Backup Strategies](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/)
- [Terraform State Management](https://www.terraform.io/docs/language/state/index.html)
