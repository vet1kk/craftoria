import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CartService, DataService } from '../../services';
import { MenuCategoryFilterComponent, MenuHeroComponent, MenuItemCardComponent } from '../components';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  imports: [MenuHeroComponent, MenuCategoryFilterComponent, MenuItemCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  readonly dataService = inject(DataService);
  readonly cartService = inject(CartService);
  readonly selectedCategory = signal<string | null>(null);

  readonly filteredItems = computed(() => {
    const selectedCategory = this.selectedCategory();

    if (!selectedCategory) {
      return this.dataService.menuItems;
    }

    return this.dataService
      .menuItems
      .filter((item) => item.categoryId === selectedCategory);
  });
}
