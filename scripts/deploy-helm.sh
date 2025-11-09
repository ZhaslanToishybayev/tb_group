#!/bin/bash

# TB Group Helm Deployment Script
# Usage: ./deploy-helm.sh [dev|staging|production]

set -e

ENVIRONMENT=${1:-production}
HELM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../helm" && pwd)"
RELEASE_NAME="tbgroup"
NAMESPACE="tbgroup"

echo "🚀 Deploying TB Group using Helm - Environment: $ENVIRONMENT"
echo "=================================================="

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install it first."
    echo "   Installation: https://helm.sh/docs/intro/install/"
    exit 1
fi

# Check cluster connection
echo "📡 Checking cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi
echo "✅ Cluster connection verified"

# Add Helm repositories
echo "📦 Adding Helm repositories..."
helm repo add bitnami https://charts.bitnami.com/bitnami 2>/dev/null || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
helm repo update

# Create namespace if it doesn't exist
echo "📦 Creating namespace if not exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Create monitoring namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Create secrets from file
if [ -f "$HELM_DIR/tbgroup/.env.$ENVIRONMENT" ]; then
    echo "🔐 Creating secrets from .env.$ENVIRONMENT file..."
    kubectl create secret generic $RELEASE_NAME-secrets \
        --from-env-file="$HELM_DIR/tbgroup/.env.$ENVIRONMENT" \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo "⚠️  Warning: .env.$ENVIRONMENT not found, secrets must be set manually"
fi

# Upgrade or install release
echo "🚀 Deploying/upgrading release: $RELEASE_NAME"
helm upgrade --install $RELEASE_NAME $HELM_DIR/tbgroup \
    --namespace $NAMESPACE \
    --create-namespace \
    --set environment=$ENVIRONMENT \
    --set api.image.tag=$ENVIRONMENT-{{ .SHORT_SHA }} \
    --set web.image.tag=$ENVIRONMENT-{{ .SHORT_SHA }} \
    --set admin.image.tag=$ENVIRONMENT-{{ .SHORT_SHA }} \
    --wait \
    --timeout 10m \
    --debug

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Release status:"
helm status $RELEASE_NAME -n $NAMESPACE
echo ""
echo "📊 Pod status:"
kubectl get pods -n $NAMESPACE
echo ""
echo "🌐 Services:"
kubectl get svc -n $NAMESPACE
echo ""
echo "🔍 Ingress:"
kubectl get ingress -n $NAMESPACE
echo ""
echo "🔗 URLs:"
{{- range .Values.ingress.hosts }}
echo "   - https://{{ .host }}"
{{- end }}
echo ""
echo "📜 View logs: kubectl logs -f deployment/$RELEASE_NAME-api -n $NAMESPACE"
echo "💰 View Helm values: helm get values $RELEASE_NAME -n $NAMESPACE"
echo "📋 List releases: helm list -n $NAMESPACE"
