import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Category, CategoryProductOption, SkeletonGroupConfig } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ValidationService } from '../../../../services';
import { AdminCategoryDeleteModalComponent } from './components/admin-category-delete-modal/admin-category-delete-modal.component';
import { AdminCategoryCreateModalComponent } from './components/admin-category-create-modal/admin-category-create-modal.component';
import { AdminCategoryUpdateModalComponent } from './components/admin-category-update-modal/admin-category-update-modal.component';
import { AdminCategoryViewModalComponent } from './components/admin-category-view-modal/admin-category-view-modal.component';
import { ButtonComponent, ImagePreviewComponent, ModalComponent, SkeletonComponent } from '../../../../ui';

@Component({
  selector: 'app-admin-categories-panel',
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    NgTemplateOutlet,
    ModalComponent,
    ButtonComponent,
    SkeletonComponent,
    ImagePreviewComponent,
    AdminCategoryCreateModalComponent,
    AdminCategoryUpdateModalComponent,
    AdminCategoryViewModalComponent,
    AdminCategoryDeleteModalComponent
  ],
  templateUrl: './admin-categories-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesPanelComponent {
  readonly formGroupName = 'adminCategoryUpsert';

  private readonly validationService = inject(ValidationService);

  readonly categories = input.required<Category[]>();
  readonly isLoading = input(false);
  readonly productOptions = input.required<CategoryProductOption[]>();
  @Output() readonly categoryChanged = new EventEmitter<void>();

  readonly selectedCategory = signal<Category | null>(null);
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly isViewModalOpen = signal(false);

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
    this.validationService.clearGroupErrors(this.formGroupName);
  }

  onModalCompleted(): void {
    this.categoryChanged.emit();
  }
}
