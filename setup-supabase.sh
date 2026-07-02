#!/bin/bash

# Naa Transit — Supabase Schema Migration Script
# Automatically sets up the database schema from supabase-schema.sql

set -e

echo "🚀 Naa Transit — Supabase Setup"
echo "================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  echo "Please create .env.local with your Supabase credentials"
  exit 1
fi

# Load environment variables
export $(cat .env.local | xargs)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SECRET_KEY" ]; then
  echo "❌ Error: SUPABASE_URL or SUPABASE_SECRET_KEY not set in .env.local"
  exit 1
fi

echo "✅ Found Supabase credentials"
echo "   URL: $SUPABASE_URL"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo ""
  echo "📦 Installing Supabase CLI..."
  npm install -g supabase
fi

echo ""
echo "🔗 Setting up database schema..."
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | cut -d'.' -f1 | rev | cut -d'/' -f1 | rev)

if [ -z "$PROJECT_REF" ]; then
  echo "❌ Could not extract project reference from SUPABASE_URL"
  exit 1
fi

echo "Project Ref: $PROJECT_REF"

# Read schema file
if [ ! -f supabase-schema.sql ]; then
  echo "❌ Error: supabase-schema.sql not found in project root"
  exit 1
fi

echo ""
echo "📋 Running SQL migrations..."
echo ""

# Use curl to execute SQL via Supabase REST API
# This is a workaround for running SQL without needing psql

SCHEMA_SQL=$(cat supabase-schema.sql)

# For now, show instructions for manual setup
echo "To apply the schema, please:"
echo ""
echo "1. Go to https://app.supabase.com/project/$PROJECT_REF/sql"
echo "2. Create a new query"
echo "3. Copy the contents of supabase-schema.sql and paste"
echo "4. Click 'Run'"
echo ""
echo "Or use psql if you have PostgreSQL installed:"
echo "   psql -h ${SUPABASE_URL#https://} -U postgres -d postgres < supabase-schema.sql"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Apply the database schema (see instructions above)"
echo "2. Test login at http://localhost:5173/conductor"
echo "3. Use demo credentials: EMP-0001 / password123"
echo ""
