import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeUk from '@angular/common/locales/uk';
import { inject, LOCALE_ID, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { AuthService } from './services';
import { localeHeaderInterceptor } from './interceptors/locale-header.interceptor';

registerLocaleData(localeUk);

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([localeHeaderInterceptor])
    ),

    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initialize();
    }),

    { provide: LOCALE_ID, useValue: 'uk' }
  ]
}).catch((err) => console.error(err));
