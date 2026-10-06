"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cron_controller_1 = require("../controllers/cron.controller");
const cronRouter = (0, express_1.Router)();
// Vercel Cron invokes POST /api/cron/emails every 10 minutes.
cronRouter.post('/emails', cron_controller_1.sendWelcomeEmailsCron);
exports.default = cronRouter;
//# sourceMappingURL=cron.routes.js.map