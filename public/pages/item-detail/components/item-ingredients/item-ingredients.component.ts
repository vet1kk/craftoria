import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ResolvedProductIngredient } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-item-ingredients',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './item-ingredients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemIngredientsComponent {
  readonly ingredients = input.required<ResolvedProductIngredient[]>();
}
