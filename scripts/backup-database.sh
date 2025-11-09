#!/bin/bash

# TB Group Database Backup Script
# Creates backups of PostgreSQL database and uploads to S3

set -e

BACKUP_DIR="/tmp/tbgroup-backups"
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="tbgroup-backups"
NAMESPACE="tbgroup"

echo "🚀 Starting database backup..."
echo "================================"
echo "Date: $DATE"
echo "Namespace: $NAMESPACE"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

# Get database credentials
echo "📋 Getting database credentials..."
DB_HOST=$(kubectl get svc tbgroup-postgres -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
DB_PORT=$(kubectl get svc tbgroup-postgres -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')
DB_NAME=$(kubectl get secret tbgroup-secrets -n $NAMESPACE -o jsonpath='{.data.database_name}' | base64 -d)
DB_USER=$(kubectl get secret tbgroup-secrets -n $NAMESPACE -o jsonpath='{.data.database_user}' | base64 -d)
DB_PASSWORD=$(kubectl get secret tbgroup-secrets -n $NAMESPACE -o jsonpath='{.data.database_password}' | base64 -d)

# Get database pod
DB_POD=$(kubectl get pods -n $NAMESPACE -l app=tbgroup-postgres -o jsonpath='{.items[0].metadata.name}')

# Create database backup
echo "💾 Creating database backup..."
kubectl exec -n $NAMESPACE $DB_POD -- pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --verbose \
  --no-owner \
  --clean \
  --create \
  --if-exists \
  > $BACKUP_DIR/db_backup_$DATE.sql

echo "✅ Database backup created: db_backup_$DATE.sql"

# Compress backup
echo "🗜️  Compressing backup..."
gzip $BACKUP_DIR/db_backup_$DATE.sql
echo "✅ Backup compressed: db_backup_$DATE.sql.gz"

# Upload to S3
echo "☁️  Uploading to S3..."
aws s3 cp \
  $BACKUP_DIR/db_backup_$DATE.sql.gz \
  s3://$S3_BUCKET/database/ \
  --region eu-central-1 \
  --storage-class STANDARD_IA

echo "✅ Backup uploaded to s3://$S3_BUCKET/database/db_backup_$DATE.sql.gz"

# Create metadata file
cat > $BACKUP_DIR/metadata_$DATE.json << EOF
{
  "backup_date": "$DATE",
  "namespace": "$NAMESPACE",
  "database": {
    "host": "$DB_HOST",
    "port": "$DB_PORT",
    "name": "$DB_NAME",
    "user": "$DB_USER"
  },
  "backup_file": "db_backup_$DATE.sql.gz",
  "s3_location": "s3://$S3_BUCKET/database/db_backup_$DATE.sql.gz",
  "size": "$(stat -f%z $BACKUP_DIR/db_backup_$DATE.sql.gz 2>/dev/null || stat -c%s $BACKUP_DIR/db_backup_$DATE.sql.gz)",
  "checksum": "$(sha256sum $BACKUP_DIR/db_backup_$DATE.sql.gz | cut -d' ' -f1)"
}
EOF

# Upload metadata
aws s3 cp \
  $BACKUP_DIR/metadata_$DATE.json \
  s3://$S3_BUCKET/database/metadata/ \
  --region eu-central-1

echo "✅ Metadata uploaded: s3://$S3_BUCKET/database/metadata/metadata_$DATE.json"

# Clean up local files
echo "🧹 Cleaning up local files..."
rm -rf $BACKUP_DIR

# List recent backups
echo ""
echo "📊 Recent backups on S3:"
aws s3 ls s3://$S3_BUCKET/database/ --region eu-central-1 | tail -5

echo ""
echo "✅ Database backup completed successfully!"
