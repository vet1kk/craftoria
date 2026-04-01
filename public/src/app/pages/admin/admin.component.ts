import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { take } from 'rxjs';

import { CatalogHelper } from '../../helpers';
import { AdminTab, Category, CategoryProductOption, Product } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CategoryApiService, SettingsApiService } from '../../services';
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
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly isRefreshing = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');
  readonly categoryProductOptions = signal<CategoryProductOption[]>([]);

  readonly activeTab = signal<AdminTab>('items');
  readonly editableCategories = computed(() =>
    this.categories().filter((category) => category.slug !== 'all')
  );

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.reloadCatalog();
    this.reloadCategoryOptions();

    effect(() => {
      if (this.isRefreshing() && !this.isCatalogLoading()) {
        this.isRefreshing.set(false);
      }
    });
  }

  onCategoryChanged(): void {
    this.reloadCatalog();
    this.reloadCategoryOptions();
  }

  refreshPage(): void {
    if (this.isCatalogLoading()) {
      return;
    }

    this.isRefreshing.set(true);
    this.reloadCatalog();
    this.reloadCategoryOptions();
  }

  onRefreshStateChange(isRefreshing: boolean): void {
    if (!isRefreshing) {
      this.isRefreshing.set(false);
      return;
    }

    this.refreshPage();
  }

  private reloadCatalog(): void {
    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }

  private reloadCategoryOptions(): void {
    this.categoryApiService.options().pipe(take(1)).subscribe({
      next: (response) => {
        this.categoryProductOptions.set(response.data ?? []);
      },
    });
  }
}
