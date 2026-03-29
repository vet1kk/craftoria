import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Ingredient } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-ingredients',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './product-ingredients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductIngredientsComponent {
  readonly ingredients = input.required<Ingredient[]>();
}
