import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, DataService, I18nService, ProductService } from '../../services';
import { ProductGalleryComponent, ProductIngredientsComponent, ProductNutritionComponent, ProductPackagingComponent } from './components';
import { Metadata, PackageDetails, Product, ProductImage } from '../../models';

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
  readonly dataService = inject(DataService);
  readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly i18n = inject(I18nService);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
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
    return this.productService.getCategoryById(product.category_id);
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
    return this.productService.getProductPortionLabel(product);
  });

  readonly ingredientBreakdown = computed(() => {
    const product = this.product;
    if (!product) {
      return [];
    }
    return this.productService.getProductIngredientBreakdown(product);
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
    this.fetchProduct();

    effect(() => {
      if (this.dataService.shouldReloadCatalogForLocale()) {
        void this.fetchProduct();
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

    this.productService.loadProduct(slug).then((product) => {
      this.product = product;
      this.isLoading.set(false);
      if (!product) {
        this.loadError.set(this.i18n.translate('ui.itemDetail.notFoundHint'));
      }
    }).catch(() => {
      this.isLoading.set(false);
    });
  }

  getMetadata(type: string): Metadata | undefined {
    return this.metadata().find((metadata: Metadata): boolean => metadata.type === type);
  }
}
