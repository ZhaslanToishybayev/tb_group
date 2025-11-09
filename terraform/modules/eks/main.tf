module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  vpc_id                         = var.vpc_id
  subnet_ids                     = var.subnet_ids
  cluster_endpoint_public_access = var.cluster_endpoint_public_access
  cluster_endpoint_private_access = var.cluster_endpoint_private_access

  # Cluster access entry
  enable_cluster_creator_admin_permissions = true

  # IRSA
  enable_irsa = true

  # Cluster logging
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  # Tags
  tags = var.tags

  # EKS Managed Node Groups
  node_groups = var.node_groups

  # Self-managed node groups
  self_managed_node_groups = var.self_managed_node_groups

  # Fargate profiles
  fargate_profiles = var.fargate_profiles

  # Add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # OIDC identity provider
  create_oidc_provider = true
}

# EKS Add-ons
resource "aws_eks_addon" "this" {
  for_each = var.cluster_addons

  cluster_name = module.eks.cluster_name
  addon_name   = each.value.name
  addon_version = lookup(each.value, "addon_version", null)

  configuration = each.value.configuration

  depends_on = [
    module.eks
  ]
}
