import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { ToastComponent } from 'src/app/shared/components/toast/toast.component';

/** Cross-field validator: Password === ConfirmPassword */
function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('Password')?.value;
  const confirm = control.get('ConfirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    ToastComponent,
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
            <h1>Create your account</h1>
            <p>Start booking direct flights in minutes.</p>
          </header>

          @if (success()) {
            <div class="auth__success">
              <app-toast variant="success" title="Account created" [dismissible]="false">
                Welcome aboard! Redirecting you to sign in…
              </app-toast>
            </div>
          }

          <form
            [formGroup]="form"
            (ngSubmit)="submitForm()"
            novalidate
            autocomplete="on"
          >
            <div class="form-field">
              <label for="name" class="label">
                Full name <span class="required" aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                type="text"
                autocomplete="name"
                formControlName="Name"
                class="input"
                [attr.aria-invalid]="invalid('Name')"
                [attr.aria-describedby]="invalid('Name') ? 'name-error' : null"
              />
              @if (invalid('Name')) {
                <p class="form-error" id="name-error" role="alert">
                  <app-icon name="alert" [size]="14" /> Please enter your name.
                </p>
              }
            </div>

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
                  <app-icon name="alert" [size]="14" /> Please enter a valid email.
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
                  autocomplete="new-password"
                  formControlName="Password"
                  class="input"
                  placeholder="At least 6 characters"
                  [attr.aria-invalid]="invalid('Password')"
                  [attr.aria-describedby]="invalid('Password') ? 'password-error' : 'password-hint'"
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
                  <app-icon name="alert" [size]="14" /> Password must be at least 6 characters.
                </p>
              } @else {
                <p class="form-hint" id="password-hint">
                  Use at least 6 characters.
                </p>
              }
            </div>

            <div class="form-field">
              <label for="confirm" class="label">
                Confirm password <span class="required" aria-hidden="true">*</span>
              </label>
              <input
                id="confirm"
                [type]="showPassword() ? 'text' : 'password'"
                autocomplete="new-password"
                formControlName="ConfirmPassword"
                class="input"
                [attr.aria-invalid]="form.hasError('passwordsMismatch') && form.get('ConfirmPassword')?.touched"
                aria-describedby="confirm-error"
              />
              @if (form.hasError('passwordsMismatch') && form.get('ConfirmPassword')?.touched) {
                <p class="form-error" id="confirm-error" role="alert">
                  <app-icon name="alert" [size]="14" /> Passwords don't match.
                </p>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block btn-lg"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="btn-spinner" aria-hidden="true"></span>
                <span>Creating account…</span>
              } @else {
                <span>Create account</span>
              }
            </button>
          </form>

          <p class="auth__alt">
            Already have an account?
            <a routerLink="/login" class="btn-link">Sign in</a>
          </p>
        </div>
      </div>
    </section>
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
      .auth__success { margin-bottom: var(--space-4); }
      .auth__alt {
        margin-top: var(--space-6);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authentication = inject(AuthenticationService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly success = signal(false);

  form = this.fb.group(
    {
      Name: ['', [Validators.required, Validators.minLength(2)]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      ConfirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {}

  togglePassword(): void {
    this.showPassword.update((v) => !v);
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
    this.loading.set(true);
    const { Name, Email, Password } = this.form.value as any;
    this.authentication.registerUser({ Name, Email, Password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.loading.set(false);
  }
}
