import { Injectable, signal } from '@angular/core';

/**
 * AuthService — modernised to use Angular Signals (Angular 16+).
 *
 * Improvements over the original:
 *   - State is reactive (signals) — components re-render automatically.
 *   - State is initialised from localStorage so a hard refresh no longer logs the
 *     user out (the previous implementation defaulted `isLoggedIn=false` on every
 *     reload, so refreshing the page after login would silently break auth).
 *   - Role and name are also restored from localStorage.
 *   - `getAuthStatus()` is kept as a Promise for backward-compat with the route
 *     guard, but resolves synchronously now (no 10 ms setTimeout race).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal<boolean>(this.readInitial('ys_logged_in', false));
  private readonly _role = signal<string>(this.readInitial('ys_role', '') ?? '');
  private readonly _name = signal<string>(this.readInitial('ys_name', '') ?? '');

  /** Public readonly views for templates. */
  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly role = this._role.asReadonly();
  readonly name = this._name.asReadonly();

  getName(): string {
    return this._name();
  }

  getRole(): string {
    return this._role();
  }

  setRole(role: string): void {
    this._role.set(role);
    this.persist('ys_role', role);
  }

  setName(name: string): void {
    this._name.set(name);
    this.persist('ys_name', name);
  }

  /**
   * Returns a Promise so existing callers (the route guard) don't need to change
   * signature, but the promise resolves synchronously — no more setTimeout race.
   */
  getAuthStatus(): Promise<boolean> {
    return Promise.resolve(this._isLoggedIn());
  }

  login(): void {
    this._isLoggedIn.set(true);
    this.persist('ys_logged_in', 'true');
  }

  logout(): void {
    this._isLoggedIn.set(false);
    this._role.set('');
    this._name.set('');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ys_logged_in');
      localStorage.removeItem('ys_role');
      localStorage.removeItem('ys_name');
      localStorage.removeItem('token');
    }
  }

  private readInitial(key: string, fallback: boolean): boolean;
  private readInitial(key: string, fallback: string | null): string | null;
  private readInitial(key: string, fallback: boolean | string | null): boolean | string | null {
    if (typeof localStorage === 'undefined') return fallback;
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    if (typeof fallback === 'boolean') return v === 'true';
    return v;
  }

  private persist(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }
}
