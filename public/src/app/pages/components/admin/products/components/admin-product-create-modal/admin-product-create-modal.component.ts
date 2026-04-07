import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, of, switchMap, take } from 'rxjs';

import { ApiErrorHelper, extractValidationPayload, FormHelper } from '../../../../../../helpers';
import { Category, SelectOption } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { I18nService, ProductApiService, ToastService, TransitionStateService, ValidationService } from '../../../../../../services';
import { ButtonComponent, LoaderComponent } from '../../../../../../ui';
import { AdminProductFormFieldsComponent } from '../admin-product-form-fields/admin-product-form-fields.component';
import { AdminProductModalHelper } from '../admin-product-form-fields/admin-product-modal.helper';

@Component({
  selector: 'app-admin-product-create-modal',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, LoaderComponent, ButtonComponent, AdminProductFormFieldsComponent],
  templateUrl: './admin-product-create-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductCreateModalComponent {
  readonly formGroupName = 'adminProductUpsert';

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly productApiService = inject(ProductApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly validationService = inject(ValidationService);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly defaultPosition = input.required<number>();
  readonly categories = input.required<Category[]>();
  readonly transition = this.transitionStateService.create<'create'>();
  readonly isBusy = this.transition.isBusy;
  readonly actionError = this.transition.error;
  readonly selectedImageName = signal('');
  readonly productForm = AdminProductModalHelper.createProductForm(this.formBuilder);

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
  }

  categoryOptions(): SelectOption[] {
    return this.categories().map((category) => ({ value: category.id, label: category.name }));
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = AdminProductModalHelper.buildPayload(this.productForm);
    const formData = FormHelper.objectToFormData(payload, [
      'category_id',
      'name',
      'sku',
      'description',
      'price',
      'featured_image',
      'shelf_life',
      'position',
      'stock_quantity',
      'reorder_level',
      'is_active',
      'is_available'
    ]);
    const translationFields = AdminProductModalHelper.extractCreateTranslationFields(this.productForm);

    this.transition.start('create');

    this.productApiService.create(formData).pipe(
      switchMap((response) => {
        const productId = response.data.id;

        if (!translationFields) {
          return of(null);
        }

        return this.productApiService.updateTranslations(productId, 'uk', translationFields);
      }),
      take(1),
      finalize(() => this.transition.finish())
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.productCreateSuccess'));
        this.validationService.clearGroupErrors(this.formGroupName);
        this.completed.emit();
        this.closeRequested.emit();
      },
      error: (error: unknown) => {
        const payload = extractValidationPayload(error);

        if (payload?.errors) {
          this.validationService.setFieldErrors(this.formGroupName, payload.errors);
        }

        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.productCreateError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.productForm.controls['featured_image'].setValue(file);
    this.productForm.controls['featured_image'].markAsDirty();
    this.selectedImageName.set(file?.name ?? '');
  }

  isSubmitDisabled(): boolean {
    return this.isBusy() || this.productForm.invalid;
  }

  busyActionLabel(): string {
    return this.i18n.translate('ui.admin.productCreateAction');
  }

  private resetForm(): void {
    this.selectedImageName.set('');
    this.transition.clearError();
    this.validationService.clearGroupErrors(this.formGroupName);

    const defaultCategoryId = this.categories()[0]?.id ?? null;
    AdminProductModalHelper.resetForCreate(this.productForm, this.defaultPosition(), defaultCategoryId);
  }
}
