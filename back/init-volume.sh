#!/bin/sh

# Sync seed images to the persistent volume
# The volume is mounted at /app/back/public/upload
# The seed copy is at /app/back/upload_seed

SEED_DIR="/app/back/upload_seed"
VOLUME_DIR="/app/back/public/upload"

if [ -d "$SEED_DIR" ]; then
    echo "Syncing seed images to volume..."
    # -n: don't overwrite existing files
    # -r: recursive
    # -u: update only (skip newer files in destination)
    cp -rn "$SEED_DIR"/* "$VOLUME_DIR"/ 2>/dev/null || true
    echo "Seed sync complete."
fi

echo "Starting backend..."
cd /app/back
node index.js
