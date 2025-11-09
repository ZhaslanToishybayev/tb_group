# TB Group - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the TB Group website to production. The deployment process is fully automated using Terraform, Helm, and GitHub Actions.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Infrastructure Deployment](#infrastructure-deployment)
4. [Application Deployment](#application-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [DNS and SSL Configuration](#dns-and-ssl-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Prerequisites

### Required Tools

- [Terraform](https://www.terraform.io/downloads.html) (>= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (>= 1.28)
- [Helm](https://helm.sh/docs/intro/install/) (>= 3.13)
- [AWS CLI](https://aws.amazon.com/cli/) (>= 2.0)
- [Git](https://git-scm.com/)

### Required Accounts

1. **AWS Account** with:
   - EC2 access
   - EKS access
   - RDS access
   - S3 access
   - Route 53 access
   - Certificate Manager access

2. **GitHub Account** with:
   - Repository access
   - GitHub Container Registry access

3. **Domain Registrar** with:
   - DNS management access

### AWS Permissions

Required IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:*",
        "ec2:*",
        "rds:*",
        "s3:*",
        "iam:*",
        "logs:*",
        "cloudwatch:*",
        "route53:*",
        "acm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## Pre-Deployment Checklist

### 1. Security Review

- [ ] All secrets are stored in AWS Secrets Manager
- [ ] Database credentials are rotated
- [ ] SSH keys are generated and stored securely
- [ ] SSL certificates are obtained
- [ ] IAM roles follow least privilege principle
- [ ] Security groups are configured

### 2. Cost Estimation

```bash
# Estimate monthly costs
./scripts/estimate-costs.sh production
```

Expected monthly costs:
- EKS Cluster: ~$100
- EC2 Instances (3x t3.large): ~$150
- RDS (db.t3.medium): ~$50
- ElastiCache: ~$15
- Load Balancer: ~$25
- Data Transfer: ~$20
- **Total**: ~$360/month

### 3. Resource Quotas

Ensure AWS account has sufficient quotas:
- Running On-Demand Instances: 20+ vCPUs
- VPCs: 5+
- EKS Clusters: 1+
- RDS Instances: 1+
- Application Load Balancers: 10+

### 4. DNS Records

Prepare DNS records:

| Type | Name | Value |
|------|------|-------|
| A | tbgroup.kz | (CloudFront/Load Balancer IP) |
| CNAME | api.tbgroup.kz | (EKS API endpoint) |
| CNAME | admin.tbgroup.kz | (EKS Admin endpoint) |

### 5. SSL Certificates

Request SSL certificates from AWS Certificate Manager:

```bash
# For production domain
aws acm request-certificate \
  --domain-name tbgroup.kz \
  --subject-alternative-names "*.tbgroup.kz" \
  --validation-method DNS \
  --region eu-central-1
```

## Infrastructure Deployment

### Step 1: Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

### Step 2: Prepare Environment

Create environment file:

```bash
# terraform/environments/production/terraform.tfvars
environment  = "production"
aws_region   = "eu-central-1"
cluster_name = "tbgroup-cluster"

# Domain
domain_name     = "tbgroup.kz"
route53_zone_id = "Z1234567890"
certificate_arn = "arn:aws:acm:eu-central-1:123456789:certificate/..."

# Database
db_instance_class         = "db.t3.medium"
db_allocated_storage      = 50
db_backup_retention_period = 30

# Node groups
node_groups = {
  general = {
    instance_types = ["t3.large"]
    capacity_type  = "ON_DEMAND"
    scaling_config = {
      desired_size = 3
      max_size     = 10
      min_size     = 2
    }
  }
  workers = {
    instance_types = ["t3.xlarge"]
    capacity_type  = "ON_DEMAND"
    scaling_config = {
      desired_size = 2
      max_size     = 20
      min_size     = 1
    }
  }
}
```

### Step 3: Initialize Terraform

```bash
# Initialize Terraform
./scripts/deploy-terraform.sh init production

# Format and validate
./scripts/deploy-terraform.sh fmt
./scripts/deploy-terraform.sh validate
```

### Step 4: Plan Deployment

```bash
# Review planned changes
./scripts/deploy-terraform.sh plan production
```

Review the plan carefully:
- [ ] VPC created with correct CIDR
- [ ] EKS cluster with expected nodes
- [ ] RDS instance with correct size
- [ ] Security groups configured
- [ ] No destructive changes

### Step 5: Apply Infrastructure

```bash
# Deploy infrastructure
./scripts/deploy-terraform.sh apply production
```

This will take approximately 15-20 minutes. Monitor the output for:
- VPC creation
- EKS cluster provisioning
- Node group scaling
- RDS instance creation
- Security group configuration

**Output Example**:
```
Outputs:

cluster_endpoint = "https://EKS_ENDPOINT.gr7.eu-central-1.eks.amazonaws.com"
cluster_name = "tbgroup-cluster"
database_endpoint = "tbgroup-cluster-db.xxxxxxx.eu-central-1.rds.amazonaws.com:5432"
redis_endpoint = "tbgroup-cluster-redis.xxxxxx.cache.amazonaws.com:6379"
```

### Step 6: Update kubeconfig

```bash
# Configure kubectl
aws eks update-kubeconfig \
  --region eu-central-1 \
  --name tbgroup-cluster

# Verify connection
kubectl get nodes
kubectl get pods -A
```

## Application Deployment

### Step 1: Create Namespaces

```bash
# Create application namespace
kubectl create namespace tbgroup --dry-run=client -o yaml | kubectl apply -f -

# Create monitoring namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
```

### Step 2: Create Secrets

Create production secrets:

```bash
# Create secrets file: helm/tbgroup/.env.production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@tbgroup-cluster-db.xxxxxx.eu-central-1.rds.amazonaws.com:5432/tbgroup
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@tbgroup-cluster-redis.xxxxxx.cache.amazonaws.com:6379
JWT_ACCESS_SECRET=your-jwt-access-secret-32-chars-min
JWT_REFRESH_SECRET=your-jwt-refresh-secret-32-chars-min
SMTP_USER=alerts@tbgroup.kz
SMTP_PASS=your-smtp-password
BITRIX24_WEBHOOK_URL=https://your-company.bitrix24.kz/rest/1/your-webhook/
RECAPTCHA_SECRET=your-recaptcha-secret
```

```bash
# Create Kubernetes secret
kubectl create secret generic tbgroup-secrets \
  --from-env-file=helm/tbgroup/.env.production \
  --namespace=tbgroup \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 3: Deploy with Helm

```bash
# Add Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Deploy application
./scripts/deploy-helm.sh production
```

Monitor deployment:
```bash
# Check deployment status
kubectl get deployments -n tbgroup
kubectl get pods -n tbgroup
kubectl get services -n tbgroup

# Watch deployment
kubectl rollout status deployment/tbgroup-api -n tbgroup
kubectl rollout status deployment/tbgroup-web -n tbgroup
```

### Step 4: Deploy Monitoring

```bash
# Deploy monitoring stack
./scripts/deploy-monitoring.sh
```

## Post-Deployment Verification

### Health Checks

```bash
# Check all pods are running
kubectl get pods -n tbgroup

# Check services
kubectl get services -n tbgroup

# Check ingress
kubectl get ingress -n tbgroup

# Check HPA
kubectl get hpa -n tbgroup
```

### Application Health

```bash
# Test API health
curl -f https://api.tbgroup.kz/health || echo "API health check failed"

# Test web
curl -f https://tbgroup.kz || echo "Web health check failed"

# Test admin
curl -f https://admin.tbgroup.kz || echo "Admin health check failed"
```

### Database Connectivity

```bash
# Check database connection
kubectl exec -it -n tbgroup deployment/tbgroup-api -- \
  pg_isready -h tbgroup-cluster-db.xxxxxx.eu-central-1.rds.amazonaws.com -p 5432
```

### Monitoring

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/tbgroup-monitoring-prometheus 9090:9090
# Navigate to: http://localhost:9090/targets

# Check Grafana
kubectl port-forward -n monitoring svc/tbgroup-monitoring-grafana 3000:80
# Navigate to: http://localhost:3000 (admin/admin)
```

## DNS and SSL Configuration

### Step 1: Create DNS Records

```bash
# Create CNAME records
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890 \
  --change-batch file://dns-records.json
```

**dns-records.json**:
```json
{
  "Comment": "TB Group DNS",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.tbgroup.kz",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "EKS_API_ENDPOINT" }
        ]
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "admin.tbgroup.kz",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "EKS_ADMIN_ENDPOINT" }
        ]
      }
    }
  ]
}
```

### Step 2: Verify DNS Propagation

```bash
# Check DNS resolution
nslookup tbgroup.kz
nslookup api.tbgroup.kz
nslookup admin.tbgroup.kz
```

### Step 3: Verify SSL Certificates

```bash
# Check SSL certificate
openssl s_client -connect tbgroup.kz:443 -servername tbgroup.kz

# Or use SSL checker
curl -I https://tbgroup.kz
```

## Monitoring Setup

### Grafana Dashboards

1. **TB Group Overview**:
   - Request rate
   - Error rate
   - Response time
   - Active users

2. **Application Performance**:
   - Endpoint latency
   - Database queries
   - Cache hit rate

3. **Infrastructure**:
   - Node resource usage
   - Pod status
   - Network I/O

### Alert Rules

Verify critical alerts:
- High error rate
- High latency
- Pod crash looping
- Database down

### Notification Channels

Configure:
- Email: admin@tbgroup.kz
- Slack: #alerts
- PagerDuty: (optional)

## Rollback Procedures

### Application Rollback

```bash
# Rollback Helm release
helm rollback tbgroup 1 -n tbgroup

# Or rollback to specific revision
helm rollback tbgroup 2 -n tbgroup

# Check rollback status
helm history tbgroup -n tbgroup
```

### Infrastructure Rollback

```bash
# Destroy and recreate
./scripts/deploy-terraform.sh destroy production
./scripts/deploy-terraform.sh apply production
```

### Database Rollback

```bash
# Restore from backup
./scripts/restore-database.sh <backup_filename>
```

## Troubleshooting

### Common Issues

#### Issue: Pods stuck in Pending

**Cause**: Insufficient resources or node issues

**Solution**:
```bash
# Check node status
kubectl get nodes

# Check pod events
kubectl describe pod <pod-name> -n tbgroup

# Check resource quotas
kubectl get resourcequota -n tbgroup
```

#### Issue: Database connection fails

**Cause**: Security group or network issues

**Solution**:
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids <sg-id>

# Check network connectivity
kubectl exec -it <pod> -n tbgroup -- \
  telnet tbgroup-cluster-db.xxxxxx.eu-central-1.rds.amazonaws.com 5432
```

#### Issue: High memory usage

**Cause**: Memory leak or insufficient limits

**Solution**:
```bash
# Check pod memory
kubectl top pods -n tbgroup

# Increase memory limits in deployment
kubectl patch deployment tbgroup-api -n tbgroup -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"memory":"1Gi"}}}]}}}}'
```

#### Issue: SSL certificate not working

**Cause**: Certificate not propagated or invalid

**Solution**:
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn <arn>

# Check DNS records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890
```

