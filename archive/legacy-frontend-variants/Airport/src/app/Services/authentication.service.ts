import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, Message, LoginUser, LoginSuccess } from '../Interfaces/index';
import { Observable } from 'rxjs';

/**
 * Legacy Angular 15 SPA service — modernised for Vercel deployment.
 *
 * Originally hardcoded `http://localhost:4002`. On Vercel, the backend is
 * exposed under `/api` (mounted via the top-level rewrites in `vercel.json`),
 * so this SPA uses relative URLs and the Vercel edge routes the requests.
 *
 * Locally, set `BACKEND_URL` env var and run `ng serve` — the value is
 * injected via the `environment.apiUrl` token below.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  // In Vercel production: '/api' (relative — Vercel edge routes to backend service)
  // In local dev: 'http://localhost:4002/api' (set in environment.ts)
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  registerUser(user: User): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/auth/register`, user);
  }

  loginUser(user: LoginUser): Observable<LoginSuccess> {
    return this.http.post<LoginSuccess>(`${this.baseUrl}/auth/login`, user);
  }
}
