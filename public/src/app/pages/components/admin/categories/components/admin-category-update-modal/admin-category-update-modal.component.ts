import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  OnChanges,
  Output,
  signal,
  SimpleChanges
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable, of, switchMap, take } from 'rxjs';

import { Category, CategoryProductOption, CategoryUpsertPayload, SelectOption } from '../../../../../../models';
import { ApiErrorHelper, extractValidationPayload } from '../../../../../../helpers';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { CategoryApiService, I18nService, ToastService, TransitionStateService, ValidationService } from '../../../../../../services';
import { ButtonComponent, FormTagSelectComponent, LoaderComponent } from '../../../../../../ui';
import { AdminCategoryFormFieldsComponent } from '../admin-category-form-fields/admin-category-form-fields.component';

@Component({
  selector: 'app-admin-category-update-modal',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, LoaderComponent, ButtonComponent, FormTagSelectComponent, AdminCategoryFormFieldsComponent],
  templateUrl: './admin-category-update-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoryUpdateModalComponent implements OnChanges {
  readonly formGroupName = 'adminCategoryUpsert';

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly validationService = inject(ValidationService);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly category = input.required<Category>();
  readonly productOptions = input.required<CategoryProductOption[]>();
  readonly transition = this.transitionStateService.create<'update'>();
  readonly isBusy = this.transition.isBusy;
  readonly actionError = this.transition.error;
  readonly selectedImageName = signal('');
  readonly categoryForm = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.maxLength(255)]),
    name_uk: this.formBuilder.control('', [Validators.maxLength(255)]),
    icon: this.formBuilder.control('', [Validators.maxLength(255)]),
    is_active: this.formBuilder.control(true),
    position: this.formBuilder.control(0, [Validators.min(0)]),
    image: this.formBuilder.control<File | null>(null),
    product_ids: this.formBuilder.control<string[]>([])
  });
  readonly availableProductOptions = computed<SelectOption[]>(() => {
    const categoryId = this.category().id;

    return this.productOptions()
      .filter((option) => option.category_id === null || option.category_id === categoryId)
      .map((option) => ({ value: option.id, label: option.name }));
  });

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['category'] && !changes['productOptions']) {
      return;
    }

    const category = this.category();
    const selectedProductIds = this.productOptions()
      .filter((option) => option.category_id === category.id)
      .map((option) => option.id);

    this.selectedImageName.set('');
    this.validationService.clearGroupErrors(this.formGroupName);
    this.categoryForm.reset({
      name: category.translations?.['en']?.name ?? category.name ?? '',
      name_uk: category.translations?.['uk']?.name ?? '',
      icon: category.icon ?? '',
      position: category.position,
      is_active: category.is_active,
      image: null,
      product_ids: selectedProductIds
    });
  }

  submit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const category = this.category();
    const payload = this.buildBasePayload();
    const changedBaseFields = this.buildChangedBaseFields(payload, category);
    const hasBaseChanges = Object.keys(changedBaseFields).length > 0;
    const translationFields = this.extractChangedTranslationFields(category);
    const selectedProductIds = this.categoryForm.controls.product_ids.value;
    const hasProductChanges = !this.isSameProductSelection(selectedProductIds, category.id);

    if (!hasBaseChanges && !translationFields && !hasProductChanges) {
      return;
    }

    const updateFormData = hasBaseChanges ? this.buildUpdateFormData(payload, changedBaseFields) : null;
    this.transition.start('update');

    let request$: Observable<unknown> = of(null);

    if (hasBaseChanges) {
      request$ = request$.pipe(
        switchMap(() => this.categoryApiService.update(category.id, updateFormData!))
      );
    }

    if (translationFields) {
      request$ = request$.pipe(
        switchMap(() => this.categoryApiService.updateTranslations(category.id, 'uk', translationFields))
      );
    }

    if (hasProductChanges) {
      request$ = request$.pipe(
        switchMap(() => this.categoryApiService.assignProducts(category.id, selectedProductIds))
      );
    }

    request$.pipe(
      take(1),
      finalize(() => this.transition.finish())
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryUpdateSuccess'));
        this.validationService.clearGroupErrors(this.formGroupName);
        this.completed.emit();
        this.closeRequested.emit();
      },
      error: (error: unknown) => {
        const payload = extractValidationPayload(error);

        if (payload?.errors) {
          this.validationService.setFieldErrors(this.formGroupName, payload.errors);
        }

        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryUpdateError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.categoryForm.controls.image.setValue(file);
    this.selectedImageName.set(file?.name ?? '');
  }

  isSubmitDisabled(): boolean {
    return this.isBusy() || this.categoryForm.invalid || !this.hasUpdateChanges();
  }

  busyActionLabel(): string {
    return this.i18n.translate('ui.admin.categorySaveAction');
  }


  private hasUpdateChanges(): boolean {
    const payload = this.buildBasePayload();
    const changedBaseFields = this.buildChangedBaseFields(payload, this.category());
    const translationFields = this.extractChangedTranslationFields(this.category());
    const hasProductChanges = !this.isSameProductSelection(this.categoryForm.controls.product_ids.value, this.category().id);

    return Object.keys(changedBaseFields).length > 0 || translationFields !== null || hasProductChanges;
  }

  private buildBasePayload(): CategoryUpsertPayload {
    const formData = this.categoryForm.getRawValue();

    return {
      name: formData.name.trim(),
      icon: formData.icon?.trim() ? formData.icon.trim() : null,
      position: formData.position,
      is_active: formData.is_active,
      image: formData.image
    };
  }

  private buildChangedBaseFields(payload: CategoryUpsertPayload, selectedCategory: Category): Record<string, string | number | boolean | File | null> {
    const changedFields: Record<string, string | number | boolean | File | null> = {};
    const normalizedName = payload.name.trim();
    const normalizedIcon = payload.icon?.trim() ? payload.icon.trim() : null;

    if (this.categoryForm.controls.name.dirty && normalizedName !== selectedCategory.name) {
      changedFields['name'] = normalizedName;
    }

    if (this.categoryForm.controls.icon.dirty && normalizedIcon !== (selectedCategory.icon ?? null)) {
      changedFields['icon'] = normalizedIcon;
    }

    if (this.categoryForm.controls.position.dirty && payload.position !== selectedCategory.position) {
      changedFields['position'] = payload.position;
    }

    if (this.categoryForm.controls.is_active.dirty && payload.is_active !== selectedCategory.is_active) {
      changedFields['is_active'] = payload.is_active;
    }

    if (this.categoryForm.controls.image.dirty && payload.image instanceof File) {
      changedFields['image'] = payload.image;
    }

    return changedFields;
  }

  private buildUpdateFormData(
    payload: CategoryUpsertPayload,
    changedFields: Record<string, string | number | boolean | File | null>
  ): FormData {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(changedFields).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        formData.append(key, '');
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
        return;
      }

      formData.append(key, String(value));
    });

    if (!changedFields['name']) {
      formData.append('name', payload.name.trim());
    }

    return formData;
  }

  private extractChangedTranslationFields(selectedCategory: Category): Record<string, string> | null {
    if (!this.categoryForm.controls.name_uk.dirty) {
      return null;
    }

    const translatedName = this.categoryForm.controls.name_uk.value?.trim() ?? null;
    const currentTranslatedName = selectedCategory.translations?.['uk']?.name?.trim() ?? null;

    if (!translatedName || translatedName === currentTranslatedName) {
      return null;
    }

    return { name: translatedName };
  }

  private isSameProductSelection(selectedIds: string[], categoryId: string): boolean {
    const existingIds = this.productOptions()
      .filter((option) => option.category_id === categoryId)
      .map((option) => option.id)
      .sort();

    const normalizedSelected = [...selectedIds].sort();

    return JSON.stringify(normalizedSelected) === JSON.stringify(existingIds);
  }
}
