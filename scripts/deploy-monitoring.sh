#!/bin/bash

# TB Group Monitoring Stack Deployment Script
# Deploys Prometheus, Grafana, Alertmanager, and other observability tools

set -e

NAMESPACE="monitoring"
HELM_RELEASE_NAME="tbgroup-monitoring"

echo "🚀 Deploying TB Group Monitoring Stack"
echo "======================================"

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install it first."
    exit 1
fi

# Add Helm repositories
echo "📦 Adding Helm repositories..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts 2>/dev/null || true
helm repo update

# Create namespace
echo "📦 Creating namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy kube-prometheus-stack (includes Prometheus, Grafana, Alertmanager)
echo "🔧 Deploying kube-prometheus-stack..."
helm upgrade --install $HELM_RELEASE_NAME prometheus-community/kube-prometheus-stack \
  --namespace $NAMESPACE \
  --create-namespace \
  --set grafana.adminPassword=admin \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size=10Gi \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.enableAdminAPI=true \
  --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage=10Gi \
  --set prometheusOperator.admissionWebhooks.patch.image.repository=批/proxy \
  --set prometheusOperator.admissionWebhooks.patch.image.sha= \
  --wait \
  --timeout 10m

# Deploy custom Prometheus configuration
echo "⚙️  Deploying custom Prometheus configuration..."
kubectl create configmap tbgroup-prometheus-config \
  --from-file=prometheus.yml=observability/prometheus/prometheus.yml \
  --from-file=alert_rules.yml=observability/prometheus/alert_rules.yml \
  --namespace $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy Alertmanager configuration
echo "🚨 Deploying Alertmanager configuration..."
kubectl create configmap tbgroup-alertmanager-config \
  --from-file=alertmanager.yml=observability/alertmanager/alertmanager.yml \
  --namespace $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy Jaeger for distributed tracing
echo "🔍 Deploying Jaeger for distributed tracing..."
helm upgrade --install jaeger jaegertracing/jaeger \
  --namespace $NAMESPACE \
  --set provisionDataStore.cassandra=false \
  --set provisionDataStore.elasticsearch.enabled=true \
  --set elasticsearch.replicas=1 \
  --set elasticsearch.minimumMasterNodes=1 \
  --set elasticsearch.volumeSize=10Gi \
  --wait \
  --timeout 10m

# Deploy Loki for log aggregation
echo "📜 Deploying Loki for log aggregation..."
helm upgrade --install loki grafana/loki-stack \
  --namespace $NAMESPACE \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=20Gi \
  --set promtail.enabled=true \
  --set loglevel=info \
  --wait \
  --timeout 10m

# Restart Prometheus to pick up new config
echo "🔄 Restarting Prometheus to apply new configuration..."
kubectl delete pods -n $NAMESPACE -l app=prometheus,prometheus=monitoring

# Restart Alertmanager to apply new config
echo "🔄 Restarting Alertmanager to apply new configuration..."
kubectl delete pods -n $NAMESPACE -l app=alertmanager,alertmanager=monitoring

echo ""
echo "✅ Monitoring stack deployment complete!"
echo ""
echo "📊 Access Information:"
echo "====================="
echo ""
echo "🔗 Grafana:"
echo "   URL: kubectl port-forward -n $NAMESPACE svc/tbgroup-monitoring-grafana 3000:80"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "🔗 Prometheus:"
echo "   URL: kubectl port-forward -n $NAMESPACE svc/tbgroup-monitoring-prometheus 9090:9090"
echo ""
echo "🔗 Alertmanager:"
echo "   URL: kubectl port-forward -n $NAMESPACE svc/tbgroup-monitoring-alertmanager 9093:9093"
echo ""
echo "🔗 Jaeger:"
echo "   URL: kubectl port-forward -n $NAMESPACE svc/jaeger-query 16686:16686"
echo ""
echo "🔗 Loki:"
echo "   URL: kubectl port-forward -n $NAMESPACE svc/loki 3100:3100"
echo ""
echo "📜 View logs:"
echo "   kubectl logs -n $NAMESPACE deployment/tbgroup-api"
echo ""
echo "📋 View alerts:"
echo "   kubectl get servicemonitors -n $NAMESPACE"
echo ""
