import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Site footer — appears on every page below <router-outlet>.
 * Sticky-footer behavior is provided by the .app-shell wrapper on AppComponent.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="site-footer" role="contentinfo">
      <div class="container-page site-footer__inner">
        <div class="site-footer__col site-footer__brand">
          <div class="site-footer__brand-row">
            <img src="/assets/images/logo.svg" alt="" width="32" height="32" />
            <span>Youngshark Airport</span>
          </div>
          <p class="site-footer__tagline">
            Direct flights to your destination. Best customer service from booking to arrival.
          </p>
        </div>

        <nav class="site-footer__col" aria-label="Footer">
          <h6>Product</h6>
          <a routerLink="/">Home</a>
          <a routerLink="/book">My bookings</a>
          <a routerLink="/register">Create account</a>
        </nav>

        <nav class="site-footer__col" aria-label="Footer legal">
          <h6>Company</h6>
          <a routerLink="/">About</a>
          <a routerLink="/">Contact</a>
          <a routerLink="/">Careers</a>
        </nav>

        <nav class="site-footer__col" aria-label="Footer legal">
          <h6>Legal</h6>
          <a routerLink="/">Privacy</a>
          <a routerLink="/">Terms</a>
          <a routerLink="/">Cookies</a>
        </nav>
      </div>
      <div class="site-footer__bottom">
        <div class="container-page site-footer__bottom-inner">
          <span>&copy; {{ year }} Youngshark Airport. All rights reserved.</span>
          <span class="site-footer__built">Built with Angular 19</span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      :host { display: block; }
      .site-footer {
        background-color: var(--color-surface-2);
        border-top: 1px solid var(--color-border);
        margin-top: auto;
      }
      .site-footer__inner {
        display: grid;
        gap: var(--space-8);
        padding-block: var(--space-12) var(--space-8);
        grid-template-columns: 1fr;
      }
      @media (min-width: 768px) {
        .site-footer__inner { grid-template-columns: 2fr 1fr 1fr 1fr; }
      }
      .site-footer__brand-row {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-weight: var(--weight-semibold);
        margin-bottom: var(--space-3);
      }
      .site-footer__tagline {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        max-width: 360px;
      }
      .site-footer__col h6 {
        margin-bottom: var(--space-3);
        color: var(--color-text-subtle);
      }
      .site-footer__col a {
        display: block;
        padding-block: var(--space-1);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
      .site-footer__col a:hover { color: var(--color-text); }
      .site-footer__bottom {
        border-top: 1px solid var(--color-border);
        padding-block: var(--space-4);
      }
      .site-footer__bottom-inner {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        font-size: var(--text-xs);
        color: var(--color-text-subtle);
      }
      @media (min-width: 768px) {
        .site-footer__bottom-inner { flex-direction: row; justify-content: space-between; }
      }
    `,
  ],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
