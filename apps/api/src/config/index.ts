import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the api package root (apps/api/.env).
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralised environment configuration.
 *
 * Reads everything from process.env with sensible defaults so the same code
 * runs locally (docker-compose) and on Vercel (managed Azure SQL).
 *
 * `require()`-free — works in both CJS (Node 16) and ESM (Node 20+) builds.
 */
export const config = {
  /** Express server port — Vercel injects this automatically. */
  port: Number(process.env.PORT) || 4002,
  /** API route prefix — mounted in server.ts. */
  apiPrefix: '/api',
  /** JWT signing secret. */
  jwtSecret: process.env.JWT_SECRET ?? process.env.SECRETKEY ?? 'dev-secret-change-me',
  /** JWT token TTL. */
  jwtTtl: '1h',
  /** SQL Server connection. */
  db: {
    user: process.env.DB_USER ?? 'sa',
    password: process.env.DB_PWD ?? '',
    database: process.env.DB_NAME ?? 'AirportDB',
    server: process.env.DB_HOST ?? 'db',
    port: Number(process.env.DB_PORT) || 1433,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: (process.env.DB_ENCRYPT ?? 'false') === 'true',
      trustServerCertificate: (process.env.DB_TRUST ?? 'true') === 'true',
    },
  },
  /** SMTP — used by the cron emailer. */
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER ?? process.env.EMAIL ?? '',
    pass: process.env.SMTP_PASS ?? process.env.PASSWORD ?? '',
    from: process.env.SMTP_FROM ?? process.env.EMAIL ?? '',
  },
  /** CORS — allow the SPA origin in dev. On Vercel both run under the same domain. */
  corsOrigin: process.env.CORS_ORIGIN ?? true,
} as const;

export const sqlConfig = config.db;
