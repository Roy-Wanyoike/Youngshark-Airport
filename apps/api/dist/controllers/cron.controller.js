"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmailsCron = sendWelcomeEmailsCron;
const email_1 = require("../services/email");
/**
 * Cron controller — invoked by Vercel Cron (or any external scheduler).
 *
 * POST /api/cron/emails triggers a welcome-email sweep.
 *
 * Optional: guard with a CRON_SECRET header so the endpoint can't be abused.
 * (For now, the route is internal — Vercel Cron calls it directly.)
 */
async function sendWelcomeEmailsCron(_req, res) {
    try {
        const summary = await (0, email_1.sendWelcomeEmails)();
        return res.status(200).json({ ok: true, ...summary });
    }
    catch (error) {
        console.error('[cron.sendWelcomeEmails]', error);
        return res.status(500).json({ ok: false, error: error.message });
    }
}
//# sourceMappingURL=cron.controller.js.map