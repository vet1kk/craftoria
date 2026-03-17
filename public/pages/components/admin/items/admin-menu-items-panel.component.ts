import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Category, MenuItem } from '../../../../models';

@Component({
  selector: 'app-admin-menu-items-panel',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './admin-menu-items-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMenuItemsPanelComponent {
  readonly menuItems = input.required<MenuItem[]>();
  readonly categories = input.required<Category[]>();
  readonly currency = input.required<string>();
  readonly categoriesById = computed(
    () => new Map(this.categories().map((category) => [category.id, category.name]))
  );

  getCategoryName(categoryId: string): string {
    return this.categoriesById().get(categoryId) ?? 'Невідомо';
  }
}
