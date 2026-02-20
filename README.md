# Creator-spot (By: FanzoftheOne)

Monorepo with **FastAPI + Postgres** backend and **Next.js** frontend.

## Repo layout

- `backend/` = FastAPI API (`/api/*`)
- `frontend/` = Next.js UI

---

## Backend (Railway)

### Railway service settings

- **Root Directory:** `backend`
- **Start Command:** `sh -lc "./start.sh"`

### Backend environment variables (Railway)

- `DATABASE_URL` = Railway Postgres connection string
- `JWT_SECRET` = long random string
- `CORS_ORIGINS` = comma-separated list of allowed front-end origins
  - Example: `https://your-app.vercel.app,https://yourdomain.com`
- Optional: `CORS_ORIGIN_REGEX` = allow preview URLs (example: `https://.*\\.vercel\\.app`)

Health checks:
- `GET /health`
- `GET /api/health`

---

## Frontend (Vercel)

### Vercel project settings

- **Root Directory:** `frontend`

### Frontend environment variables (Vercel)

- `NEXT_PUBLIC_API_URL` = backend base URL (NO `/api` suffix)
  - Example: `https://your-railway-domain.up.railway.app`

---

## Local run

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB"
export JWT_SECRET="change-me"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```
