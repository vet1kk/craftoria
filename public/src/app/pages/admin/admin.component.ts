import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, take } from 'rxjs';

import { AdminTab, Category, Product } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CategoryApiService, I18nService, ProductApiService, SettingsApiService } from '../../services';
import { extractApiErrorMessage } from '../../services/api-error';
import { AdminCategoriesPanelComponent, AdminProductPanelComponent, AdminTabsComponent } from '../components';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [AdminTabsComponent, AdminProductPanelComponent, AdminCategoriesPanelComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly productApiService = inject(ProductApiService);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly i18n = inject(I18nService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');

  readonly activeTab = signal<AdminTab>('items');
  readonly editableCategories = computed(() =>
    this.categories().filter((category) => category.slug !== 'all')
  );

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.loadCatalog();
  }

  loadCatalog(): void {
    this.isCatalogLoading.set(true);
    this.catalogError.set('');

    forkJoin([
      this.categoryApiService.listing(),
      this.productApiService.listing()
    ]).pipe(
      take(1),
      catchError((error: unknown) => {
        this.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.products.catalogLoadError'), this.i18n));
        return of(null);
      })
    ).subscribe((result) => {
      if (result) {
        const [categoriesResponse, productsResponse] = result;
        this.categories.set((categoriesResponse.data ?? []).filter((category) => Boolean(category?.id)));
        this.products.set((productsResponse.data ?? []).filter((product) => Boolean(product?.id)));
      }

      this.isCatalogLoading.set(false);
    });
  }
}
