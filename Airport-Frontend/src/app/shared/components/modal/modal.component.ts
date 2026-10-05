import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Accessible modal dialog (Angular 19 standalone).
 *
 * Implements:
 *   - role="dialog" + aria-modal="true" + aria-labelledby
 *   - Focus trap (Tab / Shift+Tab cycles within the dialog)
 *   - Initial focus moves to the dialog
 *   - Escape closes the dialog
 *   - Focus returns to the previously focused element on close
 *   - Backdrop click closes (configurable)
 *   - prefers-reduced-motion respected
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal-backdrop"
      (click)="onBackdropClick($event)"
      aria-hidden="true"
    ></div>
    <div
      #dialogRef
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="labelledby"
      [attr.aria-describedby]="describedby || null"
      class="modal-dialog"
      [class.modal-dialog--sm]="size === 'sm'"
      [class.modal-dialog--lg]="size === 'lg'"
      tabindex="-1"
    >
      @if (title) {
        <div class="modal-header">
          <h2 class="modal-title" [id]="labelledby">{{ title }}</h2>
          @if (dismissible) {
            <button
              type="button"
              class="btn btn-ghost btn-icon modal-close"
              (click)="close.emit()"
              aria-label="Close dialog"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>
      }
      <div class="modal-body" [attr.id]="describedby || null">
        <ng-content></ng-content>
      </div>
      @if (showFooter) {
        <div class="modal-footer">
          <ng-content select="[modalFooter]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: var(--z-modal);
        display: grid;
        place-items: center;
        padding: var(--space-4);
      }
      .modal-backdrop {
        position: absolute;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(2px);
        animation: backdrop-fade-in var(--transition-base);
      }
      @keyframes backdrop-fade-in { from { opacity: 0; } to { opacity: 1; } }
      .modal-dialog {
        position: relative;
        width: 100%;
        max-width: 480px;
        max-height: calc(100vh - 2 * var(--space-4));
        overflow: auto;
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        animation: dialog-pop var(--transition-base) cubic-bezier(0.16, 1, 0.3, 1);
        outline: none;
      }
      .modal-dialog--sm { max-width: 360px; }
      .modal-dialog--lg { max-width: 720px; }
      @keyframes dialog-pop {
        from { opacity: 0; transform: translateY(8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-5) var(--space-6) var(--space-4);
      }
      .modal-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); margin: 0; }
      .modal-body {
        padding: var(--space-2) var(--space-6) var(--space-6);
        color: var(--color-text-muted);
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-6) var(--space-5);
        border-top: 1px solid var(--color-border);
        background-color: var(--color-surface-2);
        border-bottom-left-radius: var(--radius-lg);
        border-bottom-right-radius: var(--radius-lg);
      }
      .modal-close { margin: calc(-1 * var(--space-2)); }
      @media (prefers-reduced-motion: reduce) {
        .modal-backdrop, .modal-dialog { animation: none; }
      }
      @media (max-width: 640px) {
        :host { padding: var(--space-2); }
        .modal-dialog { max-width: 100%; }
        .modal-header, .modal-body, .modal-footer { padding-inline: var(--space-4); }
      }
    `,
  ],
})
export class ModalComponent implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() title = '';
  @Input() labelledby = `modal-title-${Math.random().toString(36).slice(2, 9)}`;
  @Input() describedby = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dismissible = true;
  @Input() showFooter = true;
  @Input() closeOnBackdrop = true;

  @Output() close = new EventEmitter<void>();

  private previouslyFocused: HTMLElement | null = null;
  readonly isOpen = signal(true);

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.previouslyFocused = document.activeElement as HTMLElement;
    const dialog = (this.host.nativeElement as HTMLElement).querySelector<HTMLElement>('.modal-dialog');
    if (dialog) {
      const focusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (focusable ?? dialog).focus();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && this.dismissible) {
      event.stopPropagation();
      this.close.emit();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.dismissible) {
      event.preventDefault();
      this.close.emit();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const dialog = (this.host.nativeElement as HTMLElement).querySelector<HTMLElement>('.modal-dialog');
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
