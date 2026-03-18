import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Category } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-categories-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './admin-categories-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesPanelComponent {
  readonly categories = input.required<Category[]>();
}
