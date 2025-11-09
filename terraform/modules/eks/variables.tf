variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "cluster_endpoint_public_access" {
  description = "Enable public endpoint access for the EKS cluster"
  type        = bool
  default     = true
}

variable "cluster_endpoint_private_access" {
  description = "Enable private endpoint access for the EKS cluster"
  type        = bool
  default     = true
}

variable "node_groups" {
  description = "EKS managed node groups"
  type = map(object({
    instance_types = list(string)
    capacity_type  = string
    scaling_config = object({
      desired_size = number
      max_size     = number
      min_size     = number
    })
  }))
  default = {}
}

variable "self_managed_node_groups" {
  description = "Self-managed node groups"
  type = map(any)
  default = {}
}

variable "fargate_profiles" {
  description = "Fargate profiles"
  type = map(any)
  default = {}
}

variable "cluster_addons" {
  description = "EKS cluster add-ons"
  type = map(object({
    name              = string
    addon_version     = optional(string)
    configuration     = optional(string)
    most_recent       = optional(bool)
  }))
  default = {
    coredns = {
      name        = "coredns"
      most_recent = true
    }
    kube-proxy = {
      name        = "kube-proxy"
      most_recent = true
    }
    vpc-cni = {
      name        = "vpc-cni"
      most_recent = true
    }
  }
}

variable "tags" {
  description = "Additional tags for EKS cluster"
  type        = map(string)
  default     = {}
}
