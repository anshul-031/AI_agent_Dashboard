# Database Deployment Troubleshooting Guide

## The Problem
You're getting "Unable to open the database file" error because your application is configured to use SQLite (file-based database) in production, but deployment environments typically don't allow file system writes.

## Solution: Switch to PostgreSQL for Production

### 1. Updated Configuration
✅ **Prisma Schema Updated**: Changed from SQLite to PostgreSQL
✅ **Migration Files Created**: Database schema ready for PostgreSQL
✅ **Scripts Updated**: Added production-ready commands

### 2. Environment Variables Required

Set these environment variables in your deployment platform:

```bash
# PostgreSQL Database (Required)
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# MongoDB for Flowcharts (Required)
MONGODB_URI="mongodb://username:password@host:27017/database_name"

# Security (Required)
JWT_SECRET="your-secure-secret-key-minimum-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Application URL (Required)
NEXTAUTH_URL="https://your-domain.com"

# Environment
NODE_ENV="production"
```

### 3. Deployment Steps

#### Option A: Using the Deployment Script
```bash
# 1. Set environment variables (see above)
# 2. Run the deployment setup script
chmod +x scripts/deploy-setup.sh
./scripts/deploy-setup.sh
```

#### Option B: Manual Steps
```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate deploy

# 4. Build application
npm run build

# 5. Start application
npm start
```

### 4. Platform-Specific Instructions

#### Vercel
1. Go to your project settings
2. Add environment variables in the "Environment Variables" section
3. Redeploy your application

#### Netlify
1. Go to Site Settings > Environment Variables
2. Add the required variables
3. Trigger a new deployment

#### Railway
1. Add environment variables in the project settings
2. Railway will auto-redeploy

#### Heroku
```bash
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set MONGODB_URI="mongodb://..."
heroku config:set JWT_SECRET="your-secret"
heroku config:set NEXTAUTH_SECRET="your-secret"
heroku config:set NEXTAUTH_URL="https://your-app.herokuapp.com"
```

### 5. Database Setup

#### PostgreSQL Options
- **Free Options**: Supabase, Railway, Neon
- **Paid Options**: AWS RDS, Google Cloud SQL, Azure Database

#### MongoDB Options
- **Free Options**: MongoDB Atlas (512MB free tier)
- **Paid Options**: MongoDB Atlas, AWS DocumentDB

### 6. Testing the Fix

After deployment, check these endpoints:
- `https://your-domain.com/api/auth/login` - Should not throw database errors
- `https://your-domain.com/api/agents` - Should connect to database
- Check application logs for any remaining database connection issues

### 7. Common Issues & Solutions

#### Issue: "Connection refused"
**Solution**: Check if DATABASE_URL is accessible from your deployment environment

#### Issue: "Authentication failed"
**Solution**: Verify username/password in DATABASE_URL

#### Issue: "SSL required"
**Solution**: Add `?sslmode=require` to your DATABASE_URL

#### Issue: "Database does not exist"
**Solution**: Create the database first, then run migrations

### 8. Rollback Plan

If you need to quickly rollback to SQLite for testing:

```bash
# Temporarily switch back to SQLite (NOT for production)
# Edit prisma/schema.prisma:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

# Then run:
npx prisma generate
npx prisma db push
```

### 9. Monitoring

After deployment, monitor:
- Application logs for database connection errors
- Database connection metrics
- Response times for database queries

### 10. Performance Optimization

For production:
- Enable connection pooling in DATABASE_URL
- Set appropriate timeout values
- Consider read replicas for heavy read workloads

## Need Help?

If you're still experiencing issues:
1. Check the application logs in your deployment platform
2. Verify all environment variables are set correctly
3. Test database connectivity independently
4. Ensure your database server allows connections from your deployment platform's IP range
