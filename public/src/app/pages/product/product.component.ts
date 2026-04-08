import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map, take } from 'rxjs';

import { ApiErrorHelper, ProductHelper } from '../../helpers';
import { Category, Metadata, PackageDetails, Product, ProductImage } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, CategoryApiService, I18nService, ProductApiService, SettingsApiService } from '../../services';
import { ProductGalleryComponent, ProductIngredientsComponent, ProductNutritionComponent, ProductPackagingComponent } from './components';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    TranslatePipe,
    ProductGalleryComponent,
    ProductNutritionComponent,
    ProductPackagingComponent,
    ProductIngredientsComponent
  ],
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly productApiService = inject(ProductApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly settingsApiService = inject(SettingsApiService);
  readonly cartService = inject(CartService);
  readonly i18n = inject(I18nService);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly currency = signal('');
  readonly categories = signal<Category[]>([]);
  private lastLoadedLocale: string | null = null;
  private readonly route = inject(ActivatedRoute);
  private readonly productSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' }
  );

  product: Product | undefined;

  readonly category = computed(() => {
    const product = this.product;
    if (!product) {
      return undefined;
    }
    return this.categories().find((category) => category.id === product.category_id);
  });

  readonly galleryImages = computed(() => {
    const product = this.product;
    if (!product) {
      return [];
    }
    let images: string[] = [];

    if (product.featured_image_url) {
      images.push(product.featured_image_url);
    }

    images.push(
      ...product.images
        .map((image: ProductImage) => image.image_url)
        .filter((imageUrl: string) => Boolean(imageUrl))
    );
    return images;
  });

  readonly nutrition = computed(() => {
    const product = this.product;
    return product?.nutrition_totals;
  });

  readonly metadata = computed((): Metadata[] => {
    const product = this.product;
    return product?.metadata ?? [];
  });

  readonly portionLabel = computed(() => {
    const product = this.product;
    if (!product) {
      return '';
    }
    return ProductHelper.getProductPortionLabel(product, (key) => this.i18n.translate(key));
  });

  readonly ingredientBreakdown = computed(() => {
    const product = this.product;
    if (!product) {
      return [];
    }
    return ProductHelper.getProductIngredientBreakdown(product, (key) => this.i18n.translate(key));
  });

  readonly packageDetailsBreakdown = computed((): PackageDetails => {
    const details: PackageDetails = {
      packaging: this.getMetadata('packaging')?.value,
      contents: this.getMetadata('contents')?.value,
      storage: this.getMetadata('storage_instructions')?.value,
      shelf_life: this.product?.shelf_life
    };

    return Object.fromEntries(
      Object.entries(details).filter(([_, value]) => value !== undefined)
    );
  });

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.fetchProduct();

    effect(() => {
      const locale = this.i18n.locale();
      const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;
      this.lastLoadedLocale = locale;

      if (shouldForceReload) {
        this.fetchProduct();
      }
    });
  }

  fetchProduct(): void {
    const slug = this.productSlug();
    this.loadError.set('');
    this.product = undefined;
    this.categories.set([]);

    if (!slug) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    forkJoin({
      product: this.productApiService.item(slug),
      categories: this.categoryApiService.listing()
    }).pipe(take(1)).subscribe({
      next: ({ product, categories }) => {
        this.categories.set(categories.data ?? []);
        this.product = product.data;
        this.isLoading.set(false);
        if (!product.data) {
          this.loadError.set(this.i18n.translate('ui.itemDetail.notFoundHint'));
        }
      },
      error: (error: unknown) => {
        this.loadError.set(this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.products.itemLoadError')));
        this.isLoading.set(false);
      }
    });
  }


  getMetadata(type: string): Metadata | undefined {
    return this.metadata().find((metadata: Metadata): boolean => metadata.type === type);
  }
}
