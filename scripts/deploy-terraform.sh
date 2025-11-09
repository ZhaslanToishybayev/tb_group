#!/bin/bash

# TB Group Terraform Infrastructure Deployment Script
# Usage: ./deploy-terraform.sh [init|plan|apply|destroy|fmt|validate] [dev|staging|production]

set -e

COMMAND=${1:-apply}
ENVIRONMENT=${2:-production}
TERRAFORM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../terraform" && pwd)"

echo "🚀 TB Group Infrastructure Deployment"
echo "======================================"
echo "Command: $COMMAND"
echo "Environment: $ENVIRONMENT"
echo "Directory: $TERRAFORM_DIR"
echo ""

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    echo "   Download: https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   Installation: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

cd "$TERRAFORM_DIR"

case "$COMMAND" in
  init)
    echo "📦 Initializing Terraform..."
    terraform init \
      -backend-config="environments/$ENVIRONMENT/backend.tfvars" \
      -reconfigure
    ;;

  fmt)
    echo "🔍 Formatting Terraform files..."
    terraform fmt -recursive
    echo "✅ Files formatted"
    ;;

  validate)
    echo "✅ Validating Terraform configuration..."
    terraform validate
    echo "✅ Configuration is valid"
    ;;

  plan)
    echo "📊 Planning infrastructure changes..."
    terraform plan \
      -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
      -out=tfplan-$ENVIRONMENT
    ;;

  apply)
    echo "🔧 Applying infrastructure changes..."
    terraform apply \
      -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
      -auto-approve

    echo ""
    echo "✅ Infrastructure deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update kubeconfig:"
    echo "   aws eks update-kubeconfig --region eu-central-1 --name tbgroup-cluster"
    echo ""
    echo "2. Deploy applications using Helm:"
    echo "   ./scripts/deploy-helm.sh $ENVIRONMENT"
    ;;

  destroy)
    echo "⚠️  WARNING: This will destroy all infrastructure!"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
      terraform destroy \
        -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
        -auto-approve
      echo "✅ Infrastructure destroyed"
    else
      echo "❌ Destroy cancelled"
    fi
    ;;

  output)
    echo "📤 Terraform outputs:"
    terraform output
    ;;

  *)
    echo "❌ Unknown command: $COMMAND"
    echo "Available commands: init, fmt, validate, plan, apply, destroy, output"
    exit 1
    ;;
esac
