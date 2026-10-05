// Browser bootstrap — uses the shared appConfig + client hydration.
import { bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideClientHydration(withEventReplay()),
  ],
}).catch((err) => console.error(err));
