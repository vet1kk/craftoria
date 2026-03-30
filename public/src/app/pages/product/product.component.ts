import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, take } from 'rxjs';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, CategoryApiService, I18nService, LocaleService, ProductApiService, SettingsApiService } from '../../services';
import { ProductGalleryComponent, ProductIngredientsComponent, ProductNutritionComponent, ProductPackagingComponent } from './components';
import { Category, Ingredient, IngredientUnit, Metadata, PackageDetails, Product, ProductImage } from '../../models';
import { extractApiErrorMessage } from '../../services/api-error';

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
  private readonly productApiService = inject(ProductApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly localeService = inject(LocaleService);
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
    return product.images.map((image: ProductImage) => image.image_url).filter((imageUrl: string) => Boolean(imageUrl));
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
    return this.getProductPortionLabel(product);
  });

  readonly ingredientBreakdown = computed(() => {
    const product = this.product;
    if (!product) {
      return [];
    }
    return this.getProductIngredientBreakdown(product);
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

    this.categoryApiService.listing().pipe(take(1)).subscribe((response) => {
      this.categories.set(response.data ?? []);
    });

    this.fetchProduct();

    effect(() => {
      const locale = this.localeService.locale();
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

    if (!slug) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    this.productApiService.item(slug).pipe(take(1)).subscribe({
      next: (product) => {
        this.product = product.data;
        this.isLoading.set(false);
        if (!product.data) {
          this.loadError.set(this.i18n.translate('ui.itemDetail.notFoundHint'));
        }
      },
      error: (error: unknown) => {
        this.loadError.set(extractApiErrorMessage(error, this.i18n.translate('ui.products.itemLoadError'), this.i18n));
        this.isLoading.set(false);
      }
    });
  }

  private getProductIngredientBreakdown(product: Product): Ingredient[] {
    return product.ingredients.map((ingredient: Ingredient) => ({
      ...ingredient,
      quantity_label: this.formatQuantity(ingredient.quantity, ingredient.unit)
    }));
  }

  private getProductPortionLabel(product: Product): string {
    const totalsByUnit = product.ingredients.reduce<Record<IngredientUnit, number>>(
      (accumulator, ingredient: Ingredient) => {
        accumulator[ingredient.unit] += ingredient.quantity;

        return accumulator;
      },
      { g: 0, ml: 0 }
    );

    const portionLabel = (Object.entries(totalsByUnit) as Array<[IngredientUnit, number]>)
      .filter(([, total]) => total > 0)
      .map(([unit, total]) => this.formatQuantity(total, unit))
      .join(' + ');

    return portionLabel || 'Порція уточнюється';
  }

  private formatQuantity(quantity: number, unit: IngredientUnit): string {
    const formattedQuantity = Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(1);

    return `${formattedQuantity} ${this.i18n.translate('ui.itemDetail.' + unit)}`;
  }

  getMetadata(type: string): Metadata | undefined {
    return this.metadata().find((metadata: Metadata): boolean => metadata.type === type);
  }
}
