import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { IconComponent } from '../shared/components/icon/icon.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent, IconComponent],
  template: `
    <app-hero [loggedIn]="auth.isLoggedIn()" />

    <section class="section" aria-labelledby="features-title">
      <div class="container-page">
        <header class="section__head">
          <h2 id="features-title">Why fly with Youngshark</h2>
          <p class="section__lead">
            A modern booking experience built around clarity, speed and trust —
            so you can spend less time planning and more time travelling.
          </p>
        </header>

        <ul class="features" role="list">
          <li class="card feature">
            <div class="feature__icon"><app-icon name="plane" [size]="24" /></div>
            <h3 class="feature__title">Direct flights</h3>
            <p class="feature__desc">
              Search and book direct flights to over 120 destinations worldwide,
              with transparent pricing and no hidden fees.
            </p>
          </li>
          <li class="card feature">
            <div class="feature__icon"><app-icon name="clock" [size]="24" /></div>
            <h3 class="feature__title">24/7 support</h3>
            <p class="feature__desc">
              Our customer service team is available around the clock, from the
              moment you book until you arrive at your destination.
            </p>
          </li>
          <li class="card feature">
            <div class="feature__icon"><app-icon name="shield" [size]="24" /></div>
            <h3 class="feature__title">Secure by default</h3>
            <p class="feature__desc">
              Your account and bookings are protected by token-based authentication
              and encrypted storage — no plaintext passwords, ever.
            </p>
          </li>
        </ul>
      </div>
    </section>

    <section class="section section--muted" aria-labelledby="cta-title">
      <div class="container-page">
        <div class="card cta">
          <div class="cta__content">
            <h2 id="cta-title">Ready to take off?</h2>
            <p>Create a free account in seconds and book your next flight today.</p>
          </div>
          <div class="cta__actions">
            @if (auth.isLoggedIn()) {
              <a routerLink="/book" class="btn btn-primary btn-lg">
                View my bookings <app-icon name="arrow-right" [size]="18" />
              </a>
            } @else {
              <a routerLink="/register" class="btn btn-primary btn-lg">
                Get started <app-icon name="arrow-right" [size]="18" />
              </a>
              <a routerLink="/login" class="btn btn-secondary btn-lg">Sign in</a>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .section--muted { background-color: var(--color-surface-2); }
      .section__head {
        max-width: 720px;
        margin-bottom: var(--space-10);
      }
      .section__head h2 { margin-bottom: var(--space-3); }
      .section__lead { color: var(--color-text-muted); font-size: var(--text-lg); }

      .features {
        display: grid;
        gap: var(--space-6);
        grid-template-columns: 1fr;
      }
      @media (min-width: 768px) { .features { grid-template-columns: repeat(3, 1fr); } }

      .feature {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        height: 100%;
      }
      .feature__icon {
        display: grid;
        place-items: center;
        width: 48px; height: 48px;
        background-color: var(--color-primary-subtle);
        color: var(--color-primary);
        border-radius: var(--radius-md);
      }
      .feature__title { font-size: var(--text-xl); }
      .feature__desc { color: var(--color-text-muted); font-size: var(--text-sm); }

      .cta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-6);
        background: linear-gradient(135deg, var(--color-primary-subtle) 0%, var(--color-surface) 100%);
        border-color: var(--color-primary);
      }
      .cta__content h2 { margin-bottom: var(--space-2); }
      .cta__content p { color: var(--color-text-muted); }
      .cta__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
    `,
  ],
})
export class HomeComponent {
  protected readonly auth = inject(AuthService);
}
