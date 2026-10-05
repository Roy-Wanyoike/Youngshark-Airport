import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AuthService } from 'src/app/services/auth.service';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    ModalComponent,
  ],
  template: `
    <section class="auth">
      <div class="container-page auth__inner">
        <div class="auth__media" aria-hidden="true">
          <img
            src="/assets/images/plane-illustration.jpg"
            alt=""
            width="800" height="800"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="auth__card card">
          <header class="auth__head">
            <h1>Welcome back</h1>
            <p>Sign in to manage your bookings.</p>
          </header>

          <form
            [formGroup]="form"
            (ngSubmit)="submitForm()"
            novalidate
            autocomplete="on"
          >
            <div class="form-field">
              <label for="email" class="label">
                Email <span class="required" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                autocomplete="email"
                formControlName="Email"
                class="input"
                placeholder="you@example.com"
                [attr.aria-invalid]="invalid('Email')"
                [attr.aria-describedby]="invalid('Email') ? 'email-error' : null"
              />
              @if (invalid('Email')) {
                <p class="form-error" id="email-error" role="alert">
                  <app-icon name="alert" [size]="14" />
                  Please enter a valid email address.
                </p>
              }
            </div>

            <div class="form-field">
              <label for="password" class="label">
                Password <span class="required" aria-hidden="true">*</span>
              </label>
              <div class="input-group">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  formControlName="Password"
                  class="input"
                  placeholder="••••••••"
                  [attr.aria-invalid]="invalid('Password')"
                  [attr.aria-describedby]="invalid('Password') ? 'password-error' : null"
                />
                <button
                  type="button"
                  class="btn btn-ghost btn-icon input-group-suffix"
                  (click)="togglePassword()"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  [attr.aria-pressed]="showPassword()"
                >
                  <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18" />
                </button>
              </div>
              @if (invalid('Password')) {
                <p class="form-error" id="password-error" role="alert">
                  <app-icon name="alert" [size]="14" />
                  Please enter your password.
                </p>
              }
            </div>

            <div class="auth__row">
              <label class="checkbox">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <a routerLink="/" class="btn-link">Forgot password?</a>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block btn-lg"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="btn-spinner" aria-hidden="true"></span>
                <span>Signing in…</span>
              } @else {
                <span>Sign in</span>
              }
            </button>
          </form>

          <p class="auth__alt">
            Don't have an account?
            <a routerLink="/register" class="btn-link">Create one</a>
          </p>
        </div>
      </div>
    </section>

    @if (showError()) {
      <app-modal
        title="Sign-in failed"
        [dismissible]="true"
        [showFooter]="true"
        (close)="closeError()"
      >
        <p>{{ errorMessage() }}</p>
        <div modalFooter>
          <button type="button" class="btn btn-primary" (click)="closeError()">Try again</button>
        </div>
      </app-modal>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .auth { padding-block: var(--space-12); }
      @media (min-width: 768px) { .auth { padding-block: var(--space-16); } }
      .auth__inner {
        display: grid;
        gap: var(--space-8);
        grid-template-columns: 1fr;
        align-items: center;
      }
      @media (min-width: 1024px) {
        .auth__inner { grid-template-columns: 1fr 1fr; gap: var(--space-16); }
      }
      .auth__media {
        display: none;
        border-radius: var(--radius-2xl);
        overflow: hidden;
        aspect-ratio: 4 / 3;
      }
      @media (min-width: 1024px) { .auth__media { display: block; } }
      .auth__media img { width: 100%; height: 100%; object-fit: cover; }
      .auth__card { max-width: 480px; margin-inline: auto; width: 100%; }
      .auth__head { margin-bottom: var(--space-6); }
      .auth__head h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
      .auth__head p { color: var(--color-text-muted); }
      .auth__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        margin-bottom: var(--space-5);
        font-size: var(--text-sm);
      }
      .checkbox { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-text-muted); cursor: pointer; }
      .checkbox input { width: 16px; height: 16px; accent-color: var(--color-primary); }
      .auth__alt {
        margin-top: var(--space-6);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authentication = inject(AuthenticationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly showError = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    Email: ['', [Validators.required, Validators.email]],
    Password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/book']);
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  invalid(control: 'Email' | 'Password'): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authentication.loginUser(this.form.value as any).subscribe({
      next: (response) => {
        this.auth.setRole(response.role);
        this.auth.setName(response.name);
        this.auth.login();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', response.token);
        }
        this.loading.set(false);
        this.router.navigate(['book']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? error?.message ?? 'Could not sign in. Please try again.',
        );
        this.showError.set(true);
      },
    });
  }

  closeError(): void {
    this.showError.set(false);
  }

  ngOnDestroy(): void {
    this.loading.set(false);
  }
}
