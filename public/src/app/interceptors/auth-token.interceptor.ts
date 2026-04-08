import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { UserService } from '../services';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const userService = inject(UserService);
  const token = userService.getToken();

  if (!token || !isApiRequest(request.url)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};

function isApiRequest(url: string): boolean {
  if (environment.apiUrl.startsWith('http')) {
    return url.startsWith(environment.apiUrl);
  }

  return url.startsWith(environment.apiUrl) || url.startsWith('/api/');
}

