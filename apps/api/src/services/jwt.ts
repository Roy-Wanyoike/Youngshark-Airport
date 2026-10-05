import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { PublicUser } from '../types/index.js';

/**
 * JWT helpers — single source of truth for sign + verify.
 */
export function signToken(user: PublicUser): string {
  return jwt.sign(
    { Id: user.Id, Name: user.Name, Email: user.Email, Role: user.Role },
    config.jwtSecret,
    { expiresIn: config.jwtTtl },
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtSecret);
}
