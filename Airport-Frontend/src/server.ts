import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

/**
 * Health-check — useful for Vercel deployment probes.
 * Mounted before the static + SSR catch-all so it always returns JSON.
 */
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'airport-frontend',
    ts: Date.now(),
    backendUrl: process.env['BACKEND_URL'] ? 'configured' : 'unset',
  });
});

/**
 * Serve static files from /browser (JS, CSS, images, fonts).
 * `maxAge: 1y` because Angular's output hash makes files immutable.
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }),
);

/**
 * Handle all other requests by rendering the Angular application server-side.
 *
 * `process.env.BACKEND_URL` is injected by Vercel's service bindings when the
 * frontend service declares a binding to the backend. The Angular app reads
 * it via `REQUEST` token in `app.config.server.ts` if you want server-side
 * HTTP calls to bypass the public edge — but for the common case the SPA's
 * relative `/api/*` calls work via Vercel's top-level rewrites.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable,
 * or defaults to 4000 (Vercel injects PORT automatically).
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
