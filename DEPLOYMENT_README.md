# MindTube Deployment Guide

This document provides instructions for deploying the MindTube application, which transforms YouTube videos into interactive mind maps.

## Quick Start

The easiest way to deploy MindTube is using the provided deployment script:

```bash
# Setup the environment
./deploy_mindtube.sh setup

# Start the application
./deploy_mindtube.sh start
```

## Deployment Script Usage

The `deploy_mindtube.sh` script provides several commands to manage your MindTube deployment:

```bash
Usage: ./deploy_mindtube.sh [options] [command]

Options:
  -e, --env ENV      Environment (local, staging, production) [default: local]
  -d, --domain DOMAIN Domain name [default: localhost]
  -h, --help         Show this help message

Commands:
  setup              Setup initial environment
  start              Start all services
  stop               Stop all services
  restart            Restart all services
  logs               Show logs
  status             Show status of services
  backup             Backup the database
  restore FILE       Restore database from FILE
  debug              Run debug commands for mindmap creation issues
```

### Examples

```bash
# Setup local environment
./deploy_mindtube.sh setup

# Start local environment
./deploy_mindtube.sh start

# Setup production environment with custom domain
./deploy_mindtube.sh -e production -d example.com setup

# Start production environment
./deploy_mindtube.sh -e production start

# View logs
./deploy_mindtube.sh logs

# Backup database
./deploy_mindtube.sh backup

# Restore database from backup
./deploy_mindtube.sh restore backup_20230101120000.sql

# Debug mindmap creation issues
./deploy_mindtube.sh debug
```

## Manual Deployment

If you prefer to deploy manually, refer to the detailed instructions in [deployment_guide.md](deployment_guide.md).

## Debugging Mindmap Creation Issues

If you encounter issues with mindmap creation, you can use the debug command:

```bash
./deploy_mindtube.sh debug
```

This will:
1. Check backend logs
2. Show service status
3. Verify database connectivity
4. Check recent tasks

## Environment Variables

The deployment script will create a `.env` file with default values. You can modify this file to customize your deployment.

Key environment variables:

- `DOMAIN`: Domain name for your deployment
- `ENVIRONMENT`: Deployment environment (local, staging, production)
- `POSTGRES_PASSWORD`: PostgreSQL database password
- `SECRET_KEY`: Secret key for JWT token generation
- `FIRST_SUPERUSER`: Email for the initial admin user
- `FIRST_SUPERUSER_PASSWORD`: Password for the initial admin user

## Accessing the Application

After deployment, you can access the application at:

- Local: http://localhost:5173
- Production: https://dashboard.your-domain.com

The API documentation is available at:

- Local: http://localhost:8000/docs
- Production: https://api.your-domain.com/docs

## Troubleshooting

If you encounter issues during deployment, refer to the troubleshooting section in [deployment_guide.md](deployment_guide.md).

For more specific issues with mindmap creation, use the debug command:

```bash
./deploy_mindtube.sh debug
```

## Support

If you need further assistance, please contact the development team or open an issue on the GitHub repository. 