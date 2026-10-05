import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app-state';
import {
  selectSelectedBooking,
  selectBookingsLoading,
  selectBookingsError,
} from 'src/app/state/reducers/booking.reducer';
import {
  getSingleBookingId,
  updateBooking,
} from 'src/app/state/actions/booking.actions';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { SkeletonComponent } from 'src/app/shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-update-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container-page">
        <nav aria-label="Breadcrumb" class="breadcrumb">
          <a routerLink="/book">My bookings</a>
          <span aria-hidden="true">/</span>
          <a [routerLink]="['/book', id()]">Details</a>
          <span aria-hidden="true">/</span>
          <span>Edit</span>
        </nav>

        <header class="page-head">
          <p class="page-head__eyebrow">Edit booking</p>
          <h1>Update your trip</h1>
          <p class="page-head__lead">Change the destination or travel date for this booking.</p>
        </header>

        @if (loading()) {
          <div class="card" aria-busy="true">
            <div class="edit-grid">
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
            </div>
            <div class="edit-actions">
              <app-skeleton variant="text" width="80px" />
              <app-skeleton variant="text" width="120px" />
            </div>
          </div>
        } @else if (error()) {
          <div class="card error-card">
            <h3>Couldn't load this booking</h3>
            <p>{{ error() }}</p>
            <a routerLink="/book" class="btn btn-secondary">Back to bookings</a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submitForm()" class="card edit-form" novalidate>
            <div class="edit-grid">
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
                    <app-icon name="alert" [size]="14" /> Please pick a valid date.
                  </p>
                } @else {
                  <p class="form-hint" id="date-hint">Pick a date from today onwards.</p>
                }
              </div>
            </div>

            <div class="edit-actions">
              <a [routerLink]="['/book', id()]" class="btn btn-ghost">Cancel</a>
              <button type="submit" class="btn btn-primary" [disabled]="loadingSubmit()">
                @if (loadingSubmit()) { <span class="btn-spinner" aria-hidden="true"></span> }
                <span>Save changes</span>
              </button>
            </div>
          </form>
        }
      </div>
    </section>
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
        flex-wrap: wrap;
      }
      .breadcrumb a { color: var(--color-primary); }
      .breadcrumb a:hover { text-decoration: underline; }
      .breadcrumb span[aria-hidden] { color: var(--color-text-subtle); }

      .page-head { margin-bottom: var(--space-8); }
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

      .edit-form { padding: var(--space-6); }
      .edit-grid {
        display: grid;
        gap: var(--space-4);
        grid-template-columns: 1fr;
      }
      @media (min-width: 768px) { .edit-grid { grid-template-columns: 2fr 1fr; } }
      .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-6);
        padding-top: var(--space-6);
        border-top: 1px solid var(--color-border);
      }
      .input-group { position: relative; display: flex; align-items: center; }
      .input-group__prefix {
        position: absolute;
        left: var(--space-3);
        color: var(--color-text-subtle);
        pointer-events: none;
      }
      .input--with-prefix { padding-left: calc(var(--space-3) + 20px + var(--space-2)); }

      .error-card { text-align: center; }
      .error-card h3 { font-size: var(--text-lg); margin-bottom: var(--space-2); }
      .error-card p { color: var(--color-text-muted); margin-bottom: var(--space-4); }
    `,
  ],
})
export class UpdateBookingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store<AppState>);

  readonly id = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly loadingSubmit = signal(false);
  private readonly formInitialized = signal(false);

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
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.id.set(id);
      this.store.dispatch(getSingleBookingId({ id }));
    });

    this.store.select(selectSelectedBooking).subscribe((b: any) => {
      if (b && !this.formInitialized()) {
        const date = new Date(b.TravelDate).toISOString().slice(0, 10);
        this.form.setValue({ Destination: b.Destination, TravelDate: date });
        this.formInitialized.set(true);
      }
    });
    this.store.select(selectBookingsLoading).subscribe((l) => this.loading.set(l));
    this.store.select(selectBookingsError).subscribe((e) => this.error.set(e));
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
    this.store.dispatch(
      updateBooking({ updatedBooking: this.form.value as any, id: this.id() }),
    );
    setTimeout(() => {
      this.loadingSubmit.set(false);
      this.router.navigate(['../'], { relativeTo: this.route });
    }, 400);
  }
}
