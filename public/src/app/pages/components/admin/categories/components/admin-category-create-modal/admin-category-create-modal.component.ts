import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable, of, switchMap, take } from 'rxjs';

import { CategoryProductOption, CategoryUpsertPayload, SelectOption } from '../../../../../../models';
import { ApiErrorHelper, extractValidationPayload } from '../../../../../../helpers';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { CategoryApiService, I18nService, ToastService, TransitionStateService, ValidationService } from '../../../../../../services';
import { ButtonComponent, FormTagSelectComponent, LoaderComponent } from '../../../../../../ui';
import { AdminCategoryFormFieldsComponent } from '../admin-category-form-fields/admin-category-form-fields.component';

@Component({
  selector: 'app-admin-category-create-modal',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, LoaderComponent, ButtonComponent, FormTagSelectComponent, AdminCategoryFormFieldsComponent],
  templateUrl: './admin-category-create-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoryCreateModalComponent {
  readonly formGroupName = 'adminCategoryUpsert';

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly validationService = inject(ValidationService);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly defaultPosition = input.required<number>();
  readonly productOptions = input.required<CategoryProductOption[]>();
  readonly transition = this.transitionStateService.create<'create'>();
  readonly isBusy = this.transition.isBusy;
  readonly actionError = this.transition.error;
  readonly selectedImageName = signal('');
  readonly categoryForm = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.maxLength(255)]),
    name_uk: this.formBuilder.control('', [Validators.maxLength(255)]),
    icon: this.formBuilder.control('', [Validators.maxLength(255)]),
    position: this.formBuilder.control(0, [Validators.min(0)]),
    is_active: this.formBuilder.control(true),
    image: this.formBuilder.control<File | null>(null),
    product_ids: this.formBuilder.control<string[]>([])
  });
  readonly availableProductOptions = computed<SelectOption[]>(() => this.productOptions()
    .filter((option) => option.category_id === null)
    .map((option) => ({ value: option.id, label: option.name })));

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  ngOnInit(): void {
    this.categoryForm.patchValue({
      position: this.defaultPosition(),
    });
  }

  submit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.buildBasePayload();
    const formData = this.buildCreateFormData(payload);
    const translationFields = this.extractCreateTranslationFields();

    this.transition.start('create');

    this.categoryApiService.create(formData).pipe(
      switchMap((response) => {
        const categoryId = response.data.id;

        let request$: Observable<unknown> = of(null);

        if (translationFields) {
          request$ = request$.pipe(
            switchMap(() => this.categoryApiService.updateTranslations(categoryId, 'uk', translationFields))
          );
        }

        const productIds = this.categoryForm.controls.product_ids.value;

        if (productIds.length > 0) {
          request$ = request$.pipe(
            switchMap(() => this.categoryApiService.assignProducts(categoryId, productIds))
          );
        }

        return request$;
      }),
      take(1),
      finalize(() => this.transition.finish())
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryCreateSuccess'));
        this.validationService.clearGroupErrors(this.formGroupName);
        this.completed.emit();
        this.closeRequested.emit();
      },
      error: (error: unknown) => {
        const payload = extractValidationPayload(error);

        if (payload?.errors) {
          this.validationService.setFieldErrors(this.formGroupName, payload.errors);
        }

        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryCreateError'));
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
    return this.isBusy() || this.categoryForm.invalid || this.categoryForm.pristine;
  }


  busyActionLabel(): string {
    return this.i18n.translate('ui.admin.categoryCreateAction');
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

  private buildCreateFormData(payload: CategoryUpsertPayload): FormData {
    const formData = new FormData();
    formData.append('name', payload.name.trim());
    formData.append('position', String(payload.position));
    formData.append('is_active', payload.is_active ? '1' : '0');

    if (payload.icon !== null) {
      formData.append('icon', payload.icon);
    }

    if (payload.image instanceof File) {
      formData.append('image', payload.image);
    }

    return formData;
  }

  private extractCreateTranslationFields(): Record<string, string> | null {
    const translatedName = this.categoryForm.controls.name_uk.value?.trim() ?? null;

    if (!translatedName) {
      return null;
    }

    return { name: translatedName };
  }
}
