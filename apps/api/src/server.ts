import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRouter from './routes/auth.routes.js';
import flightsRouter from './routes/flights.routes.js';
import cronRouter from './routes/cron.routes.js';
import { db } from './services/db.js';

/**
 * Youngshark Airport — consolidated API.
 *
 * One Express app that:
 *   - mounts `/api/auth/*`   → user registration + login + protected home
 *   - mounts `/api/flights*` → booking CRUD (token-authenticated)
 *   - mounts `/api/cron/*`   → Vercel-Cron-invoked email sweep
 *   - exposes `/api/health`  → liveness probe
 *
 * Originally split across two packages (`backend/` + `BackgroundService/`)
 * — now consolidated into one clean layered architecture.
 */

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

// --- Routes (most-specific first) ---
app.use(`${config.apiPrefix}/auth`, authRouter);
app.use(`${config.apiPrefix}/flights`, flightsRouter);
app.use(`${config.apiPrefix}/cron`, cronRouter);

// --- Health probe ---
app.get(`${config.apiPrefix}/health`, async (_req, res) => {
  const dbOk = await db.health().catch(() => false);
  res.json({
    ok: true,
    service: 'api',
    ts: Date.now(),
    db: dbOk ? 'connected' : 'disconnected',
  });
});

// --- 404 for unknown /api routes ---
app.use(`${config.apiPrefix}/*`, (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Start server when invoked directly ---
const port = config.port;
app.listen(port, () => {
  console.log(`[api] listening on :${port}`);
});

export default app;
