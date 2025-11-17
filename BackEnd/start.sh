#!/bin/sh
echo "🚀 Starting Sampling Inspection Control System Backend..."

# Apply migrations (if any)
# npm run migrate

# Start the Node app
exec node dist/server.js