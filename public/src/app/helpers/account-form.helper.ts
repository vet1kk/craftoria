import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import { LaravelValidationErrors } from '../models';

export function extractValidationPayload(error: unknown): LaravelValidationErrors | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  const payload = error.error as LaravelValidationErrors | string | null;

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload;
}

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const passwordControl = control.get('password');
  const confirmPasswordControl = control.get('confirmPassword');
  const password = passwordControl?.value;
  const confirmPassword = confirmPasswordControl?.value;

  if (!confirmPasswordControl) {
    return null;
  }

  const currentErrors = confirmPasswordControl.errors ?? {};

  if (!password || !confirmPassword) {
    if (currentErrors['passwordMismatch']) {
      const { passwordMismatch, ...rest } = currentErrors;
      confirmPasswordControl.setErrors(Object.keys(rest).length > 0 ? rest : null);
    }

    return null;
  }

  if (password !== confirmPassword) {
    if (!currentErrors['passwordMismatch']) {
      confirmPasswordControl.setErrors({ ...currentErrors, passwordMismatch: true });
    }

    return { passwordMismatch: true };
  }

  if (currentErrors['passwordMismatch']) {
    const { passwordMismatch, ...rest } = currentErrors;
    confirmPasswordControl.setErrors(Object.keys(rest).length > 0 ? rest : null);
  }

  return null;
}
