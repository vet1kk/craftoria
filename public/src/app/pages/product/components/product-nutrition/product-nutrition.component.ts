import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NutritionFacts } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-product-nutrition',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './product-nutrition.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductNutritionComponent {
  readonly nutrition = input.required<NutritionFacts>();
  readonly portionLabel = input.required<string>();
}
