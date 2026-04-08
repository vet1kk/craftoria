import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { DropdownComponent, DropdownOption } from '../../../../ui';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-products-list-controls',
  standalone: true,
  templateUrl: './products-list-controls.component.html',
  imports: [TranslatePipe, DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsListControlsComponent {
  readonly searchQuery = input('');
  readonly availabilityFilter = input<AvailabilityFilter>('all');
  readonly availabilityOptions: ReadonlyArray<DropdownOption> = [
    { value: 'all', labelKey: 'ui.products.availabilityAll' },
    { value: 'available', labelKey: 'ui.products.availabilityInStock' },
    { value: 'unavailable', labelKey: 'ui.products.availabilityOutOfStock' }
  ];
  readonly availabilityLabelKey = computed(() => {
    const selected = this.availabilityOptions.find((option) => option.value === this.availabilityFilter());

    return selected?.labelKey ?? 'ui.products.availabilityAll';
  });

  readonly searchQueryChange = output<string>();
  readonly availabilityFilterChange = output<AvailabilityFilter>();

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';

    this.searchQueryChange.emit(value);
  }

  selectAvailability(value: string): void {
    if (value === 'all' || value === 'available' || value === 'unavailable') {
      this.availabilityFilterChange.emit(value);
    }
  }
}
