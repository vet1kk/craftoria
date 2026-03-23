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
  readonly selectedSlugs = input<string[]>(['all']);
  readonly categoryChange = output<string>();

  isSelected(slug: string): boolean {
    return this.selectedSlugs().includes(slug);
  }
}