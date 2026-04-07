import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Category } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ProductsListControlsComponent } from '../list-controls';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type ProductSort = 'position' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-products-category-filter',
  standalone: true,
  templateUrl: './products-category-filter.component.html',
  imports: [
    TranslatePipe,
    ProductsListControlsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoryFilterComponent {
  readonly categories = input.required<Category[]>();
  readonly selectedSlugs = input<string[]>(['all']);
  readonly searchQuery = input('');
  readonly availabilityFilter = input<AvailabilityFilter>('all');
  readonly sortBy = input<ProductSort>('position');
  readonly resultsCount = input(0);

  readonly categoryChange = output<string>();
  readonly searchQueryChange = output<string>();
  readonly availabilityFilterChange = output<AvailabilityFilter>();
  readonly sortByChange = output<ProductSort>();
  readonly visibleCategories = computed(() => this.categories().filter((category) => category.slug !== 'all'));
  readonly hasActiveFilters = computed(() => {
    return this.searchQuery().trim().length > 0
      || this.availabilityFilter() !== 'all'
      || this.sortBy() !== 'position'
      || !this.isSelected('all');
  });

  isSelected(slug: string): boolean {
    return this.selectedSlugs().includes(slug);
  }

  selectCategory(slug: string): void {
    this.categoryChange.emit(slug);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value;

    if (value === 'position' || value === 'priceAsc' || value === 'priceDesc' || value === 'nameAsc') {
      this.sortByChange.emit(value);
    }
  }

  resetAllFilters(): void {
    this.categoryChange.emit('all');
    this.searchQueryChange.emit('');
    this.availabilityFilterChange.emit('all');
    this.sortByChange.emit('position');
  }
}
