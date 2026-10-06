import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon.component';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <section class="not-found">
      <div class="container-page not-found__inner">
        <div class="not-found__media" aria-hidden="true">
          <img src="/assets/images/404.svg" alt="" width="400" height="300" />
        </div>
        <div class="not-found__content">
          <p class="not-found__eyebrow">Error 404</p>
          <h1>Page not found</h1>
          <p class="not-found__lead">
            The page you're looking for doesn't exist or has moved.
            Let's get you back on track.
          </p>
          <div class="not-found__actions">
            <a routerLink="/" class="btn btn-primary btn-lg">
              <app-icon name="arrow-right" [size]="18" /> Back to home
            </a>
            <a routerLink="/book" class="btn btn-secondary btn-lg">Browse flights</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .not-found {
        padding-block: var(--space-12);
        min-height: 70vh;
        display: grid;
        place-items: center;
      }
      @media (min-width: 768px) { .not-found { padding-block: var(--space-20); } }
      .not-found__inner {
        display: grid;
        gap: var(--space-8);
        grid-template-columns: 1fr;
        align-items: center;
        text-align: center;
      }
      @media (min-width: 768px) {
        .not-found__inner { grid-template-columns: 1fr 1fr; text-align: left; }
      }
      .not-found__media { display: grid; place-items: center; }
      .not-found__media img { width: 100%; max-width: 400px; height: auto; }
      .not-found__eyebrow {
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wider);
        margin-bottom: var(--space-2);
      }
      .not-found h1 { font-size: var(--text-4xl); margin-bottom: var(--space-3); }
      .not-found__lead {
        color: var(--color-text-muted);
        font-size: var(--text-lg);
        max-width: 480px;
        margin-bottom: var(--space-6);
      }
      @media (min-width: 768px) { .not-found__lead { margin-inline: 0; } }
      @media (max-width: 767px) { .not-found__lead { margin-inline: auto; } }
      .not-found__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        justify-content: center;
      }
      @media (min-width: 768px) { .not-found__actions { justify-content: flex-start; } }
    `,
  ],
})
export class PageNotFoundComponent {}
