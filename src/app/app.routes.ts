import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((c) => c.HomeComponent),
    title: 'Youngshark Airport — Direct flights to your destination',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then((c) => c.RegisterComponent),
    title: 'Create your account — Youngshark Airport',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((c) => c.LoginComponent),
    title: 'Sign in — Youngshark Airport',
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./bookings/booking/booking.component').then((c) => c.BookingComponent),
    title: 'My bookings — Youngshark Airport',
  },
  {
    path: 'book/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./bookings/single-booking/single-booking.component').then(
        (c) => c.SingleBookingComponent,
      ),
    title: 'Booking details — Youngshark Airport',
  },
  {
    path: 'book/:id/edit',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./bookings/update-booking/update-booking.component').then(
        (c) => c.UpdateBookingComponent,
      ),
    title: 'Edit booking — Youngshark Airport',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./page-not-found/page-not-found.component').then(
        (c) => c.PageNotFoundComponent,
      ),
    title: '404 — Page not found | Youngshark Airport',
  },
];
