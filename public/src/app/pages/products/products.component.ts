import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, DataService } from '../../services';
import { ProductComponent, ProductsCategoryFilterComponent, ProductsHeroComponent } from '../components';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [ProductsHeroComponent, TranslatePipe, ProductsHeroComponent, ProductsCategoryFilterComponent, ProductComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent {
  readonly dataService = inject(DataService);
  readonly cartService = inject(CartService);
  readonly selectedCategorySlug = signal('all');

  readonly filteredProducts = computed(() => {
    const selectedSlug = this.selectedCategorySlug();
    const products = this.dataService.products();

    if (!selectedSlug || selectedSlug === 'all') {
      return products;
    }

    const selectedCategory = this.dataService.categories().find((cat) => cat.slug === selectedSlug);

    if (!selectedCategory) {
      return products;
    }

    return products.filter((item) => item.category_id === selectedCategory.id);
  });

  readonly showCategories = computed(() => this.dataService.products().length > 0);

  constructor() {
    void this.dataService.ensureCatalogLoaded();

    effect(() => {
      if (this.dataService.shouldReloadCatalogForLocale()) {
        void this.dataService.ensureCatalogLoaded(true);
      }
    });
  }
}
