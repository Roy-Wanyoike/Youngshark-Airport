import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from 'src/app/state/app-state';
import { Booking } from 'src/app/shared/interfaces';
import {
  selectAllBookings,
  selectBookingsError,
  selectBookingsLoading,
  selectAddSuccess,
  selectAddError,
  selectDeleteSuccess,
} from 'src/app/state/reducers/booking.reducer';
import {
  addBooking,
  clearBookingStatus,
  deleteBooking,
  getBookings,
} from 'src/app/state/actions/booking.actions';
import { toggleForm } from 'src/app/state/actions/sample.actions';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { SkeletonComponent } from 'src/app/shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { ToastComponent } from 'src/app/shared/components/toast/toast.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ToastComponent,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container-page">
        <header class="page-head">
          <div>
            <p class="page-head__eyebrow">Bookings</p>
            <h1>Your flights</h1>
            <p class="page-head__lead">Manage upcoming trips, add new destinations, and view past bookings.</p>
          </div>
          <button type="button" class="btn btn-primary" (click)="toggleForm()" [attr.aria-expanded]="showForm()">
            <app-icon [name]="showForm() ? 'close' : 'plus'" [size]="18" />
            <span>{{ showForm() ? 'Cancel' : 'Add booking' }}</span>
          </button>
        </header>

        @if (addSuccess() || addError() || deleteSuccess()) {
          <div class="page-toast">
            @if (addSuccess()) {
              <app-toast variant="success" title="Booking added" (dismiss)="clearStatus()">
                {{ addSuccess() }}
              </app-toast>
            }
            @if (addError()) {
              <app-toast variant="error" title="Could not add booking" (dismiss)="clearStatus()">
                {{ addError() }}
              </app-toast>
            }
            @if (deleteSuccess()) {
              <app-toast variant="success" title="Booking deleted" (dismiss)="clearStatus()">
                {{ deleteSuccess() }}
              </app-toast>
            }
          </div>
        }

        @if (showForm()) {
          <form [formGroup]="form" (ngSubmit)="submitForm()" class="card booking-form" novalidate>
            <div class="booking-form__grid">
              <div class="form-field">
                <label for="destination" class="label">
                  Destination <span class="required" aria-hidden="true">*</span>
                </label>
                <div class="input-group">
                  <app-icon name="pin" [size]="18" class="input-group__prefix" />
                  <input
                    id="destination"
                    type="text"
                    formControlName="Destination"
                    class="input input--with-prefix"
                    placeholder="Nairobi, Dubai, New York…"
                    [attr.aria-invalid]="invalid('Destination')"
                    [attr.aria-describedby]="invalid('Destination') ? 'destination-error' : 'destination-hint'"
                  />
                </div>
                @if (invalid('Destination')) {
                  <p class="form-error" id="destination-error" role="alert">
                    <app-icon name="alert" [size]="14" /> Destination must be 2–64 letters.
                  </p>
                } @else {
                  <p class="form-hint" id="destination-hint">City or airport name.</p>
                }
              </div>

              <div class="form-field">
                <label for="travel-date" class="label">
                  Travel date <span class="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="travel-date"
                  type="date"
                  formControlName="TravelDate"
                  class="input"
                  [min]="today"
                  [attr.aria-invalid]="invalid('TravelDate')"
                  aria-describedby="date-hint"
                />
                @if (invalid('TravelDate')) {
                  <p class="form-error" id="date-error" role="alert">
                    <app-icon name="alert" [size]="14" /> Please pick a future date.
                  </p>
                } @else {
                  <p class="form-hint" id="date-hint">Pick a date from today onwards.</p>
                }
              </div>
            </div>

            <div class="booking-form__actions">
              <button type="button" class="btn btn-ghost" (click)="toggleForm()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loadingSubmit()">
                @if (loadingSubmit()) { <span class="btn-spinner" aria-hidden="true"></span> }
                <span>Save booking</span>
              </button>
            </div>
          </form>
        }

        <!-- Loading state -->
        @if (loading()) {
          <div class="table-wrap" aria-busy="true" aria-live="polite">
            <table class="table">
              <thead>
                <tr><th>Name</th><th>Destination</th><th>Travel date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td><app-skeleton variant="text" /></td>
                    <td><app-skeleton variant="text" /></td>
                    <td><app-skeleton variant="text" width="60%" /></td>
                    <td><app-skeleton variant="text" width="40%" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Error state -->
        @if (!loading() && error()) {
          <div class="card error-card">
            <h3>Couldn't load your bookings</h3>
            <p>{{ error() }}</p>
            <button type="button" class="btn btn-secondary" (click)="retry()">
              <app-icon name="refresh" [size]="16" /> Try again
            </button>
          </div>
        }

        <!-- Empty state -->
        @if (!loading() && !error() && bookings().length === 0) {
          <div class="card">
            <app-empty-state
              icon="plane"
              title="No bookings yet"
              description="Add your first flight and we'll keep track of all your trips in one place."
            >
              <button type="button" class="btn btn-primary" (click)="openForm()">
                <app-icon name="plus" [size]="16" /> Add a booking
              </button>
            </app-empty-state>
          </div>
        }

        <!-- Success: table (desktop ≥768px) / cards (mobile) -->
        @if (!loading() && !error() && bookings().length > 0) {
          <div class="table-wrap desktop-table">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Travel date</th>
                  <th scope="col" class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (booking of bookings(); track booking.Id) {
                  <tr>
                    <td>
                      <div class="booking-cell">
                        <span class="booking-cell__avatar">{{ initial(booking.Name) }}</span>
                        <div>
                          <p class="booking-cell__name">{{ booking.Name }}</p>
                          <p class="booking-cell__email">{{ booking.Email }}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-info">
                        <app-icon name="pin" [size]="12" /> {{ booking.Destination }}
                      </span>
                    </td>
                    <td class="tabular">{{ booking.TravelDate | date: 'mediumDate' }}</td>
                    <td class="text-right">
                      <div class="table-actions">
                        <a [routerLink]="['/book', booking.Id]" class="btn btn-ghost btn-sm" [attr.aria-label]="'View booking ' + booking.Destination">
                          <app-icon name="eye" [size]="14" /> View
                        </a>
                        <a [routerLink]="['/book', booking.Id, 'edit']" class="btn btn-ghost btn-sm" [attr.aria-label]="'Edit booking ' + booking.Destination">
                          <app-icon name="edit" [size]="14" /> Edit
                        </a>
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm btn-danger-ghost"
                          (click)="askDelete(booking)"
                          [attr.aria-label]="'Delete booking to ' + booking.Destination"
                        >
                          <app-icon name="trash" [size]="14" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <ul class="mobile-cards" role="list">
            @for (booking of bookings(); track booking.Id) {
              <li class="card mobile-card">
                <div class="mobile-card__head">
                  <span class="booking-cell__avatar">{{ initial(booking.Name) }}</span>
                  <div>
                    <p class="mobile-card__name">{{ booking.Name }}</p>
                    <p class="mobile-card__email">{{ booking.Email }}</p>
                  </div>
                  <span class="badge badge-info">
                    <app-icon name="pin" [size]="12" /> {{ booking.Destination }}
                  </span>
                </div>
                <div class="mobile-card__row">
                  <app-icon name="calendar" [size]="16" />
                  <span>{{ booking.TravelDate | date: 'fullDate' }}</span>
                </div>
                <div class="mobile-card__actions">
                  <a [routerLink]="['/book', booking.Id]" class="btn btn-secondary btn-sm btn-block">
                    <app-icon name="eye" [size]="14" /> View
                  </a>
                  <a [routerLink]="['/book', booking.Id, 'edit']" class="btn btn-ghost btn-sm btn-block">
                    <app-icon name="edit" [size]="14" /> Edit
                  </a>
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm btn-block btn-danger-ghost"
                    (click)="askDelete(booking)"
                  >
                    <app-icon name="trash" [size]="14" /> Delete
                  </button>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-4);
        margin-bottom: var(--space-8);
      }
      .page-head__eyebrow {
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wider);
        margin-bottom: var(--space-2);
      }
      .page-head h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
      .page-head__lead { color: var(--color-text-muted); max-width: 540px; }
      .page-toast { margin-bottom: var(--space-6); }

      .booking-form { margin-bottom: var(--space-8); }
      .booking-form__grid {
        display: grid;
        gap: var(--space-4);
        grid-template-columns: 1fr;
      }
      @media (min-width: 768px) {
        .booking-form__grid { grid-template-columns: 2fr 1fr; align-items: end; }
      }
      .booking-form__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-4);
      }
      .input-group { position: relative; display: flex; align-items: center; }
      .input-group__prefix {
        position: absolute;
        left: var(--space-3);
        color: var(--color-text-subtle);
        pointer-events: none;
      }
      .input--with-prefix { padding-left: calc(var(--space-3) + 20px + var(--space-2)); }

      .table-wrap { margin-top: var(--space-4); }
      .table-actions { display: inline-flex; gap: var(--space-1); }
      .btn-danger-ghost { color: var(--color-error); }
      .btn-danger-ghost:hover { background-color: var(--color-error-subtle); color: var(--color-error); }

      .booking-cell { display: flex; align-items: center; gap: var(--space-3); }
      .booking-cell__avatar {
        display: grid; place-items: center;
        width: 36px; height: 36px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary-subtle);
        color: var(--color-primary);
        font-weight: var(--weight-semibold);
        font-size: var(--text-sm);
      }
      .booking-cell__name { font-weight: var(--weight-medium); }
      .booking-cell__email { font-size: var(--text-xs); color: var(--color-text-muted); }

      .desktop-table { display: none; }
      .mobile-cards { display: grid; gap: var(--space-4); list-style: none; padding: 0; }
      @media (min-width: 768px) {
        .desktop-table { display: block; }
        .mobile-cards { display: none; }
      }
      .mobile-card { padding: var(--space-4); }
      .mobile-card__head {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
      }
      .mobile-card__head > div { flex: 1; }
      .mobile-card__name { font-weight: var(--weight-semibold); }
      .mobile-card__email { font-size: var(--text-xs); color: var(--color-text-muted); }
      .mobile-card__row {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--color-text-muted);
        font-size: var(--text-sm);
        padding-block: var(--space-3);
        border-top: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
        margin-bottom: var(--space-4);
      }
      .mobile-card__actions { display: grid; gap: var(--space-2); }

      .error-card { text-align: center; }
      .error-card h3 { font-size: var(--text-lg); margin-bottom: var(--space-2); }
      .error-card p { color: var(--color-text-muted); margin-bottom: var(--space-4); }
    `,
  ],
})
export class BookingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store<AppState>);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly bookings = signal<Booking[]>([]);
  readonly showForm = signal(false);
  readonly loadingSubmit = signal(false);
  readonly addSuccess = signal('');
  readonly addError = signal('');
  readonly deleteSuccess = signal('');
  readonly pendingDelete = signal<Booking | null>(null);

  today = new Date().toISOString().slice(0, 10);

  form = this.fb.group({
    Destination: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(64),
        Validators.pattern(/^[a-zA-Z][a-zA-Z\s\-']*$/),
      ],
    ],
    TravelDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.store.dispatch(getBookings());
    this.store.select(selectAllBookings).subscribe((b) => this.bookings.set(b));
    this.store.select(selectBookingsLoading).subscribe((l) => this.loading.set(l));
    this.store.select(selectBookingsError).subscribe((e) => this.error.set(e));
    this.store.select(selectAddSuccess).subscribe((m) => this.addSuccess.set(m ?? ''));
    this.store.select(selectAddError).subscribe((m) => this.addError.set(m ?? ''));
    this.store.select(selectDeleteSuccess).subscribe((m) => this.deleteSuccess.set(m ?? ''));
    // Sync showForm from sample slice
    this.store.select((s: any) => s.sample?.showForm).subscribe((v: boolean) => this.showForm.set(!!v));
  }

  toggleForm(): void {
    this.store.dispatch(toggleForm());
  }

  openForm(): void {
    if (!this.showForm()) this.toggleForm();
  }

  retry(): void {
    this.store.dispatch(getBookings());
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loadingSubmit.set(true);
    this.store.dispatch(addBooking({ newBooking: this.form.value as any }));
    this.store.dispatch(getBookings());
    setTimeout(() => {
      this.loadingSubmit.set(false);
      this.form.reset();
      this.toggleForm();
    }, 600);
  }

  askDelete(booking: Booking): void {
    this.pendingDelete.set(booking);
    if (typeof confirm === 'function') {
      // Inline confirm dialog (will be replaced by the modal version in single-booking.component.ts)
      // but here we keep a simple confirm since the table view doesn't navigate to single-booking.
      const ok = confirm(`Delete the booking to ${booking.Destination}? This cannot be undone.`);
      if (ok) {
        this.store.dispatch(deleteBooking({ id: booking.Id }));
      }
    } else {
      // Fallback when `confirm` is unavailable (e.g. some sandboxed environments)
      this.store.dispatch(deleteBooking({ id: booking.Id }));
    }
    this.pendingDelete.set(null);
  }

  clearStatus(): void {
    this.store.dispatch(clearBookingStatus());
  }

  initial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }
}
