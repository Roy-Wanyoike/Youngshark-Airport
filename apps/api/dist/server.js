"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const flights_routes_1 = __importDefault(require("./routes/flights.routes"));
const cron_routes_1 = __importDefault(require("./routes/cron.routes"));
const db_1 = require("./services/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin, credentials: true }));
app.use(express_1.default.json());
app.use(`${config_1.config.apiPrefix}/auth`, auth_routes_1.default);
app.use(`${config_1.config.apiPrefix}/flights`, flights_routes_1.default);
app.use(`${config_1.config.apiPrefix}/cron`, cron_routes_1.default);
app.get(`${config_1.config.apiPrefix}/health`, async (_req, res) => {
    const dbOk = await db_1.db.health().catch(() => false);
    res.json({
        ok: true,
        service: 'api',
        ts: Date.now(),
        db: dbOk ? 'connected' : 'disconnected',
    });
});
app.use(`${config_1.config.apiPrefix}/*`, (_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
const port = config_1.config.port;
app.listen(port, () => {
    console.log(`[api] listening on :${port}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map