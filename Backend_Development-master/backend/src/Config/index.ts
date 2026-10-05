import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * SQL Server connection config.
 *
 * Reads from environment so the same code runs locally (docker-compose) and on
 * Vercel (managed Azure SQL or any cloud SQL Server).
 *
 *  - DB_HOST    : hostname of the SQL Server (e.g. `db` for docker-compose,
 *                 `myapp-sql.database.windows.net` for Azure SQL)
 *  - DB_USER    : SQL auth username
 *  - DB_PWD     : SQL auth password
 *  - DB_NAME    : database name
 *  - DB_PORT    : optional, defaults to 1433
 *  - DB_ENCRYPT : optional 'true' / 'false' (Azure SQL requires true)
 *  - DB_TRUST   : optional, trust self-signed certs (local dev)
 */
export const sqlConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PWD as string,
  database: process.env.DB_NAME as string,
  server: (process.env.DB_HOST ?? 'db') as string,
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
