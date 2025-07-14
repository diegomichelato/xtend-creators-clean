# Production Deployment Guide

## Deployment Platforms

### 1. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Environment variables needed:
- DATABASE_URL
- SENDGRID_API_KEY
- SENDGRID_VERIFIED_SENDER_EMAIL
- FRONTEND_URL

### 2. Render
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables in dashboard

### 3. Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy
```

## Required Environment Variables
```
DATABASE_URL=postgresql://...
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_VERIFIED_SENDER_EMAIL=no-reply@yourdomain.com
FROM_EMAIL=no-reply@yourdomain.com
FRONTEND_URL=https://your-frontend.com
NODE_ENV=production
SESSION_SECRET=your-secure-secret
```

## Health Check Endpoints
- GET /health - Basic health status
- GET /health/detailed - Comprehensive system check

## Database Setup
Ensure your production database has all required tables and columns.
The system will automatically validate schema on startup.