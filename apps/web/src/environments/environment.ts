/**
 * Production environment.
 *
 * On Vercel, the frontend and backend run under the same domain:
 *   - `/api/auth/*`  → backend service (Express)
 *   - `/api/flights*` → backend service (Express)
 *   - everything else → this Angular SPA (or SSR server)
 *
 * So the SPA uses **relative** URLs — no CORS, no hardcoded host. The
 * `apiUrl` is just the path prefix `/api`.
 *
 * For server-side rendering, `server.ts` reads `process.env.BACKEND_URL`
 * (injected by Vercel's `bindings` config) to call the backend directly
 * during SSR — bypassing the public edge for lower latency.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
};
