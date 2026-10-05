# Youngshark Airport

A modernised flight-booking application deployed on **Vercel** as a single
project with two services:

- **`web`** — Angular 19 frontend (SSR-enabled, modern UI/UX from PR #19)
- **`api`** — Consolidated Express API (auth + flights CRUD + cron emailer)

## Repository layout

```
.
├── apps/
│   ├── web/                  # Angular 19 frontend (SSR via @angular/ssr)
│   │   ├── src/
│   │   │   ├── app/          # Components, services, state (NgRx)
│   │   │   ├── server.ts     # SSR Express entrypoint
│   │   │   └── ...
│   │   ├── angular.json
│   │   └── package.json
│   └── api/                  # Consolidated Express API
│       ├── src/
│       │   ├── config/        # Environment config
│       │   ├── schemas/       # Joi validators
│       │   ├── middleware/     # verifyToken
│       │   ├── services/       # db, jwt, email (cron)
│       │   ├── controllers/    # auth, flights, cron
│       │   ├── routes/         # auth, flights, cron
│       │   ├── templates/      # EJS email templates
│       │   ├── types/          # Shared TypeScript interfaces
│       │   └── server.ts       # Express entrypoint
│       ├── db/                # SQL DDL + stored procedures
│       │   ├── tables/
│       │   └── stored-procedures/{user,booking}/
│       └── package.json
├── archive/
│   └── legacy-frontend-variants/   # Original Angular 15 SPA + SSR (not deployed)
├── vercel.json              # Service + binding + rewrite definitions
├── lighthouserc.json        # Lighthouse CI thresholds
└── .github/workflows/        # CI: build + Lighthouse
```

## Vercel services

| Service | Root       | Framework | Public route                                      | Bindings                  |
|---------|------------|-----------|---------------------------------------------------|---------------------------|
| `web`   | `apps/web` | angular   | `/*` (catch-all)                                  | → `api` (`BACKEND_URL`)   |
| `api`   | `apps/api` | express   | `/api/auth/*`, `/api/flights*`, `/api/cron/*`, `/api/health` | — |

### Bindings

```text
web  ──[BACKEND_URL]──>  api
```

### Public routing

| Path                  | Service | Notes                                       |
|-----------------------|---------|---------------------------------------------|
| `/api/auth/*`         | `api`   | `POST /register`, `POST /login`, `GET /home`|
| `/api/flights*`       | `api`   | Booking CRUD (token-authenticated)         |
| `/api/cron/emails`    | `api`   | Invoked by Vercel Cron every 10 minutes    |
| `/api/health`         | `api`   | Health probe (also served by `web`)         |
| `/*` (everything else)| `web`   | SSR-rendered Angular app                    |

### Vercel Cron

```json
"crons": [
  { "path": "/api/cron/emails", "schedule": "*/10 * * * *" }
]
```

The original `BackgroundService` used `node-cron` (every 10 seconds) — that
doesn't fit Vercel's request-scoped functions. The endpoint is now an HTTP
handler invoked by Vercel Cron every 10 minutes.

## Local development

### Web (Angular 19 with SSR)

```bash
cd apps/web
npm install
npm start          # serves on http://localhost:4200 (HMR + SSR)
```

### API (Express + SQL Server + cron emailer)

```bash
cd apps/api
cp .env.example .env       # fill in DB + SMTP credentials
npm install
npm run dev                # tsx watch on :4002 (HMR)
# or: npm run build && npm start
```

Verify the API:
```bash
curl http://localhost:4002/api/health
# {"ok":true,"service":"api","ts":...,"db":"connected"}
```

Trigger an email sweep manually:
```bash
curl -X POST http://localhost:4002/api/cron/emails
```

## Deploy to Vercel

### 1. Prerequisites

- A Vercel account
- A SQL Server database reachable from Vercel (Azure SQL recommended — the
  docker-compose `mcr.microsoft.com/mssql/server` image only works locally)
- (Optional) An SMTP account (Gmail with an app password works)

### 2. Import the repo

Vercel reads `vercel.json` and auto-configures both services. Either:

```bash
npx vercel link
npx vercel --prod
```

Or via the Vercel dashboard: "New Project" → import the GitHub repo.

### 3. Set environment variables

Set these in **Vercel → Project Settings → Environment Variables** (or via
`vercel env`). The `api` service needs the DB + SMTP + JWT variables; the
`web` service only needs the `BACKEND_URL` binding (auto-injected).

| Variable        | Example                              | Service | Description                       |
|-----------------|--------------------------------------|---------|-----------------------------------|
| `DB_HOST`       | `myapp-sql.database.windows.net`     | `api`   | SQL Server hostname               |
| `DB_PORT`       | `1433`                               | `api`   | SQL Server port                   |
| `DB_USER`       | `youngshark_admin`                   | `api`   | SQL auth username                 |
| `DB_PWD`        | `••••••••••`                         | `api`   | SQL auth password                 |
| `DB_NAME`       | `AirportDB`                          | `api`   | Database name                     |
| `DB_ENCRYPT`    | `true`                               | `api`   | `true` for Azure SQL (TLS)        |
| `DB_TRUST`      | `false`                              | `api`   | `true` for local self-signed certs|
| `JWT_SECRET`    | `long-random-string`                 | `api`   | JWT signing secret                |
| `SMTP_HOST`     | `smtp.gmail.com`                     | `api`   | SMTP server                       |
| `SMTP_PORT`     | `587`                                | `api`   | SMTP port                         |
| `SMTP_USER`     | `you@gmail.com`                      | `api`   | SMTP username                     |
| `SMTP_PASS`     | `gmail-app-password`                 | `api`   | SMTP password (app password)      |
| `SMTP_FROM`     | `you@gmail.com`                      | `api`   | From address                      |

### 4. Deploy

```bash
vercel --prod
```

### 5. Verify

```bash
# Health checks
curl https://<your-project>.vercel.app/api/health
curl https://<your-project>.vercel.app/

# Auth flow
curl -X POST https://<your-project>.vercel.app/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"Name":"Test","Email":"t@example.com","Password":"Test!1234","ConfirmPassword":"Test!1234"}'
```

## Lighthouse CI

`lighthouserc.json` defines thresholds that fail the GitHub Action on PRs:

| Category        | Threshold | Severity |
|-----------------|-----------|----------|
| Performance     | ≥ 0.85    | warn    |
| **Accessibility** | **≥ 0.95** | **error** |
| Best Practices  | ≥ 0.90    | warn    |
| SEO             | ≥ 0.90    | warn    |

## Backend architecture

The API follows a clean layered architecture:

```text
src/server.ts                  # Express entry — mounts routes, starts server
src/routes/                    # Route definitions (auth, flights, cron)
  └── *.routes.ts
src/controllers/               # Request handlers — orchestrate services, format responses
  └── *.controller.ts
src/middleware/                # Express middleware (verifyToken)
  └── auth.ts
src/services/                  # Business logic + I/O (db, jwt, email)
  ├── db.ts                     # mssql connection pool + exec/query helpers
  ├── jwt.ts                    # sign/verify
  └── email.ts                  # Cron-triggered welcome email sweep
src/schemas/                   # Joi validation schemas
src/config/                    # Environment-driven config
src/types/                      # Shared TypeScript interfaces
src/templates/                 # EJS email templates
```

**Why this structure?**

- **Single responsibility** — each file does one thing (routes define HTTP
  shape, controllers orchestrate, services do I/O, schemas validate).
- **Testable** — services are pure functions of their inputs, controllers are
  thin wrappers, routes are declarative.
- **Backend contract preserved** — every endpoint, the `token` header, and
  every response shape matches the original `backend/` package exactly.
- **Cron consolidated** — the `BackgroundService` is now a route on the same
  API server (`POST /api/cron/emails`), not a separate deployable.

## Notes & limitations

- **Vercel Cron free tier**: 1 cron job per project on the Hobby plan. We use
  one (`*/10 * * * *` → `/api/cron/emails`).
- **SQL Server on Vercel**: Vercel functions connect to external SQL Server
  via TCP. Azure SQL is recommended.
- **SSR + NgRx**: The booking list's `getBookings` effect fires on the server
  during SSR. Without a valid token, it 401s — the loading skeleton renders,
  then the client hydrates and re-fetches with the user's token.
- **Archive**: The original Angular 15 SPA (`Airport/`) and Angular 15 SSR
  (`Airport-ssr/`) are preserved under `archive/legacy-frontend-variants/`
  for historical reference but are **not deployed**. The modernized Angular 19
  frontend in `apps/web/` is the only frontend service.