### Logs

```bash
# Application logs
kubectl logs -f deployment/tbgroup-api -n tbgroup
kubectl logs -f deployment/tbgroup-web -n tbgroup

# Database logs
kubectl logs -f statefulset/tbgroup-postgres -n tbgroup

# Ingress logs
kubectl logs -f deployment/nginx-ingress-controller -n ingress-nginx
```

### Debug Mode

Enable debug logging:

```bash
# Enable debug for API
kubectl patch deployment tbgroup-api -n tbgroup -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"NODE_ENV","value":"development"}]}]}}}}'

# Restart pod
kubectl rollout restart deployment/tbgroup-api -n tbgroup
```

## Maintenance

### Regular Tasks

#### Daily
- [ ] Check monitoring dashboards
- [ ] Review error logs
- [ ] Verify backup completion

#### Weekly
- [ ] Review resource usage
- [ ] Check for security updates
- [ ] Update dependencies
- [ ] Review access logs

#### Monthly
- [ ] Security audit
- [ ] Cost optimization review
- [ ] Performance optimization
- [ ] Disaster recovery test

#### Quarterly
- [ ] Complete infrastructure review
- [ ] Capacity planning
- [ ] Security penetration test
- [ ] DR drill

### Updates

#### Kubernetes Version Upgrade

