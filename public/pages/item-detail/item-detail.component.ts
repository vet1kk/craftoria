import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, DataService, I18nService, ProductService } from '../../services';
import {
  ItemGalleryComponent,
  ItemIngredientsComponent,
  ItemNutritionComponent,
  ItemPackagingComponent
} from './components';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    TranslatePipe,
    ItemGalleryComponent,
    ItemNutritionComponent,
    ItemPackagingComponent,
    ItemIngredientsComponent
  ],
  templateUrl: './item-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetailComponent {
  readonly dataService = inject(DataService);
  readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly i18n = inject(I18nService);
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  private readonly route = inject(ActivatedRoute);
  private readonly itemSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' }
  );

  readonly item = computed(() => this.productService.getProductBySlug(this.itemSlug()));
  readonly category = computed(() => {
    const product = this.item();
    if (!product) return undefined;
    return this.productService.getCategoryById(product.category_id);
  });
  readonly galleryImages = computed(() => {
    const product = this.item();
    if (!product) return [];
    return [...product.gallery_image_urls].filter(
      (imageUrl, index, allImages) => Boolean(imageUrl) && allImages.indexOf(imageUrl) === index
    );
  });
  readonly nutrition = computed(() => {
    const product = this.item();
    if (!product) return undefined;
    return this.productService.getProductNutrition(product);
  });
  readonly portionLabel = computed(() => {
    const product = this.item();
    if (!product) return '';
    return this.productService.getProductPortionLabel(product);
  });
  readonly ingredientBreakdown = computed(() => {
    const product = this.item();
    if (!product) return [];
    return this.productService.getProductIngredientBreakdown(product);
  });

  constructor() {
    effect(() => {
      const slug = this.itemSlug();
      this.loadError.set('');

      if (!slug) {
        this.isLoading.set(false);
        return;
      }

      if (this.productService.getProductBySlug(slug)) {
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);

      void this.dataService.loadProduct(slug).then((item) => {
        this.isLoading.set(false);
        if (!item) {
          this.loadError.set(this.i18n.translate('ui.itemDetail.notFoundHint'));
        }
      });
    });
  }
}
