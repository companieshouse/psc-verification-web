#!/bin/bash
#
# Start script for PSC verification web
PORT=3000
export NODE_PORT=${PORT}
exec node -r ./dist/otel.js httpserver.js -- ${PORT}