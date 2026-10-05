// Angular 19 standalone bootstrap — replaces AppModule entirely.
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { isDevMode } from '@angular/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { sampleReducer } from './app/state/reducers/sample.reducer';
import { counterReducer } from './app/state/reducers/counter.reducer';
import { bookingReducer } from './app/state/reducers/booking.reducer';
import { tokenInterceptor } from './app/services/token.interceptor';
import { BookingsEffect } from './app/state/effects/booking.effects';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideStore({
      sample: sampleReducer,
      counter: counterReducer,
      booking: bookingReducer,
    }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects([BookingsEffect]),
  ],
}).catch((err) => console.error(err));
