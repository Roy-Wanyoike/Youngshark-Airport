import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Legacy Angular 15 SPA token interceptor — modernised.
 *
 * Changes:
 *   - Auth routes now match by path prefix `/api/auth/` (works on Vercel
 *     where the backend is exposed under `/api`).
 *   - Removed the debug `Custom: 'Just see Me'` header that was sent on every
 *     authenticated request.
 *   - Only attaches the token if one exists in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class TokenInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const isAuthRoute =
      req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

    if (isAuthRoute) {
      return next.handle(req);
    }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return next.handle(req);
    }

    const modifiedReq = req.clone({
      headers: new HttpHeaders().append('token', token),
    });
    return next.handle(modifiedReq);
  }
}
