import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, Observable, of, switchMap, take } from 'rxjs';

import { ApiErrorHelper, extractValidationPayload, FormHelper } from '../../../../../../helpers';
import { Category, Product, SelectOption } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { I18nService, ProductApiService, ToastService, TransitionStateService, ValidationService } from '../../../../../../services';
import { ButtonComponent, LoaderComponent } from '../../../../../../ui';
import { AdminProductFormFieldsComponent } from '../admin-product-form-fields/admin-product-form-fields.component';
import { AdminProductModalHelper } from '../admin-product-form-fields/admin-product-modal.helper';

@Component({
  selector: 'app-admin-product-update-modal',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, LoaderComponent, ButtonComponent, AdminProductFormFieldsComponent],
  templateUrl: './admin-product-update-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductUpdateModalComponent implements OnChanges {
  readonly formGroupName = 'adminProductUpsert';

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly productApiService = inject(ProductApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly validationService = inject(ValidationService);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly product = input.required<Product>();
  readonly categories = input.required<Category[]>();
  readonly transition = this.transitionStateService.create<'update'>();
  readonly isBusy = this.transition.isBusy;
  readonly actionError = this.transition.error;
  readonly selectedImageName = signal('');
  readonly productForm = AdminProductModalHelper.createProductForm(this.formBuilder);

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['product'] && !changes['categories']) {
      return;
    }

    this.selectedImageName.set('');
    this.transition.clearError();
    this.validationService.clearGroupErrors(this.formGroupName);
    AdminProductModalHelper.resetForUpdate(this.productForm, this.product());
  }

  categoryOptions(): SelectOption[] {
    return this.categories().map((category) => ({ value: category.id, label: category.name }));
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.product();
    const payload = AdminProductModalHelper.buildPayload(this.productForm);
    const changedBaseFields = AdminProductModalHelper.buildChangedBaseFields(this.productForm, payload, product);
    const hasBaseChanges = Object.keys(changedBaseFields).length > 0;
    const translationFields = AdminProductModalHelper.extractChangedTranslationFields(this.productForm, product);

    if (!hasBaseChanges && !translationFields) {
      return;
    }

    this.transition.start('update');

    let request$: Observable<unknown> = of(null);

    if (hasBaseChanges) {
      const updateData = FormHelper.objectToFormData(changedBaseFields, [], true);
      updateData.append('_method', 'PUT');

      request$ = request$.pipe(
        switchMap(() => this.productApiService.update(product.id, updateData))
      );
    }

    if (translationFields) {
      request$ = request$.pipe(
        switchMap(() => this.productApiService.updateTranslations(product.id, 'uk', translationFields))
      );
    }

    request$.pipe(
      take(1),
      finalize(() => this.transition.finish())
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.productUpdateSuccess'));
        this.validationService.clearGroupErrors(this.formGroupName);
        this.completed.emit();
        this.closeRequested.emit();
      },
      error: (error: unknown) => {
        const validationPayload = extractValidationPayload(error);

        if (validationPayload?.errors) {
          this.validationService.setFieldErrors(this.formGroupName, validationPayload.errors);
        }

        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.productUpdateError'));
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
    if (this.isBusy() || this.productForm.invalid) {
      return true;
    }

    const payload = AdminProductModalHelper.buildPayload(this.productForm);
    const changedBaseFields = AdminProductModalHelper.buildChangedBaseFields(this.productForm, payload, this.product());
    const translationFields = AdminProductModalHelper.extractChangedTranslationFields(this.productForm, this.product());

    return Object.keys(changedBaseFields).length === 0 && !translationFields;
  }

  busyActionLabel(): string {
    return this.i18n.translate('ui.admin.productSaveAction');
  }
}
