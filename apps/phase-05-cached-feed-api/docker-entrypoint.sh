#!/bin/sh
set -eu

echo "Running prisma migrate deploy..."
if [ -x "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma
elif command -v prisma >/dev/null 2>&1; then
  prisma migrate deploy --schema=./prisma/schema.prisma
else
  npx prisma migrate deploy --schema=./prisma/schema.prisma
fi

echo "Starting Cached Feed API on PORT=${PORT:-3005}..."
exec node dist/server.js
