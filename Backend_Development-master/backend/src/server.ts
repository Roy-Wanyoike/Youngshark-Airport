import express, { json } from 'express';
import router from './Router';
import authrouter from './Router/authRoutes';
import cors from 'cors';

/**
 * Backend Express server (modernised for Vercel deployment).
 *
 * Changes from the original:
 *   - Routes mounted under `/api/*` so Vercel rewrites can route `/api/auth/*`
 *     and `/api/flights*` to this service while the SPA owns everything else.
 *   - Listens on `process.env.PORT` (Vercel injects this). Falls back to 4002
 *     for local `npm start` parity.
 *   - `cors({ origin: true })` so the SPA's origin can call the API. Vercel
 *     already routes both under the same domain, but this keeps localhost dev
 *     working when the SPA is on :4200 and the API on :4002.
 */
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(json());

app.use('/api/flights', router);
app.use('/api/auth', authrouter);

// Health-check — useful for Vercel deployment probes.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', ts: Date.now() });
});

const port = Number(process.env.PORT) || 4002;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on :${port}`);
});
