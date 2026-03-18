import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, DataService } from '../../services';
import { MenuCategoryFilterComponent, MenuHeroComponent, MenuItemCardComponent } from '../components';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  imports: [MenuHeroComponent, MenuCategoryFilterComponent, MenuItemCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  readonly dataService = inject(DataService);
  readonly cartService = inject(CartService);
  readonly selectedCategorySlug = signal('all');

  readonly filteredItems = computed(() => {
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
  }
}
