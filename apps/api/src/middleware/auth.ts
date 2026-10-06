import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt';
import type { DecodedToken } from '../types/index';

/**
 * Authentication middleware.
 *
 * Reads the `token` header (preserves the original backend contract — NOT
 * `Authorization`) and verifies it. On failure responds with 401/403.
 *
 * On success populates `req.user` with the decoded payload.
 */
export interface AuthedRequest extends Request {
  user?: DecodedToken;
}

export function verifyTokenMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers['token'] as string | undefined;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(403).json({ error: 'Invalid or expired token', detail: error.message });
  }
}
