#!/bin/bash

# TB Group Kubernetes Deployment Script
# Usage: ./deploy-k8s.sh [dev|staging|production]

set -e

ENVIRONMENT=${1:-production}
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../k8s" && pwd)"
NAMESPACE="tbgroup"

echo "🚀 Deploying TB Group to Kubernetes - Environment: $ENVIRONMENT"
echo "=================================================="

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install it first."
    exit 1
fi

# Check if kustomize is installed
if ! command -v kustomize &> /dev/null; then
    echo "❌ kustomize is not installed. Please install it first."
    exit 1
fi

# Check cluster connection
echo "📡 Checking cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi
echo "✅ Cluster connection verified"

# Create namespace if it doesn't exist
echo "📦 Creating namespace if not exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Create monitoring namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Apply secrets
echo "🔐 Setting up secrets..."
if [ -f "$K8S_DIR/overlays/$ENVIRONMENT/.env.$ENVIRONMENT" ]; then
    kubectl create secret generic tbgroup-secrets \
        --from-env-file="$K8S_DIR/overlays/$ENVIRONMENT/.env.$ENVIRONMENT" \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo "⚠️  Warning: .env.$ENVIRONMENT not found, using base secrets"
    kubectl apply -f "$K8S_DIR/base/secret.yaml"
fi

# Apply ConfigMap
echo "⚙️  Applying configuration..."
kubectl apply -f "$K8S_DIR/base/configmap.yaml" -n $NAMESPACE

# Deploy using kustomize
echo "🚀 Deploying applications..."
kubectl apply -k "$K8S_DIR/overlays/$ENVIRONMENT"

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl rollout restart deployment/tbgroup-api -n $NAMESPACE
kubectl rollout restart deployment/tbgroup-web -n $NAMESPACE
kubectl rollout restart deployment/tbgroup-admin -n $NAMESPACE

echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
kubectl get deployments -n $NAMESPACE
echo ""
echo "🌐 Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "🔍 Check status: kubectl get pods -n $NAMESPACE"
echo "📜 View logs: kubectl logs -f deployment/tbgroup-api -n $NAMESPACE"
echo "🔗 Ingress: kubectl get ingress -n $NAMESPACE"
