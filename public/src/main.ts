import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { authTokenInterceptor } from './app/interceptors/auth-token.interceptor';
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
    provideHttpClient(withInterceptors([authTokenInterceptor, localeHeaderInterceptor])),
    provideAppInitializer(() => {
      const authApiService = inject(AuthApiService);
      const userService = inject(UserService);

      if (!userService.getToken()) {
        userService.clearCurrentUser();
        return of(void 0);
      }

      return authApiService.profile().pipe(
        map((response) => response.data),
        tap((user) => {
          userService.setCurrentUser(user);
        }),
        map(() => void 0),
        catchError(() => {
          userService.clearToken();
          userService.clearCurrentUser();
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
