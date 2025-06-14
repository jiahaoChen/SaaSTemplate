# MindTube Deployment Guide

This guide provides step-by-step instructions for deploying the MindTube application, which transforms YouTube videos into interactive mind maps. The deployment process includes setting up Docker containers, configuring environment variables, and starting the application.

## Prerequisites

- [Docker](https://docs.docker.com/engine/install/) (Docker Engine, not Docker Desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A domain name (for production deployment)
- SSH access to your server (for remote deployment)

## Local Development Deployment

For local development and testing, follow these steps:

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd MindTube
```

### 2. Create Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# General
DOMAIN=localhost
STACK_NAME=mindtube-local
ENVIRONMENT=local
PROJECT_NAME=MindTube

# Frontend
DOCKER_IMAGE_FRONTEND=mindtube-frontend
FRONTEND_HOST=http://localhost:5173

# Backend
DOCKER_IMAGE_BACKEND=mindtube-backend
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost","http://localhost:8080"]

# Database
POSTGRES_SERVER=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changethis
POSTGRES_DB=app
POSTGRES_PORT=5432

# Security
SECRET_KEY=changethis

# Initial Admin User
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# Email
SMTP_HOST=mailcatcher
SMTP_PORT=1025
SMTP_TLS=false
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=info@example.com

# Optional: Monitoring
SENTRY_DSN=
```

### 3. Start the Application

Run the following command to start all services:

```bash
docker compose watch
```

This will start the following services:
- Backend API (FastAPI): http://localhost:8000
- Frontend (React): http://localhost:5173
- Database (PostgreSQL): localhost:5432
- Adminer (Database management): http://localhost:8080
- Traefik (Proxy): http://localhost:8090
- MailCatcher (Email testing): http://localhost:1080

### 4. Verify the Deployment

1. Open your browser and navigate to http://localhost:5173
2. You should see the MindTube frontend application
3. Test the API by visiting http://localhost:8000/docs

## Production Deployment

For production deployment, follow these steps:

### 1. Server Setup

1. Create a server with your preferred cloud provider (AWS, GCP, DigitalOcean, etc.)
2. Configure DNS records to point to your server's IP address
3. SSH into your server
4. Install Docker and Docker Compose

### 2. Traefik Setup (Public HTTPS)

Traefik will handle incoming connections and HTTPS certificates.

```bash
# Create a directory for Traefik
mkdir -p /root/code/traefik-public/

# Create a Docker network for Traefik
docker network create traefik-public

# Configure environment variables for Traefik
export USERNAME=admin
export PASSWORD=changethis
export HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD)
export DOMAIN=your-domain.com
export EMAIL=admin@your-domain.com

# Copy the Traefik Docker Compose file
# (You can copy the content of docker-compose.traefik.yml to the server)
nano /root/code/traefik-public/docker-compose.traefik.yml

# Start Traefik
cd /root/code/traefik-public/
docker compose -f docker-compose.traefik.yml up -d
```

### 3. Application Deployment

```bash
# Create a directory for your application
mkdir -p /root/code/mindtube/
cd /root/code/mindtube/

# Clone your repository
git clone <your-repository-url> .

# Create environment variables for production
cat > .env << EOL
# General
DOMAIN=your-domain.com
STACK_NAME=mindtube
ENVIRONMENT=production
PROJECT_NAME=MindTube

# Frontend
DOCKER_IMAGE_FRONTEND=mindtube-frontend
FRONTEND_HOST=https://dashboard.your-domain.com

# Backend
DOCKER_IMAGE_BACKEND=mindtube-backend
BACKEND_CORS_ORIGINS=["https://dashboard.your-domain.com"]

# Database
POSTGRES_SERVER=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -hex 32)
POSTGRES_DB=app
POSTGRES_PORT=5432

# Security
SECRET_KEY=$(openssl rand -hex 32)

# Initial Admin User
FIRST_SUPERUSER=admin@your-domain.com
FIRST_SUPERUSER_PASSWORD=$(openssl rand -hex 16)

# Email
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
EMAILS_FROM_EMAIL=info@your-domain.com

# Optional: Monitoring
SENTRY_DSN=your-sentry-dsn
EOL

# Deploy the application
docker compose -f docker-compose.yml up -d
```

### 4. Verify the Production Deployment

1. Open your browser and navigate to https://dashboard.your-domain.com
2. You should see the MindTube frontend application
3. Test the API by visiting https://api.your-domain.com/docs

## Deployment Script

You can use the following script to automate the deployment process:

```bash
#!/bin/bash

# Exit on error
set -e

# Check if running in production or staging
if [ "$1" == "production" ]; then
  export ENVIRONMENT=production
  export DOMAIN=your-domain.com
  export STACK_NAME=mindtube
elif [ "$1" == "staging" ]; then
  export ENVIRONMENT=staging
  export DOMAIN=staging.your-domain.com
  export STACK_NAME=mindtube-staging
else
  echo "Usage: $0 [production|staging]"
  exit 1
fi

# Generate a tag based on the current date and time
export TAG=$(date +%Y%m%d%H%M%S)

# Build the Docker images
docker compose -f docker-compose.yml build

# Generate the Docker stack file
docker compose -f docker-compose.yml config > docker-stack.yml

# Deploy the stack
docker stack deploy -c docker-stack.yml --with-registry-auth "${STACK_NAME}"

echo "Deployment completed successfully!"
echo "Frontend: https://dashboard.${DOMAIN}"
echo "Backend API: https://api.${DOMAIN}"
echo "API Documentation: https://api.${DOMAIN}/docs"
```

Save this script as `deploy.sh` and make it executable:

```bash
chmod +x deploy.sh
```

Then run it with:

```bash
./deploy.sh production  # For production deployment
./deploy.sh staging     # For staging deployment
```

## Debugging Docker Mindmap Creation Issues

If you encounter issues with mindmap creation in Docker, follow these steps:

1. Check the Docker container logs:

```bash
docker compose logs backend
```

2. Ensure all services are running:

```bash
docker compose ps
```

3. Verify database connectivity:

```bash
docker compose exec backend python -c "import app.db.session as db; print(db.SessionLocal().execute('SELECT 1').scalar())"
```

4. Check for background task errors:

```bash
docker compose exec backend python -c "from app.core.config import settings; from app.db.session import SessionLocal; from app.models.task import Task; db = SessionLocal(); print([{t.id: t.status} for t in db.query(Task).order_by(Task.created_at.desc()).limit(5)])"
```

5. Restart the backend service:

```bash
docker compose restart backend
```

## Maintenance

### Updating the Application

To update the application to the latest version:

```bash
git pull
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d
```

### Backup Database

To backup the PostgreSQL database:

```bash
docker compose exec db pg_dump -U postgres app > backup_$(date +%Y%m%d%H%M%S).sql
```

### Restore Database

To restore a database backup:

```bash
cat backup_file.sql | docker compose exec -T db psql -U postgres app
```

## Troubleshooting

### Common Issues

1. **Backend container exits immediately**
   - Check logs: `docker compose logs backend`
   - Ensure database connection is working
   - Verify environment variables are set correctly

2. **Frontend cannot connect to backend**
   - Check CORS settings in backend
   - Verify API URL in frontend environment variables

3. **Mindmap generation fails**
   - Check for YouTube API quota limits
   - Verify AI API keys are valid
   - Check for network connectivity issues

4. **Database connection errors**
   - Ensure PostgreSQL container is running
   - Check database credentials in environment variables

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the application logs: `docker compose logs`
2. Review the error messages in the browser console
3. Contact the development team or open an issue on the GitHub repository

## Conclusion

You have successfully deployed the MindTube application. The application is now accessible at the configured domain, and you can start creating mindmaps from YouTube videos.

For more information on using the application, refer to the [User Guide](README.md). 