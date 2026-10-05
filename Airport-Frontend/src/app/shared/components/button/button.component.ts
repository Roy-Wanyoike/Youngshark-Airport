import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg';

/**
 * Button component — wraps the .btn design-system classes.
 *
 * Why a component (and not just CSS classes)?
 *   - Enforces consistent loading state (spinner + disabled) across the app.
 *   - Type defaults to "button" (HTML default is "submit" which has caused bugs).
 *   - icon + iconRight slots standardized.
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (loading) {
      <span class="btn-spinner" aria-hidden="true"></span>
    } @else if (icon) {
      <app-icon [name]="icon" [size]="iconSize" />
    }
    <ng-content></ng-content>
    @if (iconRight && !loading) {
      <app-icon [name]="iconRight" [size]="iconSize" />
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        min-height: 44px;
        padding-inline: var(--space-5);
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        line-height: 1;
        letter-spacing: var(--tracking-wide);
        border-radius: var(--radius-md);
        border: 1px solid transparent;
        cursor: pointer;
        user-select: none;
        text-decoration: none;
        transition: background-color var(--transition-fast), border-color var(--transition-fast),
                    color var(--transition-fast), box-shadow var(--transition-fast),
                    transform var(--transition-fast);
        white-space: nowrap;
      }
      :host:active { transform: translateY(1px); }
      :host[disabled], :host.is-disabled { opacity: 0.5; pointer-events: none; }

      :host(.btn-primary) { background-color: var(--color-primary); color: var(--color-primary-foreground); }
      :host(.btn-primary):hover { background-color: var(--color-primary-hover); }

      :host(.btn-secondary) { background-color: var(--color-surface); color: var(--color-text); border-color: var(--color-border-strong); }
      :host(.btn-secondary):hover { background-color: var(--color-surface-2); border-color: var(--color-text-subtle); }

      :host(.btn-ghost) { background-color: transparent; color: var(--color-text-muted); }
      :host(.btn-ghost):hover { background-color: var(--color-surface-2); color: var(--color-text); }

      :host(.btn-danger) { background-color: var(--color-error); color: #ffffff; }
      :host(.btn-danger):hover { filter: brightness(0.92); }

      :host(.btn-link) { background: none; color: var(--color-primary); padding: 0; min-height: auto; text-decoration: underline; text-underline-offset: 3px; }
      :host(.btn-link):hover { color: var(--color-primary-hover); }

      :host(.btn-sm) { min-height: 36px; padding-inline: var(--space-3); font-size: var(--text-xs); }
      :host(.btn-lg) { min-height: 52px; padding-inline: var(--space-8); font-size: var(--text-base); }
      :host(.btn-block) { width: 100%; }

      .btn-spinner {
        width: 16px; height: 16px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: var(--radius-full);
        animation: btn-spin 0.8s linear infinite;
      }
      @keyframes btn-spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: Variant = 'primary';
  @Input() size: Size = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  @Input() icon: string = '';
  @Input() iconRight: string = '';
  @Input() ariaLabel = '';
  @Input() iconSize = 18;
}
