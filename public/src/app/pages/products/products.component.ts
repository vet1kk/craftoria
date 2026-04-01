import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { take } from 'rxjs';
import { CatalogHelper } from '../../helpers';
import { Category, Product, SkeletonGroupConfig } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, I18nService, SettingsApiService } from '../../services';
import { SkeletonComponent } from '../../ui';
import { ProductComponent, ProductsCategoryFilterComponent, ProductsHeroComponent } from '../components';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [ProductsHeroComponent, TranslatePipe, ProductsHeroComponent, ProductsCategoryFilterComponent, ProductComponent, SkeletonComponent],
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
  readonly emptyProductsMessageKey = computed(() =>
    this.products().length === 0 ? 'ui.products.emptyCatalog' : 'ui.products.emptyCategory'
  );
  readonly productCardsSkeletonGroups: SkeletonGroupConfig[] = [
    {
      rowsClassName: 'grid gap-6 sm:grid-cols-2 md:grid-cols-3',
      rows: [
        {
          className: 'rounded-2xl border border-stone-100 bg-white p-3 shadow-sm',
          center: {
            className: 'space-y-3',
            lines: [
              { widthClass: 'w-full', heightClass: 'h-32', roundedClass: 'rounded-xl', tone: 'muted' },
              { widthClass: 'w-2/3', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-1/2', heightClass: 'h-3', tone: 'muted' },
              { widthClass: 'w-24', heightClass: 'h-8', roundedClass: 'rounded-full', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-2xl border border-stone-100 bg-white p-3 shadow-sm',
          center: {
            className: 'space-y-3',
            lines: [
              { widthClass: 'w-full', heightClass: 'h-32', roundedClass: 'rounded-xl', tone: 'muted' },
              { widthClass: 'w-3/4', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-2/5', heightClass: 'h-3', tone: 'muted' },
              { widthClass: 'w-24', heightClass: 'h-8', roundedClass: 'rounded-full', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-2xl border border-stone-100 bg-white p-3 shadow-sm',
          center: {
            className: 'space-y-3',
            lines: [
              { widthClass: 'w-full', heightClass: 'h-32', roundedClass: 'rounded-xl', tone: 'muted' },
              { widthClass: 'w-4/5', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-1/2', heightClass: 'h-3', tone: 'muted' },
              { widthClass: 'w-24', heightClass: 'h-8', roundedClass: 'rounded-full', tone: 'muted' }
            ]
          }
        }
      ]
    }
  ];

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
