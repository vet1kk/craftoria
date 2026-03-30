import { HttpErrorResponse } from '@angular/common/http';
import { LaravelValidationErrors } from '../models';
import { I18nService } from './i18n.service';


export function extractApiErrorMessage(error: unknown, fallbackMessage: string, i18n: I18nService): string {
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
      return i18n.translate(firstValidationMessage, firstValidationMessage);
    }

    if (payload.message) {
      return i18n.translate(payload.message, payload.message);
    }
  }

  return fallbackMessage;
}
