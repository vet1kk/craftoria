import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';

import { Category, Product, SkeletonGroupConfig } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ValidationService } from '../../../../services';
import { ButtonComponent, ImagePreviewComponent, ModalComponent, SkeletonComponent } from '../../../../ui';
import { AdminProductCreateModalComponent } from './components/admin-product-create-modal/admin-product-create-modal.component';
import { AdminProductDeleteModalComponent } from './components/admin-product-delete-modal/admin-product-delete-modal.component';
import { AdminProductUpdateModalComponent } from './components/admin-product-update-modal/admin-product-update-modal.component';
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
    AdminProductViewModalComponent,
    AdminProductCreateModalComponent,
    AdminProductUpdateModalComponent,
    AdminProductDeleteModalComponent
  ],
  templateUrl: './admin-product-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductPanelComponent {
  readonly formGroupName = 'adminProductUpsert';

  private readonly validationService = inject(ValidationService);

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

  closeModals(): void {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isViewModalOpen.set(false);
    this.validationService.clearGroupErrors(this.formGroupName);
  }

  onModalCompleted(): void {
    this.productChanged.emit();
  }

  getCategoryName(categoryId: string | null): string {
    if (!categoryId) {
      return '';
    }

    return this.categoriesById().get(categoryId) ?? '';
  }
}
