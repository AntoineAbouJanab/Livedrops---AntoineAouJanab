# Week 5 Deployment Guide

## Overview
- Backend: Render (Free Web Service) running `apps/api`
- Database: MongoDB Atlas (M0)
- Frontend: Vercel serving `apps/storefront`
- LLM: Week 3 Colab notebook exposed via ngrok with a new `/generate` endpoint

---

## Prerequisites
- GitHub repo connected to Render and Vercel
- MongoDB Atlas account (M0 tier)
- Free ngrok account to expose your Colab service

---

## 1) MongoDB Atlas (Required)
1. Create an M0 cluster and a database user.
2. Network Access: allow `0.0.0.0/0` during development.
3. Copy your SRV connection string to `MONGODB_URI`.
4. Default database is `shoplite` (override via `DB_NAME`).

---

## 2) Seed Data (Required)
1. From `apps/api`, duplicate `.env.example` to `.env` and set:
   ```env
   MONGODB_URI=<your MongoDB SRV URI>
   DB_NAME=shoplite
   # For dev you may keep CORS_ORIGIN=*
   ```
2. Install deps and seed:
   ```bash
   cd apps/api
   npm install
   npm run seed
   ```
3. Minimum dataset:
   - Customers: 10–15 (includes `demo@example.com`)
   - Products: 20–30
   - Orders: 15–20

---

## 3) Backend Deployment (Render)
Use the root `render.yaml` (recommended) or configure manually.

### Option A: Use `render.yaml`
- Create a new Web Service from your GitHub repo; Render auto-detects `render.yaml`.
- After the service is created, set environment variables in the Render dashboard.

### Option B: Manual setup
- Service Type: Web Service
- Root Directory: `apps/api`
- Build Command: `npm ci` (or `npm install`)
- Start Command: `npm start`
- Health Check Path: `/health`

### Environment Variables (Render → Dashboard → Environment)
```env
PORT=8080
MONGODB_URI=<your Atlas SRV URI>
DB_NAME=shoplite
CORS_ORIGIN=https://livedrops-antoine-aou-janab-9h14.vercel.app/

# Optional LLM integration
LLM_BASE_URL=https://norine-interplanetary-unstupidly.ngrok-free.dev
# Optional: cap LLM latency (ms)
LLM_TIMEOUT_MS=5000


---

## 4) Frontend Deployment (Vercel)
1. New Project → import your GitHub repo.
2. Root Directory: `apps/storefront`.
3. Framework Preset: Vite.
4. Build Command:
   ```bash
   npm run build
   ```
5. Output Directory:
   ```
   dist
   ```
6. Environment Variables (Vercel → Settings → Environment):
   ```env
   VITE_API_BASE_URL=https://livedrops-antoineaoujanab.onrender.com
   ```

Note: The app uses hash routing, so no rewrites are required.

---

## 5) LLM Endpoint (Colab + ngrok)

### a) Setup in Colab
Open `notebooks/llm-deployment.ipynb` (Week 3) and add a new endpoint for Week 5.

### b) Example Flask endpoint
```python
@app.post("/generate")
def generate_endpoint():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt") or data.get("question") or ""
    if not prompt:
        return jsonify({"error": "Missing 'prompt'"}), 400

    text = generate_response(prompt, max_new_tokens=int(data.get("max_new_tokens", 160)))
    return jsonify({"output": text}), 200
```

The backend will POST `<LLM_BASE_URL>/generate` and accepts either `{ output }` or `{ text }`.

### c) Expose via ngrok
1. Start ngrok in Colab after launching Flask:
   ```bash
   !ngrok http 5000
   ```
2. Copy the public base URL (e.g., `https://abcd1234.ngrok.io`).
3. In Render env vars, set `LLM_BASE_URL` to that URL and redeploy.

---

## 6) Environment Variables (Summary)

| Service | Variable | Example / Notes |
|---|---|---|
| Backend | `MONGODB_URI` | Atlas SRV string |
|  | `PORT` | 8080 (default) |
|  | `DB_NAME` | `shoplite` |
|  | `CORS_ORIGIN` | Comma-separated origins; `*` for dev |
|  | `LLM_BASE_URL` | ngrok URL from Colab (optional) |
|  | `LLM_TIMEOUT_MS` | LLM call timeout in ms (optional) |
| Frontend | `VITE_API_BASE_URL` | Public API base URL |

---

## 7) Run Locally (End-to-End)

### Backend
```bash
cd apps/api
npm install
# duplicate .env.example → .env and fill MONGODB_URI (and optionally DB_NAME, CORS_ORIGIN, LLM_* )
npm run seed
npm run dev   # or: npm start
```
Health check: `http://localhost:8080/health`

### Frontend
```bash
cd apps/storefront
npm install
# duplicate .env.example → .env and set VITE_API_BASE_URL=http://localhost:8080
npm run dev
```
Open the printed localhost URL.

### LLM (optional)
1. Run the Colab notebook.
2. Ensure `/generate` exists.
3. Start ngrok and copy its public URL.
4. Add `LLM_BASE_URL` to `apps/api/.env`.
5. Restart the backend.

---

## 8) Verify After Deploy
- API health: `GET /health` should return `{ ok: true }`.
- Customers: `GET /api/customers?email=demo@example.com` returns the seeded user.
- Products: `GET /api/products` returns seeded items.
- Orders SSE: open `#/order/:id` in the storefront to watch `/api/orders/:id/stream` updates.
- Assistant: ask a policy question in “Ask Support”; citations like `[Qxx]` appear when matched.

If you see "LLM offline; backing off 60s" in logs, your `LLM_BASE_URL` is not reachable—this only affects assistant small talk/policy fallback.

