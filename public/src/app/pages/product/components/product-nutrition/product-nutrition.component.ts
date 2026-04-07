import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NutritionFacts } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-nutrition',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './product-nutrition.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductNutritionComponent {
  readonly nutrition = input.required<NutritionFacts>();
  readonly portionLabel = input.required<string>();
}
