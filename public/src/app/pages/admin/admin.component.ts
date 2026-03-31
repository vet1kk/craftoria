import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');
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

    this.reloadCatalog();
  }

  onCategoryChanged(): void {
    this.reloadCatalog();
    this.reloadCategoryOptions();
  }

  private reloadCatalog(): void {
    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }

  private reloadCategoryOptions(): void {
    this.categoryApiService.options().pipe(take(1)).subscribe({
      next: (response) => {
        this.categoryProductOptions.set(response.data ?? []);
      },
      error: () => {
        // Keep previously loaded options if refresh fails.
      }
    });
  }
}
