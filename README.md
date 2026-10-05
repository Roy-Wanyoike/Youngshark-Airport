# Youngshark Airport

Multi-service web application: an Angular 19 frontend (with SSR), an Express
backend backed by SQL Server, and a cron-triggered email service — all deployed
to Vercel as a single project using [Vercel Services](https://vercel.com/docs/services).

## Repository layout

```
.
├── vercel.json                              # Service + binding + rewrite definitions
├── lighthouserc.json                        # Lighthouse CI thresholds
├── .github/workflows/
│   ├── build.yml                            # Build verification for all services
│   └── lighthouse.yml                       # Lighthouse CI on PRs
├── Airport-Frontend/                        # Modernized Angular 19 frontend (SSR enabled)
└── Backend_Development-master/
    ├── Airport/                             # Legacy Angular 15 SPA (kept for reference)
    ├── Airport-ssr/                         # Legacy Angular 15 SSR (kept for reference)
    ├── backend/                             # Express + SQL Server API
    └── BackgroundService/                   # Cron-triggered email service
```

## Services (Vercel)

| Service            | Root                                  | Framework | Public? | Bindings                |
|--------------------|---------------------------------------|-----------|---------|-------------------------|
| `airport-frontend` | `Airport-Frontend`                    | angular   | yes `/` | → `backend` (`BACKEND_URL`) |
| `airport`          | `Backend_Development-master/Airport`  | angular   | no      | → `backend` (`BACKEND_URL`) |
| `airport-ssr`      | `Backend_Development-master/Airport-ssr` | angular | no      | → `backend` (`BACKEND_URL`) |
| `backend`          | `Backend_Development-master/backend`  | express   | yes `/api/auth/*`, `/api/flights*` | — |
| `backgroundservice` | `Backend_Development-master/BackgroundService` | express | yes `/api/cron/emails` (cron only) | — |

### Public routing

| Path                  | Service             | Notes                                   |
|-----------------------|---------------------|-----------------------------------------|
| `/api/auth/*`         | `backend`           | Auth endpoints (register, login)       |
| `/api/flights*`       | `backend`           | Booking CRUD                            |
| `/api/cron/emails`    | `backgroundservice` | Invoked by Vercel Cron every 10 minutes |
| `/api/health`         | `backend` or `airport-frontend` | Health probe                 |
| `/*` (everything else) | `airport-frontend` | SSR-rendered Angular app                |

### Bindings

```text
airport-frontend ──BACKEND_URL──> backend
airport          ──BACKEND_URL──> backend
airport-ssr      ──BACKEND_URL──> backend
```

The backend service is **publicly reachable** via `/api/*` rewrites, and also
**internally reachable** from the three Angular services via the `BACKEND_URL`
env var that Vercel injects.

## Local development

### Frontend (Angular 19 with SSR)

```bash
cd Airport-Frontend
npm install
npm start        # serves on http://localhost:4200 (HMR)
```

For SSR dev:
```bash
npm run dev:ssr
```

### Backend (Express + SQL Server)

```bash
cd Backend_Development-master/backend
cp .env.example .env       # fill in DB credentials
npm install
npm run build              # compiles TypeScript → dist/
npm start                  # runs nodemon + tsc -w on :4002
```

### Background service

```bash
cd Backend_Development-master/BackgroundService
cp .env.example .env       # fill in DB + SMTP credentials
npm install
npm run build
npm start                  # serves on :4002, exposes POST /api/cron/emails
```

To trigger an email sweep locally:
```bash
curl -X POST http://localhost:4002/api/cron/emails
```

## Deploy to Vercel

### 1. Prerequisites

- A Vercel account
- A SQL Server database reachable from Vercel (Azure SQL recommended —
  the docker-compose `mcr.microsoft.com/mssql/server` image only works locally)
- (Optional) An SMTP account (Gmail with an app password works)

### 2. Import the repo

```bash
# From the repo root, after pushing to GitHub:
npx vercel link
npx vercel --prebuilt=false  # Vercel auto-detects services from vercel.json
```

Or via the Vercel dashboard: "New Project" → import the GitHub repo → Vercel
reads `vercel.json` and configures all 5 services automatically.

### 3. Set environment variables

Set these in **Vercel → Project Settings → Environment Variables** (or via
`vercel env`):

#### `backend` + `backgroundservice` (both need DB access)

| Variable       | Example                              | Description                       |
|----------------|--------------------------------------|-----------------------------------|
| `DB_HOST`      | `myapp-sql.database.windows.net`     | SQL Server hostname               |
| `DB_PORT`      | `1433`                               | SQL Server port                   |
| `DB_USER`      | `youngshark_admin`                   | SQL auth username                 |
| `DB_PWD`       | `••••••••••`                         | SQL auth password                 |
| `DB_NAME`      | `AirportDB`                          | Database name                     |
| `DB_ENCRYPT`   | `true`                               | `true` for Azure SQL (TLS)        |
| `DB_TRUST`     | `false`                              | `true` for local self-signed certs|
| `SECRETKEY`    | `long-random-string`                 | JWT signing secret (backend only) |

#### `backgroundservice` only

| Variable   | Example              | Description                |
|------------|----------------------|----------------------------|
| `EMAIL`    | `you@gmail.com`      | SMTP username              |
| `PASSWORD` | `gmail-app-password` | SMTP password (app password) |

### 4. Deploy

```bash
vercel --prod
```

Vercel builds each service independently per `vercel.json`, provisions the
bindings, and sets up the rewrites + cron. Your project is live at
`https://<your-project>.vercel.app`.

### 5. Verify

```bash
# Health checks
curl https://<your-project>.vercel.app/api/health        # backend
curl https://<your-project>.vercel.app/                  # SSR HTML

# Auth flow
curl -X POST https://<your-project>.vercel.app/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"Name":"Test","Email":"t@example.com","Password":"Test!1234"}'
```

## Lighthouse CI

`lighthouserc.json` defines thresholds that fail the GitHub Action on PRs:

| Category        | Threshold | Severity |
|-----------------|-----------|----------|
| Performance     | ≥ 0.85    | warn    |
| Accessibility   | ≥ 0.95    | error   |
| Best Practices  | ≥ 0.90    | warn    |
| SEO             | ≥ 0.90    | warn    |

The action runs on every PR to `main`. Lighthouse reports are uploaded to
temporary public storage for review.

## Notes & limitations

- **Vercel Cron free tier**: 1 cron job per project on the Hobby plan. We use
  one (`*/10 * * * *` → `/api/cron/emails`).
- **SQL Server on Vercel**: Vercel functions can connect to external SQL Server
  instances (Azure SQL recommended). The `mssql` package uses TCP which works
  fine from Vercel's Node.js runtime.
- **SSR + NgRx**: The booking list's `getBookings` effect fires on the server
  during SSR. Without a valid token, it will 401 — the loading skeleton
  renders, then the client hydrates and re-fetches with the user's token.
  Future improvement: use TransferState to cache the SSR response.
- **Legacy `Airport` and `Airport-ssr`**: These are the original Angular 15
  frontend variants. They're wired as internal services (no public rewrites)
  so you can deploy them experimentally without exposing them publicly. To
  switch the public frontend to one of them, change the catch-all rewrite in
  `vercel.json` from `airport-frontend` to the desired service.
