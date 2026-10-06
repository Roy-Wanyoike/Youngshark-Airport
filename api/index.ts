import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../apps/api/dist/server';

/**
 * Catch-all serverless function for the Youngshark Airport API.
 *
 * Vercel routes all /api/* requests to this function (via the rewrite in
 * vercel.json). The Express app from apps/api handles the actual routing.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
