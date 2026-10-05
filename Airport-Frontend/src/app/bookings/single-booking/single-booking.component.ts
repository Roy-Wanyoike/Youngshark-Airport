import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app-state';
import {
  selectSelectedBooking,
  selectBookingsLoading,
  selectBookingsError,
} from 'src/app/state/reducers/booking.reducer';
import {
  deleteBooking,
  getSingleBookingId,
  getBookings,
} from 'src/app/state/actions/booking.actions';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { SkeletonComponent } from 'src/app/shared/components/skeleton/skeleton.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-single-booking',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    SkeletonComponent,
    ModalComponent,
    EmptyStateComponent,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container-page">
        <nav aria-label="Breadcrumb" class="breadcrumb">
          <a routerLink="/book">My bookings</a>
          <span aria-hidden="true">/</span>
          <span>Details</span>
        </nav>

        @if (loading()) {
          <div class="card detail-card" aria-busy="true" aria-live="polite">
            <div class="detail-card__head">
              <app-skeleton variant="avatar" />
              <div class="detail-card__head-text">
                <app-skeleton variant="line" width="40%" />
                <app-skeleton variant="text" width="60%" />
              </div>
            </div>
            <div class="detail-grid">
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
            </div>
          </div>
        } @else if (error()) {
          <div class="card error-card">
            <h3>Couldn't load this booking</h3>
            <p>{{ error() }}</p>
            <div class="error-card__actions">
              <button type="button" class="btn btn-secondary" (click)="retry()">
                <app-icon name="refresh" [size]="16" /> Try again
              </button>
              <a routerLink="/book" class="btn btn-ghost">Back to bookings</a>
            </div>
          </div>
        } @else if (booking()) {
          <div class="card detail-card">
            <header class="detail-card__head">
              <div class="detail-card__avatar">{{ initial(booking()!.Name) }}</div>
              <div class="detail-card__head-text">
                <p class="detail-card__eyebrow">Booking</p>
                <h1>{{ booking()!.Name }}</h1>
                <p class="detail-card__email">{{ booking()!.Email }}</p>
              </div>
              <span class="badge badge-info">
                <app-icon name="pin" [size]="12" /> {{ booking()!.Destination }}
              </span>
            </header>

            <div class="detail-grid">
              <div class="detail-cell">
                <div class="detail-cell__icon"><app-icon name="pin" [size]="18" /></div>
                <div>
                  <p class="detail-cell__label">Destination</p>
                  <p class="detail-cell__value">{{ booking()!.Destination }}</p>
                </div>
              </div>
              <div class="detail-cell">
                <div class="detail-cell__icon"><app-icon name="calendar" [size]="18" /></div>
                <div>
                  <p class="detail-cell__label">Travel date</p>
                  <p class="detail-cell__value">{{ booking()!.TravelDate | date: 'fullDate' }}</p>
                </div>
              </div>
              <div class="detail-cell">
                <div class="detail-cell__icon"><app-icon name="user" [size]="18" /></div>
                <div>
                  <p class="detail-cell__label">Passenger</p>
                  <p class="detail-cell__value">{{ booking()!.Name }}</p>
                </div>
              </div>
            </div>

            <div class="detail-card__actions">
              <a [routerLink]="['/book', id(), 'edit']" class="btn btn-secondary">
                <app-icon name="edit" [size]="16" /> Edit
              </a>
              <button type="button" class="btn btn-danger" (click)="askDelete()">
                <app-icon name="trash" [size]="16" /> Delete
              </button>
            </div>
          </div>
        } @else {
          <div class="card">
            <app-empty-state
              icon="inbox"
              title="Booking not found"
              description="This booking may have been deleted or never existed."
            >
              <a routerLink="/book" class="btn btn-primary">Back to bookings</a>
            </app-empty-state>
          </div>
        }
      </div>
    </section>

    @if (showConfirm()) {
      <app-modal
        title="Delete this booking?"
        size="sm"
        (close)="cancelDelete()"
      >
        <p>
          This will permanently remove the booking to
          <strong>{{ booking()?.Destination }}</strong>. This action cannot be undone.
        </p>
        <div modalFooter>
          <button type="button" class="btn btn-ghost" (click)="cancelDelete()">Cancel</button>
          <button type="button" class="btn btn-danger" (click)="confirmDelete()">
            <app-icon name="trash" [size]="16" /> Delete
          </button>
        </div>
      </app-modal>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-6);
      }
      .breadcrumb a { color: var(--color-primary); }
      .breadcrumb a:hover { text-decoration: underline; }
      .breadcrumb span[aria-hidden] { color: var(--color-text-subtle); }

      .detail-card { padding: var(--space-8); }
      .detail-card__head {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-8);
        flex-wrap: wrap;
      }
      .detail-card__avatar {
        display: grid; place-items: center;
        width: 56px; height: 56px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary-subtle);
        color: var(--color-primary);
        font-size: var(--text-xl);
        font-weight: var(--weight-bold);
      }
      .detail-card__head-text { flex: 1; min-width: 200px; }
      .detail-card__eyebrow {
        font-size: var(--text-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wider);
        color: var(--color-text-subtle);
        margin-bottom: var(--space-1);
      }
      .detail-card__head-text h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
      .detail-card__email { font-size: var(--text-sm); color: var(--color-text-muted); }
      .detail-grid {
        display: grid;
        gap: var(--space-4);
        grid-template-columns: 1fr;
        margin-bottom: var(--space-8);
      }
      @media (min-width: 768px) { .detail-grid { grid-template-columns: repeat(3, 1fr); } }
      .detail-cell {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background-color: var(--color-surface-2);
      }
      .detail-cell__icon {
        display: grid; place-items: center;
        width: 36px; height: 36px;
        background-color: var(--color-surface);
        color: var(--color-primary);
        border-radius: var(--radius-md);
        flex-shrink: 0;
      }
      .detail-cell__label {
        font-size: var(--text-xs);
        color: var(--color-text-subtle);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        margin-bottom: var(--space-1);
      }
      .detail-cell__value { font-weight: var(--weight-semibold); }
      .detail-card__actions {
        display: flex;
        gap: var(--space-3);
        justify-content: flex-end;
      }
      .error-card { text-align: center; }
      .error-card h3 { font-size: var(--text-lg); margin-bottom: var(--space-2); }
      .error-card p { color: var(--color-text-muted); margin-bottom: var(--space-4); }
      .error-card__actions { display: flex; gap: var(--space-3); justify-content: center; }
    `,
  ],
})
export class SingleBookingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store<AppState>);

  readonly id = signal('');
  readonly booking = signal<any>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showConfirm = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.id.set(id);
      this.store.dispatch(getSingleBookingId({ id }));
    });

    this.store.select(selectSelectedBooking).subscribe((b: any) => this.booking.set(b ?? null));
    this.store.select(selectBookingsLoading).subscribe((l) => this.loading.set(l));
    this.store.select(selectBookingsError).subscribe((e) => this.error.set(e));
  }

  retry(): void {
    this.store.dispatch(getBookings());
    this.store.dispatch(getSingleBookingId({ id: this.id() }));
  }

  askDelete(): void {
    this.showConfirm.set(true);
  }

  cancelDelete(): void {
    this.showConfirm.set(false);
  }

  confirmDelete(): void {
    this.showConfirm.set(false);
    this.store.dispatch(deleteBooking({ id: this.id() }));
    this.router.navigate(['/book']);
  }

  initial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }
}
