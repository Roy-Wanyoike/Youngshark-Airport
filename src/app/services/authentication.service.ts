import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, Message, LoginUser, LoginSuccess } from '../shared/interfaces';

/**
 * AuthenticationService — thin HTTP wrapper.
 *
 * Endpoint contract preserved exactly:
 *   POST /auth/register  →  body: User            →  returns Message
 *   POST /auth/login     →  body: LoginUser        →  returns LoginSuccess
 *
 * The base URL comes from `environment.apiUrl` (no more hardcoded strings
 * scattered through services).
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  registerUser(user: User): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/auth/register`, user);
  }

  loginUser(user: LoginUser): Observable<LoginSuccess> {
    return this.http.post<LoginSuccess>(`${this.baseUrl}/auth/login`, user);
  }
}
