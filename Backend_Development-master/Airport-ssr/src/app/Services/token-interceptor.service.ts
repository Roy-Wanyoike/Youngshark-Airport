import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Legacy Angular 15 SSR token interceptor — modernised.
 *
 * - Skips auth routes (matched by path prefix `/api/auth/`)
 * - Removes the debug `Custom: 'Just see Me'` header
 * - SSR-safe: `localStorage` only accessed in browser
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
