import { Injectable, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

type GroupErrors = Record<string, string[]>;

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private readonly groupedErrors = signal<Record<string, GroupErrors>>({});

  hasError(control: AbstractControl | null | undefined): boolean {
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || control.dirty);
  }

  setGroupErrors(groupName: string, errors: Record<string, string[] | undefined>): void {
    this.setFieldErrors(groupName, errors);
  }

  setFieldError(groupName: string, fieldKey: string, message: string | string[]): void {
    const messages = Array.isArray(message) ? message : [message];

    this.groupedErrors.update((current) => {
      const normalizedFieldKey = this.normalizeFieldKey(fieldKey);
      const currentGroup = current[groupName] ?? {};

      return {
        ...current,
        [groupName]: {
          ...currentGroup,
          [normalizedFieldKey]: messages.filter((value) => value.trim().length > 0)
        }
      };
    });
  }

  setError(groupName: string, fieldKey: string, message: string | string[]): void {
    this.setFieldError(groupName, fieldKey, message);
  }

  setFieldErrors(
    groupName: string,
    errors: Record<string, string | string[] | undefined>
  ): void {
    const normalized: GroupErrors = {};

    for (const [key, value] of Object.entries(errors)) {
      if (!value) {
        continue;
      }

      const messages = Array.isArray(value) ? value : [value];
      const filtered = messages.filter((message) => message.trim().length > 0);

      if (filtered.length === 0) {
        continue;
      }

      normalized[this.normalizeFieldKey(key)] = filtered;
    }

    this.groupedErrors.update((current) => ({
      ...current,
      [groupName]: {
        ...(current[groupName] ?? {}),
        ...normalized
      }
    }));
  }

  clearGroupErrors(groupName: string): void {
    this.groupedErrors.update((current) => {
      if (!(groupName in current)) {
        return current;
      }

      const next = { ...current };
      delete next[groupName];

      return next;
    });
  }

  clearFieldError(groupName: string, fieldKey: string): void {
    const normalizedFieldKey = this.normalizeFieldKey(fieldKey);

    this.groupedErrors.update((current) => {
      const group = current[groupName];

      if (!group || !(normalizedFieldKey in group)) {
        return current;
      }

      const nextGroup = { ...group };
      delete nextGroup[normalizedFieldKey];

      return {
        ...current,
        [groupName]: nextGroup
      };
    });
  }

  getFieldErrors(groupName: string, fieldKey: string): string[] {
    const normalizedFieldKey = this.normalizeFieldKey(fieldKey);

    return this.groupedErrors()[groupName]?.[normalizedFieldKey] ?? [];
  }

  hasFieldError(groupName: string, fieldKey: string): boolean {
    return this.getFieldErrors(groupName, fieldKey).length > 0;
  }

  hasGroupErrors(groupName: string, fields: readonly string[]): boolean {
    return fields.some((field) => this.hasFieldError(groupName, field));
  }

  getFieldErrorMessage(groupName: string, fieldKey: string): string | null {
    return this.getFieldErrors(groupName, fieldKey)[0] ?? null;
  }

  getError(groupName: string, fieldKey: string): string {
    return this.getFieldErrorMessage(groupName, fieldKey) ?? '';
  }

  getErrorMessage(
    control: AbstractControl | null | undefined,
    messages: Record<string, string>,
    fallbackMessage: string
  ): string | null {
    if (!this.hasError(control)) {
      return null;
    }

    for (const key of Object.keys(messages)) {
      if (control?.hasError(key)) {
        return messages[key];
      }
    }

    return fallbackMessage;
  }

  private normalizeFieldKey(fieldKey: string): string {
    return fieldKey.split('.').pop() ?? fieldKey;
  }
}
