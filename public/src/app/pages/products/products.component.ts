import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { take } from 'rxjs';
import { CatalogHelper } from '../../helpers';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, I18nService, SettingsApiService } from '../../services';
import { ProductComponent, ProductsCategoryFilterComponent, ProductsHeroComponent } from '../components';
import { Category, Product } from '../../models';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [ProductsHeroComponent, TranslatePipe, ProductsHeroComponent, ProductsCategoryFilterComponent, ProductComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent {
  private readonly catalogHelper = inject(CatalogHelper);
  private readonly settingsApiService = inject(SettingsApiService);
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
      const locale = this.i18n.locale();
      const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;
      this.lastLoadedLocale = locale;

      if (shouldForceReload) {
        this.loadCatalog();
      }
    });
  }

  loadCatalog(): void {
    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }
}
