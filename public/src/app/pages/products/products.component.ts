import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, take } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, CategoryApiService, I18nService, LocaleService, ProductApiService, SettingsApiService } from '../../services';
import { ProductComponent, ProductsCategoryFilterComponent, ProductsHeroComponent } from '../components';
import { Category, Product } from '../../models';
import { extractApiErrorMessage } from '../../services/api-error';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [ProductsHeroComponent, TranslatePipe, ProductsHeroComponent, ProductsCategoryFilterComponent, ProductComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly productApiService = inject(ProductApiService);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly localeService = inject(LocaleService);
  private readonly i18n = inject(I18nService);
  readonly cartService = inject(CartService);
  readonly selectedCategorySlug = signal('all');
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');
  private lastLoadedLocale: string | null = null;

  readonly filteredProducts = computed(() => {
    const selectedSlug = this.selectedCategorySlug();
    const products = this.products();

    if (!selectedSlug || selectedSlug === 'all') {
      return products;
    }

    const selectedCategory = this.categories().find((cat) => cat.slug === selectedSlug);

    if (!selectedCategory) {
      return products;
    }

    return products.filter((item) => item.category_id === selectedCategory.id);
  });

  readonly showCategories = computed(() => this.products().length > 0);

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.loadCatalog();

    effect(() => {
      const locale = this.localeService.locale();
      const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;
      this.lastLoadedLocale = locale;

      if (shouldForceReload) {
        this.loadCatalog();
      }
    });
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
