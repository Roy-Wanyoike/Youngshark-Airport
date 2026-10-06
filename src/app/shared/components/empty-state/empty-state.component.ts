import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/**
 * Empty state — answers "what is empty, why, what's next?".
 * Use inside *ngIf blocks where data is missing.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="empty-state" role="status">
      <div class="empty-state__icon">
        <app-icon [name]="icon" [size]="48" [strokeWidth]="1.5" />
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      @if (description) {
        <p class="empty-state__description">{{ description }}</p>
      }
      @if (actionLabel) {
        <div class="empty-state__action">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--space-12) var(--space-6);
        gap: var(--space-3);
      }
      .empty-state__icon {
        display: grid;
        place-items: center;
        width: 80px; height: 80px;
        border-radius: var(--radius-full);
        background-color: var(--color-surface-2);
        color: var(--color-text-subtle);
        margin-bottom: var(--space-2);
      }
      .empty-state__title {
        font-size: var(--text-lg);
        font-weight: var(--weight-semibold);
        color: var(--color-text);
        margin: 0;
      }
      .empty-state__description {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        max-width: 420px;
        margin: 0 auto;
      }
      .empty-state__action { margin-top: var(--space-4); }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
  @Input() actionLabel = '';
}