```bash
# Check available version
aws eks describe-addon-versions --addon-name coredns

# Update EKS version
terraform apply -var cluster_version=1.30

# Update addons
kubectl apply -f kube-addon-update.yaml
```

#### Application Update

```bash
# Update Helm values
helm upgrade tbgroup ./helm/tbgroup \
  --namespace tbgroup \
  --set image.tag=v2.1.0 \
  --wait
```

### Scaling

#### Horizontal Pod Autoscaler

```bash
# Check HPA status
kubectl get hpa -n tbgroup

# Manually scale
kubectl scale deployment tbgroup-api --replicas=5 -n tbgroup
```

#### Vertical Pod Autoscaler

```bash
# Install VPA
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/vertical-pod-autoscaler/hack/vpa-up.sh

# Enable VPA for deployment
kubectl apply -f vpa-tbgroup-api.yaml
```

## Security

### Regular Security Tasks

1. **Rotate Secrets** (every 90 days)
2. **Update Dependencies** (weekly)
3. **Review IAM Policies** (monthly)
4. **Audit Access Logs** (weekly)
5. **Penetration Testing** (quarterly)

### Security Checklist

- [ ] TLS 1.3 enabled
- [ ] Strong passwords
- [ ] MFA enabled on all accounts
- [ ] VPC configured with private subnets
- [ ] Security groups minimal permissions
- [ ] Regular security updates
- [ ] WAF configured
- [ ] Rate limiting enabled
- [ ] API authentication required
- [ ] Secrets in AWS Secrets Manager

