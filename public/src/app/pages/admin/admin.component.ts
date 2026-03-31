import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, of, switchMap, take } from 'rxjs';

import { ApiErrorHelper, CatalogHelper, FormHelper } from '../../helpers';
import { AdminTab, Category, CategoryProductOption, CategoryUpdatePayload, CategoryUpsertPayload, Product } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CategoryApiService, I18nService, SettingsApiService, ToastService } from '../../services';
import { AdminCategoriesPanelComponent, AdminProductPanelComponent, AdminTabsComponent } from '../components';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [AdminTabsComponent, AdminProductPanelComponent, AdminCategoriesPanelComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {
  private readonly catalogHelper = inject(CatalogHelper);
  private readonly route = inject(ActivatedRoute);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly toastService = inject(ToastService);
  private readonly i18n = inject(I18nService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');
  readonly isCategoryActionLoading = signal(false);
  readonly categoryActionError = signal('');
  readonly categoryActionSuccessTick = signal(0);
  readonly categoryProductOptions = signal<CategoryProductOption[]>(
    (this.route.snapshot.data['categoryProductOptions'] as CategoryProductOption[] | undefined) ?? []
  );

  readonly activeTab = signal<AdminTab>('items');
  readonly editableCategories = computed(() =>
    this.categories().filter((category) => category.slug !== 'all')
  );

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }

  createCategory(payload: CategoryUpsertPayload): void {
    this.isCategoryActionLoading.set(true);
    this.categoryActionError.set('');

    const formData = FormHelper.objectToFormData({
      ...payload,
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      icon: payload.icon?.trim() ?? null,
    }, ['name', 'slug', 'icon', 'position', 'is_active', 'image']);

    this.categoryApiService.create(formData).pipe(
      switchMap((response) => {
        if (payload.product_ids.length === 0) {
          return of(null);
        }

        return this.categoryApiService.assignProducts(response.data.id, payload.product_ids);
      }),
      take(1),
      finalize(() => this.isCategoryActionLoading.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryCreateSuccess'));
        this.categoryActionSuccessTick.update((tick) => tick + 1);
        this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryCreateError'));
        this.categoryActionError.set(message);
        this.toastService.error(message);
      }
    });
  }

  updateCategory(payload: CategoryUpdatePayload): void {
    this.isCategoryActionLoading.set(true);
    this.categoryActionError.set('');

    const formData = FormHelper.objectToFormData({
      ...payload,
      _method: 'PUT',
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      icon: payload.icon?.trim() ?? null,
    }, ['_method', 'name', 'slug', 'icon', 'position', 'is_active', 'image']);

    this.categoryApiService.update(payload.id, formData).pipe(
      switchMap(() => {
        if (payload.product_ids.length === 0) {
          return of(null);
        }

        return this.categoryApiService.assignProducts(payload.id, payload.product_ids);
      }),
      take(1),
      finalize(() => this.isCategoryActionLoading.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryUpdateSuccess'));
        this.categoryActionSuccessTick.update((tick) => tick + 1);
        this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryUpdateError'));
        this.categoryActionError.set(message);
        this.toastService.error(message);
      }
    });
  }

  deleteCategory(categoryId: string): void {
    this.isCategoryActionLoading.set(true);
    this.categoryActionError.set('');

    this.categoryApiService.delete(categoryId).pipe(
      take(1),
      finalize(() => this.isCategoryActionLoading.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryDeleteSuccess'));
        this.categoryActionSuccessTick.update((tick) => tick + 1);
        this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryDeleteError'));
        this.categoryActionError.set(message);
        this.toastService.error(message);
      }
    });
  }
}
