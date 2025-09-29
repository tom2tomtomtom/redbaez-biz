#!/bin/bash

# Sync Netlify environment variables to local .env file
# This script pulls all VITE_* variables from Netlify and saves them locally

echo "🔄 Syncing environment variables from Netlify..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if project is linked to Netlify
if [ ! -d ".netlify" ]; then
    echo "⚠️  Project not linked to Netlify. Running 'netlify link'..."
    netlify link
fi

# Create backup of existing .env
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "📦 Backed up existing .env file"
fi

# Pull environment variables and save to .env
echo "📥 Pulling variables from Netlify..."
netlify env:import .env

echo "✅ Environment variables synced successfully!"
echo ""
echo "Variables available in .env file. You can now run:"
echo "  npm run dev"
echo ""
