#!/bin/bash

# DEK Dashboard Deployment Script
# This script helps deploy the dashboard to production

set -e  # Exit on any error

echo "🚀 Starting DEK Dashboard deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Check required environment variables
echo "🔍 Checking environment variables..."
required_vars=("NEXTAUTH_SECRET" "DATABASE_URL" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ Environment variables check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed database if needed
echo "🌱 Seeding database..."
npm run seed

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "To start the production server, run:"
echo "npm start"
echo ""
echo "The application will be available at: $NEXTAUTH_URL"
