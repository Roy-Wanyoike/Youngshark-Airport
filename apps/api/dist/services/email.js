"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmails = sendWelcomeEmails;
const index_1 = require("../config/index");
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const node_path_1 = __importDefault(require("node:path"));
const db_1 = require("./db");
/**
 * Email service — scans UserTable for unsent welcome emails, renders the
 * template, sends via SMTP, and marks each row as sent.
 *
 * Invoked by `POST /api/cron/emails` (Vercel Cron every 10 minutes).
 */
async function sendWelcomeEmails() {
    const summary = { scanned: 0, sent: 0, failed: 0 };
    if (!index_1.config.smtp.user || !index_1.config.smtp.pass) {
        // SMTP not configured — skip silently rather than fail the cron.
        console.warn('[email] SMTP credentials not set — skipping welcome-email sweep.');
        return summary;
    }
    const result = await db_1.db.query("SELECT * FROM UserTable WHERE isSent = '0'");
    const users = result.recordset;
    summary.scanned = users.length;
    const transporter = nodemailer_1.default.createTransport({
        host: index_1.config.smtp.host,
        port: index_1.config.smtp.port,
        auth: { user: index_1.config.smtp.user, pass: index_1.config.smtp.pass },
    });
    // Templates are copied to dist/templates/ during build (see package.json build script).
    // __dirname is apps/api/dist/services/ → ../templates/ → apps/api/dist/templates/
    const templatePath = node_path_1.default.resolve(__dirname, '../templates/registration.ejs');
    for (const user of users) {
        try {
            const html = await ejs_1.default.renderFile(templatePath, { name: user.Name });
            await transporter.sendMail({
                from: index_1.config.smtp.from,
                to: user.Email,
                subject: 'Welcome to Youngshark Airport',
                html,
            });
            await db_1.db.query(`UPDATE UserTable SET isSent = '1' WHERE Id = '${user.Id}'`);
            summary.sent += 1;
        }
        catch (error) {
            summary.failed += 1;
            console.error(`[email] failed for ${user.Email}:`, error);
        }
    }
    return summary;
}
//# sourceMappingURL=email.js.map