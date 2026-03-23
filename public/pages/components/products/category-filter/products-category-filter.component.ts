import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Category } from '../../../../models';

@Component({
  selector: 'app-products-category-filter',
  standalone: true,
  templateUrl: './products-category-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selectedCategorySlug = input('all');
  readonly categoryChange = output<string>();
}