## Support

### Contact Information

- **DevOps Team**: devops@tbgroup.kz
- **Emergency**: +7-XXX-XXX-XXXX
- **Documentation**: https://github.com/ZhaslanToishybayev/tb_group/wiki

### Escalation

1. **Level 1**: On-call engineer
2. **Level 2**: DevOps lead
3. **Level 3**: Infrastructure team
4. **Level 4**: CTO

## Appendix

### Useful Commands

```bash
# Cluster info
kubectl cluster-info
kubectl get nodes
kubectl top nodes

# Pod management
kubectl get pods -A
kubectl describe pod <pod> -n tbgroup
kubectl logs <pod> -n tbgroup --previous

# Deployment management
kubectl get deployments -n tbgroup
kubectl rollout status deployment/tbgroup-api -n tbgroup
kubectl rollout history deployment/tbgroup-api -n tbgroup

# Service management
kubectl get svc -A
kubectl describe svc tbgroup-api-service -n tbgroup

# Ingress management
kubectl get ingress -A
kubectl describe ingress tbgroup-ingress -n tbgroup

# Resource management
kubectl get hpa -A
kubectl get vpa -A

# Namespace management
kubectl get namespaces
kubectl create namespace <name>
```

### Useful URLs

- **Grafana**: http://grafana.monitoring.tbgroup.kz
- **Prometheus**: http://prometheus.monitoring.tbgroup.kz
- **Alertmanager**: http://alertmanager.monitoring.tbgroup.kz
- **Jaeger**: http://jaeger.monitoring.tbgroup.kz
- **Kubernetes Dashboard**: http://dashboard.monitoring.tbgroup.kz

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-11-10 | 1.0.0 | Initial production deployment guide |
