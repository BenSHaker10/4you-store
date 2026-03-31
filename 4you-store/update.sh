#!/bin/bash
cd /home/4you-store
echo "Pulling latest changes from GitHub..."
git pull origin main
echo "Installing dependencies..."
pnpm install
echo "Building project..."
pnpm build
echo "Restarting application..."
pm2 restart 4you-store
echo "Update complete!"
