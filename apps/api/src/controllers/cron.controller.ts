import type { Response } from 'express';
import { sendWelcomeEmails } from '../services/email.js';
import type { AuthedRequest } from '../middleware/auth.js';

/**
 * Cron controller — invoked by Vercel Cron (or any external scheduler).
 *
 * POST /api/cron/emails triggers a welcome-email sweep.
 *
 * Optional: guard with a CRON_SECRET header so the endpoint can't be abused.
 * (For now, the route is internal — Vercel Cron calls it directly.)
 */
export async function sendWelcomeEmailsCron(_req: AuthedRequest, res: Response) {
  try {
    const summary = await sendWelcomeEmails();
    return res.status(200).json({ ok: true, ...summary });
  } catch (error: any) {
    console.error('[cron.sendWelcomeEmails]', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
