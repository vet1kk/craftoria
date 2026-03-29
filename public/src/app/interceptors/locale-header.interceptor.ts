import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { LocaleService } from '../services';

export const localeHeaderInterceptor: HttpInterceptorFn = (request, next) => {
  const localeService = inject(LocaleService);

  return next(request.clone({
    setHeaders: {
      'Accept-Language': localeService.apiLocale()
    }
  }));
};
