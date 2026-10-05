import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { User, Message, LoginUser, LoginSuccess } from '../Interfaces/index';
import { Observable } from 'rxjs';

/**
 * Legacy Angular 15 SSR authentication service — modernised for Vercel.
 *
 * - On the browser: uses relative `/api/*` URLs (Vercel edge routes to backend)
 * - On the server (during SSR): uses `process.env.BACKEND_URL` (the binding
 *   injected by Vercel services) to call the backend directly, bypassing
 *   the public edge for lower latency.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly isServer: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isServer = isPlatformServer(platformId);
  }

  private get baseUrl(): string {
    if (this.isServer && typeof process !== 'undefined' && process.env?.BACKEND_URL) {
      return process.env.BACKEND_URL + '/api';
    }
    return '/api';
  }

  registerUser(user: User): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/auth/register`, user);
  }

  loginUser(user: LoginUser): Observable<LoginSuccess> {
    return this.http.post<LoginSuccess>(`${this.baseUrl}/auth/login`, user);
  }
}
