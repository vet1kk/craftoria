import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { LaravelValidationErrors } from '../models';
import { I18nService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHelper {
  private readonly i18n = inject(I18nService);

  extractApiErrorMessage(error: unknown, fallbackMessage: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallbackMessage;
    }

    const payload = error.error as LaravelValidationErrors | string | null;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const firstValidationMessage = Object.values(payload.errors ?? {}).flat()[0];

      if (firstValidationMessage) {
        return this.i18n.translate(firstValidationMessage, firstValidationMessage);
      }

      if (payload.message) {
        return this.i18n.translate(payload.message, payload.message);
      }
    }

    return fallbackMessage;
  }
}

