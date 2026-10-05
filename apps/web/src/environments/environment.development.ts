/**
 * Development environment.
 *
 * `npm start` runs `ng serve` on http://localhost:4200. The backend runs
 * separately on http://localhost:4002. CORS is enabled on the backend so
 * the SPA can call it cross-origin in dev.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4002/api',
};
