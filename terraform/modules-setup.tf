# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name_prefix = "${var.cluster_name}-vpc"
  cidr       = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway   = true
  enable_vpn_gateway   = var.enable_vpn_gateway
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.cluster_name}-vpc"
  }
}

# EKS Module
module "eks" {
  source = "./modules/eks"

  cluster_name    = var.cluster_name
  cluster_version = "1.29"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  node_groups = var.node_groups

  tags = {
    Environment = var.environment
  }
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  identifier = "${var.cluster_name}-db"

  engine     = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  backup_retention_period = var.db_backup_retention_period
  backup_window         = "03:00-04:00"
  maintenance_window    = "sun:04:00-sun:05:00"

  db_name  = "tbgroup"
  username = "postgres"
  password = random_password.db_password.result

  vpc_security_group_ids = [module.rds_security_group.security_group_id]
  db_subnet_group_name   = module.rds.db_subnet_group

  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"

  tags = {
    Environment = var.environment
  }
}

# Generate random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# ElastiCache Redis Module
module "elasticache" {
  source = "./modules/elasticache"

  cluster_name = "${var.cluster_name}-redis"

  engine_version = "7.0"
  node_type      = "cache.t3.micro"
  num_cache_nodes = 1

  subnet_ids = module.vpc.private_subnets
  security_group_ids = [module.redis_security_group.security_group_id]

  parameter_group_name = "default.redis7"

  tags = {
    Environment = var.environment
  }
}

# Security Groups
module "rds_security_group" {
  source = "./modules/security-groups"

  name_prefix = "${var.cluster_name}-rds-sg"
  vpc_id      = module.vpc.vpc_id
  ingress_cidr_blocks = var.public_subnets
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.cluster_name}-rds-sg"
  }
}

module "redis_security_group" {
  source = "./modules/security-groups"

  name_prefix = "${var.cluster_name}-redis-sg"
  vpc_id      = module.vpc.vpc_id
  ingress_cidr_blocks = var.private_subnets
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.cluster_name}-redis-sg"
  }
}

# S3 Module
module "s3" {
  source = "./modules/s3"

  bucket_name = "${var.cluster_name}-backups"
  environment = var.environment

  versioning = true
  encryption = true

  tags = {
    Environment = var.environment
  }
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/monitoring"

  cluster_name = var.cluster_name
  environment  = var.environment

  log_retention = var.environment == "production" ? 30 : 7

  enable_sns_notifications = var.environment == "production"

  tags = {
    Environment = var.environment
  }
}
