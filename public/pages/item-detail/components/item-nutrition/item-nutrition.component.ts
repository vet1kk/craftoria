import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NutritionFacts } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-item-nutrition',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './item-nutrition.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemNutritionComponent {
  readonly nutrition = input.required<NutritionFacts>();
  readonly portionLabel = input.required<string>();
}
