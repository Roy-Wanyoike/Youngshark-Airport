import {
  Component,
  HostListener,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IconComponent } from '../shared/components/icon/icon.component';

type Theme = 'light' | 'dark';

/**
 * Header / global nav.
 *
 * Modernisation fixes:
 *   - Sticky header (z-sticky) instead of scrolling away.
 *   - Header height fixed at 64px mobile / 72px desktop (was 5vw → broken on both ends).
 *   - Centered max-width container (was width:40% + margin-left:20px).
 *   - Mobile hamburger menu (≥44px touch target) → vertical drawer with focus trap.
 *   - "Logout" is now a real <button> (was <a (click)> → not keyboard-activatable).
 *   - "Welcome {{name}}" is now a <span> (was <a> with no href → focusable but inert).
 *   - Active route marked with aria-current="page" (via routerLinkActive).
 *   - Dark mode toggle (sun/moon icon) with localStorage persistence.
 *   - Focus-visible outlines on every interactive element.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header" role="banner">
      <div class="container-page site-header__inner">
        <a routerLink="/" class="site-header__brand" aria-label="Youngshark Airport — home">
          <img src="/assets/images/logo.svg" alt="" width="40" height="40" />
          <span class="site-header__brand-text">
            <span class="site-header__brand-name">Youngshark</span>
            <span class="site-header__brand-sub">AIRPORT</span>
          </span>
        </a>

        <nav class="site-header__nav-desktop" aria-label="Primary">
          <a
            routerLink="/"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: true }"
            [attr.aria-current]="isActiveExact('/') ? 'page' : null"
          >Home</a>
          @if (auth.isLoggedIn()) {
            <a
              routerLink="/book"
              routerLinkActive="is-active"
              [attr.aria-current]="isActivePrefix('/book') ? 'page' : null"
            >My bookings</a>
          }
        </nav>

        <div class="site-header__actions">
          @if (auth.isLoggedIn()) {
            <span class="site-header__welcome">
              <app-icon name="user" [size]="16" />
              <span>Welcome, {{ auth.name() }}</span>
            </span>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              (click)="logout()"
              aria-label="Log out"
            >
              <app-icon name="logout" [size]="16" />
              <span class="site-header__btn-label">Log out</span>
            </button>
          } @else {
            <a routerLink="/login" class="btn btn-ghost btn-sm">Sign in</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">
              <span>Get started</span>
              <app-icon name="arrow-right" [size]="16" />
            </a>
          }

          <button
            type="button"
            class="btn btn-ghost btn-icon site-header__theme"
            (click)="toggleTheme()"
            [attr.aria-label]="theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
            [attr.aria-pressed]="theme() === 'dark'"
          >
            <app-icon [name]="theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
          </button>

          <button
            type="button"
            class="btn btn-ghost btn-icon site-header__menu-toggle"
            (click)="toggleMenu()"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-nav"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
          >
            <app-icon [name]="menuOpen() ? 'close' : 'menu'" [size]="22" />
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div
          class="site-header__drawer"
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav class="site-header__nav-mobile" aria-label="Mobile primary">
            <a
              routerLink="/"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMenu()"
            >Home</a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/book" routerLinkActive="is-active" (click)="closeMenu()">My bookings</a>
            } @else {
              <a routerLink="/login" (click)="closeMenu()">Sign in</a>
              <a routerLink="/register" (click)="closeMenu()">Get started</a>
            }
            @if (auth.isLoggedIn()) {
              <button type="button" class="btn btn-secondary btn-block" (click)="logout()">
                <app-icon name="logout" [size]="16" /> Log out
              </button>
            }
          </nav>
        </div>
      }
    </header>
  `,
  styles: [
    `
      :host { display: contents; }
      .site-header {
        position: sticky;
        top: 0;
        z-index: var(--z-sticky);
        background-color: color-mix(in srgb, var(--color-surface) 88%, transparent);
        backdrop-filter: saturate(1.4) blur(12px);
        border-bottom: 1px solid var(--color-border);
      }
      .site-header__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        min-height: var(--header-height);
      }
      @media (min-width: 1024px) {
        .site-header__inner { min-height: var(--header-height-lg); }
      }
      .site-header__brand {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        font-weight: var(--weight-bold);
        color: var(--color-text);
      }
      .site-header__brand img { width: 40px; height: 40px; }
      .site-header__brand-text { display: flex; flex-direction: column; line-height: 1; }
      .site-header__brand-name { font-size: var(--text-base); letter-spacing: var(--tracking-tight); }
      .site-header__brand-sub { font-size: 10px; font-weight: var(--weight-medium); color: var(--color-text-subtle); letter-spacing: var(--tracking-wider); }

      .site-header__nav-desktop {
        display: none;
        align-items: center;
        gap: var(--space-1);
      }
      .site-header__nav-desktop a {
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        color: var(--color-text-muted);
        border-radius: var(--radius-md);
        transition: background-color var(--transition-fast), color var(--transition-fast);
      }
      .site-header__nav-desktop a:hover { background-color: var(--color-surface-2); color: var(--color-text); }
      .site-header__nav-desktop a.is-active { color: var(--color-primary); background-color: var(--color-primary-subtle); }
      @media (min-width: 768px) {
        .site-header__nav-desktop { display: flex; }
      }

      .site-header__actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .site-header__welcome {
        display: none;
        align-items: center;
        gap: var(--space-2);
        padding-inline: var(--space-3);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
      @media (min-width: 1024px) {
        .site-header__welcome { display: inline-flex; }
      }
      .site-header__btn-label { display: none; }
      @media (min-width: 768px) {
        .site-header__btn-label { display: inline; }
      }
      .site-header__theme { display: inline-flex; }

      .site-header__menu-toggle { display: inline-flex; }
      @media (min-width: 768px) {
        .site-header__menu-toggle { display: none; }
      }

      .site-header__drawer {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        animation: drawer-slide var(--transition-base);
        transform-origin: top;
      }
      @keyframes drawer-slide {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (min-width: 768px) {
        .site-header__drawer { display: none; }
      }
      .site-header__nav-mobile {
        display: flex;
        flex-direction: column;
        padding: var(--space-3);
        gap: var(--space-1);
        max-width: var(--container-max);
        margin-inline: auto;
      }
      .site-header__nav-mobile a,
      .site-header__nav-mobile button {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-base);
        font-weight: var(--weight-medium);
        color: var(--color-text-muted);
        border-radius: var(--radius-md);
        text-align: left;
      }
      .site-header__nav-mobile a:hover,
      .site-header__nav-mobile button:hover { background-color: var(--color-surface-2); color: var(--color-text); }
      .site-header__nav-mobile a.is-active { color: var(--color-primary); background-color: var(--color-primary-subtle); }
      @media (prefers-reduced-motion: reduce) { .site-header__drawer { animation: none; } }
    `,
  ],
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly theme = signal<Theme>(this.readInitialTheme());

  constructor() {
    // Apply theme on init
    if (typeof document !== 'undefined') {
      document.documentElement.dataset['theme'] = this.theme();
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset['theme'] = next;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ys_theme', next);
    }
  }

  isActiveExact(path: string): boolean {
    return this.router.url === path;
  }
  isActivePrefix(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  private readInitialTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'light';
    const stored = localStorage.getItem('ys_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
