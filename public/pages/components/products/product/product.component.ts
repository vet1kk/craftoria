import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { Product } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService, ProductService } from '../../../../services';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {
  readonly productService = inject(ProductService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly item = input.required<Product>();
  readonly currency = input.required<string>();
  readonly addToCart = output<Product>();
  readonly portionLabel = computed(() => this.productService.getProductPortionLabel(this.item()));
  readonly itemAriaLabel = computed(() => `${this.i18n.translate('ui.itemCard.openDetailsFor')} ${this.item().name}`);
  readonly hasImage = computed(() => {
    const imageUrl = this.item().image_url;
    return Boolean(imageUrl) && !imageUrl?.startsWith('data:image/svg+xml');
  });

  openDetails(): void {
    void this.router.navigate(['/product', this.item().slug]);
  }
}
