import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { I18nService } from '../services';

export const localeHeaderInterceptor: HttpInterceptorFn = (request, next) => {
  const i18nService = inject(I18nService);

  return next(request.clone({
    setHeaders: {
      'Accept-Language': i18nService.apiLocale()
    }
  }));
};
