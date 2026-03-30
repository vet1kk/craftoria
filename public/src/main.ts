import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { localeHeaderInterceptor } from './app/interceptors/locale-header.interceptor';
import { AuthApiService, UserService } from './app/services';
import { environment } from './environments/environment';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([localeHeaderInterceptor])),
    provideAppInitializer(() => {
      const authApiService = inject(AuthApiService);
      const authService = inject(UserService);

      return authApiService.session().pipe(
        map((response) => response.data),
        tap((session) => {
          authService.setCurrentUser(session.authenticated && session.user ? session.user : null);
        }),
        map(() => void 0),
        catchError(() => {
          authService.clearCurrentUser();
          return of(void 0);
        })
      );
    }),
    importProvidersFrom(
      NgxGoogleAnalyticsModule.forRoot(environment.gaMeasurementId),
      NgxGoogleAnalyticsRouterModule
    ),
  ]
}).catch((err: unknown) => console.error(err));
