import { config } from '../config/index';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'node:path';
import { db } from './db';

// __dirname is available in CommonJS.
export interface EmailSummary {
  scanned: number;
  sent: number;
  failed: number;
}

/**
 * Email service — scans UserTable for unsent welcome emails, renders the
 * template, sends via SMTP, and marks each row as sent.
 *
 * Invoked by `POST /api/cron/emails` (Vercel Cron every 10 minutes).
 */
export async function sendWelcomeEmails(): Promise<EmailSummary> {
  const summary: EmailSummary = { scanned: 0, sent: 0, failed: 0 };

  if (!config.smtp.user || !config.smtp.pass) {
    // SMTP not configured — skip silently rather than fail the cron.
    console.warn('[email] SMTP credentials not set — skipping welcome-email sweep.');
    return summary;
  }

  const result = await db.query("SELECT * FROM UserTable WHERE isSent = '0'");
  const users = result.recordset as Array<{
    Id: string;
    Name: string;
    Email: string;
  }>;
  summary.scanned = users.length;

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  // Templates are copied to dist/templates/ during build (see package.json build script).
  // __dirname is apps/api/dist/services/ → ../templates/ → apps/api/dist/templates/
  const templatePath = path.resolve(__dirname, '../templates/registration.ejs');

  for (const user of users) {
    try {
      const html = await ejs.renderFile(templatePath, { name: user.Name });
      await transporter.sendMail({
        from: config.smtp.from,
        to: user.Email,
        subject: 'Welcome to Youngshark Airport',
        html,
      });
      await db.query(`UPDATE UserTable SET isSent = '1' WHERE Id = '${user.Id}'`);
      summary.sent += 1;
    } catch (error) {
      summary.failed += 1;
      console.error(`[email] failed for ${user.Email}:`, error);
    }
  }

  return summary;
}
