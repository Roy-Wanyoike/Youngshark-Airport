import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../shared/components/modal/modal.component';

/**
 * Backward-compatible <app-error> wrapper.
 *
 * Replaces the broken hand-rolled modal:
 *   - rbga typo (no shadow rendered)
 *   - no focus trap, no role=dialog, no Escape, off-center on mobile
 *
 * Now delegates to the accessible <app-modal> shared component.
 */
@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      title="Something went wrong"
      size="sm"
      [showFooter]="true"
      (close)="onClose.emit()"
    >
      <p>{{ errorMessage }}</p>
      <div modalFooter>
        <button type="button" class="btn btn-primary" (click)="onClose.emit()">Close</button>
      </div>
    </app-modal>
  `,
})
export class ErrorComponent {
  @Input() errorMessage = '';
  @Output() onClose = new EventEmitter<void>();
}
