import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryProductOption, CategoryUpdatePayload, CategoryUpsertPayload } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { CatalogHelper } from '../../../../helpers';
import { I18nService } from '../../../../services';
import { FormInputComponent } from '../../../../ui';

@Component({
  selector: 'app-admin-categories-panel',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, FormInputComponent, NgTemplateOutlet],
  templateUrl: './admin-categories-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesPanelComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly i18n = inject(I18nService);
  private lastActionSuccessTick = -1;

  readonly categories = input.required<Category[]>();
  readonly productOptions = input.required<CategoryProductOption[]>();
  readonly isBusy = input(false);
  readonly actionError = input('');
  readonly actionSuccessTick = input(0);
  readonly createCategory = output<CategoryUpsertPayload>();
  readonly updateCategory = output<CategoryUpdatePayload>();
  readonly deleteCategory = output<string>();

  readonly selectedCategory = signal<Category | null>(null);
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly isViewModalOpen = signal(false);
  readonly selectedImageName = signal('');
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

  constructor() {
    effect(() => {
      const successTick = this.actionSuccessTick();

      if (this.lastActionSuccessTick === -1) {
        this.lastActionSuccessTick = successTick;
        return;
      }

      if (successTick !== this.lastActionSuccessTick) {
        this.closeModals();
      }

      this.lastActionSuccessTick = successTick;
    });
  }

  openCreateModal(): void {
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
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isViewModalOpen.set(false);
  }

  submitCreate(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.createCategory.emit(this.buildPayload());
  }

  submitUpdate(): void {
    if (this.categoryForm.invalid || !this.selectedCategory()) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.updateCategory.emit({
      id: this.selectedCategory()!.id,
      ...this.buildPayload()
    });
  }

  confirmDelete(): void {
    if (!this.selectedCategory()) {
      return;
    }

    this.deleteCategory.emit(this.selectedCategory()!.id);
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

  hasStringControlError(control: FormControl<string>): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  getNameError(): string | null {
    const control = this.categoryForm.controls.name;

    if (!this.hasStringControlError(control)) {
      return null;
    }

    if (control.hasError('required')) {
      return this.i18n.translate('ui.admin.categoryNameRequired');
    }

    if (control.hasError('maxlength')) {
      return this.i18n.translate('ui.admin.categoryNameMaxLength');
    }

    return this.i18n.translate('ui.account.validation.fieldInvalid');
  }

  getSlugError(): string | null {
    const control = this.categoryForm.controls.slug;

    if (!this.hasStringControlError(control)) {
      return null;
    }

    if (control.hasError('required')) {
      return this.i18n.translate('ui.admin.categorySlugRequired');
    }

    if (control.hasError('maxlength')) {
      return this.i18n.translate('ui.admin.categorySlugMaxLength');
    }

    return this.i18n.translate('ui.account.validation.fieldInvalid');
  }

  getIconError(): string | null {
    const control = this.categoryForm.controls.icon;

    if (!this.hasStringControlError(control)) {
      return null;
    }

    if (control.hasError('maxlength')) {
      return this.i18n.translate('ui.admin.categoryIconMaxLength');
    }

    return this.i18n.translate('ui.account.validation.fieldInvalid');
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
