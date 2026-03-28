import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { enableProdMode, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { localeHeaderInterceptor } from './app/interceptors/locale-header.interceptor';
import { AuthService } from './app/services';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([localeHeaderInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initialize();
    })
  ]
}).catch((err: unknown) => console.error(err));
