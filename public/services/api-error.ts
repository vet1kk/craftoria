import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { I18nService } from './i18n.service';

interface LaravelValidationErrors {
  message?: string;
  errors?: Record<string, string[]>;
}

export function extractApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallbackMessage;
  }

  const payload = error.error as LaravelValidationErrors | string | null;

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const localizationService = inject(I18nService);
    const firstValidationMessage = Object.values(payload.errors ?? {}).flat()[0];

    if (firstValidationMessage) {
      return localizationService.translate(firstValidationMessage, firstValidationMessage);
    }

    if (payload.message) {
      return localizationService.translate(payload.message, payload.message);
    }
  }

  return fallbackMessage;
}
