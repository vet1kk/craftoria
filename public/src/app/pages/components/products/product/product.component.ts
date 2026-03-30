import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { Ingredient, IngredientUnit, Product } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly product = input.required<Product>();
  readonly currency = input.required<string>();
  readonly addToCart = output<Product>();
  readonly portionLabel = computed(() => this.getProductPortionLabel(this.product()));
  readonly itemAriaLabel = computed(() => `${this.i18n.translate('ui.itemCard.openDetailsFor')} ${this.product().name}`);
  readonly hasImage = computed(() => {
    return Boolean(this.product().featured_image_url);
  });

  openDetails(): void {
    void this.router.navigate(['/product', this.product().slug]);
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
}
