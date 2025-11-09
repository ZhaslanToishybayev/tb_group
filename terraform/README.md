# TB Group Infrastructure - Terraform

## Overview

This directory contains Terraform configurations for deploying the TB Group website infrastructure on AWS. The infrastructure includes:

- **VPC** - Virtual Private Cloud with public and private subnets
- **EKS** - Elastic Kubernetes Service for running containerized applications
- **RDS** - PostgreSQL database for data storage
- **ElastiCache** - Redis for caching and session management
- **S3** - Object storage for backups and static assets
- **CloudWatch** - Monitoring and logging
- **Security Groups** - Network security controls

## Prerequisites

1. **Terraform** (>= 1.0) - [Install Terraform](https://www.terraform.io/downloads.html)
2. **AWS CLI** (>= 2.0) - [Install AWS CLI](https://aws.amazon.com/cli/)
3. **AWS Account** with appropriate permissions
4. **kubectl** - [Install kubectl](https://kubernetes.io/docs/tasks/tools/)

## Quick Start

### 1. Configure AWS Credentials

```bash
aws configure
```

You'll need to provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `eu-central-1`
- Default output format: `json`

### 2. Initialize Terraform

```bash
./scripts/deploy-terraform.sh init production
```

### 3. Plan Infrastructure

```bash
./scripts/deploy-terraform.sh plan production
```

### 4. Apply Infrastructure

```bash
./scripts/deploy-terraform.sh apply production
```

This will create all the necessary infrastructure components. The process takes approximately 15-20 minutes.

### 5. Update kubeconfig

```bash
aws eks update-kubeconfig --region eu-central-1 --name tbgroup-cluster
```

### 6. Deploy Applications

```bash
./scripts/deploy-helm.sh production
```

## Directory Structure

```
terraform/
├── main.tf                    # Provider configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── modules-setup.tf           # Module instantiation
├── modules/
│   ├── vpc/                   # VPC module
│   ├── eks/                   # EKS module
│   ├── rds/                   # RDS module
│   ├── elasticache/           # ElastiCache module
│   ├── s3/                    # S3 module
│   ├── monitoring/            # CloudWatch module
│   └── security-groups/       # Security groups
├── environments/
│   ├── dev/                   # Development environment
│   ├── staging/               # Staging environment
│   └── production/            # Production environment
└── scripts/
    └── deploy-terraform.sh    # Deployment script
```

## Environment Configuration

### Development

```bash
./scripts/deploy-terraform.sh apply dev
```

- Smaller instance types
- Single AZ deployment
- Minimal redundancy

### Staging

```bash
./scripts/deploy-terraform.sh apply staging
```

- Medium instance types
- Multi-AZ deployment
- Standard redundancy

### Production

```bash
./scripts/deploy-terraform.sh apply production
```

- Optimized instance types
- Multi-AZ deployment
- High availability
- Auto-scaling
- Enhanced monitoring

## Environment Variables

Create a `terraform.tfvars` file in the environment directory:

```hcl
# General
environment  = "production"
aws_region   = "eu-central-1"
cluster_name = "tbgroup-cluster"

# Networking
vpc_cidr        = "10.0.0.0/16"
private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# Database
db_instance_class         = "db.t3.medium"
db_allocated_storage      = 50
db_backup_retention_period = 30

# Domain
domain_name     = "tbgroup.kz"
route53_zone_id = "Z1234567890"
certificate_arn = "arn:aws:acm:eu-central-1:123456789:certificate/12345678-1234-1234-1234-123456789012"
```

## Output

After successful deployment, Terraform will output:

- **Cluster endpoint** - EKS API server URL
- **Database endpoint** - RDS connection details
- **Redis endpoint** - ElastiCache connection details
- **S3 bucket** - Storage bucket name
- **kubeconfig command** - Command to update kubectl configuration

Example output:

```bash
cluster_endpoint = "https://EKS_ENDPOINT.gr7.eu-central-1.eks.amazonaws.com"
database_endpoint = "tbgroup-cluster-db.xxxxxxx.eu-central-1.rds.amazonaws.com:5432"
redis_endpoint = "tbgroup-cluster-redis.xxxxxx.cache.amazonaws.com:6379"
```

## Updating Infrastructure

### Modifying Resources

1. Edit the relevant `.tf` files
2. Run plan to see changes:

```bash
./scripts/deploy-terraform.sh plan production
```

3. Apply changes:

```bash
./scripts/deploy-terraform.sh apply production
```

### Adding New Resources

1. Create a new module in `modules/`
2. Reference the module in `modules-setup.tf`
3. Run plan and apply

## Destroying Infrastructure

⚠️ **Warning**: This action is irreversible!

```bash
./scripts/deploy-terraform.sh destroy production
```

## Monitoring and Logging

### CloudWatch

- **Log Groups**: Automatically created for EKS clusters
- **Metrics**: CPU, memory, network, and disk metrics
- **Alerts**: SNS notifications for critical events

### Grafana and Prometheus

Install the monitoring stack:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword=admin
```

## Security Best Practices

1. **Least Privilege**: IAM policies follow the principle of least privilege
2. **Network Isolation**: Resources are deployed in private subnets
3. **Encryption**: All data is encrypted at rest and in transit
4. **Secrets Management**: Sensitive values are stored in AWS Secrets Manager
5. **Security Groups**: Minimal access between components
6. **VPC Flow Logs**: Network traffic is logged for security analysis

## Troubleshooting

### Common Issues

**Issue: Terraform fails to create resources**

Solution:
- Check AWS credentials and permissions
- Ensure AWS region has required services available
- Check service quotas (EKS, RDS, etc.)

**Issue: Cannot connect to EKS cluster**

Solution:
- Update kubeconfig: `aws eks update-kubeconfig --region eu-central-1 --name tbgroup-cluster`
- Check security group rules
- Verify cluster endpoint access

**Issue: Database connection fails**

Solution:
- Verify security group allows connections
- Check if database is in the same VPC
- Verify connection credentials

### Logs

View Terraform logs:

```bash
tail -f terraform.log
```

### State Management

The Terraform state is stored in S3. To view state:

```bash
terraform show
```

## Cost Optimization

### Estimated Monthly Costs (Production)

- EKS Cluster: ~$100
- EC2 Nodes (3x t3.large): ~$150
- RDS (db.t3.medium): ~$50
- ElastiCache (cache.t3.micro): ~$15
- Load Balancer: ~$25
- Data Transfer: ~$20
- **Total**: ~$360/month

### Cost Reduction Tips

1. **Use Spot Instances** for non-production workloads
2. **Right-size** instances based on actual usage
3. **Enable** instance savings plans for predictable workloads
4. **Use** reserved instances for RDS
5. **Monitor** and delete unused resources

## Support and Maintenance

### Updates

- Keep Terraform version up to date
- Regularly update Kubernetes and container images
- Apply security patches promptly

### Backup

- **Database**: Automated backups with 7-day retention
- **S3**: Versioning enabled for critical data
- **Terraform State**: Stored in S3 with versioning

### Disaster Recovery

- Multi-AZ deployment for high availability
- Automated snapshots for databases
- Infrastructure as Code for quick recovery

## License

Copyright © 2024 TB Group. All rights reserved.
