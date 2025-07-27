#!/bin/bash

# Deployment Setup Script for AI Agent Dashboard
# This script helps set up the database and environment for deployment

set -e

echo "🚀 Setting up AI Agent Dashboard for deployment..."

# Check if environment variables are set
check_env_vars() {
    echo "📋 Checking required environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ ERROR: DATABASE_URL environment variable is not set"
        echo "Please set it to your PostgreSQL connection string:"
        echo "Example: postgresql://username:password@host:5432/database_name"
        exit 1
    fi
    
    if [ -z "$MONGODB_URI" ]; then
        echo "❌ ERROR: MONGODB_URI environment variable is not set"
        echo "Please set it to your MongoDB connection string:"
        echo "Example: mongodb://username:password@host:27017/database_name"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        echo "❌ ERROR: JWT_SECRET environment variable is not set"
        echo "Please set it to a secure random string (minimum 32 characters)"
        exit 1
    fi
    
    echo "✅ All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm ci --production=false
}

# Generate Prisma client
generate_prisma() {
    echo "🔧 Generating Prisma client..."
    npx prisma generate
}

# Run database migrations
run_migrations() {
    echo "🗃️ Running database migrations..."
    npx prisma migrate deploy
    
    echo "✅ Database migrations completed"
}

# Seed database (optional)
seed_database() {
    echo "🌱 Seeding database with initial data..."
    npm run db:seed || echo "⚠️ Seeding failed or no seed script found"
}

# Build application
build_app() {
    echo "🏗️ Building application..."
    npm run build
}

# Main execution
main() {
    check_env_vars
    install_dependencies
    generate_prisma
    run_migrations
    
    # Ask if user wants to seed the database
    read -p "Do you want to seed the database with initial data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        seed_database
    fi
    
    build_app
    
    echo ""
    echo "🎉 Deployment setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start your application with: npm start"
    echo "2. Check logs for any issues"
    echo "3. Verify database connectivity"
    echo ""
    echo "Environment:"
    echo "- DATABASE_URL: ${DATABASE_URL:0:20}..."
    echo "- MONGODB_URI: ${MONGODB_URI:0:20}..."
    echo "- NODE_ENV: $NODE_ENV"
}

# Run main function
main "$@"
