import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon.component';

/**
 * Hero — modernised.
 *
 * Replaces:
 *   - <marquee> (deprecated, fails WCAG 2.2.2)
 *   - hotlinked brave.com image (broken on rate-limit)
 *   - red-on-dark contrast failure
 *   - overlay positioned absolute top:40% left:40% width:30% (overflow on mobile)
 *   - "Book Now" button with no routerLink / no type / no aria-label
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__media">
        <img
          src="/assets/images/hero-airport.jpg"
          alt="A passenger jet on a runway at sunset"
          width="1600" height="900"
          fetchPriority="high"
          decoding="async"
        />
        <div class="hero__scrim" aria-hidden="true"></div>
      </div>
      <div class="container-page hero__inner">
        <p class="hero__eyebrow">
          <app-icon name="plane" [size]="16" />
          Direct flights, every day
        </p>
        <h1 id="hero-title" class="hero__title">
          Direct flights to your destination
        </h1>
        <p class="hero__subtitle">
          We offer the best customer service from booking until you arrive at your destination.
          Search, book and manage your trips in one place.
        </p>
        <div class="hero__actions">
          <a routerLink="/book" class="btn btn-primary btn-lg">
            Book now
            <app-icon name="arrow-right" [size]="18" />
          </a>
          @if (!loggedIn) {
            <a routerLink="/register" class="btn btn-secondary btn-lg">
              Create account
            </a>
          }
        </div>
        <ul class="hero__stats" role="list">
          <li><strong>120+</strong><span>destinations</span></li>
          <li><strong>24/7</strong><span>support</span></li>
          <li><strong>4.8★</strong><span>rating</span></li>
        </ul>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .hero {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        background-color: var(--color-surface-3);
      }
      .hero__media {
        position: absolute;
        inset: 0;
        z-index: -1;
      }
      .hero__media img {
        width: 100%; height: 100%;
        object-fit: cover;
        object-position: center;
      }
      .hero__scrim {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(8, 15, 30, 0.55) 0%, rgba(8, 15, 30, 0.85) 100%);
      }
      .hero__inner {
        position: relative;
        padding-block: var(--space-16) var(--space-20);
        color: var(--color-text-inverse);
      }
      @media (min-width: 768px) {
        .hero__inner { padding-block: var(--space-20) var(--space-24); }
      }
      .hero__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-1) var(--space-3);
        background-color: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        letter-spacing: var(--tracking-wide);
        text-transform: uppercase;
        margin-bottom: var(--space-4);
      }
      .hero__title {
        font-size: var(--text-4xl);
        line-height: var(--leading-tight);
        font-weight: var(--weight-bold);
        letter-spacing: var(--tracking-tight);
        max-width: 720px;
        margin-bottom: var(--space-4);
      }
      @media (min-width: 768px) {
        .hero__title { font-size: var(--text-5xl); }
      }
      .hero__subtitle {
        font-size: var(--text-lg);
        line-height: var(--leading-relaxed);
        max-width: 580px;
        color: rgba(255, 255, 255, 0.86);
        margin-bottom: var(--space-6);
      }
      .hero__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-bottom: var(--space-10);
      }
      .hero__stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-4);
        max-width: 480px;
        padding-top: var(--space-6);
        border-top: 1px solid rgba(255, 255, 255, 0.18);
      }
      .hero__stats li {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .hero__stats strong {
        font-size: var(--text-2xl);
        font-weight: var(--weight-bold);
        line-height: 1;
      }
      .hero__stats span {
        font-size: var(--text-xs);
        color: rgba(255, 255, 255, 0.72);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
      }

      /* The .btn-primary / .btn-secondary classes work on the <a> tags because the
         global .btn styles in styles.css are not tag-scoped. To make them visually
         correct on a dark hero, we override colors here. */
      .hero__actions .btn-primary {
        background-color: #ffffff;
        color: var(--color-text);
      }
      .hero__actions .btn-primary:hover { background-color: rgba(255, 255, 255, 0.92); }
      .hero__actions .btn-secondary {
        background-color: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.32);
        backdrop-filter: blur(8px);
      }
      .hero__actions .btn-secondary:hover { background-color: rgba(255, 255, 255, 0.2); }
    `,
  ],
})
export class HeroComponent {
  @Input() loggedIn = false;
}
