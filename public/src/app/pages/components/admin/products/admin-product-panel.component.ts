import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, of, switchMap, take } from 'rxjs';

import { Category, Product, ProductUpdatePayload, ProductUpsertPayload, SkeletonGroupConfig } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ApiErrorHelper, extractValidationPayload, FormHelper } from '../../../../helpers';
import { I18nService, ProductApiService, ToastService, TransitionStateService, ValidationService } from '../../../../services';
import { ButtonComponent, ImagePreviewComponent, ModalComponent, SkeletonComponent } from '../../../../ui';
import { AdminProductDeleteModalComponent } from './components/admin-product-delete-modal/admin-product-delete-modal.component';
import { AdminProductUpsertModalComponent } from './components/admin-product-upsert-modal/admin-product-upsert-modal.component';
import { AdminProductViewModalComponent } from './components/admin-product-view-modal/admin-product-view-modal.component';

@Component({
  selector: 'app-admin-product-panel',
  standalone: true,
  imports: [
    TranslatePipe,
    ButtonComponent,
    SkeletonComponent,
    ImagePreviewComponent,
    ModalComponent,
    ReactiveFormsModule,
    AdminProductViewModalComponent,
    AdminProductUpsertModalComponent,
    AdminProductDeleteModalComponent
  ],
  templateUrl: './admin-product-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductPanelComponent {
  readonly formGroupName = 'adminProductUpsert';

  private readonly formBuilder = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly productApiService = inject(ProductApiService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly toastService = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly products = input.required<Product[]>();
  readonly isLoading = input(false);
  readonly categories = input.required<Category[]>();
  readonly currency = input.required<string>();
  @Output() readonly productChanged = new EventEmitter<void>();

  readonly selectedProduct = signal<Product | null>(null);
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly isViewModalOpen = signal(false);
  readonly selectedImageName = signal('');
  readonly transition = this.transitionStateService.create<'create' | 'update' | 'delete'>();
  readonly isBusy = this.transition.isBusy;
  readonly busyAction = this.transition.action;
  readonly actionError = this.transition.error;
  readonly productForm = this.formBuilder.group({
    category_id: this.formBuilder.control<string | null>(null),
    name: this.formBuilder.control('', [Validators.required, Validators.maxLength(255)]),
    name_uk: this.formBuilder.control('', [Validators.maxLength(255)]),
    sku: this.formBuilder.control('', [Validators.maxLength(255)]),
    description: this.formBuilder.control('', [Validators.required]),
    description_uk: this.formBuilder.control(''),
    price: this.formBuilder.control(0, [Validators.required, Validators.min(0)]),
    shelf_life: this.formBuilder.control(''),
    position: this.formBuilder.control(0, [Validators.min(0)]),
    stock_quantity: this.formBuilder.control(0, [Validators.min(0)]),
    reorder_level: this.formBuilder.control(0, [Validators.min(0)]),
    is_active: this.formBuilder.control(true),
    is_available: this.formBuilder.control(true),
    featured_image: this.formBuilder.control<File | null>(null)
  });

  readonly hasSelection = computed(() => this.selectedProduct() !== null);
  readonly categoriesById = computed(
    () => new Map(this.categories().map((category) => [category.id, category.name]))
  );
  readonly productsSkeletonGroups: SkeletonGroupConfig[] = [
    {
      rowsClassName: 'space-y-3',
      rows: [
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-12', heightClass: 'h-12', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-44', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-60', heightClass: 'h-3', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-12', heightClass: 'h-12', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-40', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-56', heightClass: 'h-3', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-12', heightClass: 'h-12', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-36', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-52', heightClass: 'h-3', tone: 'muted' }
            ]
          }
        }
      ]
    }
  ];

  selectedProductCategoryName(): string {
    const product = this.selectedProduct();

    if (!product) {
      return '';
    }

    return this.getCategoryName(product.category_id);
  }

  openCreateModal(): void {
    this.validationService.clearGroupErrors(this.formGroupName);
    this.selectedProduct.set(null);
    this.selectedImageName.set('');

    this.productForm.reset({
      category_id: null,
      name: '',
      name_uk: '',
      sku: '',
      description: '',
      description_uk: '',
      price: 0,
      shelf_life: '',
      position: this.products().length,
      stock_quantity: 0,
      reorder_level: 0,
      is_active: true,
      is_available: true,
      featured_image: null
    });

    this.isCreateModalOpen.set(true);
  }

  openViewModal(product: Product): void {
    this.selectedProduct.set(product);
    this.isViewModalOpen.set(true);
  }

  openEditModal(product?: Product): void {
    const target = product ?? this.selectedProduct();

    if (!target) {
      return;
    }

    this.validationService.clearGroupErrors(this.formGroupName);
    this.selectedProduct.set(target);
    this.selectedImageName.set('');
    this.productForm.reset({
      category_id: target.category_id ?? null,
      name: target.name,
      name_uk: target.translations?.['uk']?.name ?? '',
      sku: target.sku ?? '',
      description: target.description,
      description_uk: target.translations?.['uk']?.description ?? '',
      price: Number(target.price),
      shelf_life: target.shelf_life !== null && target.shelf_life !== undefined ? String(target.shelf_life) : '',
      position: target.position,
      stock_quantity: target.stock_quantity,
      reorder_level: target.reorder_level,
      is_active: target.is_active,
      is_available: target.is_available,
      featured_image: null
    });
    this.isViewModalOpen.set(false);
    this.isEditModalOpen.set(true);
  }

  openDeleteModal(product?: Product): void {
    const target = product ?? this.selectedProduct();

    if (!target) {
      return;
    }

    this.selectedProduct.set(target);
    this.isViewModalOpen.set(false);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(force = false): void {
    if (this.isBusy() && !force) {
      return;
    }

    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isViewModalOpen.set(false);
    this.transition.clearError();
    this.validationService.clearGroupErrors(this.formGroupName);
  }

  submitCreate(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const formData = FormHelper.objectToFormData({
      ...payload,
      name: payload.name.trim(),
      sku: payload.sku?.trim() ?? null,
      shelf_life: payload.shelf_life,
      description: payload.description.trim(),
    }, [
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

    const translationFields = payload.translations?.['uk'] ?? null;

    this.transition.start('create');

    this.productApiService.create(formData).pipe(
      switchMap((response) => {
        if (!translationFields) {
          return of(response);
        }

        return this.productApiService.updateTranslations(response.data.id, 'uk', translationFields);
      }),
      take(1),
      finalize(() => {
        this.transition.finish();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.productCreateSuccess'));
        this.closeModals(true);
        this.productChanged.emit();
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

  submitUpdate(): void {
    if (this.productForm.invalid || !this.selectedProduct()) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload: ProductUpdatePayload = {
      id: this.selectedProduct()!.id,
      ...this.buildPayload()
    };

    const formData = FormHelper.objectToFormData({
      ...payload,
      _method: 'PUT',
      name: payload.name.trim(),
      sku: payload.sku?.trim() ?? null,
      shelf_life: payload.shelf_life,
      description: payload.description.trim(),
    }, [
      '_method',
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

    const translationFields = payload.translations?.['uk'] ?? null;

    this.transition.start('update');

    this.productApiService.update(payload.id, formData).pipe(
      switchMap(() => {
        if (!translationFields) {
          return of(null);
        }

        return this.productApiService.updateTranslations(payload.id, 'uk', translationFields);
      }),
      take(1),
      finalize(() => {
        this.transition.finish();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.productUpdateSuccess'));
        this.closeModals(true);
        this.productChanged.emit();
      },
      error: (error: unknown) => {
        const payload = extractValidationPayload(error);

        if (payload?.errors) {
          this.validationService.setFieldErrors(this.formGroupName, payload.errors);
        }

        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.productUpdateError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  confirmDelete(): void {
    if (!this.selectedProduct()) {
      return;
    }

    this.transition.start('delete');

    this.productApiService.delete(this.selectedProduct()!.id).pipe(
      take(1),
      finalize(() => {
        this.transition.finish();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.productDeleteSuccess'));
        this.closeModals(true);
        this.productChanged.emit();
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.productDeleteError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  isCreateSubmitDisabled(): boolean {
    return this.isBusy() || this.productForm.invalid || this.productForm.pristine;
  }

  isUpdateSubmitDisabled(): boolean {
    return this.isBusy() || this.productForm.invalid || !this.hasUpdateChanges();
  }

  getCategoryName(categoryId: string | null): string {
    if (!categoryId) {
      return this.i18n.translate('ui.admin.unassignedCategory');
    }

    return this.categoriesById().get(categoryId) ?? this.i18n.translate('ui.admin.unknownCategory');
  }

  handleImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.productForm.controls.featured_image.setValue(file);
    this.selectedImageName.set(file?.name ?? '');
  }

  busyActionLabel(): string {
    switch (this.busyAction()) {
      case 'create':
        return this.i18n.translate('ui.admin.productCreateAction');
      case 'update':
        return this.i18n.translate('ui.admin.productSaveAction');
      case 'delete':
        return this.i18n.translate('ui.admin.productDeleteAction');
      default:
        return this.i18n.translate('ui.admin.loadingCatalog');
    }
  }

  private hasUpdateChanges(): boolean {
    const selectedProduct = this.selectedProduct();

    if (!selectedProduct) {
      return false;
    }

    const value = this.productForm.getRawValue();
    const name = (value.name ?? '').trim();
    const nameUk = value.name_uk?.trim() ? value.name_uk.trim() : null;
    const description = (value.description ?? '').trim();
    const descriptionUk = value.description_uk?.trim() ? value.description_uk.trim() : null;
    const sku = value.sku?.trim() ? value.sku.trim() : null;
    const shelfLife = value.shelf_life !== '' ? Number(value.shelf_life) : null;

    const hasImageChange = value.featured_image instanceof File;

    return value.category_id !== selectedProduct.category_id
      || name !== selectedProduct.name
      || nameUk !== (selectedProduct.translations?.['uk']?.name ?? null)
      || sku !== (selectedProduct.sku ?? null)
      || description !== selectedProduct.description
      || descriptionUk !== (selectedProduct.translations?.['uk']?.description ?? null)
      || Number(value.price) !== Number(selectedProduct.price)
      || shelfLife !== (selectedProduct.shelf_life ?? null)
      || Number(value.position ?? 0) !== selectedProduct.position
      || Number(value.stock_quantity ?? 0) !== selectedProduct.stock_quantity
      || Number(value.reorder_level ?? 0) !== selectedProduct.reorder_level
      || Boolean(value.is_active) !== selectedProduct.is_active
      || Boolean(value.is_available) !== selectedProduct.is_available
      || hasImageChange;
  }

  private buildPayload(): ProductUpsertPayload {
    const formData = this.productForm.getRawValue();

    return {
      category_id: formData.category_id,
      name: (formData.name ?? '').trim(),
      translations: {
        uk: {
          name: formData.name_uk?.trim() ? formData.name_uk.trim() : null,
          description: formData.description_uk?.trim() ? formData.description_uk.trim() : null,
        },
      },
      sku: formData.sku?.trim() ? formData.sku.trim() : null,
      description: (formData.description ?? '').trim(),
      price: Number(formData.price),
      featured_image: formData.featured_image,
      shelf_life: formData.shelf_life !== '' ? Number(formData.shelf_life) : null,
      position: Number(formData.position ?? 0),
      stock_quantity: Number(formData.stock_quantity ?? 0),
      reorder_level: Number(formData.reorder_level ?? 0),
      is_active: Boolean(formData.is_active),
      is_available: Boolean(formData.is_available)
    };
  }
}
