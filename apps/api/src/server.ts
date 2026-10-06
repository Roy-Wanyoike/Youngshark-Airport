import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRouter from './routes/auth.routes';
import flightsRouter from './routes/flights.routes';
import cronRouter from './routes/cron.routes';
import { db } from './services/db';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.use(`${config.apiPrefix}/auth`, authRouter);
app.use(`${config.apiPrefix}/flights`, flightsRouter);
app.use(`${config.apiPrefix}/cron`, cronRouter);

app.get(`${config.apiPrefix}/health`, async (_req, res) => {
  const dbOk = await db.health().catch(() => false);
  res.json({
    ok: true,
    service: 'api',
    ts: Date.now(),
    db: dbOk ? 'connected' : 'disconnected',
  });
});

app.use(`${config.apiPrefix}/*`, (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Only listen when run directly (not when imported as a Vercel serverless function)
if (require.main === module) {
  const port = config.port;
  app.listen(port, () => {
    console.log(`[api] listening on :${port}`);
  });
}

export default app;
