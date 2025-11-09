#!/bin/bash

# TB Group Database Restore Script
# Restores database from S3 backup

set -e

S3_BUCKET="tbgroup-backups"
NAMESPACE="tbgroup"

if [ -z "$1" ]; then
  echo "❌ Error: Backup file name required"
  echo "Usage: ./restore-database.sh <backup_filename>"
  echo ""
  echo "Available backups:"
  aws s3 ls s3://$S3_BUCKET/database/ --region eu-central-1 | grep .sql.gz
  exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="/tmp/tbgroup-restore"

echo "🚀 Starting database restore..."
echo "==============================="
echo "Backup file: $BACKUP_FILE"
echo "Namespace: $NAMESPACE"
echo ""

# Get database credentials
echo "📋 Getting database credentials..."
DB_HOST=$(kubectl get svc tbgroup-postgres -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
DB_PORT=$(kubectl get svc tbgroup-postgres -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')
DB_NAME=$(kubectl get secret tbgroup-secrets -n $NAMESPACE -o jsonpath='{.data.database_name}' | base64 -d)
DB_USER=$(kubectl get secret tbgroup-secrets -n $NAMESPACE -o jsonpath='{.data.database_user}' | base64 -d)
DB_PASSWORD=$(kubectl get secret tbgroup-secrets -n $NAMESPACE -o jsonpath='{.data.database_password}' | base64 -d)

# Get database pod
DB_POD=$(kubectl get pods -n $NAMESPACE -l app=tbgroup-postgres -o jsonpath='{.items[0].metadata.name}')

# Create restore directory
mkdir -p $RESTORE_DIR

# Download backup from S3
echo "📥 Downloading backup from S3..."
aws s3 cp \
  s3://$S3_BUCKET/database/$BACKUP_FILE \
  $RESTORE_DIR/ \
  --region eu-central-1

echo "✅ Backup downloaded"

# Decompress backup
echo "🗜️  Decompressing backup..."
gunzip $RESTORE_DIR/$BACKUP_FILE

BACKUP_SQL="${BACKUP_FILE%.gz}"
echo "✅ Backup decompressed: $BACKUP_SQL"

# Confirm restore
echo ""
echo "⚠️  WARNING: This will OVERWRITE the current database!"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
  echo "❌ Restore cancelled"
  rm -rf $RESTORE_DIR
  exit 1
fi

# Restore database
echo "💾 Restoring database..."
kubectl exec -n $NAMESPACE $DB_POD -- psql \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d postgres \
  < $RESTORE_DIR/$BACKUP_SQL

echo "✅ Database restored successfully"

# Clean up
echo "🧹 Cleaning up..."
rm -rf $RESTORE_DIR

echo ""
echo "✅ Database restore completed!"
