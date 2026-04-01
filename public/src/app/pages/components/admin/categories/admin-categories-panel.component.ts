import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, of, switchMap, take } from 'rxjs';

import { Category, CategoryProductOption, CategoryUpdatePayload, CategoryUpsertPayload, SkeletonGroupConfig } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ApiErrorHelper, CatalogHelper, extractValidationPayload, FormHelper } from '../../../../helpers';
import { CategoryApiService, I18nService, ToastService, TransitionStateService, ValidationService } from '../../../../services';
import {
  ButtonComponent,
  FormInputComponent,
  ImagePreviewComponent,
  LoaderComponent,
  ModalComponent,
  SkeletonComponent
} from '../../../../ui';

@Component({
  selector: 'app-admin-categories-panel',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, FormInputComponent, NgTemplateOutlet, ModalComponent, LoaderComponent, ButtonComponent, SkeletonComponent, ImagePreviewComponent],
  templateUrl: './admin-categories-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesPanelComponent {
  readonly formGroupName = 'adminCategoryUpsert';

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly toastService = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly categories = input.required<Category[]>();
  readonly isLoading = input(false);
  readonly productOptions = input.required<CategoryProductOption[]>();
  @Output() readonly categoryChanged = new EventEmitter<void>();

  readonly selectedCategory = signal<Category | null>(null);
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly isViewModalOpen = signal(false);
  readonly selectedImageName = signal('');
  readonly transition = this.transitionStateService.create<'create' | 'update' | 'delete'>();
  readonly isBusy = this.transition.isBusy;
  readonly busyAction = this.transition.action;
  readonly actionError = this.transition.error;
  readonly categoryForm = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.maxLength(255)]),
    slug: this.formBuilder.control('', [Validators.required, Validators.maxLength(255)]),
    icon: this.formBuilder.control('', [Validators.maxLength(255)]),
    position: this.formBuilder.control(0, [Validators.min(0)]),
    is_active: this.formBuilder.control(true),
    image: this.formBuilder.control<File | null>(null),
    product_ids: this.formBuilder.control<string[]>([])
  });

  readonly hasSelection = computed(() => this.selectedCategory() !== null);
  readonly categoriesSkeletonGroups: SkeletonGroupConfig[] = [
    {
      lines: [
        { widthClass: 'w-40', heightClass: 'h-6', tone: 'default' }
      ]
    },
    {
      rowsClassName: 'space-y-3',
      rows: [
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-16', heightClass: 'h-10', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-36', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-24', heightClass: 'h-3', tone: 'muted' }
            ]
          },
          right: {
            lines: [
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' },
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' },
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-16', heightClass: 'h-10', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-40', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-28', heightClass: 'h-3', tone: 'muted' }
            ]
          },
          right: {
            lines: [
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' },
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' },
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-16', heightClass: 'h-10', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-32', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-20', heightClass: 'h-3', tone: 'muted' }
            ]
          },
          right: {
            lines: [
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' },
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' },
              { widthClass: 'w-20', heightClass: 'h-9', roundedClass: 'rounded-full', tone: 'muted' }
            ]
          }
        }
      ]
    }
  ];

  openCreateModal(): void {
    this.validationService.clearGroupErrors(this.formGroupName);
    this.selectedCategory.set(null);
    this.selectedImageName.set('');
    this.categoryForm.reset({
      name: '',
      slug: '',
      icon: '',
      position: this.categories().length,
      is_active: true,
      image: null,
      product_ids: []
    });
    this.isCreateModalOpen.set(true);
  }

  openViewModal(category: Category): void {
    this.selectedCategory.set(category);
    this.isViewModalOpen.set(true);
  }

  openEditModal(category?: Category): void {
    const target = category ?? this.selectedCategory();

    if (!target) {
      return;
    }

    this.validationService.clearGroupErrors(this.formGroupName);
    this.selectedCategory.set(target);
    this.selectedImageName.set('');
    this.categoryForm.reset({
      name: target.name,
      slug: target.slug,
      icon: target.icon ?? '',
      position: target.position,
      is_active: target.is_active,
      image: null,
      product_ids: this.productOptions()
        .filter((option) => option.category_id === target.id)
        .map((option) => option.id)
    });
    this.isViewModalOpen.set(false);
    this.isEditModalOpen.set(true);
  }

  openDeleteModal(category?: Category): void {
    const target = category ?? this.selectedCategory();

    if (!target) {
      return;
    }

    this.selectedCategory.set(target);
    this.isViewModalOpen.set(false);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    if (this.isBusy()) {
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
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const formData = FormHelper.objectToFormData({
      ...payload,
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      icon: payload.icon?.trim() ?? null,
    }, ['name', 'slug', 'icon', 'position', 'is_active', 'image']);

    this.transition.start('create');

    this.categoryApiService.create(formData).pipe(
      switchMap((response) => {
        if (payload.product_ids.length === 0) {
          return of(null);
        }

        return this.categoryApiService.assignProducts(response.data.id, payload.product_ids);
      }),
      take(1),
      finalize(() => {
        this.transition.finish();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryCreateSuccess'));
        this.closeModals();
        this.categoryChanged.emit();
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

  submitUpdate(): void {
    if (this.categoryForm.invalid || !this.selectedCategory()) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload: CategoryUpdatePayload = {
      id: this.selectedCategory()!.id,
      ...this.buildPayload()
    };

    const formData = FormHelper.objectToFormData({
      ...payload,
      _method: 'PUT',
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      icon: payload.icon?.trim() ?? null,
    }, ['_method', 'name', 'slug', 'icon', 'position', 'is_active', 'image']);

    this.transition.start('update');

    this.categoryApiService.update(payload.id, formData).pipe(
      switchMap(() => {
        if (payload.product_ids.length === 0) {
          return of(null);
        }

        return this.categoryApiService.assignProducts(payload.id, payload.product_ids);
      }),
      take(1),
      finalize(() => {
        this.transition.finish();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryUpdateSuccess'));
        this.closeModals();
        this.categoryChanged.emit();
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

  confirmDelete(): void {
    if (!this.selectedCategory()) {
      return;
    }

    this.transition.start('delete');

    this.categoryApiService.delete(this.selectedCategory()!.id).pipe(
      take(1),
      finalize(() => {
        this.transition.finish();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryDeleteSuccess'));
        this.closeModals();
        this.categoryChanged.emit();
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryDeleteError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  isCreateSubmitDisabled(): boolean {
    return this.isBusy() || this.categoryForm.invalid || this.categoryForm.pristine;
  }

  isUpdateSubmitDisabled(): boolean {
    return this.isBusy() || this.categoryForm.invalid || !this.hasUpdateChanges();
  }

  private hasUpdateChanges(): boolean {
    const selectedCategory = this.selectedCategory();

    if (!selectedCategory) {
      return false;
    }

    const value = this.categoryForm.getRawValue();

    const hasImageChange = value.image instanceof File;

    return value.name.trim() !== selectedCategory.name
      || value.slug.trim() !== selectedCategory.slug
      || (value.icon?.trim() ? value.icon.trim() : null) !== (selectedCategory.icon ?? null)
      || value.position !== selectedCategory.position
      || value.is_active !== selectedCategory.is_active
      || !this.isSameProductSelection(value.product_ids, selectedCategory.id)
      || hasImageChange;
  }

  onProductSelectionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedIds = Array.from(select.selectedOptions).map((option) => option.value);

    this.categoryForm.controls.product_ids.setValue(selectedIds);
    this.categoryForm.controls.product_ids.markAsDirty();
  }

  isProductSelected(productId: string): boolean {
    return this.categoryForm.controls.product_ids.value.includes(productId);
  }

  private isSameProductSelection(selectedIds: string[], categoryId: string): boolean {
    const existingIds = this.productOptions()
      .filter((option) => option.category_id === categoryId)
      .map((option) => option.id)
      .sort();

    const normalizedSelected = [...selectedIds].sort();

    return JSON.stringify(normalizedSelected) === JSON.stringify(existingIds);
  }

  syncSlugFromName(): void {
    const name = this.categoryForm.controls.name.value;

    this.categoryForm.controls.slug.setValue(CatalogHelper.toSlug(name));
  }

  handleImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.categoryForm.controls.image.setValue(file);
    this.selectedImageName.set(file?.name ?? '');
  }

  busyActionLabel(): string {
    switch (this.busyAction()) {
      case 'create':
        return this.i18n.translate('ui.admin.categoryCreateAction');
      case 'update':
        return this.i18n.translate('ui.admin.categorySaveAction');
      case 'delete':
        return this.i18n.translate('ui.admin.categoryDeleteAction');
      default:
        return this.i18n.translate('ui.admin.loadingCatalog');
    }
  }

  private buildPayload(): CategoryUpsertPayload {
    const formData = this.categoryForm.getRawValue();

    return {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      icon: formData.icon?.trim() ? formData.icon.trim() : null,
      position: formData.position,
      is_active: formData.is_active,
      image: formData.image,
      product_ids: formData.product_ids
    };
  }
}
