#!/bin/bash

# Bidly Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 Bidly Deployment Script"
echo "=========================="
echo ""

# Check if Convex is initialized
if [ ! -f "convex.json" ]; then
    echo "❌ Convex not initialized!"
    echo ""
    echo "Please run this command first:"
    echo "  npx convex dev"
    echo ""
    echo "After Convex is initialized, run this script again."
    exit 1
fi

echo "✅ Convex configuration found"
echo ""

# Step 1: Deploy Convex
echo "📦 Step 1: Deploying Convex backend..."
npx convex deploy --yes

echo ""
echo "✅ Convex deployed!"
echo ""

# Get Convex URL from .env.local
if [ -f ".env.local" ]; then
    CONVEX_URL=$(grep "NEXT_PUBLIC_CONVEX_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ ! -z "$CONVEX_URL" ]; then
        echo "📋 Your Convex URL: $CONVEX_URL"
        echo ""
        echo "⚠️  IMPORTANT: Make sure to add this to Vercel environment variables:"
        echo "   NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL"
        echo ""
    fi
fi

# Step 2: Deploy to Vercel
echo "🌐 Step 2: Deploying to Vercel..."
echo ""
echo "⚠️  Make sure you've set all environment variables in Vercel dashboard first!"
echo "   Go to: https://vercel.com/majostechs-projects/bidly/settings/environment-variables"
echo ""
read -p "Have you set all environment variables in Vercel? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please set environment variables first, then run this script again."
    exit 1
fi

echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your app should be live at: https://bidly-*.vercel.app"
echo ""
echo "Next steps:"
echo "1. Configure Clerk domain in Clerk dashboard"
echo "2. Test your deployment"
echo "3. Set up custom domain (optional)"




