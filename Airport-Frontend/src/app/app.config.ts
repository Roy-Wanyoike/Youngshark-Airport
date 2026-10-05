import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { isDevMode } from '@angular/core';

import { routes } from './app.routes';
import { sampleReducer } from './state/reducers/sample.reducer';
import { counterReducer } from './state/reducers/counter.reducer';
import { bookingReducer } from './state/reducers/booking.reducer';
import { tokenInterceptor } from './services/token.interceptor';
import { BookingsEffect } from './state/effects/booking.effects';

/**
 * Shared application config — used by both browser and server bootstraps.
 *
 * `withFetch()` is recommended for SSR (Angular 19) — uses the native `fetch`
 * API which is available in Node 18+ / Vercel Functions and avoids the legacy
 * XHR shim (`xhr2`) on the server.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideStore({
      sample: sampleReducer,
      counter: counterReducer,
      booking: bookingReducer,
    }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects([BookingsEffect]),
  ],
};

