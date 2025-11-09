module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = var.name_prefix
  cidr = var.cidr

  azs             = var.azs
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway = var.enable_nat_gateway
  enable_vpn_gateway = var.enable_vpn_gateway
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support = var.enable_dns_support

  single_nat_gateway = var.single_nat_gateway
  one_nat_gateway_per_az = var.one_nat_gateway_per_az

  public_subnet_tags = {
    Name = "${var.name_prefix}-public"
  }

  private_subnet_tags = {
    Name = "${var.name_prefix}-private"
  }

  tags = var.tags

  vpc_flow_log_tags = {
    Name = "${var.name_prefix}-flow-logs"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "this" {
  count  = var.create_igw ? 1 : 0
  vpc_id = module.vpc.vpc_id

  tags = {
    Name = "${var.name_prefix}-igw"
  }
}

# Egress Only Internet Gateway
resource "aws_egress_only_internet_gateway" "this" {
  count  = var.create_egress_only_igw ? 1 : 0
  vpc_id = module.vpc.vpc_id

  tags = {
    Name = "${var.name_prefix}-egress-igw"
  }
}
