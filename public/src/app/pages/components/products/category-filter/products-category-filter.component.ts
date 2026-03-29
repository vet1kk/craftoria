import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Category } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-products-category-filter',
  standalone: true,
  templateUrl: './products-category-filter.component.html',
  imports: [
    TranslatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selectedSlugs = input<string[]>(['all']);
  readonly categoryChange = output<string>();

  isMenuOpen = signal(false);

  activeCategoryName = computed(() => {
    const firstSlug = this.selectedSlugs()[0];
    const match = this.categories().find(c => c.slug === firstSlug);
    return match ? match.name : '';
  });

  isSelected(slug: string): boolean {
    return this.selectedSlugs().includes(slug);
  }

  selectCategory(slug: string): void {
    this.categoryChange.emit(slug);
    this.isMenuOpen.set(false);
  }
}