import { FormGroup } from '@angular/forms';

export class FormHelper {
  static formToFormData(form: FormGroup, fields: string[] = [], nulls = false): FormData {
    return FormHelper.objectToFormData(form.getRawValue(), fields, nulls);
  }

  static objectToFormData(object: Record<string, any>, fields: string[] = [], nulls = false): FormData {
    const formData = new FormData();

    Object.keys(object).forEach((key) => {
      if (fields.length && !fields.includes(key)) {
        return;
      }

      FormHelper.appendFormDataValue(formData, key, object[key], nulls);
    });

    return formData;
  }

  private static appendFormDataValue(formData: FormData, key: string, value: any, nulls: boolean): void {
    if (value === null || value === undefined) {
      if (nulls) {
        formData.append(key, '');
      }

      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        FormHelper.appendFormDataValue(formData, `${key}[${index}]`, item, nulls);
      });

      return;
    }

    if (typeof value === 'object' && !(value instanceof File)) {
      if ('file' in value && value.file instanceof File) {
        formData.append(key, value.file);
        return;
      }

      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        FormHelper.appendFormDataValue(formData, `${key}[${nestedKey}]`, nestedValue, nulls);
      });

      return;
    }

    formData.append(key, FormHelper.normalizeFormValue(value));
  }

  private static normalizeFormValue(value: any): any {
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }

    return value;
  }
}
