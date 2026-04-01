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

      const value = object[key];

      if (value === null && !nulls) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          let currentItem = item;

          if (typeof currentItem === 'object' && currentItem !== null && 'file' in currentItem) {
            currentItem = currentItem.file;
          }

          formData.append(`${key}[${index}]`, FormHelper.normalizeFormValue(currentItem));
        });

        return;
      }

      if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, FormHelper.normalizeFormValue(value));
    });

    return formData;
  }

  private static normalizeFormValue(value: any): any {
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }

    return value;
  }
}
