import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { ProductHelper } from '../../../../helpers';
import { Product } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services';
import { ImagePreviewComponent } from '../../../../ui';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [TranslatePipe, ImagePreviewComponent],
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly product = input.required<Product>();
  readonly currency = input.required<string>();
  readonly addToCart = output<Product>();
  readonly portionLabel = computed(() => ProductHelper.getProductPortionLabel(this.product(), (key) => this.i18n.translate(key)));
  readonly itemAriaLabel = computed(() => `${this.i18n.translate('ui.itemCard.openDetailsFor')} ${this.product().name}`);
  readonly hasImage = computed(() => {
    return Boolean(this.product().featured_image_url);
  });

  openDetails(): void {
    void this.router.navigate(['/product', this.product().slug]);
  }
}
