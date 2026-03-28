import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ResolvedProductIngredient } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-product-ingredients',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './product-ingredients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductIngredientsComponent {
  readonly ingredients = input.required<ResolvedProductIngredient[]>();
}
