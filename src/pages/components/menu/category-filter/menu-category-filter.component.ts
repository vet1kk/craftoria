import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Category } from '../../../../models';

@Component({
  selector: 'app-menu-category-filter',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './menu-category-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuCategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selectedCategory = input<string | null>(null);
  readonly categoryChange = output<string | null>();
}
