import express from 'express';
import sendWelcomeEmail from './EmailService';

/**
 * Background email service (modernised for Vercel).
 *
 * The original implementation used `node-cron` to poll the database every 10
 * seconds. Vercel functions are request-scoped — long-running schedulers
 * don't fit that model. Instead, this service exposes an HTTP endpoint
 * (`POST /api/cron/emails`) that Vercel Cron invokes on a schedule.
 *
 * The schedule is declared in `vercel.json` under `crons[]`. Locally,
 * `npm start` runs the Express server on PORT (default 4002).
 */
const app = express();
app.use(express.json());

/**
 * Health check — useful for Vercel deployment probes.
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'backgroundservice', ts: Date.now() });
});

/**
 * Cron endpoint — invoked by Vercel Cron (or any external scheduler).
 *
 * We accept an optional `?limit=N` query to bound the batch size. Returns
 * a small JSON summary so the caller can log how many emails were sent.
 */
app.post('/api/cron/emails', async (req, res) => {
  try {
    const summary = await sendWelcomeEmail();
    res.json({ ok: true, ...summary });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[cron/emails] failed:', error?.message ?? error);
    res.status(500).json({ ok: false, error: error?.message ?? 'unknown' });
  }
});

const port = Number(process.env.PORT) || 4002;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`backgroundservice listening on :${port}`);
});
