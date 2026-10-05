import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/**
 * Functional HTTP interceptor (Angular 19 pattern).
 *
 * Preserves the original backend contract:
 *   - Login/register requests are NOT modified (no token, no custom header).
 *   - Every other authenticated request gets a `token` header (NOT `Authorization` —
 *     the Express backend reads `req.headers.token`).
 *
 * Removes the previous debug leftover (`Custom: 'Just see Me'`) which was sent
 * on every authenticated request and added bytes / confusion in production.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip auth routes — they don't need a token (and don't have one yet).
  const isAuthRoute =
    req.url.startsWith(`${environment.apiUrl}/auth/login`) ||
    req.url.startsWith(`${environment.apiUrl}/auth/register`);

  if (isAuthRoute) {
    return next(req);
  }

  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return next(req);
  }

  const modified = req.clone({
    setHeaders: { token },
  });

  return next(modified);
};
