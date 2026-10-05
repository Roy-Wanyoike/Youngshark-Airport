import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton placeholder for loading states.
 * Use `<app-skeleton variant="text" />` for inline text,
 * `<app-skeleton variant="line" width="60%" />` for table rows, etc.
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton skeleton--{{ variant }}"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius"
      aria-hidden="true"
    ></div>
  `,
  styles: [
    `
      :host { display: block; }
      .skeleton--text { height: 14px; width: 100%; }
      .skeleton--line { height: 20px; width: 100%; }
      .skeleton--avatar { width: 40px; height: 40px; border-radius: var(--radius-full); }
      .skeleton--card { height: 80px; width: 100%; border-radius: var(--radius-md); }
    `,
  ],
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'line' | 'avatar' | 'card' = 'text';
  @Input() width = '';
  @Input() height = '';
  @Input() radius = 'var(--radius-md)';
}
