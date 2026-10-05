import { Router } from 'express';
import { sendWelcomeEmailsCron } from '../controllers/cron.controller.js';

const cronRouter = Router();

// Vercel Cron invokes POST /api/cron/emails every 10 minutes.
cronRouter.post('/emails', sendWelcomeEmailsCron);

export default cronRouter;
