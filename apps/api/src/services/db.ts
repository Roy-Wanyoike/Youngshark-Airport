import mssql from 'mssql';
import { config } from '../config/index.js';

/**
 * Database access layer.
 *
 * Thin wrapper around `mssql` that:
 *   - lazily connects once (pooled, reused across requests)
 *   - exposes `exec(storedProc, params)` for stored procedures
 *   - exposes `query(sql)` for ad-hoc SQL (used by the cron emailer)
 *
 * Connection failures are surfaced — no silent swallowing.
 */
class Database {
  private pool: Promise<mssql.ConnectionPool> | null = null;

  private async getPool(): Promise<mssql.ConnectionPool> {
    if (!this.pool) {
      this.pool = mssql.connect(config.db);
    }
    return this.pool;
  }

  /** Execute a stored procedure with named parameters. */
  async exec(storedProcedure: string, params: Record<string, string | number> = {}): Promise<mssql.IResult<any>> {
    const pool = await this.getPool();
    const request = pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
    return request.execute(storedProcedure);
  }

  /** Run an ad-hoc SQL query. Used sparingly (cron emailer only). */
  async query(sql: string): Promise<mssql.IResult<any>> {
    const pool = await this.getPool();
    return pool.request().query(sql);
  }

  /** For test/health use. */
  async health(): Promise<boolean> {
    try {
      const pool = await this.getPool();
      return pool.connected;
    } catch {
      return false;
    }
  }
}

export const db = new Database();
