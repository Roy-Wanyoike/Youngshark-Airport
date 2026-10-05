import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Functional route guard (Angular 19 pattern).
 *
 * Replaces the class-based AuthGuardService — same observable behavior, but
 * matches the modern Angular API and removes the unnecessary 10 ms setTimeout
 * race from the original implementation.
 */
@Injectable({ providedIn: 'root' })
class AuthGuardService {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.auth.getAuthStatus().then((status) => {
      if (status) return true;
      return this.router.createUrlTree(['/login']);
    });
  }
}

export const AuthGuard: CanActivateFn = (route, state) =>
  inject(AuthGuardService).canActivate(route, state);
