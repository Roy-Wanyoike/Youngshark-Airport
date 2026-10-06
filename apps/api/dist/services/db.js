"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mssql_1 = __importDefault(require("mssql"));
const index_1 = require("../config/index");
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
    pool = null;
    async getPool() {
        if (!this.pool) {
            this.pool = mssql_1.default.connect(index_1.config.db);
        }
        return this.pool;
    }
    /** Execute a stored procedure with named parameters. */
    async exec(storedProcedure, params = {}) {
        const pool = await this.getPool();
        const request = pool.request();
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        return request.execute(storedProcedure);
    }
    /** Run an ad-hoc SQL query. Used sparingly (cron emailer only). */
    async query(sql) {
        const pool = await this.getPool();
        return pool.request().query(sql);
    }
    /** For test/health use. */
    async health() {
        try {
            const pool = await this.getPool();
            return pool.connected;
        }
        catch {
            return false;
        }
    }
}
exports.db = new Database();
//# sourceMappingURL=db.js.map