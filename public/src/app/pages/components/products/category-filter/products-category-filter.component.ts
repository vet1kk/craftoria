import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Category } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { DropdownComponent, DropdownOption } from '../../../../ui';
import { ProductsListControlsComponent } from '../list-controls';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type ProductSort = 'position' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-products-category-filter',
  standalone: true,
  templateUrl: './products-category-filter.component.html',
  imports: [
    TranslatePipe,
    DropdownComponent,
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
  readonly sortOptions: ReadonlyArray<DropdownOption> = [
    { value: 'position', labelKey: 'ui.products.sortByPosition' },
    { value: 'nameAsc', labelKey: 'ui.products.sortByName' },
    { value: 'priceAsc', labelKey: 'ui.products.sortByPriceAsc' },
    { value: 'priceDesc', labelKey: 'ui.products.sortByPriceDesc' }
  ];
  readonly categoryOptions = computed<ReadonlyArray<DropdownOption>>(() => {
    return this.categories().map((category) => ({
      value: category.slug,
      labelKey: category.name
    }));
  });

  readonly categoryChange = output<string>();
  readonly searchQueryChange = output<string>();
  readonly availabilityFilterChange = output<AvailabilityFilter>();
  readonly sortByChange = output<ProductSort>();
  readonly hasActiveFilters = computed(() => {
    return this.searchQuery().trim().length > 0
      || this.availabilityFilter() !== 'all'
      || this.sortBy() !== 'position'
      || !this.isSelected('all');
  });
  readonly selectedSortLabelKey = computed(() => {
    const selected = this.sortOptions.find((option) => option.value === this.sortBy());

    return selected?.labelKey ?? 'ui.products.sortByPosition';
  });
  readonly selectedCategorySlug = computed(() => this.selectedSlugs()[0] ?? 'all');
  readonly selectedCategoryLabelKey = computed(() => {
    const selected = this.categories().find((category) => category.slug === this.selectedCategorySlug());

    return selected?.name ?? this.categories()[0]?.name ?? 'ui.products.allCategoriesTab';
  });

  isSelected(slug: string): boolean {
    return this.selectedSlugs().includes(slug);
  }

  selectCategory(slug: string): void {
    this.categoryChange.emit(slug);
  }

  selectSort(value: string): void {
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
