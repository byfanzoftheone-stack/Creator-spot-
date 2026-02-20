#!/usr/bin/env sh
set -e

# Railway/Vercel-friendly start script.
# Run from the backend directory:
#   sh -lc "./start.sh"

exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
