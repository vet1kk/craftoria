import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

import { Product, ProductUpsertPayload } from '../../../../../../models';

export class AdminProductModalHelper {
  static createProductForm(formBuilder: NonNullableFormBuilder): FormGroup {
    return formBuilder.group({
      category_id: formBuilder.control<string | null>(null),
      name: formBuilder.control('', [Validators.required, Validators.maxLength(255)]),
      name_uk: formBuilder.control('', [Validators.maxLength(255)]),
      sku: formBuilder.control('', [Validators.maxLength(255)]),
      description: formBuilder.control('', [Validators.required]),
      description_uk: formBuilder.control(''),
      price: formBuilder.control(0, [Validators.required, Validators.min(0)]),
      featured_image: formBuilder.control<File | null>(null),
      shelf_life: formBuilder.control<number | null>(null),
      position: formBuilder.control(0, [Validators.required, Validators.min(0)]),
      stock_quantity: formBuilder.control(0, [Validators.required, Validators.min(0)]),
      reorder_level: formBuilder.control(0, [Validators.required, Validators.min(0)]),
      is_active: formBuilder.control(true),
      is_available: formBuilder.control(true)
    });
  }

  static resetForCreate(form: FormGroup, defaultPosition: number, defaultCategoryId: string | null): void {
    form.reset({
      category_id: defaultCategoryId,
      name: '',
      name_uk: '',
      sku: '',
      description: '',
      description_uk: '',
      price: 0,
      featured_image: null,
      shelf_life: null,
      position: defaultPosition,
      stock_quantity: 0,
      reorder_level: 0,
      is_active: true,
      is_available: true
    });
  }

  static resetForUpdate(form: FormGroup, product: Product): void {
    form.reset({
      category_id: product.category_id,
      name: product.name,
      name_uk: product.translations?.['uk']?.name ?? '',
      sku: product.sku ?? '',
      description: product.description,
      description_uk: product.translations?.['uk']?.description ?? '',
      price: product.price,
      featured_image: null,
      shelf_life: product.shelf_life ?? null,
      position: product.position,
      stock_quantity: product.stock_quantity,
      reorder_level: product.reorder_level,
      is_active: product.is_active,
      is_available: product.is_available
    });
  }

  static buildPayload(form: FormGroup): ProductUpsertPayload {
    const formValue = form.getRawValue();

    return {
      category_id: formValue['category_id'],
      name: (formValue['name'] ?? '').trim(),
      sku: formValue['sku']?.trim() ? formValue['sku'].trim() : null,
      description: (formValue['description'] ?? '').trim(),
      price: Number(formValue['price']),
      featured_image: formValue['featured_image'] ?? null,
      shelf_life: formValue['shelf_life'] ?? null,
      position: Number(formValue['position']),
      stock_quantity: Number(formValue['stock_quantity']),
      reorder_level: Number(formValue['reorder_level']),
      is_active: Boolean(formValue['is_active']),
      is_available: Boolean(formValue['is_available'])
    };
  }

  static extractCreateTranslationFields(form: FormGroup): Record<string, string> | null {
    const translatedName = form.controls['name_uk'].value?.trim() ?? null;
    const translatedDescription = form.controls['description_uk'].value?.trim() ?? null;
    const fields: Record<string, string> = {};

    if (translatedName) {
      fields['name'] = translatedName;
    }

    if (translatedDescription) {
      fields['description'] = translatedDescription;
    }

    return Object.keys(fields).length > 0 ? fields : null;
  }

  static extractChangedTranslationFields(form: FormGroup, product: Product): Record<string, string> | null {
    const fields: Record<string, string> = {};

    if (form.controls['name_uk'].dirty) {
      const translatedName = form.controls['name_uk'].value?.trim() ?? null;
      const currentTranslatedName = product.translations?.['uk']?.name?.trim() ?? null;

      if (translatedName && translatedName !== currentTranslatedName) {
        fields['name'] = translatedName;
      }
    }

    if (form.controls['description_uk'].dirty) {
      const translatedDescription = form.controls['description_uk'].value?.trim() ?? null;
      const currentTranslatedDescription = product.translations?.['uk']?.description?.trim() ?? null;

      if (translatedDescription && translatedDescription !== currentTranslatedDescription) {
        fields['description'] = translatedDescription;
      }
    }

    return Object.keys(fields).length > 0 ? fields : null;
  }

  static buildChangedBaseFields(form: FormGroup, payload: ProductUpsertPayload, product: Product): Record<string, unknown> {
    const changedFields: Record<string, unknown> = {};

    if (form.controls['category_id'].dirty && payload.category_id !== product.category_id) {
      changedFields['category_id'] = payload.category_id;
    }

    if (form.controls['name'].dirty && payload.name !== product.name) {
      changedFields['name'] = payload.name;
    }

    if (form.controls['sku'].dirty && payload.sku !== (product.sku ?? null)) {
      changedFields['sku'] = payload.sku;
    }

    if (form.controls['description'].dirty && payload.description !== product.description) {
      changedFields['description'] = payload.description;
    }

    if (form.controls['price'].dirty && payload.price !== Number(product.price)) {
      changedFields['price'] = payload.price;
    }

    if (form.controls['featured_image'].dirty && payload.featured_image instanceof File) {
      changedFields['featured_image'] = payload.featured_image;
    }

    if (form.controls['shelf_life'].dirty && payload.shelf_life !== (product.shelf_life ?? null)) {
      changedFields['shelf_life'] = payload.shelf_life;
    }

    if (form.controls['position'].dirty && payload.position !== product.position) {
      changedFields['position'] = payload.position;
    }

    if (form.controls['stock_quantity'].dirty && payload.stock_quantity !== product.stock_quantity) {
      changedFields['stock_quantity'] = payload.stock_quantity;
    }

    if (form.controls['reorder_level'].dirty && payload.reorder_level !== product.reorder_level) {
      changedFields['reorder_level'] = payload.reorder_level;
    }

    if (form.controls['is_active'].dirty && payload.is_active !== product.is_active) {
      changedFields['is_active'] = payload.is_active;
    }

    if (form.controls['is_available'].dirty && payload.is_available !== product.is_available) {
      changedFields['is_available'] = payload.is_available;
    }

    return changedFields;
  }
}
