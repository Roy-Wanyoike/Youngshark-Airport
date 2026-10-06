import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/**
 * Toast / inline alert — semantic colors via variant.
 * role="alert" so screen readers announce immediately.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="toast toast--{{ variant }}"
      role="alert"
      aria-live="assertive"
    >
      <div class="toast__icon">
        <app-icon [name]="iconName" [size]="20" />
      </div>
      <div class="toast__content">
        @if (title) {
          <p class="toast__title">{{ title }}</p>
        }
        <p class="toast__message">
          <ng-content></ng-content>
        </p>
      </div>
      @if (dismissible) {
        <button
          type="button"
          class="btn btn-ghost btn-icon toast__close"
          (click)="dismiss.emit()"
          aria-label="Dismiss notification"
        >
          <app-icon name="close" [size]="18" />
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .toast {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-surface);
      }
      .toast--success { background-color: var(--color-success-subtle); border-color: var(--color-success); color: var(--color-success); }
      .toast--error   { background-color: var(--color-error-subtle);   border-color: var(--color-error);   color: var(--color-error); }
      .toast--warning { background-color: var(--color-warning-subtle); border-color: var(--color-warning); color: var(--color-warning); }
      .toast--info    { background-color: var(--color-info-subtle);    border-color: var(--color-info);    color: var(--color-info); }
      .toast__icon { flex-shrink: 0; margin-top: 2px; }
      .toast__content { flex: 1 1 auto; color: var(--color-text); }
      .toast__title { font-weight: var(--weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1); }
      .toast__message { font-size: var(--text-sm); color: var(--color-text-muted); }
      .toast__close { flex-shrink: 0; margin: calc(-1 * var(--space-1)); }
    `,
  ],
})
export class ToastComponent {
  @Input() variant: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() title = '';
  @Input() dismissible = true;
  @Output() dismiss = new EventEmitter<void>();

  get iconName(): string {
    return {
      success: 'check',
      error: 'alert',
      warning: 'alert',
      info: 'alert',
    }[this.variant];
  }
}
