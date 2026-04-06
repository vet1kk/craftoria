import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type ProductSort = 'position' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-products-list-controls',
  standalone: true,
  templateUrl: './products-list-controls.component.html',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsListControlsComponent {
  readonly searchQuery = input('');
  readonly availabilityFilter = input<AvailabilityFilter>('all');
  readonly sortBy = input<ProductSort>('position');
  readonly resultsCount = input(0);

  readonly searchQueryChange = output<string>();
  readonly availabilityFilterChange = output<AvailabilityFilter>();
  readonly sortByChange = output<ProductSort>();
  readonly hasActiveControls = computed(() => {
    return this.searchQuery().trim().length > 0
      || this.availabilityFilter() !== 'all'
      || this.sortBy() !== 'position';
  });

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';

    this.searchQueryChange.emit(value);
  }

  onAvailabilityChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value;

    if (value === 'available' || value === 'unavailable' || value === 'all') {
      this.availabilityFilterChange.emit(value);
    }
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value;

    if (value === 'position' || value === 'priceAsc' || value === 'priceDesc' || value === 'nameAsc') {
      this.sortByChange.emit(value);
    }
  }

  resetControls(): void {
    this.searchQueryChange.emit('');
    this.availabilityFilterChange.emit('all');
    this.sortByChange.emit('position');
  }
}
