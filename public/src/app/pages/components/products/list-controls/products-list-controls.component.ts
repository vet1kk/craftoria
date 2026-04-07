import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';

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

  readonly searchQueryChange = output<string>();
  readonly availabilityFilterChange = output<AvailabilityFilter>();

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
}
