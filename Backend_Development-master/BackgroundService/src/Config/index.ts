import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * SQL Server connection config — same shape as the backend service.
 * Reads DB_HOST, DB_PORT, DB_USER, DB_PWD, DB_NAME, DB_ENCRYPT, DB_TRUST.
 */
export const sqlConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PWD as string,
  database: process.env.DB_NAME as string,
  server: (process.env.DB_HOST ?? 'localhost') as string,
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
};
