import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { take } from 'rxjs';
import { CatalogHelper } from '../../helpers';
import { Category, Product, SkeletonGroupConfig } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, I18nService, SettingsApiService } from '../../services';
import { SkeletonComponent } from '../../ui';
import { ProductComponent, ProductsCategoryFilterComponent, ProductsHeroComponent } from '../components';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type ProductSort = 'position' | 'priceAsc' | 'priceDesc' | 'nameAsc';

interface ProductQueryState {
  category: string;
  q: string;
  availability: AvailabilityFilter;
  sort: ProductSort;
}

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [ProductsHeroComponent, TranslatePipe, ProductsCategoryFilterComponent, ProductComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent {
  private readonly catalogHelper = inject(CatalogHelper);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routeQueryState = signal<ProductQueryState>({
    category: 'all',
    q: '',
    availability: 'all',
    sort: 'position'
  });
  readonly cartService = inject(CartService);
  readonly selectedCategorySlug = signal('all');
  readonly searchQuery = signal('');
  readonly availabilityFilter = signal<AvailabilityFilter>('all');
  readonly sortBy = signal<ProductSort>('position');
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');
  private lastLoadedLocale: string | null = null;

  readonly filteredProducts = computed(() => {
    const selectedSlug = this.selectedCategorySlug();
    const query = this.searchQuery().trim().toLowerCase();
    const availability = this.availabilityFilter();
    const sortBy = this.sortBy();
    let products = this.products();

    if (!selectedSlug || selectedSlug === 'all') {
      // keep full list
    } else {
      const selectedCategory = this.categories().find((cat) => cat.slug === selectedSlug);

      if (selectedCategory) {
        products = products.filter((item) => item.category_id === selectedCategory.id);
      }
    }

    if (availability === 'available') {
      products = products.filter((item) => item.is_available);
    } else if (availability === 'unavailable') {
      products = products.filter((item) => !item.is_available);
    }

    if (query.length > 0) {
      products = products.filter((item) => {
        const name = item.name?.toLowerCase() ?? '';
        const description = item.description?.toLowerCase() ?? '';

        return name.includes(query) || description.includes(query);
      });
    }

    return [...products].sort((left, right) => {
      switch (sortBy) {
        case 'priceAsc':
          return left.price - right.price;
        case 'priceDesc':
          return right.price - left.price;
        case 'nameAsc':
          return left.name.localeCompare(right.name);
        default:
          return left.position - right.position;
      }
    });
  });

  readonly showCategories = computed(() => this.products().length > 0);
  readonly emptyProductsMessageKey = computed(() =>
    this.products().length === 0 ? 'ui.products.emptyCatalog' : 'ui.products.emptyFiltered'
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
              { widthClass: 'w-full', heightClass: 'h-60', roundedClass: 'rounded-xl', tone: 'muted' },
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
              { widthClass: 'w-full', heightClass: 'h-60', roundedClass: 'rounded-xl', tone: 'muted' },
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
              { widthClass: 'w-full', heightClass: 'h-60', roundedClass: 'rounded-xl', tone: 'muted' },
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
    const initialQueryState = this.parseQueryState(this.route.snapshot.queryParamMap);
    this.routeQueryState.set(initialQueryState);
    this.syncStateFromQuery(initialQueryState);

    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.loadCatalog();

    effect(() => {
      const locale = this.i18n.locale();
      const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;
      this.lastLoadedLocale = locale;

      if (shouldForceReload) {
        this.loadCatalog(true);
      }
    });

    effect(() => {
      this.syncStateFromQuery(this.routeQueryState());
    });

    effect(() => {
      const queryState: ProductQueryState = {
        category: this.selectedCategorySlug(),
        q: this.searchQuery().trim(),
        availability: this.availabilityFilter(),
        sort: this.sortBy()
      };
      const routeState = this.routeQueryState();

      if (this.isSameQueryState(queryState, routeState)) {
        return;
      }

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          category: queryState.category !== 'all' ? queryState.category : null,
          q: queryState.q.length > 0 ? queryState.q : null,
          availability: queryState.availability !== 'all' ? queryState.availability : null,
          sort: queryState.sort !== 'position' ? queryState.sort : null
        },
        replaceUrl: true
      });
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.routeQueryState.set(this.parseQueryState(params));
    });
  }

  loadCatalog(resetState: boolean = false): void {
    if (resetState) {
      this.categories.set([]);
      this.products.set([]);
    }

    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }

  private parseQueryState(params: ParamMap): ProductQueryState {
    const category = params.get('category')?.trim() || 'all';
    const q = params.get('q')?.trim() || '';
    const availability = this.parseAvailability(params.get('availability'));
    const sort = this.parseSort(params.get('sort'));

    return { category, q, availability, sort };
  }

  private syncStateFromQuery(queryState: ProductQueryState): void {
    this.selectedCategorySlug.set(queryState.category);
    this.searchQuery.set(queryState.q);
    this.availabilityFilter.set(queryState.availability);
    this.sortBy.set(queryState.sort);
  }

  private parseAvailability(value: string | null): AvailabilityFilter {
    if (value === 'available' || value === 'unavailable') {
      return value;
    }

    return 'all';
  }

  private parseSort(value: string | null): ProductSort {
    if (value === 'priceAsc' || value === 'priceDesc' || value === 'nameAsc') {
      return value;
    }

    return 'position';
  }

  private isSameQueryState(left: ProductQueryState, right: ProductQueryState): boolean {
    return left.category === right.category
      && left.q === right.q
      && left.availability === right.availability
      && left.sort === right.sort;
  }
}
