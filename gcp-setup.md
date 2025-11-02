# Google Cloud Platform Setup Guide

This guide will help you set up the Exit-Intent Popup Builder application on Google Cloud Platform.

## Prerequisites

1. Google Cloud Account with billing enabled
2. Google Cloud SDK installed locally
3. Docker installed (for local testing)

## Initial Setup

### 1. Create a Google Cloud Project

```bash
gcloud projects create exit-intent-popup --name="Exit Intent Popup Builder"
gcloud config set project exit-intent-popup
```

### 2. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### 3. Create Artifact Registry Repositories

```bash
# Create repositories for Docker images
gcloud artifacts repositories create exit-intent-popup-backend \
  --repository-format=docker \
  --location=us-central1 \
  --description="Backend Docker images"

gcloud artifacts repositories create exit-intent-popup-frontend \
  --repository-format=docker \
  --location=us-central1 \
  --description="Frontend Docker images"
```

### 4. Set Up Cloud SQL Database

```bash
# Create Cloud SQL instance
gcloud sql instances create exit-intent-popup-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=CHANGE_THIS_PASSWORD

# Create database
gcloud sql databases create exit_intent_popup \
  --instance=exit-intent-popup-db

# Get connection name (needed for Cloud Run)
gcloud sql instances describe exit-intent-popup-db --format='value(connectionName)'
```

### 5. Create Service Account for CI/CD

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding exit-intent-popup \
  --member="serviceAccount:github-actions@exit-intent-popup.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding exit-intent-popup \
  --member="serviceAccount:github-actions@exit-intent-popup.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding exit-intent-popup \
  --member="serviceAccount:github-actions@exit-intent-popup.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding exit-intent-popup \
  --member="serviceAccount:github-actions@exit-intent-popup.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@exit-intent-popup.iam.gserviceaccount.com
```

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. **GCP_PROJECT_ID**: Your GCP project ID (e.g., `exit-intent-popup`)
2. **GCP_SA_KEY**: The entire contents of `github-actions-key.json` file
3. **DATABASE_URL**: Your Cloud SQL connection string (format: `postgresql://user:password@/dbname?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME`)
4. **FRONTEND_URL**: Your frontend Cloud Run URL (will be set after first deployment)

## Database Connection for Cloud Run

The Cloud SQL connection string format for Cloud Run:

```
postgresql://USERNAME:PASSWORD@/DATABASE_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

Example:
```
postgresql://postgres:password@/exit_intent_popup?host=/cloudsql/exit-intent-popup:us-central1:exit-intent-popup-db
```

## Deploying via GitHub Actions

1. Push your code to the `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build Docker images
   - Push to Artifact Registry
   - Deploy to Cloud Run

## Manual Deployment (Alternative)

### Using Cloud Build

```bash
# Submit build
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_DATABASE_URL="your-database-url",_FRONTEND_URL="https://your-frontend-url.run.app"
```

### Using Docker and gcloud CLI

```bash
# Build and push backend
cd backend
docker build -t us-central1-docker.pkg.dev/exit-intent-popup/exit-intent-popup-backend/backend:latest .
docker push us-central1-docker.pkg.dev/exit-intent-popup/exit-intent-popup-backend/backend:latest

# Deploy backend
gcloud run deploy exit-intent-popup-backend \
  --image us-central1-docker.pkg.dev/exit-intent-popup/exit-intent-popup-backend/backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your-database-url" \
  --add-cloudsql-instances exit-intent-popup:us-central1:exit-intent-popup-db

# Build and push frontend
cd ../frontend
docker build --build-arg NEXT_PUBLIC_API_BASE_URL="https://backend-url.run.app" \
  -t us-central1-docker.pkg.dev/exit-intent-popup/exit-intent-popup-frontend/frontend:latest .
docker push us-central1-docker.pkg.dev/exit-intent-popup/exit-intent-popup-frontend/frontend:latest

# Deploy frontend
gcloud run deploy exit-intent-popup-frontend \
  --image us-central1-docker.pkg.dev/exit-intent-popup/exit-intent-popup-frontend/frontend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_BASE_URL="https://backend-url.run.app"
```

## Cloud Run Configuration

### Backend Service

- **Memory**: 512Mi
- **CPU**: 1
- **Timeout**: 300 seconds
- **Max Instances**: 10
- **Min Instances**: 0 (for cost savings)

### Frontend Service

- **Memory**: 512Mi
- **CPU**: 1
- **Timeout**: 300 seconds
- **Max Instances**: 10
- **Min Instances**: 0

## Monitoring and Logging

View logs in Cloud Console:

```bash
# Backend logs
gcloud run services logs read exit-intent-popup-backend --region=us-central1

# Frontend logs
gcloud run services logs read exit-intent-popup-frontend --region=us-central1
```

## Cost Optimization

1. Use Cloud SQL with smaller instance sizes for development
2. Set min instances to 0 to scale down when not in use
3. Use Cloud SQL Proxy for local development instead of always-on instance
4. Monitor usage in Cloud Console billing dashboard

## Troubleshooting

### Connection Issues

If you encounter database connection issues:

1. Ensure Cloud SQL instance has Cloud Run connector enabled
2. Verify connection string format
3. Check Cloud Run service account has Cloud SQL Client role

### Build Failures

1. Check Cloud Build logs in GCP Console
2. Verify all required APIs are enabled
3. Ensure service account has necessary permissions

### Deployment Issues

1. Check Cloud Run logs for application errors
2. Verify environment variables are set correctly
3. Ensure Docker images are built successfully


