import ejs from 'ejs';
import sendMail from '../Helpers/email';
import mssql from 'mssql';
import { sqlConfig } from '../Config';
import path from 'path';

interface User {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
  isSent: string;
  Password: string;
}

interface EmailSummary {
  scanned: number;
  sent: number;
  failed: number;
}

/**
 * Scans the UserTable for unsent welcome emails, sends them, and marks them sent.
 *
 * Returns a small summary so the HTTP caller (Vercel Cron) can log activity.
 * The template path is resolved relative to the project root so it works
 * whether the service runs from `src/` (dev) or `dist/` (compiled).
 */
const sendWelcomeEmail = async (): Promise<EmailSummary> => {
  const summary: EmailSummary = { scanned: 0, sent: 0, failed: 0 };
  const pool = await mssql.connect(sqlConfig);
  const users: User[] = (
    await pool.request().query("SELECT * FROM UserTable WHERE isSent = '0'")
  ).recordset;
  summary.scanned = users.length;

  for (const user of users) {
    try {
      const templatePath = path.resolve(
        __dirname,
        process.env.NODE_ENV === 'production'
          ? '../../Templates/registration.ejs'
          : '../../Templates/registration.ejs',
      );
      const html = await ejs.renderFile(templatePath, { name: user.Name });
      await sendMail({
        from: process.env.EMAIL,
        to: user.Email,
        subject: 'Welcome to Youngshark Airport',
        html,
      });
      await pool
        .request()
        .query(`UPDATE UserTable SET isSent = '1' WHERE Id = '${user.Id}'`);
      summary.sent += 1;
    } catch (error) {
      summary.failed += 1;
      // eslint-disable-next-line no-console
      console.error('[sendWelcomeEmail] failed for', user.Email, error);
    }
  }
  return summary;
};

export default sendWelcomeEmail;
