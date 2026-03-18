import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Category } from '../../../../models';

@Component({
  selector: 'app-menu-category-filter',
  standalone: true,
  templateUrl: './menu-category-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuCategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selectedCategorySlug = input('all');
  readonly categoryChange = output<string>();
}
