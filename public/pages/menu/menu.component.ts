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
    const menuItems = this.dataService.menuItems();

    if (!selectedSlug || selectedSlug === 'all') {
      return menuItems;
    }

    const selectedCategory = this.dataService.categories().find((cat) => cat.slug === selectedSlug);

    if (!selectedCategory) {
      return menuItems;
    }

    return menuItems.filter((item) => item.categoryId === selectedCategory.id);
  });

  readonly showCategories = computed(() => this.dataService.menuItems().length > 0);

  constructor() {
    void this.dataService.ensureCatalogLoaded();
  }
}
